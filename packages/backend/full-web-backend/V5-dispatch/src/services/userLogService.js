/**
 * ============================================================
 * userLog —— 用户登录日志（user_login_log）
 * ------------------------------------------------------------
 * 一行 = 一场登录：谁、什么时候登录（login_time）、什么时候登出（logout_time）。
 * logout_time 为空 = 这一场还开着。切换用户 =「先登出上一场，再登进新的一场」，
 * 所以「谁现在在岗」= 最后一条 logout_time 为空的行（前端不查这个，见 app.store）。
 *
 * ★ 时间列是 timestamptz（绝对时刻）→ 一律走 utils/date.js 的 cn* 系列，
 *   返回里顺带补 loginDate / logoutDate（北京日），前端分天不用自己换时区。
 *
 * ★ 登出不给「传时间」的入口：时间由**服务端**盖（客户端时钟不可信）。
 *   用 updateMany + where logout_time: null 做成**原子**的 —— 并发重复登出时
 *   只有一个请求的 count 是 1，另一个拿到 0 就回 409，不会把时间盖来盖去。
 * ============================================================
 */
import { prisma } from '../db/prisma.js';
import { cnDateTime, cnDay, cnDayWhere } from '../utils/date.js';
import { badRequest, conflict, notFound } from '../utils/http.js';
import { cleanText, toInt } from '../utils/values.js';
import * as userService from './userService.js';

/** 行 → API 对象（列名保持库里的原始名，另补两个北京日） */
function toApi(row) {
    if (!row) return null;
    return {
        ...row,
        loginDate: cnDay(row.login_time),
        logoutDate: cnDay(row.logout_time),
    };
}

const missing = (id) => notFound(`user_login_log 里没有 id=${id} 的记录`);

/**
 * 列表
 * @param {Object} [query] { username, date, from, to }（date 口径 = login_time 的北京日）
 */
export async function list(query = {}) {
    const and = [];

    const username = cleanText(query.username);
    if (username) and.push({ username });

    const byDay = cnDayWhere('login_time', query);
    if (byDay) and.push(byDay);

    const items = await prisma.user_login_log.findMany({
        where: and.length ? { AND: and } : undefined,
        orderBy: { id: 'desc' },
        include: { user: true },
    });
    return { total: items.length, items: items.map(toApi) };
}

/** 详情（:id 是整数自增主键） */
export async function get(id) {
    const key = toInt(id);
    if (key === null) throw missing(id);
    const row = await prisma.user_login_log.findUnique({ where: { id: key }, include: { user: true } });
    if (!row) throw missing(id);
    return toApi(row);
}

/**
 * 登录：插一行（logout_time 留空 = 这一场开着）
 * @param {Object} body { username }
 * login_time 不接收客户端传值 —— 交给库里的 @default(now())
 * ★ 顺手把 username 在 user（花名册）里对一遍：对上就记 user_id，
 *   对不上（手输 / 还没进花名册）也照记（user_id 留空）—— 台账不拦人干活。
 */
export async function create(body = {}) {
    const username = cleanText(body.username);
    if (!username) throw badRequest('username（用户名）不能为空');

    const u = await userService.byName(username);
    const row = await prisma.user_login_log.create({
        data: { username, user_id: u?.id ?? null },
        select: { id: true },
    });
    return get(row.id);
}

/** 登出：给这一场盖上 logout_time（服务端时间）；已经登出过 → 409 */
export async function logout(id) {
    const key = toInt(id);
    if (key === null) throw missing(id);

    const { count } = await prisma.user_login_log.updateMany({
        where: { id: key, logout_time: null },
        data: { logout_time: new Date() },
    });
    if (!count) {
        // 没命中只有两种可能：这条不存在，或者已经登出过了（并发时另一个请求刚盖上）
        const row = await prisma.user_login_log.findUnique({ where: { id: key } });
        if (!row) throw missing(id);
        throw conflict(`id=${key} 已经登出过了（${cnDateTime(row.logout_time)}）`);
    }
    return get(key);
}

/** 删除（deleteMany：不存在就回 404） */
export async function remove(id) {
    const key = toInt(id);
    if (key === null) throw missing(id);
    const { count } = await prisma.user_login_log.deleteMany({ where: { id: key } });
    if (!count) throw missing(id);
    return { ok: true, id: key };
}
