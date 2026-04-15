const HERO_BASE_URL = "https://hero-sms.com/stubs/handler_api.php";

const countryMap: Record<string, number> = {
  GB: 16,
  US: 187,
  DE: 43,
  FR: 78,
  NL: 48,
  CA: 36,
  BR: 73,
  IN: 22,
};

export function getHeroCountryCode(code: string) {
  return countryMap[code.toUpperCase()];
}

function getApiKey() {
  const apiKey = process.env.HERO_SMS_API_KEY;
  if (!apiKey) {
    throw new Error("Hero SMS API key is not configured.");
  }
  return apiKey;
}

async function heroRequest(params: Record<string, string | number | undefined>) {
  const url = new URL(HERO_BASE_URL);
  url.searchParams.set("api_key", getApiKey());
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Hero SMS request failed with HTTP ${response.status}`);
  }

  return text.trim();
}

function parseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function getHeroBalance() {
  const text = await heroRequest({ action: "getBalance" });
  if (text.startsWith("ACCESS_BALANCE:")) {
    return Number(text.split(":")[1]);
  }
  const json = parseJson<{ balance?: number | string }>(text);
  if (json?.balance !== undefined) return Number(json.balance);
  throw new Error(text || "Unable to read Hero SMS balance.");
}

export async function getHeroAvailability(serviceCode: string, countryCode: string) {
  const country = getHeroCountryCode(countryCode);
  if (country === undefined) return null;

  const text = await heroRequest({
    action: "getPrices",
    service: serviceCode,
    country,
  });
  const json = parseJson<Record<string, Record<string, { count?: number | string; cost?: number | string }>>>(text);
  const countryData = json?.[String(country)];
  const serviceData = countryData?.[serviceCode];

  if (!serviceData) return null;

  return {
    count: Number(serviceData.count ?? 0),
    cost: Number(serviceData.cost ?? 0),
  };
}

export async function rentHeroNumber(serviceCode: string, countryCode: string, maxPrice?: number) {
  const country = getHeroCountryCode(countryCode);
  if (country === undefined) {
    throw new Error(`Hero SMS does not have a mapped country code for ${countryCode}.`);
  }

  const text = await heroRequest({
    action: "getNumber",
    service: serviceCode,
    country,
    maxPrice: maxPrice && maxPrice > 0 ? maxPrice : undefined,
  });

  if (text.startsWith("ACCESS_NUMBER:")) {
    const [, activationId, phoneNumber] = text.split(":");
    await setHeroStatus(activationId, 1);
    return { activationId, phoneNumber };
  }

  throw new Error(text || "Hero SMS did not return a phone number.");
}

export async function getHeroStatus(activationId: string) {
  const text = await heroRequest({ action: "getStatus", id: activationId });

  if (text.startsWith("STATUS_OK:")) {
    return { status: "STATUS_OK", code: text.slice("STATUS_OK:".length) };
  }

  return { status: text, code: null };
}

export async function setHeroStatus(activationId: string, status: 1 | 3 | 6 | 8) {
  const text = await heroRequest({ action: "setStatus", id: activationId, status });
  if (text.startsWith("ACCESS_") || text === "EARLY_CANCEL_DENIED" || text === "NO_ACTIVATION") return text;
  return text;
}