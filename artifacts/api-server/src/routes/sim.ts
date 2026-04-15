import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import type { AuthUser } from "../lib/auth";
import { ensureSimSchema } from "../lib/simSchema";
import {
  getHeroAvailability,
  getHeroBalance,
  getHeroCountriesForService,
  getHeroStatus,
  rentHeroNumber,
  setHeroStatus,
} from "../lib/heroSms";
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
  { code: "ds", name: "Discord", category: "Community", available: 486, price: 1.1 },
  { code: "am", name: "Amazon", category: "Commerce", available: 236, price: 2.1 },
];

type Service = (typeof services)[number];
type Country = (typeof countries)[number];

async function requireAdmin(req: Request, res: Response): Promise<boolean> {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  const userId = req.user.id;
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (adminEmail && req.user.email?.toLowerCase() === adminEmail) return true;
  const result = await pool.query("SELECT role FROM sim_users WHERE id = $1", [userId]);
  if (result.rows[0]?.role === "admin") return true;
  res.status(403).json({ error: "Admin access required" });
  return false;
}

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

async function heroProviderStatus() {
  if (!process.env.HERO_SMS_API_KEY) return providerStatus("Hero SMS");
  try {
    const balance = await getHeroBalance();
    return {
      name: "Hero SMS",
      mode: "live" as const,
      message: `Hero SMS is connected. Provider balance: $${balance.toFixed(2)}.`,
    };
  } catch (error) {
    return {
      name: "Hero SMS",
      mode: "setup_required" as const,
      message: error instanceof Error ? error.message : "Hero SMS connection failed.",
    };
  }
}

function nowIso() {
  return new Date().toISOString();
}

function futureIso(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

async function listServicePrices() {
  const result = await pool.query("SELECT service_code, price FROM sim_service_prices");
  return new Map(result.rows.map((row) => [String(row.service_code), Number(row.price)]));
}

async function getServicePrice(service: Service, country: Country) {
  const result = await pool.query("SELECT price FROM sim_service_prices WHERE service_code = $1", [service.code]);
  if (result.rows[0]) return Number(result.rows[0].price);
  return Number((service.price + country.startingPrice * 0.25).toFixed(2));
}

async function servicesWithPrices(country?: Country) {
  const prices = await listServicePrices();
  const countryBase = country?.startingPrice ?? 0;
  return services.map((service) => ({
    ...service,
    price: prices.has(service.code)
      ? Number(prices.get(service.code))
      : Number((service.price + countryBase * 0.25).toFixed(2)),
  }));
}

function getUserId(req: Request): string {
  return req.user?.id ?? "anonymous";
}

function getRequestOrigin(req: Request) {
  const protocol = req.get("x-forwarded-proto") ?? req.protocol;
  const host = req.get("x-forwarded-host") ?? req.get("host");
  return host ? `${protocol}://${host}` : "https://smsrentals.app";
}

async function createOxaPayInvoice(req: Request, paymentId: string, amount: number, currency: string) {
  const merchant = process.env.OXAPAY_MERCHANT_API_KEY;
  if (!merchant) {
    throw new Error("OxaPay merchant key is not configured.");
  }

  const origin = getRequestOrigin(req);
  const response = await fetch("https://api.oxapay.com/merchants/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchant,
      amount,
      currency,
      lifeTime: 60,
      feePaidByPayer: 1,
      underPaidCover: 1,
      orderId: paymentId,
      description: `SMS Rentals credit package - ${amount} credits`,
      returnUrl: `${origin}/payments`,
      callbackUrl: `${origin}/api/payments/oxapay/webhook`,
    }),
  });

  const payload = await response.json().catch(() => null) as { result?: number; message?: string; payLink?: string; trackId?: string } | null;

  if (!response.ok || !payload || payload.result !== 100 || !payload.payLink) {
    throw new Error(payload?.message || "OxaPay did not return a checkout link.");
  }

  return payload.payLink;
}

function extractCode(value: string) {
  return value.match(/\b\d{4,8}\b/)?.[0] ?? value;
}

async function refundExpiredRental(row: Record<string, unknown>) {
  if (Boolean(row.refunded)) return;
  const messages = await pool.query("SELECT COUNT(*)::int AS count FROM sim_sms_messages WHERE rental_id = $1", [row.id]);
  if (Number(messages.rows[0].count) > 0) return;
  const price = Number(row.price);
  if (price > 0) {
    await pool.query("UPDATE sim_users SET credits = credits + $1 WHERE id = $2", [price, row.user_id]);
  }
  await pool.query("UPDATE sim_rentals SET refunded = TRUE WHERE id = $1", [row.id]);
}

async function syncExpiredRentals(userId?: string) {
  const params: unknown[] = [];
  const userFilter = userId ? "AND user_id = $1" : "";
  if (userId) params.push(userId);
  const result = await pool.query(
    `SELECT * FROM sim_rentals WHERE status = 'active' AND expires_at <= NOW() ${userFilter}`,
    params,
  );
  for (const row of result.rows) {
    await pool.query("UPDATE sim_rentals SET status = 'expired' WHERE id = $1", [row.id]);
    await refundExpiredRental(row);
  }
}

async function syncHeroStatus(id: string) {
  const rentalResult = await pool.query("SELECT * FROM sim_rentals WHERE id = $1", [id]);
  const rental = rentalResult.rows[0];
  if (!rental) return null;

  if (String(rental.status) === "active" && new Date(String(rental.expires_at)) <= new Date()) {
    await pool.query("UPDATE sim_rentals SET status = 'expired' WHERE id = $1", [id]);
    await refundExpiredRental(rental);
  }

  if (String(rental.status) === "active" && rental.provider_activation_id) {
    try {
      const status = await getHeroStatus(String(rental.provider_activation_id));
      if (status.status === "STATUS_OK" && status.code) {
        const existing = await pool.query("SELECT COUNT(*)::int AS count FROM sim_sms_messages WHERE rental_id = $1 AND code = $2", [id, status.code]);
        if (Number(existing.rows[0].count) === 0) {
          await pool.query(
            "INSERT INTO sim_sms_messages (id, rental_id, sender, message, code) VALUES ($1, $2, 'Hero SMS', $3, $4)",
            [crypto.randomUUID(), id, `Your verification code is ${status.code}.`, extractCode(status.code)],
          );
        }
        await setHeroStatus(String(rental.provider_activation_id), 6).catch(() => null);
        await pool.query("UPDATE sim_rentals SET status = 'sms_received' WHERE id = $1", [id]);
      } else if (["STATUS_CANCEL", "NO_ACTIVATION", "STATUS_FINISH"].includes(status.status)) {
        await pool.query("UPDATE sim_rentals SET status = 'expired' WHERE id = $1", [id]);
        await refundExpiredRental(rental);
      }
    } catch {
    }
  }

  const updated = await pool.query("SELECT * FROM sim_rentals WHERE id = $1", [id]);
  return updated.rows[0] ?? null;
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
  await syncExpiredRentals(userId);
  const rentalsResult = await pool.query(
    "SELECT * FROM sim_rentals WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  for (const rental of rentalsResult.rows.filter((row) => row.status === "active")) {
    await syncHeroStatus(String(rental.id));
  }
  const syncedRentalsResult = await pool.query(
    "SELECT * FROM sim_rentals WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  const messagesResult = await pool.query(
    "SELECT * FROM sim_sms_messages WHERE rental_id = ANY($1::text[]) ORDER BY received_at DESC",
    [syncedRentalsResult.rows.map((row) => row.id)],
  );
  return syncedRentalsResult.rows.map((row) => mapRental(row, messagesResult.rows.filter((message) => message.rental_id === row.id)));
}

async function getAccount(userId: string, authUser?: AuthUser) {
  const name = authUser
    ? [authUser.firstName, authUser.lastName].filter(Boolean).join(" ") || "User"
    : "User";
  const email = authUser?.email || `user-${userId}@sms-rentals.app`;

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const isAdminEmail = adminEmail && email.toLowerCase() === adminEmail;

  await pool.query(
    `INSERT INTO sim_users (id, name, email, role, credits, status)
     VALUES ($1, $2, $3, $4, 0, 'active')
     ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email${isAdminEmail ? ", role = 'admin'" : ""}`,
    [userId, name, email, isAdminEmail ? "admin" : "user"],
  );
  const result = await pool.query("SELECT * FROM sim_users WHERE id = $1", [userId]);
  const user = result.rows[0];
  return {
    id: String(user.id),
    name: String(user.name),
    email: String(user.email),
    role: String(user.role),
    credits: Number(user.credits),
    avatarUrl: authUser?.profileImageUrl || undefined,
  };
}

router.use(async (_req, res, next) => {
  try {
    await ensureSimSchema();
    next();
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Database setup failed" });
  }
});

router.get("/me", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const data = GetMeResponse.parse(await getAccount(getUserId(req), req.user));
  res.json(data);
});

router.get("/dashboard", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = getUserId(req);
  const account = await getAccount(userId, req.user);
  const rentals = await listUserRentals(userId);
  const payments = await pool.query("SELECT * FROM sim_payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5", [userId]);
  const heroStatus = await heroProviderStatus();
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
    providerStatuses: [heroStatus, providerStatus("OxaPay")],
  });
  res.json(data);
});

router.get("/catalog/countries", async (_req, res) => {
  res.json(ListCountriesResponse.parse({ countries, provider: await heroProviderStatus() }));
});

router.get("/catalog/countries-for-service", async (req, res) => {
  const serviceCode = String(req.query.serviceCode ?? "");
  const service = services.find((item) => item.code === serviceCode);
  if (!service) {
    res.status(400).json({ error: "Unknown service code" });
    return;
  }
  const providerSt = await heroProviderStatus();
  const liveData = await getHeroCountriesForService(serviceCode).catch(() => []);

  const result = countries
    .map((country) => {
      const live = liveData.find((d) => d.countryCode === country.code);
      return {
        code: country.code,
        name: country.name,
        flag: country.code,
        available: live?.count ?? 0,
        heroPrice: live?.cost ?? 0,
      };
    })
    .filter((c) => c.available > 0)
    .sort((a, b) => b.available - a.available);

  res.json({ countries: result, provider: providerSt });
});

router.get("/catalog/services", async (req, res) => {
  ListServicesQueryParams.parse(req.query);
  const country = countries.find((item) => item.code === String(req.query.countryCode ?? ""));
  res.json(ListServicesResponse.parse({ services: await servicesWithPrices(country), provider: await heroProviderStatus() }));
});

router.get("/catalog/availability", async (req, res) => {
  const params = GetAvailabilityQueryParams.parse(req.query);
  const service = services.find((item) => item.code === params.serviceCode);
  const country = countries.find((item) => item.code === params.countryCode);
  if (!service || !country) {
    res.status(400).json({ error: "Unknown service or country code." });
    return;
  }
  const customPrice = await getServicePrice(service, country);
  const live = await getHeroAvailability(service.code, country.code).catch(() => null);
  res.json(
    GetAvailabilityResponse.parse({
      countryCode: country.code,
      serviceCode: service.code,
      available: live?.count ?? 0,
      price: customPrice,
      estimatedWait: "20 minute activation window",
      provider: await heroProviderStatus(),
    }),
  );
});

router.get("/rentals", async (req, res) => {
  res.json(ListRentalsResponse.parse({ rentals: await listUserRentals(getUserId(req)) }));
});

router.post("/rentals", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const body = CreateRentalBody.parse(req.body);
  const userId = getUserId(req);
  const account = await getAccount(userId, req.user);
  const country = countries.find((item) => item.code === body.countryCode) ?? countries[0];
  const service = services.find((item) => item.code === body.serviceCode) ?? services[0];
  const price = await getServicePrice(service, country);

  if (account.credits < price) {
    res.status(402).json({ error: "Insufficient credits" });
    return;
  }

  const id = crypto.randomUUID();
  try {
    const providerRental = await rentHeroNumber(service.code, country.code, price || undefined);
    if (price > 0) {
      await pool.query("UPDATE sim_users SET credits = credits - $1 WHERE id = $2", [price, userId]);
    }
    const result = await pool.query(
      `INSERT INTO sim_rentals (id, user_id, country_code, country_name, service_code, service_name, phone_number, price, status, provider, provider_activation_id, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', 'Hero SMS', $9, NOW() + INTERVAL '20 minutes')
       RETURNING *`,
      [id, userId, country.code, country.name, service.code, service.name, providerRental.phoneNumber, price, providerRental.activationId],
    );
    res.json(CreateRentalResponse.parse(mapRental(result.rows[0])));
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Hero SMS could not allocate a number." });
  }
});

router.post("/rentals/:id/refresh", async (req, res) => {
  const params = RefreshRentalParams.parse(req.params);
  const rental = await syncHeroStatus(params.id);
  if (!rental) {
    res.status(404).json({ error: "Rental not found" });
    return;
  }
  const messages = await pool.query("SELECT * FROM sim_sms_messages WHERE rental_id = $1 ORDER BY received_at DESC", [params.id]);
  res.json(RefreshRentalResponse.parse(mapRental(rental, messages.rows)));
});

router.post("/rentals/:id/cancel", async (req, res) => {
  const params = CancelRentalParams.parse(req.params);
  const rental = await pool.query("SELECT * FROM sim_rentals WHERE id = $1", [params.id]);
  const row = rental.rows[0];
  if (!row) {
    res.status(404).json({ error: "Rental not found" });
    return;
  }
  if (row.provider_activation_id) {
    const providerResponse = await setHeroStatus(String(row.provider_activation_id), 8);
    if (providerResponse === "EARLY_CANCEL_DENIED") {
      res.status(409).json({ error: "Hero SMS allows cancellation only after the provider's minimum waiting time. Try again shortly." });
      return;
    }
  }
  await pool.query("UPDATE sim_rentals SET status = 'cancelled' WHERE id = $1", [params.id]);
  await refundExpiredRental(row);
  const updatedRental = await pool.query("SELECT * FROM sim_rentals WHERE id = $1", [params.id]);
  const messages = await pool.query("SELECT * FROM sim_sms_messages WHERE rental_id = $1 ORDER BY received_at DESC", [params.id]);
  res.json(CancelRentalResponse.parse(mapRental(updatedRental.rows[0], messages.rows)));
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
  try {
    const checkoutUrl = await createOxaPayInvoice(req, id, body.amount, body.currency);
    const result = await pool.query(
      `INSERT INTO sim_payments (id, user_id, amount, credits, currency, status, provider)
       VALUES ($1, $2, $3, $3, $4, 'pending', 'OxaPay') RETURNING *`,
      [id, userId, body.amount, body.currency],
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
        checkoutUrl,
        provider: providerStatus("OxaPay"),
      }),
    );
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Unable to create OxaPay checkout." });
  }
});

router.get("/admin/overview", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  const users = await pool.query("SELECT COUNT(*)::int AS count FROM sim_users");
  const rentals = await pool.query("SELECT COUNT(*)::int AS count FROM sim_rentals WHERE status IN ('active', 'sms_received')");
  const revenue = await pool.query("SELECT COALESCE(SUM(amount), 0)::numeric AS total FROM sim_payments WHERE status = 'paid'");
  const pending = await pool.query("SELECT COUNT(*)::int AS count FROM sim_payments WHERE status = 'pending'");
  const heroStatus = await heroProviderStatus();
  res.json(
    GetAdminOverviewResponse.parse({
      totalUsers: users.rows[0].count,
      activeRentals: rentals.rows[0].count,
      revenue: Number(revenue.rows[0].total),
      pendingPayments: pending.rows[0].count,
      providerStatuses: [heroStatus, providerStatus("OxaPay")],
    }),
  );
});

router.get("/admin/users", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
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

router.post("/admin/users/:id/credits", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  const userId = String(req.params.id);
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount)) {
    res.status(400).json({ error: "A valid credit amount is required." });
    return;
  }
  const result = await pool.query(
    "UPDATE sim_users SET credits = GREATEST(credits + $1, 0) WHERE id = $2 RETURNING id, name, email, role, credits, status",
    [amount, userId],
  );
  if (!result.rows[0]) {
    res.status(404).json({ error: "User not found." });
    return;
  }
  const row = result.rows[0];
  res.json({
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: String(row.role),
    credits: Number(row.credits),
    status: String(row.status),
  });
});

router.put("/admin/users/:id/role", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  const userId = String(req.params.id);
  const role = String(req.body?.role ?? "");
  if (role !== "admin" && role !== "user") {
    res.status(400).json({ error: "Role must be 'admin' or 'user'." });
    return;
  }
  const result = await pool.query(
    "UPDATE sim_users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, credits, status",
    [role, userId],
  );
  if (!result.rows[0]) {
    res.status(404).json({ error: "User not found." });
    return;
  }
  const row = result.rows[0];
  res.json({
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: String(row.role),
    credits: Number(row.credits),
    status: String(row.status),
  });
});

router.get("/admin/services", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  const priceOverrides = await listServicePrices();
  res.json({
    services: services.map((service) => ({
      ...service,
      basePrice: service.price,
      price: priceOverrides.has(service.code) ? Number(priceOverrides.get(service.code)) : service.price,
      customPrice: priceOverrides.has(service.code),
    })),
  });
});

router.put("/admin/services/:code/price", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  const code = String(req.params.code);
  const price = Number(req.body?.price);
  const service = services.find((item) => item.code === code);
  if (!service) {
    res.status(404).json({ error: "Service not found." });
    return;
  }
  if (!Number.isFinite(price) || price < 0) {
    res.status(400).json({ error: "Price must be 0 or higher." });
    return;
  }
  await pool.query(
    `INSERT INTO sim_service_prices (service_code, price, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (service_code) DO UPDATE SET price = EXCLUDED.price, updated_at = NOW()`,
    [code, price],
  );
  res.json({
    code: service.code,
    name: service.name,
    category: service.category,
    available: service.available,
    basePrice: service.price,
    price,
    customPrice: true,
  });
});

router.get("/admin/transactions", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
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
