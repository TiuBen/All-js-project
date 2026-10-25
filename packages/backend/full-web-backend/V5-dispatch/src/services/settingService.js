/**
 * ============================================================
 * setting —— 码表维护（航司码 / 机场码）
 * ------------------------------------------------------------
 * 两张表各写一份，不做配置表 / 驼峰转换那一层：
 * **字段名就是数据库原始列名，原样进出**。
 *
 *   airlines → airplane_company_name_code
 *              chinese_airplane_company_name / airplane_company_iata_code / airplane_company_icao_code
 *   airports → airport_name_code
 *              chinese_airport_name / english_airport_name / airport_iata_code / airport_icao_code
 *
 * ★ 唯一性靠**数据库 UNIQUE 约束**（每张表 3 个唯一列）：
 *   这里不查重、不 try/catch —— 撞了 Prisma 会抛 P2002，
 *   由 server.js 的全局错误中间件统一翻成 409（utils/http.js 的 isUniqueViolation）。
 *
 * 只有一条业务校验留在这一层：中文名列 NOT NULL —— 新增必填、更新不允许清空。
 * :id 是整数自增主键。
 * ============================================================
 */
import { prisma } from '../db/prisma.js';
import { badRequest, notFound } from '../utils/http.js';
import { cleanBody, cleanText, toInt } from '../utils/values.js';

/* ==================================================================
 * 航司码  airplane_company_name_code
 * ================================================================== */
export const airlines = {
  /** 列表：q 模糊匹配中文名 / IATA / ICAO */
  async list({ q } = {}) {
    const keyword = cleanText(q);
    const where = keyword
      ? {
          OR: [
            { chinese_airplane_company_name: { contains: keyword, mode: 'insensitive' } },
            { airplane_company_iata_code: { contains: keyword, mode: 'insensitive' } },
            { airplane_company_icao_code: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const items = await prisma.airplane_company_name_code.findMany({ where, orderBy: { id: 'asc' } });
    return { total: items.length, items };
  },

  /** 单条 */
  async get(id) {
    const key = toInt(id);
    const row = key === null ? null : await prisma.airplane_company_name_code.findUnique({ where: { id: key } });
    if (!row) throw notFound(`航司码里没有 id=${id} 的记录`);
    return row;
  },

  /** 新增（中文名必填） */
  async create(body = {}) {
    const data = cleanBody(body);
    if (!cleanText(data.chinese_airplane_company_name)) {
      throw badRequest('chinese_airplane_company_name（中文航司名）不能为空');
    }
    return prisma.airplane_company_name_code.create({ data });
  },

  /** 更新（局部；中文名不允许清空） */
  async update(id, body = {}) {
    const key = toInt(id);
    if (key === null) throw notFound(`航司码里没有 id=${id} 的记录`);

    const data = cleanBody(body);
    if ('chinese_airplane_company_name' in data && !cleanText(data.chinese_airplane_company_name)) {
      throw badRequest('chinese_airplane_company_name（中文航司名）不能清空');
    }
    if (Object.keys(data).length === 0) return airlines.get(key);

    // updateMany：没命中就是 count=0，省掉 Prisma P2025 的分支
    const { count } = await prisma.airplane_company_name_code.updateMany({ where: { id: key }, data });
    if (!count) throw notFound(`航司码里没有 id=${id} 的记录`);
    return airlines.get(key);
  },

  /** 删除 */
  async remove(id) {
    const key = toInt(id);
    if (key === null) throw notFound(`航司码里没有 id=${id} 的记录`);
    await prisma.airplane_company_name_code.deleteMany({ where: { id: key } });
    return { ok: true, id: key };
  },
};

/* ==================================================================
 * 机场码  airport_name_code
 * ================================================================== */
export const airports = {
  /** 列表：q 模糊匹配中英文名 / IATA / ICAO */
  async list({ q } = {}) {
    const keyword = cleanText(q);
    const where = keyword
      ? {
          OR: [
            { chinese_airport_name: { contains: keyword, mode: 'insensitive' } },
            { english_airport_name: { contains: keyword, mode: 'insensitive' } },
            { airport_iata_code: { contains: keyword, mode: 'insensitive' } },
            { airport_icao_code: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const items = await prisma.airport_name_code.findMany({ where, orderBy: { id: 'asc' } });
    return { total: items.length, items };
  },

  /** 单条 */
  async get(id) {
    const key = toInt(id);
    const row = key === null ? null : await prisma.airport_name_code.findUnique({ where: { id: key } });
    if (!row) throw notFound(`机场码里没有 id=${id} 的记录`);
    return row;
  },

  /** 新增（中文名必填） */
  async create(body = {}) {
    const data = cleanBody(body);
    if (!cleanText(data.chinese_airport_name)) {
      throw badRequest('chinese_airport_name（中文机场名）不能为空');
    }
    return prisma.airport_name_code.create({ data });
  },

  /** 更新（局部；中文名不允许清空） */
  async update(id, body = {}) {
    const key = toInt(id);
    if (key === null) throw notFound(`机场码里没有 id=${id} 的记录`);

    const data = cleanBody(body);
    if ('chinese_airport_name' in data && !cleanText(data.chinese_airport_name)) {
      throw badRequest('chinese_airport_name（中文机场名）不能清空');
    }
    if (Object.keys(data).length === 0) return airports.get(key);

    const { count } = await prisma.airport_name_code.updateMany({ where: { id: key }, data });
    if (!count) throw notFound(`机场码里没有 id=${id} 的记录`);
    return airports.get(key);
  },

  /** 删除 */
  async remove(id) {
    const key = toInt(id);
    if (key === null) throw notFound(`机场码里没有 id=${id} 的记录`);
    await prisma.airport_name_code.deleteMany({ where: { id: key } });
    return { ok: true, id: key };
  },
};
