/**
 * ============================================================
 * 数据库 Schema（建库 + 建表）
 * ------------------------------------------------------------
 * 启动时自动执行：
 *   1. 若数据库不存在则创建（flight_dispatch）
 *   2. 建表：checklist_records（检查单填写记录）
 *   3. 建表：flights（航班）
 * 幂等：CREATE TABLE IF NOT EXISTS，可重复执行。
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
 * 2) 建表（幂等）
 */
async function ensureTables() {
  const p = getPool();
  try {
    // ---------- 检查单填写记录表 ----------
    await p.query(`
      CREATE TABLE IF NOT EXISTS checklist_records (
        id SERIAL PRIMARY KEY,
        flight_id VARCHAR(64) NOT NULL,
        flight_no VARCHAR(32),
        aircraft_type VARCHAR(32),
        flight_type VARCHAR(32),
        checklist_category VARCHAR(32) NOT NULL,
        checklist_template_id VARCHAR(64) NOT NULL,
        checklist_title TEXT,
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
    // 兼容旧表：补充可能缺失的列
    await p.query(`ALTER TABLE checklist_records ADD COLUMN IF NOT EXISTS flight_date VARCHAR(16);`);
    await p.query(`ALTER TABLE checklist_records ADD COLUMN IF NOT EXISTS checked_at TIMESTAMPTZ;`);
    // 常用查询索引
    await p.query(`CREATE INDEX IF NOT EXISTS idx_records_flight ON checklist_records(flight_id);`);
    await p.query(`CREATE INDEX IF NOT EXISTS idx_records_template ON checklist_records(checklist_template_id);`);
    await p.query(`CREATE INDEX IF NOT EXISTS idx_records_flight_date ON checklist_records(flight_date);`);
    console.log('[DB] 表 checklist_records 已就绪');

    // ---------- 航班表 ----------
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
  } catch (err) {
    console.error('[DB] 建表失败：', err.message);
  }
}
