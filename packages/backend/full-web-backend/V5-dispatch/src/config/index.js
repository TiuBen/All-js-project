/**
 * ============================================================
 * 全局配置
 * ------------------------------------------------------------
 * 统一从 .env 读配置并导出后端所需常量，业务代码不写魔法字符串。
 * 其它模块（db / services / routes）都从这里取。
 * ============================================================
 */
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 项目根目录：src/config/ → src → V5-dispatch */
const ROOT_DIR = path.resolve(__dirname, '..', '..');

/** 运行期产物目录（检查项截图等） */
const DATA_DIR = path.resolve(ROOT_DIR, 'data');
/** 检查项截图目录（一个文件 = 一张图） */
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

/**
 * 截图的对外访问前缀
 * ⚠️ 刻意挂在 /api 下面：开发环境的 vite 代理与线上 nginx 都只反代 /api，
 *    这样上传的图两边都能直接访问，不用改代理配置。
 */
const UPLOADS_URL_PREFIX = '/api/uploads';

for (const dir of [DATA_DIR, UPLOADS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * PostgreSQL 连接信息（分散字段）
 * 只在没配 DATABASE_URL 时用来现拼连接串兜底；运行期连库走 databaseUrl。
 */
const pg = {
  host: process.env.PG_HOST || '127.0.0.1',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || 'flight_dispatch',
};

/**
 * Prisma 连接串（整条 URL）
 * 优先取 .env 的 DATABASE_URL —— prisma.config.mjs（CLI 建表 / 迁移）用的是同一个值，
 * 两边必须指向同一个库，所以这里**不另拼一份**，避免配置漂移；
 * 万一只配了 PG_* 没配 DATABASE_URL，才按 PG_* 现拼兜底。
 */
const databaseUrl = process.env.DATABASE_URL
  || `postgresql://${pg.user}:${encodeURIComponent(pg.password)}@${pg.host}:${pg.port}/${pg.database}?schema=public`;

export const config = {
  /** 服务监听端口 */
  port: parseInt(process.env.PORT || '5183', 10),
  /** 服务监听地址 */
  host: process.env.HOST || '0.0.0.0',

  /** 运行环境（production 时按生产口径处理请求日志等） */
  env: process.env.NODE_ENV || 'development',
  /**
   * 日志级别：error < warn < info（默认 info 全打）。
   * 生产建议设 warn —— 只留 warn / error，静默掉监控每轮汇总这类 info 噪音。
   */
  logLevel: ['error', 'warn', 'info'].includes(process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : 'info',

  /** 允许的跨域来源（逗号分隔） */
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  /** Prisma 连接串 */
  databaseUrl,

  /**
   * ⚠️ 别删：把 PG 会话时区固定为 UTC。
   * ------------------------------------------------------------
   * PG 会按**会话时区**把 timestamptz / date 渲染成本地文本再交给驱动，
   * 而 Prisma 的 pg driver adapter 不认文本里的时区偏移：
   *   - 不固定 UTC 时，date 列会整体退一天；
   *   - timestamptz 会把本地墙上时间当成 UTC（整体差 8 小时），
   *     后果是 records_checklist 的「24 小时锁定」晚锁 8 小时、
   *     「按日期筛选」把 16:00 之后录入的记录算到第二天。
   * 固定成 UTC 后，读取回来的 JS Date 语义正确；
   * 要展示成北京时间由 utils/date.js 的 cn* 系列显式转换。
   */
  pgTimezoneOptions: '-c TimeZone=UTC',

  /** 路径常量 */
  paths: {
    root: ROOT_DIR,
    data: DATA_DIR,
    uploads: UPLOADS_DIR,
  },

  /** 截图访问前缀（静态托管挂载点，如 /api/uploads/xxx.png） */
  uploadsUrlPrefix: UPLOADS_URL_PREFIX,
  /** 单张截图体积上限（字节）：与前端 BaseCheckInput 的 IMAGE_MAX_BYTES 对齐 */
  uploadMaxBytes: 8 * 1024 * 1024,

  /**
   * 航班监控（每日 00:01 建当日基线 → 定时比对 → 记事件 + 通知）
   * ------------------------------------------------------------
   * 两个节奏都在 .env 里改，服务重启即生效，不用动代码：
   *   MONITOR_INTERVAL_MINUTES  每隔几分钟比对一次（默认 15）
   *   MONITOR_PLAN_HOUR / MINUTE  每天几点建当日基线（默认 00:01）
   */
  monitor: {
    /** 总开关：MONITOR_ENABLED=false 时不自动跑（仍可 POST /api/monitor/trigger 手动触发） */
    enabled: process.env.MONITOR_ENABLED !== 'false',
    /** ⭐ 比对间隔（分钟）—— 单独定义，改这里就是改这里 */
    intervalMinutes: Math.max(1, parseInt(process.env.MONITOR_INTERVAL_MINUTES || '15', 10)),
    /**
     * ⭐ 每天建当日基线的时刻。
     * 00:01 = 过零点一分再抓：此时当天的航班计划已经生成，抓到的就是
     * 「今天一整天有哪些航班」，作为当天的基线（**只建不更新**）。
     */
    planHour: parseInt(process.env.MONITOR_PLAN_HOUR || '0', 10),
    planMinute: parseInt(process.env.MONITOR_PLAN_MINUTE || '1', 10),
    /** 远程接口（花湖翼廊航班汇总） */
    url: process.env.MONITOR_URL
      || 'http://ffqs.hublairport.com/fqs-api/OffsiteFlight/selectMontageFlight?t=td',
    /** 单次拉取超时（毫秒）：拉不到就保留基线与上一轮，绝不清空集合 */
    timeoutMs: parseInt(process.env.MONITOR_TIMEOUT_MS || '20000', 10),
    /** 拉取失败自动重试次数（默认 2 → 总共尝试 3 次） */
    retryCount: Math.max(0, parseInt(process.env.MONITOR_RETRY_COUNT || '2', 10)),
    /** 两次重试之间的间隔（毫秒） */
    retryDelayMs: Math.max(0, parseInt(process.env.MONITOR_RETRY_DELAY_MS || '1000', 10)),
    /**
     * 🔴 断崖保护阈值：本轮条数比基线少的比例超过它就跳过本轮（不发任何通知）。
     * 少量减少是常态（航班取消 / 改期），一次性少一半以上几乎一定是数据源出问题了 ——
     * 不设防的话，接口挂一次就会把当天所有航班一次性报成「减少」。
     * 0 = 关闭该保护（不推荐）。
     */
    dropRatioLimit: (() => {
      const v = parseFloat(process.env.MONITOR_DROP_RATIO_LIMIT || '0.5');
      return Number.isFinite(v) && v >= 0 && v < 1 ? v : 0.5;
    })(),
    /**
     * 通知 webhook（钉钉 / 企微 / 飞书机器人通用 text 格式）。
     * 留空 = 只把事件落库（前端 GET /api/monitor/events 拉）+ 控制台打印，不外发。
     */
    webhookUrl: process.env.MONITOR_WEBHOOK_URL || '',
    /**
     * ⭐ 推送鉴权令牌：本地电脑拉数推给本服务的 /api/monitor/plan 与 /trigger 时，
     *   请求头要带 x-push-token 等于这个值。留空 = 不校验（仅本地开发）。
     *   生产（公网）务必配一个随机串，否则任何人都能往库里灌航班数据。
     */
    pushToken: process.env.MONITOR_PUSH_TOKEN || '',
  },

  /** 展示用：每天建基线的时刻 '00:01'（status 接口返回） */
  get monitorPlanTime() {
    const p = (n) => String(n).padStart(2, '0');
    return `${p(this.monitor.planHour)}:${p(this.monitor.planMinute)}`;
  },
};