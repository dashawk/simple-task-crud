import { Pool } from 'pg'
import { env } from '../utils/env'

// --- Base connection config ---
const connectionString = env('DATABASE_URL')
const baseConfig = connectionString
  ? { connectionString, ssl: false }
  : {
      host: env('DB_HOST', 'localhost'),
      port: Number(env('DB_PORT', '5432')),
      user: env('DB_USER', 'postgres'),
      password: env('DB_PASSWORD', ''),
      database: env('DB_NAME', 'tasks_db'),
      ssl: false
    }

// --- Pool tuning ---
export const pool = new Pool({
  ...baseConfig,
  max: Number(env('DB_POOL_MAX', '10')),
  idleTimeoutMillis: Number(env('DB_IDLE_MS', '30000')),
  connectionTimeoutMillis: Number(env('DB_CONNECT_MS', '5000')),
  application_name: env('APP_NAME', 'tasks-api')
})

// Centralized query helper (parameterized)
export const query = (text, params) => pool.query(text, params)

// Transaction helper
export async function withTransaction(work) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const res = await work(client)
    await client.query('COMMIT')
    return res
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// --- Optional: create app database via admin URL (only when you explicitly opt-in) ---
function isValidIdentifier(name) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name)
}

export async function createDatabaseIfNotExists() {
  const adminUrl = env('DB_ADMIN_URL') // e.g., postgres://postgres:pw@localhost:5432/postgres
  const dbName =
    env('DB_NAME') ||
    (() => {
      if (!connectionString) return 'tasks_db'
      try {
        const u = new URL(connectionString)
        return u.pathname.replace(/^\//, '') || 'tasks_db'
      } catch {
        return 'tasks_db'
      }
    })()

  if (!adminUrl) return // nothing to do
  if (!isValidIdentifier(dbName))
    throw new Error(`Invalid database name: ${dbName}`)

  const admin = new Pool({ connectionString: adminUrl, ssl: false })
  try {
    await admin.query(`CREATE DATABASE "${dbName}"`)
    console.log(`Created database "${dbName}"`)
  } catch (e) {
    // 42P04 => duplicate_database
    if (e.code === '42P04') {
      console.log(`Database "${dbName}" already exists`)
    } else {
      throw e
    }
  } finally {
    await admin.end()
  }
}

// --- Optional: ensure schema (for quick dev only; prefer migrations in /sql) ---
export async function ensureSchema() {
  // Tasks
  await query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `)

  // Updated_at trigger function + trigger (split statements, explicit)
  await query(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = now(); RETURN NEW; END;
    $$ LANGUAGE plpgsql;
  `)

  await query(`DROP TRIGGER IF EXISTS tasks_set_updated_at ON tasks;`)
  await query(`
    CREATE TRIGGER tasks_set_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  `)
}

// Graceful shutdown
export async function closeDatabase() {
  try {
    await pool.end()
    console.log('PostgreSQL pool closed')
  } catch (e) {
    console.error('Error closing pg pool', e)
  }
}
process.on('SIGINT', async () => {
  await closeDatabase()
  process.exit(0)
})
process.on('SIGTERM', async () => {
  await closeDatabase()
  process.exit(0)
})

// Diagnostics
pool.on('error', (err) => {
  console.error('Unexpected pg pool error:', err)
})
