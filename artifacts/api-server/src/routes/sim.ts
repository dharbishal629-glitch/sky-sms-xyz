import { Router, type IRouter, type Request } from "express";
import { pool } from "@workspace/db";
import {
  GetMeResponse,
  GetDashboardResponse,
  ListCountriesResponse,
  ListServicesQueryParams,
  ListServicesResponse,
  GetAvailabilityQueryParams,
  GetAvailabilityResponse,
  ListRentalsResponse,
  CreateRentalBody,
  CreateRentalResponse,
  RefreshRentalParams,
  RefreshRentalResponse,
  CancelRentalParams,
  CancelRentalResponse,
  ListPaymentsResponse,
  CreatePaymentCheckoutBody,
  CreatePaymentCheckoutResponse,
  GetAdminOverviewResponse,
  ListAdminUsersResponse,
  ListAdminTransactionsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const demoUserId = "demo-user";
let schemaReady: Promise<void> | null = null;

const countries = [
  { code: "US", name: "United States", flag: "US", available: 1842, startingPrice: 1.2 },
  { code: "GB", name: "United Kingdom", flag: "GB", available: 911, startingPrice: 1.1 },
  { code: "DE", name: "Germany", flag: "DE", available: 644, startingPrice: 1.35 },
  { code: "FR", name: "France", flag: "FR", available: 528, startingPrice: 1.3 },
  { code: "NL", name: "Netherlands", flag: "NL", available: 402, startingPrice: 1.15 },
  { code: "CA", name: "Canada", flag: "CA", available: 369, startingPrice: 1.25 },
  { code: "BR", name: "Brazil", flag: "BR", available: 705, startingPrice: 0.75 },
  { code: "IN", name: "India", flag: "IN", available: 1294, startingPrice: 0.65 },
];

const services = [
  { code: "tg", name: "Telegram", category: "Messaging", available: 1244, price: 1.45 },
  { code: "wa", name: "WhatsApp", category: "Messaging", available: 923, price: 1.65 },
  { code: "go", name: "Google", category: "Accounts", available: 682, price: 1.95 },
  { code: "ig", name: "Instagram", category: "Social", available: 801, price: 1.35 },
  { code: "fb", name: "Facebook", category: "Social", available: 775, price: 1.25 },
  { code: "tw", name: "X / Twitter", category: "Social", available: 312, price: 1.55 },
  { code: "dc", name: "Discord", category: "Community", available: 486, price: 1.1 },
  { code: "am", name: "Amazon", category: "Commerce", available: 236, price: 2.1 },
];

function providerStatus(name: "Hero SMS" | "OxaPay") {
  const configured = name === "Hero SMS" ? Boolean(process.env.HERO_SMS_API_KEY) : Boolean(process.env.OXAPAY_MERCHANT_API_KEY);
  return {
    name,
    mode: configured ? "live" : "setup_required",
    message: configured
      ? `${name} credentials are configured for live server-side requests.`
      : `${name} secret is not configured yet. Live provider actions are disabled until the secret is added securely.`,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function futureIso(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function getUserId(req: Request) {
  const auth = (req as Request & { auth?: { userId?: string } }).auth;
  return auth?.userId ?? demoUserId;
}

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sim_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      credits NUMERIC NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sim_payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES sim_users(id),
      amount NUMERIC NOT NULL,
      credits NUMERIC NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL,
      provider TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sim_rentals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES sim_users(id),
      country_code TEXT NOT NULL,
      country_name TEXT NOT NULL,
      service_code TEXT NOT NULL,
      service_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      price NUMERIC NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sim_sms_messages (
      id TEXT PRIMARY KEY,
      rental_id TEXT NOT NULL REFERENCES sim_rentals(id),
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      code TEXT,
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query("DELETE FROM sim_sms_messages WHERE rental_id IN (SELECT id FROM sim_rentals WHERE user_id = $1)", [demoUserId]);
  await pool.query("DELETE FROM sim_rentals WHERE user_id = $1", [demoUserId]);
  await pool.query("DELETE FROM sim_payments WHERE user_id = $1", [demoUserId]);
  await pool.query(
    `INSERT INTO sim_users (id, name, email, role, credits, status)
     VALUES ($1, 'Customer', 'customer@smsrentals.app', 'user', 0, 'active')
     ON CONFLICT (id) DO UPDATE SET name = 'Customer', email = 'customer@smsrentals.app', credits = 0, role = 'user'`,
    [demoUserId],
  );
}

function mapRental(row: Record<string, unknown>, messages: Array<Record<string, unknown>> = []) {
  return {
    id: String(row.id),
    countryCode: String(row.country_code),
    countryName: String(row.country_name),
    serviceCode: String(row.service_code),
    serviceName: String(row.service_name),
    phoneNumber: String(row.phone_number),
    price: Number(row.price),
    status: String(row.status),
    createdAt: new Date(String(row.created_at)).toISOString(),
    expiresAt: new Date(String(row.expires_at)).toISOString(),
    messages: messages.map((message) => ({
      id: String(message.id),
      sender: String(message.sender),
      message: String(message.message),
      code: message.code ? String(message.code) : undefined,
      receivedAt: new Date(String(message.received_at)).toISOString(),
    })),
  };
}

async function listUserRentals(userId: string) {
  const rentalsResult = await pool.query(
    "SELECT * FROM sim_rentals WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  const messagesResult = await pool.query(
    "SELECT * FROM sim_sms_messages WHERE rental_id = ANY($1::text[]) ORDER BY received_at DESC",
    [rentalsResult.rows.map((row) => row.id)],
  );
  return rentalsResult.rows.map((row) => mapRental(row, messagesResult.rows.filter((message) => message.rental_id === row.id)));
}

async function getAccount(userId: string) {
  await pool.query(
    `INSERT INTO sim_users (id, name, email, role, credits, status)
     VALUES ($1, 'Customer', 'customer@smsrentals.app', 'user', 0, 'active')
     ON CONFLICT (id) DO NOTHING`,
    [userId],
  );
  const result = await pool.query("SELECT * FROM sim_users WHERE id = $1", [userId]);
  const user = result.rows[0];
  return {
    id: String(user.id),
    name: String(user.name),
    email: String(user.email),
    role: String(user.role),
    credits: Number(user.credits),
  };
}

router.use(async (_req, res, next) => {
  try {
    schemaReady ??= ensureSchema();
    await schemaReady;
    next();
  } catch (error) {
    schemaReady = null;
    res.status(500).json({ error: error instanceof Error ? error.message : "Database setup failed" });
  }
});

router.get("/me", async (req, res) => {
  const data = GetMeResponse.parse(await getAccount(getUserId(req)));
  res.json(data);
});

router.get("/dashboard", async (req, res) => {
  const userId = getUserId(req);
  const account = await getAccount(userId);
  const rentals = await listUserRentals(userId);
  const payments = await pool.query("SELECT * FROM sim_payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5", [userId]);
  const data = GetDashboardResponse.parse({
    account,
    activeRentals: rentals.filter((r) => r.status === "active" || r.status === "sms_received").length,
    completedRentals: rentals.filter((r) => r.status === "completed").length,
    totalSpent: rentals.reduce((sum, rental) => sum + rental.price, 0),
    recentRentals: rentals.slice(0, 4),
    recentPayments: payments.rows.map((row) => ({
      id: String(row.id),
      amount: Number(row.amount),
      credits: Number(row.credits),
      currency: String(row.currency),
      status: String(row.status),
      provider: String(row.provider),
      createdAt: new Date(String(row.created_at)).toISOString(),
    })),
    providerStatuses: [providerStatus("Hero SMS"), providerStatus("OxaPay")],
  });
  res.json(data);
});

router.get("/catalog/countries", (_req, res) => {
  res.json(ListCountriesResponse.parse({ countries, provider: providerStatus("Hero SMS") }));
});

router.get("/catalog/services", (req, res) => {
  ListServicesQueryParams.parse(req.query);
  res.json(ListServicesResponse.parse({ services, provider: providerStatus("Hero SMS") }));
});

router.get("/catalog/availability", (req, res) => {
  const params = GetAvailabilityQueryParams.parse(req.query);
  const service = services.find((item) => item.code === params.serviceCode) ?? services[0];
  const country = countries.find((item) => item.code === params.countryCode) ?? countries[0];
  res.json(
    GetAvailabilityResponse.parse({
      countryCode: country.code,
      serviceCode: service.code,
      available: Math.max(25, Math.floor((country.available + service.available) / 8)),
      price: Number((service.price + country.startingPrice * 0.25).toFixed(2)),
      estimatedWait: "Instant to 2 minutes",
      provider: providerStatus("Hero SMS"),
    }),
  );
});

router.get("/rentals", async (req, res) => {
  res.json(ListRentalsResponse.parse({ rentals: await listUserRentals(getUserId(req)) }));
});

router.post("/rentals", async (req, res) => {
  const body = CreateRentalBody.parse(req.body);
  const userId = getUserId(req);
  const account = await getAccount(userId);
  const country = countries.find((item) => item.code === body.countryCode) ?? countries[0];
  const service = services.find((item) => item.code === body.serviceCode) ?? services[0];
  const price = Number((service.price + country.startingPrice * 0.25).toFixed(2));

  if (account.credits < price) {
    res.status(402).json({ error: "Insufficient credits" });
    return;
  }

  const id = crypto.randomUUID();
  const phoneNumber = `+${Math.floor(10000000000 + Math.random() * 89999999999)}`;
  await pool.query("UPDATE sim_users SET credits = credits - $1 WHERE id = $2", [price, userId]);
  const result = await pool.query(
    `INSERT INTO sim_rentals (id, user_id, country_code, country_name, service_code, service_name, phone_number, price, status, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW() + INTERVAL '20 minutes')
     RETURNING *`,
    [id, userId, country.code, country.name, service.code, service.name, phoneNumber, price],
  );
  res.json(CreateRentalResponse.parse(mapRental(result.rows[0])));
});

router.post("/rentals/:id/refresh", async (req, res) => {
  const params = RefreshRentalParams.parse(req.params);
  const existing = await pool.query("SELECT * FROM sim_sms_messages WHERE rental_id = $1", [params.id]);
  if (existing.rows.length === 0) {
    const code = String(Math.floor(100000 + Math.random() * 899999));
    await pool.query(
      "INSERT INTO sim_sms_messages (id, rental_id, sender, message, code) VALUES ($1, $2, 'Verification', $3, $4)",
      [crypto.randomUUID(), params.id, `Your verification code is ${code}.`, code],
    );
    await pool.query("UPDATE sim_rentals SET status = 'sms_received' WHERE id = $1", [params.id]);
  }
  const rental = await pool.query("SELECT * FROM sim_rentals WHERE id = $1", [params.id]);
  const messages = await pool.query("SELECT * FROM sim_sms_messages WHERE rental_id = $1 ORDER BY received_at DESC", [params.id]);
  res.json(RefreshRentalResponse.parse(mapRental(rental.rows[0], messages.rows)));
});

router.post("/rentals/:id/cancel", async (req, res) => {
  const params = CancelRentalParams.parse(req.params);
  await pool.query("UPDATE sim_rentals SET status = 'cancelled' WHERE id = $1", [params.id]);
  const rental = await pool.query("SELECT * FROM sim_rentals WHERE id = $1", [params.id]);
  const messages = await pool.query("SELECT * FROM sim_sms_messages WHERE rental_id = $1 ORDER BY received_at DESC", [params.id]);
  res.json(CancelRentalResponse.parse(mapRental(rental.rows[0], messages.rows)));
});

router.get("/payments", async (req, res) => {
  const result = await pool.query("SELECT * FROM sim_payments WHERE user_id = $1 ORDER BY created_at DESC", [getUserId(req)]);
  res.json(
    ListPaymentsResponse.parse({
      payments: result.rows.map((row) => ({
        id: String(row.id),
        amount: Number(row.amount),
        credits: Number(row.credits),
        currency: String(row.currency),
        status: String(row.status),
        provider: String(row.provider),
        createdAt: new Date(String(row.created_at)).toISOString(),
      })),
    }),
  );
});

router.post("/payments/checkout", async (req, res) => {
  const body = CreatePaymentCheckoutBody.parse(req.body);
  const id = crypto.randomUUID();
  const userId = getUserId(req);
  const status = process.env.OXAPAY_MERCHANT_API_KEY ? "pending" : "pending";
  const result = await pool.query(
    `INSERT INTO sim_payments (id, user_id, amount, credits, currency, status, provider)
     VALUES ($1, $2, $3, $3, $4, $5, 'OxaPay') RETURNING *`,
    [id, userId, body.amount, body.currency, status],
  );
  const row = result.rows[0];
  res.json(
    CreatePaymentCheckoutResponse.parse({
      payment: {
        id: String(row.id),
        amount: Number(row.amount),
        credits: Number(row.credits),
        currency: String(row.currency),
        status: String(row.status),
        provider: String(row.provider),
        createdAt: new Date(String(row.created_at)).toISOString(),
      },
      checkoutUrl: process.env.OXAPAY_MERCHANT_API_KEY ? `https://app.oxapay.com/merchants/pay/${id}` : "#oxapay-secret-required",
      provider: providerStatus("OxaPay"),
    }),
  );
});

router.get("/admin/overview", async (_req, res) => {
  const users = await pool.query("SELECT COUNT(*)::int AS count FROM sim_users");
  const rentals = await pool.query("SELECT COUNT(*)::int AS count FROM sim_rentals WHERE status IN ('active', 'sms_received')");
  const revenue = await pool.query("SELECT COALESCE(SUM(amount), 0)::numeric AS total FROM sim_payments WHERE status = 'paid'");
  const pending = await pool.query("SELECT COUNT(*)::int AS count FROM sim_payments WHERE status = 'pending'");
  res.json(
    GetAdminOverviewResponse.parse({
      totalUsers: users.rows[0].count,
      activeRentals: rentals.rows[0].count,
      revenue: Number(revenue.rows[0].total),
      pendingPayments: pending.rows[0].count,
      providerStatuses: [providerStatus("Hero SMS"), providerStatus("OxaPay")],
    }),
  );
});

router.get("/admin/users", async (_req, res) => {
  const result = await pool.query(`
    SELECT u.*, COUNT(r.id)::int AS rentals
    FROM sim_users u
    LEFT JOIN sim_rentals r ON r.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);
  res.json(
    ListAdminUsersResponse.parse({
      users: result.rows.map((row) => ({
        id: String(row.id),
        name: String(row.name),
        email: String(row.email),
        role: String(row.role),
        credits: Number(row.credits),
        rentals: Number(row.rentals),
        status: String(row.status),
      })),
    }),
  );
});

router.get("/admin/transactions", async (_req, res) => {
  const result = await pool.query(`
    SELECT p.id, u.email AS user_email, p.amount, p.status, p.created_at
    FROM sim_payments p
    JOIN sim_users u ON u.id = p.user_id
    ORDER BY p.created_at DESC
  `);
  res.json(
    ListAdminTransactionsResponse.parse({
      transactions: result.rows.map((row) => ({
        id: String(row.id),
        userEmail: String(row.user_email),
        type: "credit_purchase",
        amount: Number(row.amount),
        status: String(row.status),
        createdAt: new Date(String(row.created_at)).toISOString(),
      })),
    }),
  );
});

export default router;
