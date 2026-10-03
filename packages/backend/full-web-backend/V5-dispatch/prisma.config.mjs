// ============================================================
// Prisma 项目配置（Prisma 7 起为必需）
// ------------------------------------------------------------
// 为什么需要这个文件：
//   Prisma 7 把「连接串」从 schema.prisma 的 datasource 块里挪到了这里。
//   现在 schema.prisma 的 datasource 只保留 provider = "postgresql"，
//   在 schema 里再写 url = ... 会直接报 P1012 错误。
//
// 为什么是 .mjs 而不是 .ts：
//   本项目是纯 JavaScript（package.json 里 "type": "module"），
//   用 .mjs 就不必额外引入 typescript / tsx / @types/node。
//   Prisma 7 同时支持 prisma.config.ts 和 prisma.config.mjs，二选一。
//
// ⚠️ 第一行不能删：Prisma 7 的 CLI **不再自动加载 .env**，
//    必须自己 import 'dotenv/config'，否则 env('DATABASE_URL') 会取到 undefined。
//    dotenv 已是本项目依赖（src/config/index.js 也在用它）。
// ============================================================
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  /** schema 文件位置（相对本文件所在的项目根目录） */
  schema: 'prisma/schema.prisma',

  /** 迁移文件目录：prisma migrate dev 生成的 SQL 历史 */
  migrations: {
    path: 'prisma/migrations',
  },

  /**
   * 数据源连接串 —— Prisma CLI（db pull / db push / migrate）用它连库。
   * 值来自 .env 的 DATABASE_URL，需与其中的 PG_* 变量保持一致。
   * 注意：这里要的是**直连**地址（本项目就是本地库，直连即可）。
   */
  datasource: {
    url: env('DATABASE_URL'),
  },
});
