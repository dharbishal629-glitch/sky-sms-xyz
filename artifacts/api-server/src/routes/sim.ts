import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import type { AuthUser } from "../lib/auth";
import { ensureSimSchema } from "../lib/simSchema";
import { isAdminEmail } from "../lib/adminConfig";
import {
  getHeroAvailability,
  getHeroBalance,
  getHeroCountriesForService,
  getHeroPriceCatalog,
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

type Service = { code: string; name: string; category: string; available: number; price: number };
type Country = { code: string; name: string; flag: string; available: number; startingPrice: number };

const fallbackCountries: Country[] = [];
const fallbackServices: Service[] = [];

const serviceNames: Record<string, { name: string; category: string }> = {
  aex: { name: "AliExpress", category: "Commerce" },
  ap: { name: "Apple", category: "Accounts" },
  aw: { name: "Amazon Web Services", category: "Cloud" },
  be: { name: "Line", category: "Messaging" },
  bbl: { name: "Bumble", category: "Dating" },
  boh: { name: "Wise", category: "Finance" },
  dp: { name: "Proton", category: "Email" },
  ew: { name: "Nike", category: "Shopping" },
  fh: { name: "Bolt", category: "Travel" },
  fu: { name: "Snapchat", category: "Social" },
  kt: { name: "KakaoTalk", category: "Messaging" },
  lf: { name: "TikTok", category: "Social" },
  mb: { name: "Yahoo", category: "Email" },
  mt: { name: "Steam", category: "Gaming" },
  nv: { name: "Naver", category: "Accounts" },
  oi: { name: "Tinder", category: "Dating" },
  ok: { name: "OK.ru", category: "Social" },
  pc: { name: "Casino Plus", category: "Gaming" },
  pf: { name: "pof.com", category: "Dating" },
  pm: { name: "AOL", category: "Email" },
  re: { name: "Coinbase", category: "Finance" },
  uu: { name: "Wildberries", category: "Shopping" },
  vg: { name: "ShellBox", category: "Shopping" },
  vs: { name: "WinzoGame", category: "Gaming" },
  wx: { name: "Apple", category: "Accounts" },
  ya: { name: "Yandex", category: "Accounts" },
  tg: { name: "Telegram", category: "Messaging" },
  wa: { name: "WhatsApp", category: "Messaging" },
  go: { name: "Google", category: "Accounts" },
  ig: { name: "Instagram", category: "Social" },
  fb: { name: "Facebook", category: "Social" },
  tw: { name: "X / Twitter", category: "Social" },
  ds: { name: "Discord", category: "Community" },
  am: { name: "Amazon", category: "Commerce" },
  mm: { name: "Microsoft", category: "Accounts" },
  tk: { name: "TikTok", category: "Social" },
  sn: { name: "Snapchat", category: "Social" },
  nf: { name: "Netflix", category: "Entertainment" },
  nt: { name: "Netflix", category: "Entertainment" },
  qq: { name: "QQ", category: "Messaging" },
  wb: { name: "WeChat", category: "Messaging" },
  vi: { name: "Viber", category: "Messaging" },
  vk: { name: "VK", category: "Social" },
  av: { name: "Avito", category: "Commerce" },
  ub: { name: "Uber", category: "Travel" },
  ly: { name: "Olacabs", category: "Travel" },
  mbt: { name: "Microsoft Bing", category: "Accounts" },
  ot: { name: "Other", category: "General" },
};

const countryDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryFlag(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return "🌍";
  return code
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

function countryFromCode(code: string, live?: { count?: number; cost?: number }): Country {
  const fallback = fallbackCountries.find((item) => item.code === code);
  if (fallback) return { ...fallback, available: live?.count ?? fallback.available, startingPrice: live?.cost ?? fallback.startingPrice };
  const normalized = code.toUpperCase();
  const countryName = /^[A-Z]{2}$/.test(normalized) ? countryDisplayNames.of(normalized) : null;
  return {
    code: normalized,
    name: countryName ?? (normalized.startsWith("H") ? `Hero country ${normalized.slice(1)}` : normalized),
    flag: countryFlag(normalized),
    available: live?.count ?? 0,
    startingPrice: live?.cost ?? 0,
  };
}

function serviceFromCode(code: string, live?: { count?: number; cost?: number }): Service {
  const fallback = fallbackServices.find((item) => item.code === code);
  const normalizedCode = code.toLowerCase();
  const meta = serviceNames[normalizedCode] ?? serviceNames[code];
  if (fallback) return { ...fallback, available: live?.count ?? fallback.available, price: live?.cost ?? fallback.price };
  return {
    code,
    name: meta?.name ?? `Service ${code.toUpperCase()}`,
    category: meta?.category ?? "Live Provider",
    available: live?.count ?? 0,
    price: live?.cost ?? 0,
  };
}

async function withFastFallback<T>(promise: Promise<T>, fallback: T, timeoutMs = 1000): Promise<T> {
  return Promise.race([
    promise.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
  ]);
}

async function structuralServiceFallback(): Promise<Service[]> {
  const enabledCodes = await listEnabledServiceCodes();
  if (!enabledCodes) return [];
  return Array.from(enabledCodes).map((code) => serviceFromCode(code, { count: 0, cost: 0 }));
}

async function liveServices(countryCode?: string): Promise<Service[]> {
  const catalog = await withFastFallback(getHeroPriceCatalog(), [], 8000);
  if (catalog.length === 0) return structuralServiceFallback();
  const totals = new Map<string, { count: number; cost: number }>();
  for (const item of catalog) {
    if (countryCode && item.countryCode !== countryCode) continue;
    const current = totals.get(item.serviceCode) ?? { count: 0, cost: item.cost };
    current.count += item.count;
    current.cost = current.cost || item.cost;
    totals.set(item.serviceCode, current);
  }
  return Array.from(totals.entries())
    .map(([code, live]) => serviceFromCode(code, live))
    .sort((a, b) => b.available - a.available || a.name.localeCompare(b.name));
}

const MAX_COUNTRIES = 10;

async function liveCountries(): Promise<Country[]> {
  const catalog = await withFastFallback(getHeroPriceCatalog(), [], 8000);
  if (catalog.length === 0) return fallbackCountries;
  const enabledCodes = await listEnabledServiceCodes();
  const totals = new Map<string, { count: number; cost: number }>();
  for (const item of catalog) {
    if (enabledCodes && !enabledCodes.has(item.serviceCode)) continue;
    const current = totals.get(item.countryCode) ?? { count: 0, cost: item.cost };
    current.count += item.count;
    if (item.cost > 0 && (current.cost === 0 || item.cost < current.cost)) current.cost = item.cost;
    totals.set(item.countryCode, current);
  }
  return Array.from(totals.entries())
    .map(([code, live]) => countryFromCode(code, live))
    .filter((c) => c.available > 0)
    .sort((a, b) => a.startingPrice - b.startingPrice || a.name.localeCompare(b.name))
    .slice(0, MAX_COUNTRIES);
}

async function requireAdmin(req: Request, res: Response): Promise<boolean> {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  // Primary check: email must be in the admin allowlist
  if (isAdminEmail(req.user.email)) return true;
  // Secondary check: role in DB (catches manually-promoted users)
  const result = await pool.query("SELECT role FROM sim_users WHERE id = $1", [req.user.id]);
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

async function listCountryServicePrices(countryCode: string) {
  const result = await pool.query("SELECT service_code, price FROM sim_service_country_prices WHERE country_code = $1", [countryCode]);
  return new Map(result.rows.map((row) => [String(row.service_code), Number(row.price)]));
}

async function getCountryBasePrice(countryCode: string): Promise<number | null> {
  const result = await pool.query("SELECT base_price FROM sim_country_base_prices WHERE country_code = $1", [countryCode]);
  return result.rows[0] ? Number(result.rows[0].base_price) : null;
}

async function listAllCountryBasePrices(): Promise<Map<string, number>> {
  const result = await pool.query("SELECT country_code, base_price FROM sim_country_base_prices");
  return new Map(result.rows.map((row) => [String(row.country_code), Number(row.base_price)]));
}

async function listEnabledServiceCodes() {
  const result = await pool.query("SELECT service_code FROM sim_enabled_services WHERE enabled = TRUE");
  if (result.rows.length === 0) return null;
  return new Set(result.rows.map((row) => String(row.service_code)));
}

async function isServiceEnabled(serviceCode: string) {
  const enabled = await listEnabledServiceCodes();
  return !enabled || enabled.has(serviceCode);
}

async function getServicePrice(service: Service, country: Country) {
  const countryResult = await pool.query("SELECT price FROM sim_service_country_prices WHERE service_code = $1 AND country_code = $2", [service.code, country.code]);
  if (countryResult.rows[0]) return Number(countryResult.rows[0].price);
  const globalResult = await pool.query("SELECT price FROM sim_service_prices WHERE service_code = $1", [service.code]);
  if (globalResult.rows[0]) return Number(globalResult.rows[0].price);
  const dbBasePrice = await getCountryBasePrice(country.code);
  const basePrice = dbBasePrice ?? country.startingPrice;
  return Number((service.price + basePrice * 0.25).toFixed(2));
}

async function servicesWithPrices(country?: Country, enabledOnly = true) {
  const prices = await listServicePrices();
  const countryPrices = country ? await listCountryServicePrices(country.code) : new Map<string, number>();
  const dbBasePrice = country ? await getCountryBasePrice(country.code) : null;
  const countryBase = dbBasePrice ?? country?.startingPrice ?? 0;
  const enabledCodes = enabledOnly ? await listEnabledServiceCodes() : null;
  const services = await liveServices(country?.code);
  return services.filter((service) => !enabledCodes || enabledCodes.has(service.code)).map((service) => ({
    ...service,
    price: countryPrices.has(service.code)
      ? Number(countryPrices.get(service.code))
      : prices.has(service.code)
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
  const role = isAdminEmail(authUser?.email) ? "admin" : "user";

  await pool.query(
    `INSERT INTO sim_users (id, name, email, role, credits, status)
     VALUES ($1, $2, $3, $4, 0, 'active')
     ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role`,
    [userId, name, email, role],
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
  res.json(ListCountriesResponse.parse({ countries: await liveCountries(), provider: providerStatus("Hero SMS") }));
});

router.get("/catalog/countries-for-service", async (req, res) => {
  const serviceCode = String(req.query.serviceCode ?? "");
  if (!serviceCode.trim()) {
    res.status(400).json({ error: "Service code is required" });
    return;
  }
  if (!await isServiceEnabled(serviceCode)) {
    res.json({ countries: [], provider: providerStatus("Hero SMS") });
    return;
  }

  const liveData = await withFastFallback(getHeroCountriesForService(serviceCode), []);

  const mapped = liveData
    .map((live) => ({ country: countryFromCode(live.countryCode, live), available: live.count, heroPrice: live.cost }))
    .filter((c) => c.available > 0)
    .sort((a, b) => a.heroPrice - b.heroPrice || b.available - a.available)
    .slice(0, MAX_COUNTRIES);

  const service = serviceFromCode(serviceCode);
  const result = await Promise.all(
    mapped.map(async ({ country, available, heroPrice }) => ({
      code: country.code,
      name: country.name,
      flag: country.flag,
      available,
      heroPrice,
      price: await getServicePrice(service, country),
    })),
  );

  res.json({ countries: result, provider: providerStatus("Hero SMS") });
});

router.get("/catalog/services", async (req, res) => {
  ListServicesQueryParams.parse(req.query);
  const countryCode = String(req.query.countryCode ?? "");
  const country = countryCode ? countryFromCode(countryCode) : undefined;
  res.json(ListServicesResponse.parse({ services: await servicesWithPrices(country), provider: providerStatus("Hero SMS") }));
});

router.get("/catalog/availability", async (req, res) => {
  const params = GetAvailabilityQueryParams.parse(req.query);
  if (!await isServiceEnabled(params.serviceCode)) {
    res.status(400).json({ error: "This service is not enabled." });
    return;
  }
  const live = await withFastFallback(getHeroAvailability(params.serviceCode, params.countryCode), null);
  const service = serviceFromCode(params.serviceCode, live ?? undefined);
  const country = countryFromCode(params.countryCode, live ?? undefined);
  if (!service || !country) {
    res.status(400).json({ error: "Unknown service or country code." });
    return;
  }
  const customPrice = await getServicePrice(service, country);
  res.json(
    GetAvailabilityResponse.parse({
      countryCode: country.code,
      serviceCode: service.code,
      available: live?.count ?? 0,
      price: customPrice,
      estimatedWait: "20 minute activation window",
      provider: providerStatus("Hero SMS"),
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
  if (!await isServiceEnabled(body.serviceCode)) {
    res.status(400).json({ error: "This service is not currently available." });
    return;
  }
  const live = await getHeroAvailability(body.serviceCode, body.countryCode).catch(() => null);
  const country = countryFromCode(body.countryCode, live ?? undefined);
  const service = serviceFromCode(body.serviceCode, live ?? undefined);
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

router.post("/payments/oxapay/webhook", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const status = String(body.status ?? "");
    const orderId = String(body.orderId ?? "");

    if (!orderId) {
      res.status(400).json({ error: "Missing orderId" });
      return;
    }

    const paymentResult = await pool.query(
      "SELECT * FROM sim_payments WHERE id = $1",
      [orderId],
    );
    const payment = paymentResult.rows[0];
    if (!payment) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    if (status === "Paid") {
      if (String(payment.status) !== "paid") {
        await pool.query(
          "UPDATE sim_payments SET status = 'paid' WHERE id = $1",
          [orderId],
        );
        const credits = Number(payment.credits);
        if (credits > 0) {
          await pool.query(
            "UPDATE sim_users SET credits = credits + $1 WHERE id = $2",
            [credits, payment.user_id],
          );
        }
        // Mark coupon as used
        if (payment.coupon_code) {
          await pool.query(
            "UPDATE sim_coupons SET uses_count = uses_count + 1 WHERE code = $1",
            [payment.coupon_code],
          );
        }
      }
    } else if (status === "Expired" || status === "Error") {
      if (String(payment.status) === "pending") {
        await pool.query(
          "UPDATE sim_payments SET status = 'failed' WHERE id = $1",
          [orderId],
        );
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("OxaPay webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

router.post("/payments/checkout", async (req, res) => {
  const body = CreatePaymentCheckoutBody.parse(req.body);
  const id = crypto.randomUUID();
  const userId = getUserId(req);
  const userEmail = req.user?.email ?? null;
  const couponCodeRaw = typeof (req.body as any).couponCode === "string" ? (req.body as any).couponCode.trim().toUpperCase() : null;

  try {
    // Validate coupon if provided
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;
    if (couponCodeRaw) {
      const couponResult = await pool.query(
        "SELECT * FROM sim_coupons WHERE code = $1",
        [couponCodeRaw],
      );
      const coupon = couponResult.rows[0];
      const validCoupon =
        coupon &&
        coupon.active &&
        (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) &&
        (coupon.max_uses === null || Number(coupon.uses_count) < Number(coupon.max_uses)) &&
        (!coupon.target_user_email || coupon.target_user_email === userEmail);

      if (validCoupon) {
        if (coupon.type === "percentage") {
          discountAmount = Number((body.amount * (Number(coupon.value) / 100)).toFixed(2));
        } else {
          discountAmount = Math.min(Number(coupon.value), body.amount);
        }
        appliedCouponCode = couponCodeRaw;
      }
    }

    // The user pays the discounted price; credits equal what they actually pay
    const chargedAmount = Number(Math.max(body.amount - discountAmount, 0.01).toFixed(2));
    const totalCredits = chargedAmount;
    const checkoutUrl = await createOxaPayInvoice(req, id, chargedAmount, body.currency);
    const result = await pool.query(
      `INSERT INTO sim_payments (id, user_id, amount, credits, currency, status, provider, coupon_code, bonus_credits)
       VALUES ($1, $2, $3, $4, $5, 'pending', 'OxaPay', $6, $7) RETURNING *`,
      [id, userId, chargedAmount, totalCredits, body.currency, appliedCouponCode, -discountAmount],
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

// ─── Coupon: validate (user-facing) ────────────────────────────────────────
router.post("/coupons/validate", async (req, res) => {
  try {
    const { code } = req.body as { code?: string };
    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Coupon code is required." });
      return;
    }
    const userEmail = req.user?.email ?? null;
    const result = await pool.query(
      "SELECT * FROM sim_coupons WHERE UPPER(code) = UPPER($1)",
      [code.trim()],
    );
    const coupon = result.rows[0];
    if (!coupon || !coupon.active) {
      res.status(404).json({ error: "Coupon code not found or inactive." });
      return;
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      res.status(400).json({ error: "This coupon has expired." });
      return;
    }
    if (coupon.max_uses !== null && Number(coupon.uses_count) >= Number(coupon.max_uses)) {
      res.status(400).json({ error: "This coupon has reached its usage limit." });
      return;
    }
    if (coupon.target_user_email && coupon.target_user_email !== userEmail) {
      res.status(403).json({ error: "This coupon is not valid for your account." });
      return;
    }
    res.json({
      valid: true,
      code: String(coupon.code),
      type: String(coupon.type),
      value: Number(coupon.value),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to validate coupon." });
  }
});

// ─── Coupon: admin CRUD ─────────────────────────────────────────────────────
router.get("/admin/coupons", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  const result = await pool.query(
    "SELECT * FROM sim_coupons ORDER BY created_at DESC",
  );
  res.json({
    coupons: result.rows.map((r) => ({
      id: String(r.id),
      code: String(r.code),
      type: String(r.type),
      value: Number(r.value),
      maxUses: r.max_uses !== null ? Number(r.max_uses) : null,
      usesCount: Number(r.uses_count),
      targetUserEmail: r.target_user_email ?? null,
      expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : null,
      active: Boolean(r.active),
      createdAt: new Date(r.created_at).toISOString(),
    })),
  });
});

router.post("/admin/coupons", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  try {
    const { code, type, value, maxUses, targetUserEmail, expiresAt } = req.body as {
      code: string; type: string; value: number;
      maxUses?: number | null; targetUserEmail?: string | null; expiresAt?: string | null;
    };
    if (!code || !type || value == null) {
      res.status(400).json({ error: "code, type and value are required." });
      return;
    }
    if (!["fixed", "percentage"].includes(type)) {
      res.status(400).json({ error: "type must be 'fixed' or 'percentage'." });
      return;
    }
    if (type === "percentage" && (Number(value) <= 0 || Number(value) > 100)) {
      res.status(400).json({ error: "Percentage must be between 1 and 100." });
      return;
    }
    if (type === "fixed" && Number(value) <= 0) {
      res.status(400).json({ error: "Fixed discount must be greater than 0." });
      return;
    }
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO sim_coupons (id, code, type, value, max_uses, target_user_email, expires_at)
       VALUES ($1, UPPER($2), $3, $4, $5, $6, $7) RETURNING *`,
      [id, code.trim(), type, value, maxUses ?? null, targetUserEmail || null, expiresAt || null],
    );
    const r = result.rows[0];
    res.json({
      id: String(r.id), code: String(r.code), type: String(r.type), value: Number(r.value),
      maxUses: r.max_uses !== null ? Number(r.max_uses) : null, usesCount: 0,
      targetUserEmail: r.target_user_email ?? null, expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : null,
      active: true, createdAt: new Date(r.created_at).toISOString(),
    });
  } catch (error: any) {
    if (error?.code === "23505") {
      res.status(409).json({ error: "A coupon with this code already exists." });
    } else {
      res.status(500).json({ error: "Failed to create coupon." });
    }
  }
});

router.patch("/admin/coupons/:code/toggle", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  const result = await pool.query(
    "UPDATE sim_coupons SET active = NOT active WHERE UPPER(code) = UPPER($1) RETURNING *",
    [req.params.code],
  );
  if (!result.rows[0]) { res.status(404).json({ error: "Coupon not found." }); return; }
  res.json({ active: Boolean(result.rows[0].active) });
});

router.delete("/admin/coupons/:code", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  const result = await pool.query(
    "DELETE FROM sim_coupons WHERE UPPER(code) = UPPER($1) RETURNING id",
    [req.params.code],
  );
  if (!result.rows[0]) { res.status(404).json({ error: "Coupon not found." }); return; }
  res.json({ deleted: true });
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
  const countryCode = String(req.query.countryCode ?? "");
  const country = countryCode ? countryFromCode(countryCode) : undefined;
  const countryOverrides = country ? await listCountryServicePrices(country.code) : new Map<string, number>();
  const activeServices = await liveServices(country?.code);
  const enabledServiceCodes = await listEnabledServiceCodes();
  const allCountries = await liveCountries();
  const countryBasePrices = await listAllCountryBasePrices();
  res.json({
    selectedCountry: country ?? null,
    countries: allCountries.map((c) => ({
      ...c,
      customBasePrice: countryBasePrices.has(c.code) ? countryBasePrices.get(c.code) : null,
    })),
    enabledServiceCodes: Array.from(enabledServiceCodes ?? new Set(activeServices.map((service) => service.code))),
    services: activeServices.map((service) => ({
      ...service,
      basePrice: service.price,
      price: countryOverrides.has(service.code)
        ? Number(countryOverrides.get(service.code))
        : priceOverrides.has(service.code)
        ? Number(priceOverrides.get(service.code))
        : service.price,
      customPrice: countryOverrides.has(service.code) || priceOverrides.has(service.code),
      countryPrice: countryOverrides.has(service.code) ? Number(countryOverrides.get(service.code)) : null,
      globalPrice: priceOverrides.has(service.code) ? Number(priceOverrides.get(service.code)) : null,
    })),
  });
});

router.put("/admin/countries/:code/base-price", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  const code = String(req.params.code).toUpperCase();
  const price = Number(req.body?.price);
  if (!Number.isFinite(price) || price < 0) {
    res.status(400).json({ error: "Base price must be 0 or higher." });
    return;
  }
  if (price === 0) {
    await pool.query("DELETE FROM sim_country_base_prices WHERE country_code = $1", [code]);
    res.json({ countryCode: code, basePrice: null, message: "Custom base price removed, will use live API price." });
    return;
  }
  await pool.query(
    `INSERT INTO sim_country_base_prices (country_code, base_price, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (country_code) DO UPDATE SET base_price = EXCLUDED.base_price, updated_at = NOW()`,
    [code, price],
  );
  res.json({ countryCode: code, basePrice: price });
});

router.put("/admin/services/enabled", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  const serviceCodes = Array.isArray(req.body?.serviceCodes)
    ? req.body.serviceCodes.map((code: unknown) => String(code).trim()).filter(Boolean)
    : null;
  if (!serviceCodes) {
    res.status(400).json({ error: "serviceCodes must be an array." });
    return;
  }

  const uniqueCodes = Array.from(new Set(serviceCodes));
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM sim_enabled_services");
    for (const code of uniqueCodes) {
      await client.query(
        `INSERT INTO sim_enabled_services (service_code, enabled, updated_at)
         VALUES ($1, TRUE, NOW())
         ON CONFLICT (service_code) DO UPDATE SET enabled = TRUE, updated_at = NOW()`,
        [code],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  res.json({ enabledServiceCodes: uniqueCodes });
});

router.put("/admin/services/:code/price", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  const code = String(req.params.code);
  const price = Number(req.body?.price);
  const countryCode = typeof req.body?.countryCode === "string" ? String(req.body.countryCode) : "";
  const service = (await liveServices(countryCode || undefined)).find((item) => item.code === code) ?? serviceFromCode(code);
  if (!service) {
    res.status(404).json({ error: "Service not found." });
    return;
  }
  if (!Number.isFinite(price) || price < 0) {
    res.status(400).json({ error: "Price must be 0 or higher." });
    return;
  }
  if (countryCode) {
    await pool.query(
      `INSERT INTO sim_service_country_prices (service_code, country_code, price, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (service_code, country_code) DO UPDATE SET price = EXCLUDED.price, updated_at = NOW()`,
      [code, countryCode, price],
    );
  } else {
    await pool.query(
      `INSERT INTO sim_service_prices (service_code, price, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (service_code) DO UPDATE SET price = EXCLUDED.price, updated_at = NOW()`,
      [code, price],
    );
  }
  res.json({
    code: service.code,
    name: service.name,
    category: service.category,
    available: service.available,
    basePrice: service.price,
    price,
    customPrice: true,
    countryCode: countryCode || null,
  });
});

async function ticketMessages(ticketId: string, ticketRow: Record<string, unknown>) {
  const result = await pool.query("SELECT * FROM sim_support_messages WHERE ticket_id = $1 ORDER BY created_at ASC", [ticketId]);
  const messages = result.rows.map((row) => ({
    id: String(row.id),
    senderRole: String(row.sender_role),
    senderName: String(row.sender_name),
    message: String(row.message),
    createdAt: new Date(String(row.created_at)).toISOString(),
  }));
  if (messages.length > 0) return messages;
  const legacy = [{
    id: `${ticketId}-initial`,
    senderRole: "user",
    senderName: "You",
    message: String(ticketRow.message),
    createdAt: new Date(String(ticketRow.created_at)).toISOString(),
  }];
  if (ticketRow.admin_reply) {
    legacy.push({
      id: `${ticketId}-admin-reply`,
      senderRole: "admin",
      senderName: "SKY SMS Support",
      message: String(ticketRow.admin_reply),
      createdAt: new Date(String(ticketRow.updated_at)).toISOString(),
    });
  }
  return legacy;
}

async function mapSupportTicket(row: Record<string, unknown>, viewer: "user" | "admin") {
  return {
    id: String(row.id),
    ...(viewer === "admin" ? {
      userId: String(row.user_id),
      userEmail: String(row.user_email),
      userName: String(row.user_name),
    } : {}),
    subject: String(row.subject),
    category: String(row.category),
    priority: String(row.priority),
    message: String(row.message),
    status: String(row.status),
    adminReply: row.admin_reply ? String(row.admin_reply) : null,
    messages: await ticketMessages(String(row.id), row),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

router.get("/support/tickets", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const result = await pool.query(
    "SELECT * FROM sim_support_tickets WHERE user_id = $1 ORDER BY created_at DESC",
    [getUserId(req)],
  );
  res.json({ tickets: await Promise.all(result.rows.map((row) => mapSupportTicket(row, "user"))) });
});

router.post("/support/tickets", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { subject, category, priority, message } = req.body as Record<string, string>;
  if (!subject?.trim() || !category?.trim() || !message?.trim()) {
    res.status(400).json({ error: "Subject, category, and message are required." });
    return;
  }
  const validCategories = ["Billing", "Technical", "Account", "Other"];
  const validPriorities = ["low", "medium", "high"];
  if (!validCategories.includes(category)) {
    res.status(400).json({ error: "Invalid category." });
    return;
  }
  const safePriority = validPriorities.includes(priority) ? priority : "medium";
  const id = crypto.randomUUID();
  const result = await pool.query(
    `INSERT INTO sim_support_tickets (id, user_id, subject, category, priority, message)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id, getUserId(req), subject.trim().slice(0, 200), category, safePriority, message.trim().slice(0, 2000)],
  );
  const row = result.rows[0];
  await pool.query(
    "INSERT INTO sim_support_messages (id, ticket_id, sender_role, sender_name, message) VALUES ($1, $2, 'user', $3, $4)",
    [crypto.randomUUID(), id, req.user.firstName || req.user.email || "User", String(row.message)],
  );
  res.json({
    ticket: await mapSupportTicket(row, "user"),
  });
});

router.post("/support/tickets/:id/messages", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = req.params;
  const message = String(req.body?.message ?? "").trim().slice(0, 3000);
  if (!message) {
    res.status(400).json({ error: "Message is required." });
    return;
  }
  const existing = await pool.query("SELECT * FROM sim_support_tickets WHERE id = $1 AND user_id = $2", [id, getUserId(req)]);
  const ticket = existing.rows[0];
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found." });
    return;
  }
  if (["resolved", "closed"].includes(String(ticket.status))) {
    res.status(409).json({ error: "This ticket is resolved or closed. Please open a new ticket if you still need help." });
    return;
  }
  await pool.query(
    "INSERT INTO sim_support_messages (id, ticket_id, sender_role, sender_name, message) VALUES ($1, $2, 'user', $3, $4)",
    [crypto.randomUUID(), id, req.user.firstName || req.user.email || "User", message],
  );
  await pool.query("UPDATE sim_support_tickets SET status = 'open', updated_at = NOW() WHERE id = $1", [id]);
  const updated = await pool.query("SELECT * FROM sim_support_tickets WHERE id = $1", [id]);
  res.json({ ticket: await mapSupportTicket(updated.rows[0], "user") });
});

router.get("/admin/support", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  const result = await pool.query(`
    SELECT t.*, u.email AS user_email, u.name AS user_name
    FROM sim_support_tickets t
    JOIN sim_users u ON u.id = t.user_id
    ORDER BY t.created_at DESC
  `);
  res.json({ tickets: await Promise.all(result.rows.map((row) => mapSupportTicket(row, "admin"))) });
});

router.patch("/admin/support/:id", async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  const { id } = req.params;
  const { status, adminReply } = req.body as Record<string, string>;
  const validStatuses = ["open", "in_progress", "resolved", "closed"];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status." });
    return;
  }
  const existing = await pool.query("SELECT * FROM sim_support_tickets WHERE id = $1", [id]);
  if (!existing.rows[0]) {
    res.status(404).json({ error: "Ticket not found." });
    return;
  }
  const newStatus = status ?? existing.rows[0].status;
  const newReply = adminReply !== undefined ? adminReply.trim().slice(0, 3000) : existing.rows[0].admin_reply;
  if (newReply && newReply !== existing.rows[0].admin_reply) {
    await pool.query(
      "INSERT INTO sim_support_messages (id, ticket_id, sender_role, sender_name, message) VALUES ($1, $2, 'admin', 'SKY SMS Support', $3)",
      [crypto.randomUUID(), id, newReply],
    );
  }
  await pool.query(
    "UPDATE sim_support_tickets SET status = $1, admin_reply = $2, updated_at = NOW() WHERE id = $3",
    [newStatus, newReply || null, id],
  );
  const updated = await pool.query("SELECT * FROM sim_support_tickets WHERE id = $1", [id]);
  const row = updated.rows[0];
  res.json({ ticket: await mapSupportTicket(row, "user") });
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
