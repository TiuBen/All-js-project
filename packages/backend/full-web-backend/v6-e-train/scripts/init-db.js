// scripts/init-db.js - e_train 数据库初始化（PG 直连，Prisma 之外的等价 DDL 实现）
//
// 两个阶段：
//   1. 按 prisma/schema.prisma 的定义建 enum + 6 张表（表名带引号，user 是保留字、表名含连字符）
//   2. 从 v4-tower-duty/src/user-face.db 的 user 表导入：姓名 + 是否具备教员资格
//      教员资格判定：user.position 是 JSON 数组，任一席位 roleType === '教员' 即为教员
//
// 运行：node scripts/init-db.js
// 连接串默认 postgres:admin@127.0.0.1:5432/e_train，可用 E_TRAIN_DATABASE_URL 覆盖
const { Client } = require('pg');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const connectionString =
  process.env.E_TRAIN_DATABASE_URL ||
  'postgresql://postgres:admin@127.0.0.1:5432/e_train';

const USER_FACE_DB = path.resolve(__dirname, '../../v4-tower-duty/src/user-face.db');

// ---- 阶段 1：DDL（与 schema.prisma 逐字段对齐） ----
const DDL = `
-- 题型枚举：单选/多选/填空/问答/判断
DO $$ BEGIN
  CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'FILL_BLANK', 'SHORT_ANSWER', 'TRUE_FALSE');
EXCEPTION WHEN duplicate_object THEN NULL; -- 已存在则跳过
END $$;

-- 题库目录类型：执照题库（系统固定只读）/ 地方题库（可编辑）
DO $$ BEGIN
  CREATE TYPE "CategoryTreeType" AS ENUM ('LICENSE', 'LOCAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- user：教员与学员共用
CREATE TABLE IF NOT EXISTS "user" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"         TEXT NOT NULL,                -- 姓名
  "gender"       TEXT,                         -- 性别：男/女
  "phone"        TEXT UNIQUE,                  -- 电话
  "email"        TEXT UNIQUE,                  -- 邮箱
  "profile"      JSONB,                        -- 个人扩展信息
  "is_instructor" BOOLEAN NOT NULL DEFAULT false, -- 是否具备教员资格（schema 补充字段）
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- simulator-exercise：模拟机练习题题库
CREATE TABLE IF NOT EXISTS "simulator-exercise" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "content"    JSONB NOT NULL,                -- 练习题 JSON 内容
  "creater_id" UUID NOT NULL REFERENCES "user"("id"),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- theory-category：理论题库目录树（自引用邻接表）
-- 顶层（parent_id 为空）= 执照题库 / 地方题库；第二层 = 三大部分；第三层 = 大类（挂题目）
-- tree_type：整棵子树继承顶层类型（执照题库只读 / 地方题库可编辑），创建子级时由后端继承写入
CREATE TABLE IF NOT EXISTS "theory-category" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"       TEXT NOT NULL,                 -- 目录名
  "parent_id"  UUID REFERENCES "theory-category"("id"), -- 父目录，顶层为 NULL
  "tree_type"  "CategoryTreeType" NOT NULL DEFAULT 'LOCAL', -- 题库类型（顶层：执照题库=LICENSE / 地方题库=LOCAL）
  "sort_order" INT DEFAULT 0,                 -- 同级排序（执照题库顶层 0 在最上、地方题库顶层 1）
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "theory-category_parent_id_sort_order_idx" ON "theory-category"("parent_id", "sort_order");
CREATE INDEX IF NOT EXISTS "theory-category_tree_type_idx" ON "theory-category"("tree_type");

-- theory-db：理论题库
CREATE TABLE IF NOT EXISTS "theory-db" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "content"     TEXT NOT NULL,                 -- 题干（单选题干后拼选项行，判断题仅题干）
  "type"        "QuestionType" NOT NULL,       -- 单选/多选/填空/问答/判断
  "answer"      TEXT NOT NULL,                 -- 标准答案（判断题存 T/F）
  "explain"     TEXT,                          -- 解析
  "exam_no"     TEXT,                          -- 原题库试题编号（V0-atctiku 导入去重与答案对应）
  "category_id" UUID REFERENCES "theory-category"("id") ON DELETE RESTRICT, -- 所属目录（RESTRICT：被题目引用的目录禁止删除）
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "theory-db_exam_no_idx" ON "theory-db"("exam_no");

-- theory-exercise：理论考试（试卷），source 为 theory-db uuid 数组（应用层保证有效性）
CREATE TABLE IF NOT EXISTS "theory-exercise" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "source"     UUID[] NOT NULL,               -- theory-db 的 uuid 数组，无法加外键
  "creater_id" UUID NOT NULL REFERENCES "user"("id"),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 模拟机目录类型枚举：YEAR = 年份/月份固定骨架（只读），CUSTOM = 用户自建节点
DO $$ BEGIN
  CREATE TYPE "SimulatorTreeType" AS ENUM ('YEAR', 'CUSTOM');
EXCEPTION WHEN duplicate_object THEN NULL; -- 已存在则跳过
END $$;

-- simulator-category：模拟机培训目录树（自引用邻接表，结构模仿 theory-category）
-- 一级 = 年份（2025 年 sort 0 / 2026 年 sort 1），二级 = 月份（1 月 - 12 月，sort 1-12）
-- 初始数据由 scripts/import-simulator-categories.js 灌入
CREATE TABLE IF NOT EXISTS "simulator-category" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"       TEXT NOT NULL,                 -- 目录名（如 2025 年 / 3 月）
  "parent_id"  UUID REFERENCES "simulator-category"("id"), -- 父目录，顶层（年份）为 NULL
  "tree_type"  "SimulatorTreeType" NOT NULL DEFAULT 'CUSTOM', -- 骨架节点 YEAR 只读，自建节点 CUSTOM 可编辑
  "sort_order" INT DEFAULT 0,                 -- 同级排序
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "simulator-category_parent_id_sort_order_idx"
  ON "simulator-category"("parent_id", "sort_order");

-- simulator-exam：模拟机考试记录
CREATE TABLE IF NOT EXISTS "simulator-exam" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "score"         DOUBLE PRECISION,
  "trainee_id"    UUID NOT NULL REFERENCES "user"("id"),
  "instructor_id" UUID NOT NULL REFERENCES "user"("id"),
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- theory-exam：理论考试记录
CREATE TABLE IF NOT EXISTS "theory-exam" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "score"         DOUBLE PRECISION,
  "trainee_id"    UUID NOT NULL REFERENCES "user"("id"),
  "instructor_id" UUID NOT NULL REFERENCES "user"("id"),
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

// 读 user-face.db 全部用户 → [{ name, isInstructor }]
function readUsers() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(USER_FACE_DB, sqlite3.OPEN_READONLY);
    db.all('SELECT id, username, position FROM user', (err, rows) => {
      if (err) return reject(err);
      db.close();
      resolve(
        rows
          .filter((r) => r.username && r.username.trim()) // 排除空姓名
          .map((r) => {
            let isInstructor = false;
            try {
              const seats = JSON.parse(r.position || '[]');
              // 任一席位 roleType === '教员' 即具备教员资格
              isInstructor = Array.isArray(seats) && seats.some((s) => s && s.roleType === '教员');
            } catch {
              /* position 不是合法 JSON 则视为非教员 */
            }
            return { name: r.username.trim(), isInstructor };
          })
      );
    });
  });
}

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('[1] 已连接', client.database, '（PG', (await client.query('SHOW server_version')).rows[0].server_version + '）');

  // gen_random_uuid 需要 PG13+，老版本退回 pgcrypto
  const major = parseInt((await client.query('SHOW server_version')).rows[0].server_version, 10);
  if (major < 13) await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await client.query(DDL);
  console.log('[2] 建表完成（enum QuestionType + 7 张表，已存在则跳过）');

  // theory-db 补 category_id 列（目录表后加的，老库需要增量升级；幂等）
  // ON DELETE RESTRICT：数据库层兜底，被题目引用的目录禁止删除
  await client.query(`
    DO $$ BEGIN
      ALTER TABLE "theory-db" ADD COLUMN "category_id" UUID REFERENCES "theory-category"("id") ON DELETE RESTRICT;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
  console.log('[2.1] theory-db.category_id 列已就绪（题目挂到大类目录）');

  // theory-db 补 exam_no 列（原题库试题编号，老库增量升级；幂等）
  await client.query(`
    DO $$ BEGIN
      ALTER TABLE "theory-db" ADD COLUMN "exam_no" TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
  await client.query('CREATE INDEX IF NOT EXISTS "theory-db_exam_no_idx" ON "theory-db"("exam_no")');
  console.log('[2.2] theory-db.exam_no 列已就绪（原题库试题编号）');

  // simulator-category 补 tree_type 列（骨架/自建节点类型，老库增量升级；幂等）
  // 现有骨架数据（年 + 月）若还是默认 CUSTOM 则回填为 YEAR
  await client.query(`
    DO $$ BEGIN
      ALTER TABLE "simulator-category" ADD COLUMN "tree_type" "SimulatorTreeType" NOT NULL DEFAULT 'CUSTOM';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
  await client.query(`
    UPDATE "simulator-category"
    SET "tree_type" = 'YEAR'
    WHERE "tree_type" = 'CUSTOM'
      AND ("parent_id" IS NULL OR "parent_id" IN (SELECT id FROM "simulator-category" WHERE parent_id IS NULL))
  `);
  console.log('[2.3] simulator-category.tree_type 列已就绪（骨架 YEAR / 自建 CUSTOM）');

  // ---- 阶段 2：导入用户 ----
  const { rows: existing } = await client.query('SELECT COUNT(*)::int AS n FROM "user"');
  if (existing[0].n > 0) {
    console.log(`[3] user 表已有 ${existing[0].n} 条数据，跳过导入（如需重导请先清空）`);
  } else {
    const users = await readUsers();
    const instructors = users.filter((u) => u.isInstructor).length;
    for (const u of users) {
      await client.query('INSERT INTO "user" ("name", "is_instructor") VALUES ($1, $2)', [u.name, u.isInstructor]);
    }
    console.log(`[3] 用户导入完成：共 ${users.length} 人，其中教员 ${instructors} 人`);
  }

  // 汇总校验
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE is_instructor)::int AS instructors
     FROM "user"`
  );
  console.log(`[4] user 表现状：${rows[0].total} 人（教员 ${rows[0].instructors}）`);
  const { rows: tables } = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`
  );
  console.log('[5] public 下的表：', tables.map((t) => t.table_name).join(', '));

  await client.end();
}

main().catch((e) => {
  console.error('❌ 初始化失败：', e.message);
  process.exit(1);
});
