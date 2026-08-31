import pg from "pg";
import { config } from "../config/index.js";
import { getPool } from "./pool.js";
async function initDb() {
  await ensureDatabase();
  await ensureTables();
}
async function ensureDatabase() {
  const adminPool = new pg.Pool({
    ...config.pg,
    database: "postgres",
    // 连接默认管理库
    max: 2
  });
  try {
    const dbName = config.pg.database;
    const { rows } = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    if (rows.length === 0) {
      console.log(`[DB] \u521B\u5EFA\u6570\u636E\u5E93 ${dbName}`);
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
    } else {
      console.log(`[DB] \u6570\u636E\u5E93 ${dbName} \u5DF2\u5B58\u5728`);
    }
  } catch (err) {
    console.error("[DB] \u68C0\u67E5/\u521B\u5EFA\u6570\u636E\u5E93\u5931\u8D25\uFF1A", err.message);
  } finally {
    await adminPool.end();
  }
}
async function ensureTables() {
  const p = getPool();
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS checklist_records (
        id SERIAL PRIMARY KEY,
        flight_id VARCHAR(64) NOT NULL UNIQUE,
        flight_no VARCHAR(32),
        aircraft_type VARCHAR(32),
        checklist_category VARCHAR(32) NOT NULL,
        flight_date VARCHAR(16),
        header JSONB,
        items JSONB,
        video_supervision JSONB,
        inspector VARCHAR(64),
        status VARCHAR(16) DEFAULT 'draft',
        checked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    await p.query(`ALTER TABLE checklist_records ADD COLUMN IF NOT EXISTS flight_date VARCHAR(16);`);
    await p.query(`ALTER TABLE checklist_records ADD COLUMN IF NOT EXISTS checked_at TIMESTAMPTZ;`);
    await p.query(`ALTER TABLE checklist_records DROP COLUMN IF EXISTS flight_type;`);
    await p.query(`ALTER TABLE checklist_records DROP COLUMN IF EXISTS checklist_template_id;`);
    await p.query(`ALTER TABLE checklist_records DROP COLUMN IF EXISTS checklist_title;`);
    await p.query(`
      DELETE FROM checklist_records a
      USING checklist_records b
      WHERE a.flight_id = b.flight_id AND a.id < b.id;
    `);
    await p.query(`DROP INDEX IF EXISTS idx_records_flight;`);
    await p.query(`DROP INDEX IF EXISTS idx_records_template;`);
    await p.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_records_flight_unique ON checklist_records(flight_id);`);
    await p.query(`CREATE INDEX IF NOT EXISTS idx_records_flight_date ON checklist_records(flight_date);`);
    console.log("[DB] \u8868 checklist_records \u5DF2\u5C31\u7EEA");
    await p.query(`
      CREATE TABLE IF NOT EXISTS flights (
        id VARCHAR(64) PRIMARY KEY,
        flight_no VARCHAR(32) NOT NULL,
        origin VARCHAR(32),
        destination VARCHAR(32),
        departure_time_utc TIMESTAMPTZ,
        landing_time_utc TIMESTAMPTZ,
        flight_date VARCHAR(16),
        status VARCHAR(16) DEFAULT '\u8BA1\u5212',
        aircraft_type VARCHAR(32),
        flight_type VARCHAR(32),
        category VARCHAR(32),
        has_checklist BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    await p.query(`CREATE INDEX IF NOT EXISTS idx_flights_date ON flights(flight_date);`);
    console.log("[DB] \u8868 flights \u5DF2\u5C31\u7EEA");
    await p.query(`
      CREATE TABLE IF NOT EXISTS manual_fips (
        id SERIAL PRIMARY KEY,
        task VARCHAR(16),
        flight_no VARCHAR(32) NOT NULL,
        origin_station VARCHAR(16),
        dest_station VARCHAR(16),
        landing_station VARCHAR(16),
        in_out_time VARCHAR(32),
        sobt VARCHAR(32),
        eobt VARCHAR(32),
        atot VARCHAR(32),
        sibt VARCHAR(32),
        eldt VARCHAR(32),
        aldt VARCHAR(32),
        corridor VARCHAR(16),
        runway VARCHAR(16),
        stand VARCHAR(16),
        aircraft_type VARCHAR(32),
        landing_time VARCHAR(32),
        checklist_category VARCHAR(32),
        checklist_uuid VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS task VARCHAR(16);`);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS origin_station VARCHAR(16);`);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS dest_station VARCHAR(16);`);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS landing_station VARCHAR(16);`);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS in_out_time VARCHAR(32);`);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS sobt VARCHAR(32);`);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS eobt VARCHAR(32);`);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS atot VARCHAR(32);`);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS sibt VARCHAR(32);`);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS eldt VARCHAR(32);`);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS aldt VARCHAR(32);`);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS corridor VARCHAR(16);`);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS runway VARCHAR(16);`);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS checklist_category VARCHAR(32);`);
    await p.query(`ALTER TABLE manual_fips ADD COLUMN IF NOT EXISTS checklist_uuid VARCHAR(64);`);
    await p.query(`ALTER TABLE IF EXISTS fips ADD COLUMN IF NOT EXISTS checklist_category VARCHAR(32);`);
    await p.query(`ALTER TABLE IF EXISTS fips ADD COLUMN IF NOT EXISTS checklist_uuid VARCHAR(64);`);
    console.log("[DB] \u8868 manual_fips \u5DF2\u5C31\u7EEA");
    await p.query(`
      CREATE TABLE IF NOT EXISTS fresh_air_cargo (
        id SERIAL PRIMARY KEY,
        manual_fips_id INTEGER UNIQUE NOT NULL REFERENCES manual_fips(id) ON DELETE CASCADE,
        content JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log("[DB] \u8868 fresh_air_cargo \u5DF2\u5C31\u7EEA");
  } catch (err) {
    console.error("[DB] \u5EFA\u8868\u5931\u8D25\uFF1A", err.message);
  }
}
export {
  initDb
};
