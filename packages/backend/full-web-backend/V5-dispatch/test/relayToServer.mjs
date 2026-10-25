/**
 * ============================================================
 * relayToServer.mjs —— 本地拉取机场航班数据 → 推给阿里云服务器后端
 * ------------------------------------------------------------
 * 【为什么需要它】
 *   机场系统 ffqs.hublairport.com 挂在 WAF 后面，只放行机场内网/白名单，
 *   阿里云 ECS 直连会超时 → 服务器后端拉不到数据、监控整天空转。
 *   本脚本跑在「能访问机场系统」的电脑上：定时拉数，再 POST 给服务器后端的
 *   /api/monitor/plan（建基线）与 /api/monitor/trigger（比对）——这两个接口
 *   本来就支持 { rows: [...] } 离线喂数，服务器照常落库/比对/通知。
 *
 * 【怎么跑】（在本地电脑上，node >= 18）
 *   SERVER_URL=https://dd.atc1215.cn  \
 *   PUSH_TOKEN=你和服务端 .env 里一致的令牌  \
 *   node relayToServer.mjs
 *
 *   常用配置都走环境变量（不配就用默认）：
 *     SERVER_URL       服务器地址，默认 https://dd.atc1215.cn
 *     PUSH_TOKEN       推送令牌（服务端 .env 的 MONITOR_PUSH_TOKEN 配了就必须带）
 *     MONITOR_URL      机场数据源，默认 http://ffqs.hublairport.com/fqs-api/OffsiteFlight/selectMontageFlight?t=td
 *     INTERVAL_MINUTES  拉取间隔（分钟），默认 15
 *
 * 【逻辑】
 *   每 INTERVAL_MINUTES 分钟：
 *     ① 拉机场数据（重试 3 次）
 *     ② 只留「今天」的行（北京时区，口径与后端 dayOfRow 一致）；0 条就跳过本轮
 *     ③ 问服务器 status：day 不是今天 → 推 /plan（重灌当天建基线）；是 → 推 /trigger（增量比对）
 *
 * ★ 服务器端每 15 分钟自带的 runOnce / 每天 00:01 的 buildBaseline 仍会去直连机场
 *   并失败（只打 stderr、不影响服务）——它们拉不到就跳过，真正的数据由本脚本喂。
 * ============================================================
 */

const SERVER_URL = (process.env.SERVER_URL || "https://dd.atc1215.cn").replace(/\/$/, "");
const PUSH_TOKEN = process.env.PUSH_TOKEN || "";
const MONITOR_URL =
    process.env.MONITOR_URL || "http://ffqs.hublairport.com/fqs-api/OffsiteFlight/selectMontageFlight?t=td";
const INTERVAL_MINUTES = Math.max(1, parseInt(process.env.INTERVAL_MINUTES || "15", 10));

const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36";

/** 本地日志：带北京时间 YYYY-MM-DD HH:mm */
function now() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(
        d.getSeconds()
    )}`;
}
const log = (msg) => console.log(`[relay ${now()}] ${msg}`);

/** 今天（本地时区 = 北京；中国用户的电脑就是这个时区，与后端 Asia/Shanghai 一致） */
function today() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 一行归属哪一天：d 优先、退 a —— 与后端 dayOfRow 完全同口径 */
function dayOfRow(row) {
    const dayOf = (v) => (v == null || v === "" ? "" : String(v).slice(0, 10));
    return dayOf(row?.d_flight_date) || dayOf(row?.a_flight_date);
}

/** 拉机场数据（带重试 + 浏览器 UA，返回原始行数组） */
async function fetchRemote() {
    let lastErr = null;
    for (let i = 1; i <= 3; i++) {
        try {
            const res = await fetch(MONITOR_URL, {
                headers: { "User-Agent": UA, Accept: "application/json, text/plain, */*" },
                signal: AbortSignal.timeout(20000),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const body = await res.json();
            const rows = body?.data ?? body?.rows ?? body;
            if (!Array.isArray(rows)) throw new Error("返回结构里没有数组（期望 data）");
            return rows;
        } catch (err) {
            lastErr = err;
            log(`拉取第 ${i}/3 次失败：${err.message}`);
            if (i < 3) await new Promise((r) => setTimeout(r, 1000));
        }
    }
    throw lastErr;
}

/** 带 token 的请求头 */
function headers(json = true) {
    const h = {};
    if (PUSH_TOKEN) h["x-push-token"] = PUSH_TOKEN;
    if (json) h["Content-Type"] = "application/json";
    return h;
}

/** 推给服务器（POST），返回 { status, data } */
async function push(path, body) {
    const res = await fetch(`${SERVER_URL}${path}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

/** 查服务器监控状态（看它内存里的基线是哪天） */
async function serverStatus() {
    const res = await fetch(`${SERVER_URL}/api/monitor/status`, { signal: AbortSignal.timeout(15000) });
    return res.json().catch(() => ({}));
}

/** 一轮：拉数 → 过滤今天 → 决定 plan / trigger → 推 */
async function tick() {
    try {
        const rows = await fetchRemote();
        const todayRows = rows.filter((r) => dayOfRow(r) === today());
        // ★ 每次拉取都先打印条数：一眼确认这轮到底拿到没有
        log(`成功获取机场数据 ${rows.length} 条（其中今天 ${today().slice(5)} ${todayRows.length} 条）`);
        if (!todayRows.length) {
            log(`今天(${today()})暂无数据，本轮跳过（等机场系统生成今日计划）`);
            return;
        }

        let day = null;
        try {
            day = (await serverStatus()).day;
        } catch {
            log("查服务器 status 失败（服务器没起？），本轮跳过");
            return;
        }

        if (day !== today()) {
            const r = await push("/api/monitor/plan", { rows: todayRows });
            if (r.status === 200)
                log(
                    `服务器基线还是「${day ?? "无"}」，已推 /plan 建今日基线：${todayRows.length} 条 → ${JSON.stringify(
                        r.data
                    )}`
                );
            else log(`推 /plan 失败：HTTP ${r.status} ${JSON.stringify(r.data)}`);
        } else {
            const r = await push("/api/monitor/trigger", { rows: todayRows });
            if (r.status === 200) log(`已推 /trigger 比对：${todayRows.length} 条 → ${JSON.stringify(r.data)}`);
            else log(`推 /trigger 失败：HTTP ${r.status} ${JSON.stringify(r.data)}`);
        }
    } catch (err) {
        log(`本轮失败（下轮再试）：${err.message}`);
    }
}

log(
    `启动：每 ${INTERVAL_MINUTES} 分钟拉一次机场数据推给 ${SERVER_URL}${PUSH_TOKEN ? "（带 token）" : "（未带 token）"}`
);
tick(); // 启动先跑一轮
setInterval(tick, INTERVAL_MINUTES * 60 * 1000);
