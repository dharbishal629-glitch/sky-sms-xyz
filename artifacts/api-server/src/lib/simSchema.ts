import { pool } from "@workspace/db";

let schemaReady: Promise<void> | null = null;

const SEED_ENABLED_SERVICES = ["ds", "am", "go", "wa", "tg", "mm"];

async function createSchema() {
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

    CREATE TABLE IF NOT EXISTS sim_sessions (
      sid TEXT PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMPTZ NOT NULL
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
      provider TEXT NOT NULL DEFAULT 'Hero SMS',
      provider_activation_id TEXT,
      refunded BOOLEAN NOT NULL DEFAULT FALSE,
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

    CREATE TABLE IF NOT EXISTS sim_service_prices (
      service_code TEXT PRIMARY KEY,
      price NUMERIC NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sim_service_country_prices (
      service_code TEXT NOT NULL,
      country_code TEXT NOT NULL,
      price NUMERIC NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (service_code, country_code)
    );

    CREATE TABLE IF NOT EXISTS sim_enabled_services (
      service_code TEXT PRIMARY KEY,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE sim_rentals ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'Hero SMS';
    ALTER TABLE sim_rentals ADD COLUMN IF NOT EXISTS provider_activation_id TEXT;
    ALTER TABLE sim_rentals ADD COLUMN IF NOT EXISTS refunded BOOLEAN NOT NULL DEFAULT FALSE;

    CREATE TABLE IF NOT EXISTS sim_enabled_countries (
      country_code TEXT PRIMARY KEY,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sim_country_base_prices (
      country_code TEXT PRIMARY KEY,
      base_price NUMERIC NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sim_support_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES sim_users(id),
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      admin_reply TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sim_support_messages (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL REFERENCES sim_support_tickets(id) ON DELETE CASCADE,
      sender_role TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  for (const code of SEED_ENABLED_SERVICES) {
    await pool.query(
      `INSERT INTO sim_enabled_services (service_code, enabled) VALUES ($1, TRUE)
       ON CONFLICT (service_code) DO NOTHING`,
      [code],
    );
  }
}

export async function ensureSimSchema() {
  schemaReady ??= createSchema();
  try {
    await schemaReady;
  } catch (error) {
    schemaReady = null;
    throw error;
  }
}