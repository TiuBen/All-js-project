/**
 * ============================================================
 * user —— 值班员花名册（user 表）
 * ------------------------------------------------------------
 * 检查单 / 生鲜台账的检查人、登录日志的引用都指向这张表。
 * 前端暂不做本表的 CRUD 界面（用户自己写），这里只提供全套接口。
 *
 * ★ name 唯一：登录日志按名字对回 user_id、检查单回填都靠它。
 *   重名 → P2002 → 全局中间件翻 409，service 不查重不 try/catch。
 * ★ 删除被引用的用户会被外键拦住（P2003）→ 翻成 409 提示，不硬删。
 * ============================================================
 */
import { prisma } from '../db/prisma.js';
import { badRequest, conflict, notFound } from '../utils/http.js';
import { cleanText, toInt } from '../utils/values.js';

const missing = (id) => notFound(`user 里没有 id=${id} 的用户`);

/**
 * 列表
 * @param {Object} [query] { name }（模糊匹配）
 */
export async function list(query = {}) {
    const name = cleanText(query.name);
    const items = await prisma.user.findMany({
        where: name ? { name: { contains: name } } : undefined,
        orderBy: { id: 'asc' },
    });
    return { total: items.length, items };
}

/** 详情 */
export async function get(id) {
    const key = toInt(id);
    if (key === null) throw missing(id);
    const row = await prisma.user.findUnique({ where: { id: key } });
    if (!row) throw missing(id);
    return row;
}

/** 按名字取一行（登录日志解析 user_id 用）；查不到返回 null，不抛 */
export async function byName(name) {
    const n = cleanText(name);
    if (!n) return null;
    return prisma.user.findUnique({ where: { name: n }, select: { id: true } });
}

/**
 * 校验并归一「检查人 id」：数字 → 必须 user 表里存在，否则 400。
 * 供**显式按 id 指定**的入口用（比如用户自己写的 CRUD / 修改界面）。
 * @returns {Promise<number|null|undefined>} undefined = 没传（不改）；null = 显式清空
 */
export async function inspectorIdOf(value) {
    if (value === undefined) return undefined;
    const id = toInt(value);
    if (id === null) return null;
    const hit = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!hit) throw badRequest(`user 里没有 id=${id} 的用户，inspector_id 写不进去`);
    return id;
}

/**
 * 从请求体归一「检查人」—— checklist / special 的 create / update 共用：
 *   ① inspectorId（数字）→ 走 inspectorIdOf（严格：不存在 → 400）
 *   ② inspectorName（姓名字符串）→ 按 user.name 现查；对不上**留空不拦提交**
 *     （与 user_login_log 同口径：台账不该拦着人干活；前端传的就是当前登录人）
 *   ③ 都没传 → undefined（不改）；显式空串/null → null（清空）
 * @param {Object} body
 * @returns {Promise<number|null|undefined>}
 */
export async function inspectorIdFromBody(body = {}) {
    const rawId = body.inspectorId ?? body.inspector_id;
    if (rawId !== undefined) return inspectorIdOf(rawId);

    const rawName = body.inspectorName ?? body.inspector_name;
    if (rawName === undefined) return undefined;
    const name = cleanText(rawName);
    if (!name) return null;
    const hit = await byName(name);
    return hit?.id ?? null;
}

/** 新增 { name, telephone? } */
export async function create(body = {}) {
    const name = cleanText(body.name);
    if (!name) throw badRequest('name（姓名）不能为空');
    return prisma.user.create({
        data: { name, telephone: cleanText(body.telephone) },
    });
}

/** 更新（局部更新） */
export async function update(id, body = {}) {
    const key = toInt(id);
    if (key === null) throw missing(id);

    const data = {};
    if ('name' in body) {
        const name = cleanText(body.name);
        if (!name) throw badRequest('name（姓名）不能为空');
        data.name = name;
    }
    if ('telephone' in body) data.telephone = cleanText(body.telephone);

    try {
        return await prisma.user.update({ where: { id: key }, data });
    } catch (err) {
        if (err?.code === 'P2025') throw missing(id);
        throw err;
    }
}

/** 删除：被检查单 / 台账 / 登录日志引用着 → 409，不让硬删 */
export async function remove(id) {
    const key = toInt(id);
    if (key === null) throw missing(id);
    try {
        return await prisma.user.delete({ where: { id: key } });
    } catch (err) {
        if (err?.code === 'P2025') throw missing(id);
        if (err?.code === 'P2003') {
            throw conflict('该用户已被检查单 / 生鲜台账 / 登录日志引用，不能删除');
        }
        throw err;
    }
}
