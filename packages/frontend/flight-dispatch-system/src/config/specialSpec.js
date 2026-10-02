/**
 * ============================================================
 * specialSpec —— 生鲜保障页的「标准与清单」定义（唯一事实来源）
 * ------------------------------------------------------------
 * 数据来源两份材料：
 *   1. pages/SpecialPage/components/ProcessNode.png
 *        - 上半张表 → PROCESS_STEPS（保障流程的 9 个环节）
 *        - 下半张表 → 卸机作业时长（**已移到 utils/specialCargoStandards.js**，
 *          既不单独做组件，也不在这里放常量；卡片表头与达标判定共用同一份表）
 *   2. 用户提供的文字注释（原 SpecialChecklist.jsx 全文，见文末附录）
 *        → CHECKLIST_GROUPS（保障清单，分 2 组共 15 条）
 *
 * 谁从这里取定义（不各自硬编码）：
 *   ProcessNode      ← PROCESS_STEPS
 *   SpecialPage      ← CHECKLIST_TOTAL / evaluateProcess
 *   SpecialChecklist ← CHECKLIST_GROUPS / CHECKLIST_TOTAL
 *   specialStore     ← 用于算清单总条数与进度
 * ============================================================
 */

import { gapMinutes, totalMinutes } from "../utils/processTime";
import { unloadStandardMinutes } from "../utils/specialCargoStandards";

/**
 * 保障流程环节（PNG 主表的行；前端「一列 = 一个航班」）。
 *   key            数据键（persist 用，改名会丢历史数据）
 *   label          环节名（PNG 的「保障环节」列）
 *   gap            true = 该环节要统计「与上一环节间隔时长」，false = 不统计
 *   standardMin    间隔标准（分钟）；达标判定用，null 表示无硬性阈值
 *   standardText   标准说明（展示用）
 *   standardRef    'unload' 按机型取卸机作业时长 / 'transport' 驳运时长（见表）
 */
export const PROCESS_STEPS = [
    { key: "landing", no: 1, label: "飞机落地", gap: false },
    {
        key: "arrive_stand",
        no: 2,
        label: "到达机位",
        gap: true,
        standardMin: 10,
        standardText: "间隔标准 10 分钟",
    },
    { key: "open_door", no: 3, label: "开舱门", gap: true, standardMin: 10, standardText: "间隔标准 10 分钟" },
    {
        key: "start_unload",
        no: 4,
        label: "开始卸货",
        gap: true,
        standardMin: 15,
        standardText: "间隔标准 15 分钟",
    },
    {
        key: "end_unload",
        no: 5,
        label: "卸货结束",
        gap: true,
        standardRef: "unload",
        standardText: "间隔标准按机型卸机作业时长（标准值见卡片表头）",
    },
    { key: "first_truck_leave", no: 6, label: "首车离坪", gap: false },
    { key: "first_truck_arrive", no: 7, label: "首车到库", gap: false },
    { key: "last_truck_leave", no: 8, label: "末车离坪", gap: false },
    {
        key: "last_truck_arrive",
        no: 9,
        label: "末车到库",
        gap: true,
        standardRef: "transport",
        standardText: "生鲜货物标准驳运时长：南区机位—北货站 35 分钟 / 北区机位—北货站 30 分钟",
    },
];

/** 货物保障时长小计的标准上限（分钟）——PNG「货物保障时长小计（120 分钟）」 */
export const TOTAL_DURATION_STANDARD_MIN = 120;

/** 生鲜货物板数的展示单位 */
export const BOARD_UNIT = "板";

/**
 * 卸机作业时长标准已整体移到 utils/specialCargoStandards.js：
 * 数据表 CARGO_STANDARDS 与 cargoStandardRowOf / unloadStandardMinutes /
 * unloadStandardText / unloadStandardHint 都在那边（单一事实来源）。
 *
 * 这里只做一次同名转出：本文件的 evaluateProcess（卸货结束环节的间隔达标
 * 判定）要用它，同时旧的 `from '../config/specialSpec'` 引用也不会断。
 */
export { unloadStandardMinutes };

/**
 * 逐环节求值 —— **间隔时长与达标判定的唯一口径**。
 * ProcessNode（展示）与 SpecialPage（当日超标汇总）都调它，避免两处各算一遍。
 *
 *   间隔 = 本环节时间 − **上一行**环节时间（上一行没填则为 null，与 PNG 一致）
 *   跨零点自动按 +24h（23:55 → 00:39 = 44 分钟）
 *   达标 = 间隔 ≤ 标准；无标准的环节（如驳运）只给数字、不判达标
 *
 * @param {string} aircraftType 该航班机型（决定卸机作业时长标准）
 * @param {Object} steps        { [stepKey]: { time } }
 * @returns {{
 *   items: Array<{step:Object,time:string,gap:number|null,standard:number|null,ok:boolean|null}>,
 *   total: number|null,        // 货物保障时长小计 = 末车到库 − 飞机落地
 *   totalOver: boolean,
 *   over: number               // 超标环节数（含时长小计）
 * }}
 */
export function evaluateProcess(aircraftType, steps = {}) {
    let over = 0;
    const items = PROCESS_STEPS.map((step, i) => {
        const time = steps[step.key]?.time || "";
        const prevStep = i > 0 ? PROCESS_STEPS[i - 1] : null;
        const prevTime = prevStep ? steps[prevStep.key]?.time || "" : "";
        const gap = step.gap ? gapMinutes(prevTime, time) : null;
        const standard = gapStandardMinutes(step, aircraftType);
        const ok = gap != null && standard != null ? gap <= standard : null;
        if (ok === false) over += 1;
        return { step, time, gap, standard, ok };
    });

    const total = totalMinutes(steps.landing?.time, steps.last_truck_arrive?.time);
    const totalOver = total != null && total > TOTAL_DURATION_STANDARD_MIN;
    if (totalOver) over += 1;

    return { items, total, totalOver, over };
}

/**
 * 取某环节的间隔标准（分钟）。
 * @param {Object} step PROCESS_STEPS 的一项
 * @param {string} aircraftType 该航班机型
 */
export function gapStandardMinutes(step, aircraftType) {
    if (!step || !step.gap) return null;
    if (step.standardMin != null) return step.standardMin;
    if (step.standardRef === "unload") return unloadStandardMinutes(aircraftType);
    return null; // standardRef === 'transport'，分南北区两条标准，不做单一阈值判定
}

/**
 * 保障清单（原文 15 条，分 2 组）。
 * 分组与条目文字保持用户注释原文，仅规整了中英文数字间的空格。
 * key 稳定，供 zustand persist 记录勾选状态——**改名会丢勾选记录**。
 */
export const CHECKLIST_GROUPS = [
    {
        key: "before_arrival",
        title: "航班入位前",
        items: [
            {
                key: "before_arrival-1",
                no: 1,
                text: "接到空港货运启动专项保障通知后，完整记录航班号、生鲜类别、货量、保障单位等信息，并在 FIPS/ACDM 中查看航班计划，判定预计落地时间",
            },
            {
                key: "before_arrival-2",
                no: 2,
                text: "通知空港地服/顺丰调度启动 A/B 类生鲜保障程序，询问人员、车辆、装卸设备是否存在保障堵点、特殊协调需求",
            },
            {
                key: "before_arrival-3",
                no: 3,
                text: "电话向航司代办/顺丰调度了解海关、边检登临查验人员登临计划，确认登临查验可按时抵达机位",
            },
            {
                key: "before_arrival-4",
                no: 4,
                text: "通知运指该生鲜航班相关摆渡车业务给予优先，并了解机位调整情况（空港地服负责向运指进行机位协调）",
            },
            {
                key: "before_arrival-5",
                no: 5,
                text: "航班落地前通过视频监控或电话问询等方式了解地服和地勤等单位到位情况",
            },
            { key: "before_arrival-6", no: 6, text: "联动运指，确认生鲜航班机位调整情况" },
            {
                key: "before_arrival-7",
                no: 7,
                text: "通知带班，视情协调武汉进近，申请生鲜航班就近跑道落地，减少地面滑行距离",
            },
            {
                key: "before_arrival-8",
                no: 8,
                text: "对比航班系统预落地时间与空管研判落地时间，若差值 ≥20 分钟，将最新预估落地时间同步通知地勤、地服、货站等单位",
            },
            {
                key: "before_arrival-9",
                no: 9,
                text: "持续通过安防视频监控各保障岗位人员、设备待命状态，力量缺失立即电话督促到位",
            },
            { key: "before_arrival-10", no: 10, text: "通知带班生鲜航班优化滑行路线，压缩地面滑行、等待时长" },
        ],
    },
    {
        key: "unload_transfer",
        title: "卸机作业与机坪驳运",
        items: [
            { key: "unload_transfer-11", no: 11, text: "通过安防实时监控机位现场，监控卸机进度" },
            {
                key: "unload_transfer-12",
                no: 12,
                text: "关注保障群内空港货运发布的首、末车抵离时间，综合研判保障整体进度",
            },
            {
                key: "unload_transfer-13",
                no: 13,
                text: "在生鲜航班落地后 90-100 分钟内电话询问地服生鲜货物保障情况，若某一保障环节滞后，及时加以提醒和协调帮助",
            },
            {
                key: "unload_transfer-14",
                no: 14,
                text: "若收到地服申请通行北垂滑需求，向带班申请优先保障驳运车辆通行北垂滑",
            },
            { key: "unload_transfer-15", no: 15, text: "存在保障超时的情况时详细进行记录" },
        ],
    },
];

/** 清单总条数（15） */
export const CHECKLIST_TOTAL = CHECKLIST_GROUPS.reduce((n, g) => n + g.items.length, 0);

/** 全部清单条目的 key（顺序 = 展示顺序），用于一键全选/清空 */
export const CHECKLIST_ITEM_KEYS = CHECKLIST_GROUPS.flatMap((g) => g.items.map((i) => i.key));

/* ------------------------------------------------------------------
 * 附录：用户原始文字注释（未加工，保留备查）
 *
 * 航班入位前
 * 1	接到空港货运启动专项保障通知后，完整记录航班号、生鲜类别、货量、保障单位等信息，并在FIPS/ACDM中查看航班计划，判定预计落地时间
 * 2	通知空港地服/顺丰调度启动A/B类生鲜保障程序，询问人员、车辆、装卸设备是否存在保障堵点、特殊协调需求
 * 3	电话向航司代办/顺丰调度了解海关、边检登临查验人员登临计划，确认登临查验可按时抵达机位
 * 4	通知运指该生鲜航班相关摆渡车业务给予优先，并了解机位调整情况（空港地服负责向运指进行机位协调）
 * 5	航班落地前通过视频监控或电话问询等方式了解地服和地勤等单位到位情况
 * 6	联动运指，确认生鲜航班机位调整情况
 * 7	通知带班，视情协调武汉进近，申请生鲜航班就近跑道落地，减少地面滑行距离
 * 8	对比航班系统预落地时间与空管研判落地时间，若差值≥20 分钟，将最新预估落地时间同步通知地勤、地服、货站等单位
 * 9	持续通过安防视频监控各保障岗位人员、设备待命状态，力量缺失立即电话督促到位
 * 10	通知带班生鲜航班优化滑行路线，压缩地面滑行、等待时长
 * 卸机作业与机坪驳运
 * 11	通过安防实时监控机位现场，监控卸机进度
 * 12	关注保障群内空港货运发布的首、末车抵离时间，综合研判保障整体进度
 * 13	在生鲜航班落地后90-100分钟内电话询问地服生鲜货物保障情况，若某一保障环节滞后，及时加以提醒和协调帮助
 * 14	若收到地服申请通行北垂滑需求，向带班申请优先保障驳运车辆通行北垂滑
 * 15	存在保障超时的情况时详细进行记录
 *
 * （原文「备注」列全部为空；第 15 条之后没有更多内容。）
 * ------------------------------------------------------------------ */
