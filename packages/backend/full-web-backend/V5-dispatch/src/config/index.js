/**
 * ============================================================
 * 全局配置模块
 * ------------------------------------------------------------
 * 统一从 .env 读取配置，并导出后端所需的所有路径常量。
 * 所有模块（db / services / routes）都从这里取配置，
 * 避免散落魔法字符串。
 * ============================================================
 */
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// 加载 .env（默认读取当前工作目录下的 .env）
dotenv.config();

// 当前文件目录（ESM 环境没有 __dirname，手动推导）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** 项目根目录：src/config/ → 上一级（src）→ 再上一级（V5-dispatch） */
const ROOT_DIR = path.resolve(__dirname, '..', '..');

/** 数据目录（存放检查单模板 JSON、历史航班等） */
const DATA_DIR = path.resolve(ROOT_DIR, 'data');
const CHECKLISTS_DIR = path.join(DATA_DIR, 'checklists');

/** 检查项截图上传目录（原始二进制落盘，一个文件 = 一张图） */
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

/**
 * 截图的对外访问前缀
 * ⚠️ 刻意挂在 /api 下面：开发环境的 vite 代理、线上 nginx 都只反代 /api，
 *    这样上传的图在两个环境里都能直接访问，不需要改任何代理配置。
 */
const UPLOADS_URL_PREFIX = '/api/uploads';

// 确保数据目录存在
for (const dir of [DATA_DIR, CHECKLISTS_DIR, UPLOADS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export const config = {
  /** 服务监听端口 */
  port: parseInt(process.env.PORT || '5183', 10),
  /** 服务监听地址 */
  host: process.env.HOST || '0.0.0.0',

  /** 允许的跨域来源（逗号分隔，默认前端开发端口） */
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim()),

  /** PostgreSQL 连接配置 */
  pg: {
    host: process.env.PG_HOST || '127.0.0.1',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    database: process.env.PG_DATABASE || 'flight_dispatch',
  },

  /** 路径常量 */
  paths: {
    root: ROOT_DIR,
    data: DATA_DIR,
    checklists: CHECKLISTS_DIR,
    uploads: UPLOADS_DIR,
  },

  /** 截图访问前缀（静态托管挂载点，如 /api/uploads/xxx.png） */
  uploadsUrlPrefix: UPLOADS_URL_PREFIX,
  /** 单张截图体积上限（字节）：与前端 BaseCheckInput 的 IMAGE_MAX_BYTES 对齐 */
  uploadMaxBytes: 8 * 1024 * 1024,
};
