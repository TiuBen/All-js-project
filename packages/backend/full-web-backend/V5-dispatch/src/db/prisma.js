/**
 * ============================================================
 * Prisma Client 单例
 * ------------------------------------------------------------
 * 全后端**唯一**的数据库入口（业务代码里没有一条 SQL 字符串）。
 *
 * ★ 为什么要单例：Prisma Client 内部维护连接池，
 *   每次 new 一个就等于多开一个池。开发期 tsx watch 会反复重载模块，
 *   挂在 globalThis 上可以让热重载复用同一个实例（生产环境无需挂）。
 *
 * ★ 为什么要 driver adapter（@prisma/adapter-pg）：
 *   Prisma 7 起 PostgreSQL 走 driver adapter 提供连接；
 *   连接串 + 会话参数（时区）都在这里一次性给定，见 config.pgTimezoneOptions。
 *
 * ★ 为什么整个后端要用 tsx 跑（package.json 的 dev / start）：
 *   生成器 provider = "prisma-client"，产物是 **TypeScript 源码**
 *   （prisma/generated/*.ts），node 直接 import .ts 会失败。
 * ============================================================
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '../config/index.js';
import { PrismaClient, Prisma } from '../../prisma/generated/client.ts';

/**
 * 造一个新的 Prisma Client（独立连接池）
 * 需要「另起一个池」的场景才用它（如 db_seed 脚本）；
 * 业务代码一律用下面的 prisma 单例。
 * @returns {PrismaClient}
 */
export function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: config.databaseUrl,
      options: config.pgTimezoneOptions,
    }),
  });
}

/** globalThis 上的挂载键（加前缀避免和其它库撞名） */
const GLOBAL_KEY = '__v5DispatchPrisma';

/** 全局单例 */
export const prisma = globalThis[GLOBAL_KEY] ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis[GLOBAL_KEY] = prisma;
}

export { Prisma };
export default prisma;

/**
 * JSON 列赋值的可空语义
 * ------------------------------------------------------------
 * 往 `Json?` 列写 SQL NULL 必须用 Prisma.DbNull；
 * 直接写普通 null 会被理解成「JSON null 这个值」，语义不同。
 */
export const jsonValue = (value) => (value === null ? Prisma.DbNull : value);
