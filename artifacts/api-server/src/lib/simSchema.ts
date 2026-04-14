import { pool } from "@workspace/db";

let schemaReady: Promise<void> | null = null;

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