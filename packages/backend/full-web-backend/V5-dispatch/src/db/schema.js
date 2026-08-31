/**
 * ============================================================
 * 数据库 Schema（建库 + 建表）
 * ------------------------------------------------------------
 * 结构与 data/schema.sql（pg_dump 导出的权威库结构）严格一致：
 *   1. 若数据库不存在则创建（flight_dispatch）
 *   2. 建 5 张表：checklist_records / fips / flights / manual_fips / fresh_air_cargo
 *   3. 唯一约束、索引、外键与 schema.sql 一致
 * 幂等：CREATE TABLE IF NOT EXISTS + IF NOT EXISTS 索引，可重复执行。
 * ============================================================
 */
import pg from 'pg';
import { config } from '../config/index.js';
import { getPool } from './pool.js';

/**
 * 初始化数据库：确保库存在 + 所有表存在
 */
export async function initDb() {
  await ensureDatabase();
  await ensureTables();
}

/**
 * 1) 若目标数据库不存在，则通过 postgres 管理库创建
 */
async function ensureDatabase() {
  const adminPool = new pg.Pool({
    ...config.pg,
    database: 'postgres', // 连接默认管理库
    max: 2,
  });
  try {
    const dbName = config.pg.database;
    const { rows } = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName],
    );
    if (rows.length === 0) {
      console.log(`[DB] 创建数据库 ${dbName}`);
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
    } else {
      console.log(`[DB] 数据库 ${dbName} 已存在`);
    }
  } catch (err) {
    // 即使 PG 不可用也不阻断启动（后续请求会报错，便于排障）
    console.error('[DB] 检查/创建数据库失败：', err.message);
  } finally {
    await adminPool.end();
  }
}

/**
 * 2) 建表（严格对齐 data/schema.sql，幂等）
 */
async function ensureTables() {
  const p = getPool();
  try {
    // ---------- 1. 检查单填写记录表 ----------
    await p.query(`
      CREATE TABLE IF NOT EXISTS checklist_records (
        id SERIAL PRIMARY KEY,
        flight_id VARCHAR(64) NOT NULL,
        flight_no VARCHAR(32),
        aircraft_type VARCHAR(32),
        checklist_category VARCHAR(32) NOT NULL,
        flight_date VARCHAR(16),
        header JSONB,
        items JSONB,
        video_supervision JSONB,
        inspector VARCHAR(64),
        status VARCHAR(16) DEFAULT 'draft',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    await p.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_records_flight_unique ON checklist_records(flight_id);`);
    await p.query(`CREATE INDEX IF NOT EXISTS idx_records_flight_date ON checklist_records(flight_date);`);
    console.log('[DB] 表 checklist_records 已就绪');

    // ---------- 2. 历史航班流量表（fips） ----------
    await p.query(`
      CREATE TABLE IF NOT EXISTS fips (
        id SERIAL PRIMARY KEY,
        task VARCHAR(8),
        flight_no VARCHAR(32),
        origin_station VARCHAR(8),
        dest_station VARCHAR(8),
        landing_station VARCHAR(8),
        in_out_time VARCHAR(19),
        sobt VARCHAR(19),
        eobt VARCHAR(19),
        atot VARCHAR(19),
        sibt VARCHAR(19),
        eldt VARCHAR(19),
        aldt VARCHAR(19),
        corridor VARCHAR(16),
        runway VARCHAR(16),
        stand VARCHAR(16),
        aircraft_type VARCHAR(16),
        source_file VARCHAR(32),
        source_date VARCHAR(16),
        mapped_date VARCHAR(16),
        checklist_category VARCHAR(32),
        checklist_uuid VARCHAR(64)
      );
    `);
    console.log('[DB] 表 fips 已就绪');

    // ---------- 3. 航班表（flights） ----------
    await p.query(`
      CREATE TABLE IF NOT EXISTS flights (
        id VARCHAR(64) PRIMARY KEY,
        flight_no VARCHAR(32) NOT NULL,
        origin VARCHAR(32),
        destination VARCHAR(32),
        departure_time_utc TIMESTAMPTZ,
        landing_time_utc TIMESTAMPTZ,
        flight_date VARCHAR(16),
        status VARCHAR(16) DEFAULT '计划',
        aircraft_type VARCHAR(32),
        flight_type VARCHAR(32),
        category VARCHAR(32),
        has_checklist BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    await p.query(`CREATE INDEX IF NOT EXISTS idx_flights_date ON flights(flight_date);`);
    console.log('[DB] 表 flights 已就绪');

    // ---------- 4. 手动添加航班表（manual_fips） ----------
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
    console.log('[DB] 表 manual_fips 已就绪');

    // ---------- 5. 生鲜货物航班表（fresh_air_cargo） ----------
    await p.query(`
      CREATE TABLE IF NOT EXISTS fresh_air_cargo (
        id SERIAL PRIMARY KEY,
        manual_fips_id INTEGER NOT NULL UNIQUE REFERENCES manual_fips(id) ON DELETE CASCADE,
        content JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('[DB] 表 fresh_air_cargo 已就绪');
  } catch (err) {
    console.error('[DB] 建表失败：', err.message);
  }
}
