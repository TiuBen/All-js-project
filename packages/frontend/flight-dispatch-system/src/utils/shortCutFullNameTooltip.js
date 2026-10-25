/**
 * ============================================================
 * shortCutFullNameTooltip —— 航空「缩写 → 全称 + 中文解释」词典
 * ------------------------------------------------------------
 * 用途：航班列表表头的鼠标悬停提示文字。
 *   key   = 列 keyName（小写，与 config/fipsHeaders.js 一致）或
 *           IATA/ICAO 常用的时间缩写（大写）
 *   value = { full: 英文全称, cn: 中文名称, desc: 中文说明 }
 *
 * 谁在用：
 *   config/fipsHeaders.js  ← shortCutTooltip(key)（六个时刻列的 tooltip 字段）
 *   改文案只改这里；表头那里的 tooltip 会跟着变，页面不用动。
 *
 * ★ 只做「解释」，不参与任何时间计算。
 * ★ 本次清理删掉的死代码：shortCutTooltipCn（只要中文名的短提示，零引用）。
 * ============================================================
 */

/** 缩写词典（唯一数据源；目前只被本文件的 shortCutTooltip 读，无外部 import） */
export const SHORT_CUT_FULL_NAME_TOOLTIP = {
    // ---------- 本场航班列表里实际用到的 6 个时刻 ----------
    SOBT: {
        full: 'Scheduled Off-Block Time',
        cn: '计划撤轮挡时间',
        desc: '航班计划中规定的撤轮挡时刻，取自时刻表 / 飞行计划，是排班与保障的基准时间（等同 STD）。',
    },
    EOBT: {
        full: 'Estimated Off-Block Time',
        cn: '预计撤轮挡时间',
        desc: '最近一次上报的预计撤轮挡时刻，由机组 / 签派更新；是放行申请与 CTOT 计算的基础。',
    },
    ATOT: {
        full: 'Actual Take-Off Time',
        cn: '实际起飞时间',
        desc: '飞机实际离地（轮胎离地）的时刻，用于统计实际离港时刻与航班正常性。',
    },
    SIBT: {
        full: 'Scheduled In-Block Time',
        cn: '计划上轮挡时间',
        desc: '计划中航班到达并挡上轮挡的时刻（等同 STA），即计划到港时间。',
    },
    ELDT: {
        full: 'Estimated Landing Time',
        cn: '预计落地时间',
        desc: '最近一次更新的预计接地时刻，用于预排停机位与地面保障。',
    },
    ALDT: {
        full: 'Actual Landing Time',
        cn: '实际落地时间',
        desc: '飞机实际接地（轮胎触地）的时刻，用于统计实际到港时刻与航班正常性。',
    },

    // ---------- 相关但未直接成列的撤轮挡 / 放行时刻（备查） ----------
    TOBT: {
        full: 'Target Off-Block Time',
        cn: '目标撤轮挡时间',
        desc: '由地面 / 机组给出的目标撤轮挡时刻（A-CDM 概念），作为后续 COBT / TSAT 推算的输入。',
    },
    AOBT: {
        full: 'Actual Off-Block Time',
        cn: '实际撤轮挡时间',
        desc: '航班实际撤除轮挡、开始滑行的时刻。',
    },
    COBT: {
        full: 'Calculated Off-Block Time',
        cn: '计算撤轮挡时间',
        desc: '由 TOBT 按规则推算并加入缓冲后的撤轮挡时刻，用于与放行时隙对齐。',
    },
    TSAT: {
        full: 'Target Start-up Approval Time',
        cn: '目标开车批准时间',
        desc: '预计向机组发出开车许可的时刻，避免机组过早开车后长时间等待。',
    },
    CTOT: {
        full: 'Calculated Take-Off Time',
        cn: '计算起飞时间',
        desc: '由流量管理系统（ATFM）分配的起飞时隙时刻，受限于此窗口起飞（±容差）以免造成流控。',
    },

    // ---------- 常见计划 / 预计 / 实际时刻缩写 ----------
    STD: {
        full: 'Scheduled Time of Departure',
        cn: '计划离港时间',
        desc: '时刻表中的计划离港时刻，通常与 SOBT 对应（撤轮挡口径）。',
    },
    STA: {
        full: 'Scheduled Time of Arrival',
        cn: '计划到港时间',
        desc: '时刻表中的计划到港时刻，通常与 SIBT 对应（上轮挡口径）。',
    },
    ETD: {
        full: 'Estimated Time of Departure',
        cn: '预计离港时间',
        desc: '预计的离港时刻，口径视系统而定（撤轮挡或起飞）。',
    },
    ETA: {
        full: 'Estimated Time of Arrival',
        cn: '预计到港时间',
        desc: '预计的到港时刻，口径视系统而定（落地或上轮挡）。',
    },
    ATD: {
        full: 'Actual Time of Departure',
        cn: '实际离港时间',
        desc: '实际离港时刻，口径视系统而定（撤轮挡或起飞）。',
    },
    ATA: {
        full: 'Actual Time of Arrival',
        cn: '实际到港时间',
        desc: '实际到港时刻，口径视系统而定（落地或上轮挡）。',
    },
}

/**
 * 取某列的表头提示文本（供 <th title="..."> 使用）
 *   命中 → "英文全称（中文名）—— 说明"
 *   未命中 → ''（调用方回落到默认提示）
 * @usedBy pages/FipsPage/FipsPage.jsx（表头 title）
 * @param {string} key 列 key（大小写不敏感）
 * @returns {string}
 */
export function shortCutTooltip(key) {
    const item = SHORT_CUT_FULL_NAME_TOOLTIP[String(key || '').toUpperCase()]
    if (!item) return ''
    return `${item.full}（${item.cn}）—— ${item.desc}`
}
