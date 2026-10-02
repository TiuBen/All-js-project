/**
 * ============================================================
 * 数据库 Schema（建库 + 建表）
 * ------------------------------------------------------------
 * 结构与 data/schema.sql（pg_dump 导出的权威库结构）严格一致：
 *   1. 若数据库不存在则创建（flight_dispatch）
 *   2. 建 5 张表：checklist_records / fips / flights / manual_fips / fresh_air_cargo
 *   3. 建 ecyilang（航班计划快照）—— 结构见 db/ecyilangSchema.js，并做空表种子导入
 *   4. 建 special（生鲜航班保障节点台账）—— 结构见 db/specialSchema.js，并做空表种子导入
 * 唯一约束、索引、外键与 schema.sql 一致
 * 幂等：CREATE TABLE IF NOT EXISTS + IF NOT EXISTS 索引，可重复执行。
 *
 * ★ fresh_air_cargo 已泛化为「跨来源生鲜标记表」：
 *   (source_table, source_id) 是业务自然键 —— source_table 标明来源表名，
 *   source_id 是**该来源表的 UUID 标识**（manual_fips.uuid 这种，不再是自增整型 id）。
 *   老库（manual_fips_id INTEGER + 外键）由 ensureFreshAirCargo() 自动迁移。
 * ============================================================
 */
import pg from 'pg';
import { config } from '../config/index.js';
import { getPool } from './pool.js';
import { initEcyilang } from './ecyilangSchema.js';
import { initSpecial } from './specialSchema.js';

/**
 * 初始化数据库：确保库存在 + 所有表存在
 */
export async function initDb() {
  await ensureDatabase();
  await ensureTables();
  // ecyilang（航班计划快照）：建表 + 空表时从 ecyilang.json 灌种子。
  // 表结构/字段字典都在该模块里，这里只负责触发。
  await initEcyilang();
  // special（生鲜保障节点台账）：建表 + 空表时从 special.json 灌种子（9 月 50 条）。
  await initSpecial();
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
    // ---------- 0. gen_random_uuid() 依赖（PG < 13 需 pgcrypto；13+ 已内置） ----------
    // 失败不阻断：13+ 上本就无需扩展，缺权限时下面的 uuid 默认值仍能用内置函数。
    try {
      await p.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
    } catch (err) {
      console.warn('[DB] 跳过 pgcrypto 扩展（PG 13+ 通常无需）：', err.message);
    }

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
    // flight_id 不唯一：一个航班可以有多份检查单（重填 / 换类型各一份），
    // 唯一约束会让"新建"退化成覆盖旧记录 —— 只建普通索引供按航班反查。
    await p.query(`CREATE INDEX IF NOT EXISTS idx_records_flight ON checklist_records(flight_id);`);
    await p.query(`CREATE INDEX IF NOT EXISTS idx_records_flight_date ON checklist_records(flight_date);`);
    // 迁移：老库里若还留着 flight_id 唯一索引，启动时顺手摘掉（幂等）
    await p.query(`DROP INDEX IF EXISTS idx_records_flight_unique;`);
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
    // ⚠️ uuid 列是**航班身份标识**（前端创建检查单时用它当 flightId / 草稿归档键），
    //    必须与 data/schema.sql 保持一致 —— 早先本文件漏建此列，导致
    //    "靠 initDb 建空库"的服务器上缺列、创建检查单全线失败。
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
    // 迁移 1：老库补 uuid 列（幂等；已有行会自动回填默认值）
    await p.query(`
      ALTER TABLE manual_fips
        ADD COLUMN IF NOT EXISTS uuid VARCHAR(64) NOT NULL DEFAULT gen_random_uuid()::text;
    `);
    // 迁移 2：uuid 唯一索引（与 schema.sql 的 manual_fips_uuid_key 同名）
    await p.query(`CREATE UNIQUE INDEX IF NOT EXISTS manual_fips_uuid_key ON manual_fips(uuid);`);
    console.log('[DB] 表 manual_fips 已就绪');

    // ---------- 5. 生鲜货物航班表（fresh_air_cargo） ----------
    // 跨来源生鲜标记：source_table 标明来源表名，source_id 是该来源表的 UUID 标识。
    // 建表 + 老库迁移都在 ensureFreshAirCargo 里（迁移步骤较多，单独成函数）。
    await ensureFreshAirCargo(p);
    console.log('[DB] 表 fresh_air_cargo 已就绪');
  } catch (err) {
    console.error('[DB] 建表失败：', err.message);
  }
}

/**
 * 5) fresh_air_cargo —— 建表 + 迁移（幂等）
 *
 * 目标结构（业务自然键 = source_table + source_id）：
 *   id SERIAL PK
 *   source_table VARCHAR(32) NOT NULL DEFAULT 'manual_fips'  -- 来源表名
 *   source_id    UUID        NOT NULL                        -- 来源表里那行的 UUID
 *   content      JSONB DEFAULT '{}'
 *   created_at   TIMESTAMPTZ DEFAULT now()
 *
 * 老结构是 manual_fips_id INTEGER NOT NULL UNIQUE REFERENCES manual_fips(id)
 * ON DELETE CASCADE —— 迁移时把它换成对应 manual_fips.uuid 的 UUID：
 *   整数 id → 查 manual_fips.uuid → 写入新列 → 拆掉旧外键/唯一索引 → 删旧列。
 * 全程 IF EXISTS / IF NOT EXISTS，可重复执行；老库跑一次就完成转型。
 *
 * @param {import('pg').Pool} p
 */
async function ensureFreshAirCargo(p) {
  // 1) 全新库：直接按新结构建（source_id 是 UUID，不是整型）
  await p.query(`
    CREATE TABLE IF NOT EXISTS fresh_air_cargo (
      id SERIAL PRIMARY KEY,
      source_table VARCHAR(32) NOT NULL DEFAULT 'manual_fips',
      source_id UUID NOT NULL,
      content JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  // 2) 老库迁移：只要还留着 manual_fips_id 列，就说明是旧结构
  const legacy = await p.query(`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fresh_air_cargo' AND column_name = 'manual_fips_id'
  `);
  if (legacy.rowCount > 0) {
    console.log('[DB] fresh_air_cargo 检测到旧结构（manual_fips_id INTEGER），开始迁移 → source_id UUID');

    // 2.1 source_table：一步补齐默认值与 NOT NULL
    await p.query(`
      ALTER TABLE fresh_air_cargo
        ADD COLUMN IF NOT EXISTS source_table VARCHAR(32) NOT NULL DEFAULT 'manual_fips';
    `);

    // 2.2 source_id：先可空，回填后再收紧为 NOT NULL
    await p.query(`ALTER TABLE fresh_air_cargo ADD COLUMN IF NOT EXISTS source_id UUID;`);

    // 整数 manual_fips_id → 对应 manual_fips.uuid
    // （条件里加 UUID 正则，避免历史脏数据在 ::uuid 转换时报错中断启动）
    const filled = await p.query(`
      UPDATE fresh_air_cargo f
         SET source_id = m.uuid::uuid
        FROM manual_fips m
       WHERE m.id = f.manual_fips_id
         AND f.source_id IS NULL
         AND m.uuid ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    `);

    // 回填不到的（原航班已被删且外键没级联到）只能丢弃，否则 NOT NULL 加不上
    const orphan = await p.query(
      `DELETE FROM fresh_air_cargo WHERE source_id IS NULL RETURNING id, manual_fips_id;`,
    );
    if (orphan.rowCount > 0) {
      console.warn(
        '[DB] fresh_air_cargo 丢弃无主的旧标记（manual_fips 里找不到对应 uuid）：',
        orphan.rows.map((r) => `id=${r.id}→manual_fips_id=${r.manual_fips_id}`).join(', '),
      );
    }

    // 2.3 拆掉旧约束（外键指向 manual_fips(id)，新结构不再适用）
    // ⚠️ manual_fips_id_key 是**列上的 UNIQUE 约束**（不是裸索引）——
    //    DROP INDEX 会被 PG 拒绝（"cannot drop index ... because constraint ... requires it"），
    //    必须先 DROP CONSTRAINT；后面那句 DROP INDEX 只是给「裸唯一索引」形态的库兜底。
    await p.query(
      `ALTER TABLE fresh_air_cargo DROP CONSTRAINT IF EXISTS fresh_air_cargo_manual_fips_id_fkey;`,
    );
    await p.query(
      `ALTER TABLE fresh_air_cargo DROP CONSTRAINT IF EXISTS fresh_air_cargo_manual_fips_id_key;`,
    );
    await p.query(`DROP INDEX IF EXISTS fresh_air_cargo_manual_fips_id_key;`);

    // 2.4 删旧列 + 收紧新列
    await p.query(`ALTER TABLE fresh_air_cargo DROP COLUMN IF EXISTS manual_fips_id;`);
    await p.query(`ALTER TABLE fresh_air_cargo ALTER COLUMN source_id SET NOT NULL;`);

    console.log(`[DB] fresh_air_cargo 迁移完成，回填 ${filled.rowCount} 行`);
  }

  // 3) 业务自然键：同一来源表里的同一行只能有一条标记（upsert 的冲突目标）
  await p.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS fresh_air_cargo_source_key
      ON fresh_air_cargo(source_table, source_id);
  `);
}
