import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import dayjs from 'dayjs'
import { fetchFlightRows } from './fips.store'
import { specialApi } from '../api'
import { useAppStore } from './app.store'
import { CHECKLIST_ITEM_KEYS, CHECKLIST_TOTAL, PROCESS_STEPS } from '../config/specialSpec'
import { gapMinutes, normalizeHHmm, totalMinutes } from '../utils/processTime'

/**
 * ============================================================
 * specialStore —— 生鲜保障页专用 store
 * ------------------------------------------------------------
 * 分三类数据，来源与生命周期完全不同：
 *
 *  A. 生鲜航班（只读，不持久化）
 *     freshFlights  从当前航班数据源拉**跨天全量**（fetchFlightRows，不带日期筛选），
 *                   再筛 is_fresh === true。**不重复请求后端**，只是复用航班 store。
 *     dayMarkers    { 'YYYY-MM-DD': { count, tone:'emerald' } } —— 日历每天的小数字
 *                   = 当天生鲜航班数（口径 = createdDate，与 /fips 页一致）
 *                   ★ 现已与「台账（special 表）每天的记录数」取并集，
 *                     这样从 Excel 导入的 9 月台账在日历上也能直接看到。
 *
 *  B. 保障过程数据（每个航班一份，持久化到 localStorage）
 *     processData[flightKey]  保障流程节点：板数 / 是否启动保障程序 / 各环节时间节点
 *     checks[flightKey]       保障清单勾选：{ [itemKey]: true }
 *     drawerOpen              右侧抽屉展开状态
 *
 *  C. 台账（special 表，服务端；按「航班号 + 创建日」匹配）
 *     specialRecords  { '航班号|YYYY-MM-DD': row }
 *     specialIndex    { '航班号(大写)|YYYY-MM-DD': row }  ← 匹配大小写不敏感
 *     ★ 后端**没有 belongTime 列**：行的日期用服务端返回的 createdDate
 *       （口径 = createTime 的北京日，由后端补上）。
 *     ★ 表里也**没有业务唯一约束** → 「同一航班同一天只有一条」由本 store 保证：
 *       命中已有行就 PUT /:id 覆盖，没有就 POST 新建（见 writeLedger）。
 *     页面「展示值」= **本地填写优先，其次台账记录**（见 resolveProcessOf）；
 *     点「存台账」才把当前值写回服务端，所以导入的历史数据不会被本地空值盖掉。
 *     ★ 台账里当天有记录、但航班源里没有的生鲜航班，会补成一行（source:'special'），
 *       导入的历史台账因此能直接在页面上看到内容。
 *
 * ★ 为什么单独一个 store：这三类数据都属于「生鲜保障」这一件事，
 *   与 /fips 的手动航班、填写记录都不共享，混进 appStore 会互相干扰。
 *
 * ★ 键 = flightKeyOf(flight)：优先 uuid，退化到 id。
 *   改这个口径会让已存的 processData / checks 全部对不上（等同清空）。
 * ============================================================
 */

/** 航班的稳定键（流程/清单数据都以它为 key） */
export function flightKeyOf(flight) {
    if (!flight) return ''
    if (flight.uuid) return String(flight.uuid)
    if (flight.id != null) return String(flight.id)
    return ''
}

/**
 * 航班所属日期（与 /fips 页的日期口径一致：createdDate 优先）
 * @param {Object} flight
 * @returns {string} 'YYYY-MM-DD' 或 ''
 */
export function dateKeyOf(flight) {
    if (!flight) return ''
    return (
        flight.createdDate ||
        flight.flightDate ||
        (flight.created_at ? dayjs(flight.created_at).format('YYYY-MM-DD') : '') ||
        ''
    )
}

/** 台账业务键（航班号 + 创建日，仅用于展示/调试） */
export function specialKeyOf(flight) {
    const call = flight?.flight_no || flight?.callsign || ''
    const day = dateKeyOf(flight)
    return call && day ? `${call}|${day}` : ''
}

/**
 * 匹配用索引键（航班号统一大写，避免大小写差异匹配不上）
 */
function indexKeyOf(callsign, day) {
    return `${String(callsign || '').toUpperCase()}|${day || ''}`
}

/**
 * 取一个航班写入台账所需的业务键 (callsign, day)
 * ⚠️ day = 航班日期（dateKeyOf），必须能解析出 YYYY-MM-DD —— 缺了就没法定位台账行。
 * @param {Object} flight
 * @returns {{callsign: string, day: string}}
 * @throws {Error} 航班号或日期缺失
 */
function ledgerKeyOf(flight) {
    const callsign = flight?.flight_no || flight?.callsign || ''
    const day = dateKeyOf(flight)
    if (!callsign || !day) {
        throw new Error('该航班缺少航班号或日期，无法写入台账')
    }
    return { callsign: String(callsign), day }
}

/**
 * 取某航班对应的台账行（纯函数版本，组件用 —— 直接吃 store 里的 specialIndex）
 * @param {Object} index specialIndex
 * @param {Object} flight
 * @returns {Object|null}
 */
export function recordOfFlight(index = {}, flight) {
    return index[indexKeyOf(flight?.flight_no || flight?.callsign, dateKeyOf(flight))] || null
}

/** 一个航班流程数据的空形状 */
export const EMPTY_PROCESS = { boardCount: '', programStarted: false, steps: {} }

/**
 * 取某航班的流程数据（纯函数，供组件当 selector 用）
 * ⚠️ 这里会把空缺补成空值，只适合「不需要台账兜底」的场景；
 *    页面展示请用 resolveProcessOf(processData[key], record)。
 * @param {Object} processData store 里的 processData
 * @param {string} flightKey
 */
export function getProcessOf(processData, flightKey) {
    const p = processData?.[flightKey]
    if (!p) return EMPTY_PROCESS
    return { ...EMPTY_PROCESS, ...p, steps: p.steps || {} }
}

/* ============================================================
 * 台账（special 表）相关纯函数
 * ============================================================ */

/**
 * 台账行 nodes → 页面流程数据形状
 * 只取页面认识的三样：板数 / 是否启动 / 各环节时间（间隔由 evaluateProcess 现算）
 * @param {Object} nodes
 * @returns {{boardCount:string, programStarted:boolean, steps:Object}|null}
 */
export function processFromNodes(nodes) {
    if (!nodes || typeof nodes !== 'object') return null
    const steps = {}
    Object.entries(nodes.steps || {}).forEach(([k, v]) => {
        const t = normalizeHHmm(v?.time)
        if (t) steps[k] = { time: t }
    })
    return {
        boardCount: nodes.boardCount == null ? '' : String(nodes.boardCount),
        programStarted: !!nodes.programStarted,
        steps,
    }
}

/**
 * 解析某航班**最终展示**用的流程数据：本地填写优先，其次台账记录。
 *
 * ⚠️ local 必须是 **processData[key] 的原值（可能是 undefined）**，
 *    不能先经 getProcessOf 补空 —— 补空后 boardCount:'' 会把台账里的板数挡住。
 *
 * @param {Object|undefined} local processData[flightKey]
 * @param {Object|null} record     台账行（specialIndex 命中的那条）
 * @returns {{boardCount:string, programStarted:boolean, steps:Object}}
 */
export function resolveProcessOf(local, record) {
    const fromRecord = processFromNodes(record?.nodes)
    const localBoard = local?.boardCount
    const hasLocalBoard = localBoard !== undefined && localBoard !== null && localBoard !== ''
    const steps = { ...(fromRecord?.steps || {}) }
    Object.entries(local?.steps || {}).forEach(([k, v]) => {
        // 本地把某环节清空了（time:''）也要生效，所以按 key 覆盖而不是按值有无
        steps[k] = { ...(steps[k] || {}), ...v }
    })
    return {
        boardCount: hasLocalBoard ? localBoard : fromRecord?.boardCount ?? '',
        programStarted: local?.programStarted ?? fromRecord?.programStarted ?? false,
        steps,
    }
}

/**
 * 页面流程数据 → 台账 nodes（存回服务端用）
 * 保留原台账行的 sheet / boardRaw / totalRaw 等原表痕迹，不抹成 null；
 * 间隔与时长小计按 PROCESS_STEPS 现算，与页面展示口径完全一致。
 *
 * @param {Object} flight
 * @param {Object} process 已解析的流程数据（boardCount / programStarted / steps）
 * @param {Object|null} [prevRecord] 该航班原有台账行（继承 sheet/boardRaw 等）
 * @returns {Object} nodes
 */
export function nodesOf(flight, process, prevRecord) {
    const prev = prevRecord?.nodes || {}
    const steps = {}
    PROCESS_STEPS.forEach((step, i) => {
        const time = normalizeHHmm(process?.steps?.[step.key]?.time) || ''
        const prevTime =
            i > 0 ? normalizeHHmm(process?.steps?.[PROCESS_STEPS[i - 1].key]?.time) || '' : ''
        steps[step.key] = { time, gap: step.gap ? gapMinutes(prevTime, time) : null }
    })
    const board = process?.boardCount
    const boardCount = board === '' || board == null ? null : Number(board)
    return {
        sheet: prev.sheet ?? null,
        aircraftType: flight?.aircraft_type || prev.aircraftType || null,
        boardCount: Number.isNaN(boardCount) ? null : boardCount,
        boardRaw: prev.boardRaw ?? null,
        programStarted: !!process?.programStarted,
        programRaw: process?.programStarted ? '是' : '否',
        totalMinutes: totalMinutes(steps.landing?.time, steps.last_truck_arrive?.time),
        totalRaw: prev.totalRaw ?? null,
        steps,
    }
}

/** 台账行 → 页面用的「航班」行（台账里有、航班源里没有时补上） */
export function flightOfRecord(record) {
    const nt = record?.nodes || {}
    // ★ 台账里没有 belongTime 列 —— 日期用服务端补的 createdDate（createTime 的北京日）
    const day = record?.createdDate || ''
    return {
        id: `special-${record.id}`,
        uuid: `special-${record.id}`,
        flight_no: record.callsign,
        aircraft_type: nt.aircraftType || '',
        stand: '',
        origin_station: '',
        dest_station: '',
        createdDate: day,
        flightDate: day,
        is_fresh: true,
        source: 'special', // 标记：这行来自台账，不是航班源
        ledgerId: record.id,
    }
}

/**
 * 合并「航班源里的生鲜航班」与「台账记录」→ 页面行列表。
 * (航班号, 日期) 相同的视为同一架 —— 保留航班源那行（它有停机位/航线等字段）。
 * @param {Array} freshFlights
 * @param {Object} records specialRecords
 */
export function mergePageRows(freshFlights = [], records = {}) {
    const rows = [...freshFlights]
    const seen = new Set(rows.map((f) => indexKeyOf(f.flight_no, dateKeyOf(f))))
    Object.values(records).forEach((r) => {
        const k = indexKeyOf(r.callsign, r.createdDate)
        if (!k || seen.has(k)) return
        seen.add(k)
        rows.push(flightOfRecord(r))
    })
    return rows
}

/**
 * 按日期过滤行（**本地筛**：生鲜页要跨天数据算日历徽标，交给后端就没法算了；
 * 航班列表页则是后端按 ?date= 筛的，两边口径各自保留）：
 *   无日期的行**始终展示**，不因筛选而消失。
 * @param {Array} rows
 * @param {{date?:string, from?:string, to?:string}} params
 */
export function filterRowsByDate(rows = [], params = {}) {
    const { date, from, to } = params || {}
    return rows.filter((f) => {
        const d = dateKeyOf(f)
        if (!d) return true
        if (date) return d === date
        if (from && to) return d >= from && d <= to
        if (from) return d >= from
        if (to) return d <= to
        return true
    })
}

/** 一个航班已勾选的清单条数（只统计当前 spec 里存在的 key，忽略历史残留） */
export function countCheckedOf(checks = {}) {
    return CHECKLIST_ITEM_KEYS.reduce((n, k) => n + (checks[k] ? 1 : 0), 0)
}

/** 汇总多架航班的勾选数（侧栏统计卡用） */
export function sumCheckedOf(checksMap = {}, flightKeys = []) {
    return flightKeys.reduce((n, k) => n + countCheckedOf(checksMap[k]), 0)
}

// ---- 内部：不可变更新小工具 ----

/** 合并某航班的流程数据 */
function mergeProcess(processData, flightKey, patch) {
    const cur = processData[flightKey] || {}
    return { ...processData, [flightKey]: { ...cur, ...patch } }
}

/** 合并某航班某个环节的数据 */
function mergeStep(processData, flightKey, stepKey, patch) {
    const cur = processData[flightKey] || {}
    const steps = cur.steps || {}
    return {
        ...processData,
        [flightKey]: { ...cur, steps: { ...steps, [stepKey]: { ...(steps[stepKey] || {}), ...patch } } },
    }
}

/** 从 specialRecords 建匹配索引（导出以便单测/调试时自己拼索引） */
export function buildRecordIndex(records) {
    const index = {}
    Object.values(records || {}).forEach((r) => {
        index[indexKeyOf(r.callsign, r.createdDate)] = r
    })
    return index
}
const buildIndex = buildRecordIndex;

/** 日历每天的小数字 = 生鲜航班 ∪ 台账记录（同一架只算一次） */
function buildMarkers(freshFlights = [], records = {}) {
    const markers = {}
    const seen = new Set()
    const bump = (day) => {
        if (!day) return
        const cur = markers[day] || { count: 0, tone: 'emerald' }
        cur.count += 1
        markers[day] = cur
    }
    freshFlights.forEach((f) => {
        const d = dateKeyOf(f)
        if (!d) return
        seen.add(indexKeyOf(f.flight_no, d))
        bump(d)
    })
    Object.values(records || {}).forEach((r) => {
        const k = indexKeyOf(r.callsign, r.createdDate)
        if (seen.has(k)) return
        seen.add(k)
        bump(r.createdDate)
    })
    return markers
}

/* ============================================================
 * 台账本地缓存的一致性维护（服务端写完 → 本地同步，省一次全量拉取）
 * ============================================================ */

/**
 * 把一行台账并入本地缓存（records / index / 日历徽标一次更新）
 * @returns {Object} 并入的那一行
 */
function mergeLedgerRow(set, get, row) {
    const records = { ...get().specialRecords, [`${row.callsign}|${row.createdDate}`]: row }
    set({
        specialRecords: records,
        specialIndex: buildIndex(records),
        dayMarkers: buildMarkers(get().freshFlights, records),
    })
    return row
}

/** 从本地缓存里摘掉一行台账 */
function dropLedgerRow(set, get, key) {
    const records = { ...get().specialRecords }
    delete records[key]
    set({
        specialRecords: records,
        specialIndex: buildIndex(records),
        dayMarkers: buildMarkers(get().freshFlights, records),
    })
}

/** 真 uuid（后端 resolveFlight 只认这个形状）；special-N 这类合成行不匹配 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * 台账关联航班用的 flightUuid
 * ------------------------------------------------------------
 * ★ **必须传**：后端 is_fresh / specialCount 是拿航班行的 specials 关联算出来的，
 *   而关联靠 records_special 的三个外键列（fips_uuid / ecyilang_uuid / manual_fips_uuid）。
 *   只写 callsign 不带 flightUuid 的话，台账行「孤零零挂在航班号上」——
 *   库里明明有这条记录，航班列表侧却永远看不到生鲜标记（而且删航班时的连带清理也命中不到）。
 * ★ 传 undefined = 后端当没传（axios 会把 undefined 键去掉），外键保持原样。
 *   台账里自己补出来的合成行（flightOfRecord → uuid 'special-N'）没有对应航班，
 *   这里用正则挡掉，免得 POST 404。
 * @param {Object} flight
 * @returns {string|undefined}
 */
function flightUuidOf(flight) {
    const id = flight?.uuid ?? flight?.id
    const text = id == null ? '' : String(id)
    return UUID_RE.test(text) ? text : undefined
}

/**
 * 写一条台账：命中已有行就 PUT 覆盖 nodes，没有就 POST 新建。
 * ★ 后端没有 upsert 接口，records_special 也没有业务唯一约束 ——
 *   「同一航班同一天只有一条」这件事由这里保证。
 * @param {Object|null} prev 该航班已有的台账行
 * @param {string} callsign 航班号
 * @param {Object} nodes 节点内容（整包覆盖）
 * @param {string} [flightUuid] 关联航班（见 flightUuidOf；缺省则不改外键）
 */
async function writeLedger(prev, callsign, nodes, flightUuid) {
    // 检查人 = 当前登录人：优先 currentUserId（user 表主键，严格挂外键）；
    // 没有再退回按姓名（后端现解析，对不上留空不拦提交）
    const { currentUser, currentUserId } = useAppStore.getState()
    const inspector = currentUserId != null
        ? { inspectorId: currentUserId }
        : currentUser
          ? { inspectorName: currentUser }
          : {}
    const patch = { nodes, flightUuid, ...inspector }
    return prev
        ? specialApi.update(prev.id, patch)
        : specialApi.create({ callsign, ...patch })
}

/**
 * 找该航班已有的台账行：先看本地索引，没有再问一次服务端。
 * 日期按行的 createdDate（后端口径）比对；同一航班号只有一条时直接复用 ——
 * 避免因为「航班日期 ≠ 台账创建日」而白白多插一条。
 * @returns {Promise<Object|null>}
 */
async function findLedgerRow(get, callsign, day) {
    const local = get().specialIndex[indexKeyOf(callsign, day)]
    if (local) return local

    const res = await specialApi.list({ callsign })
    const rows = res?.items || []
    if (rows.length === 1) return rows[0]
    return rows.find((r) => r.createdDate === day) || null
}

export const useSpecialStore = create(
    persist(
        (set, get) => ({
            /* ---------------- A. 生鲜航班（只读） ---------------- */
            freshFlights: [],
            loading: false,
            error: null,
            dayMarkers: {},

            /**
             * 拉取全部航班 → 筛出生鲜航班 → 顺手重算日历数字。
             * ★ 用 fetchFlightRows()（**不带日期筛选**）：日历上每天的小数字要跨天，
             *   拿「只选中那一天」的列表算不出别的日子。本页的按日显示仍在本地筛
             *   （rowsForDate），与航班列表页的「后端筛」是两条路，各自保留。
             * @returns {Promise<Array>} 生鲜航班列表
             */
            fetchFreshFlights: async () => {
                set({ loading: true, error: null })
                try {
                    const all = (await fetchFlightRows()) || []
                    const fresh = all.filter((f) => f.is_fresh)
                    set({
                        freshFlights: fresh,
                        dayMarkers: buildMarkers(fresh, get().specialRecords),
                        loading: false,
                        error: null,
                    })
                    return fresh
                } catch (err) {
                    set({ loading: false, error: err.message || '加载失败' })
                    throw err
                }
            },

            /* ---------------- C. 台账（special 表，服务端） ---------------- */
            specialRecords: {}, // { '航班号|YYYY-MM-DD': row }
            specialIndex: {}, // { '航班号(大写)|YYYY-MM-DD': row }
            specialLoading: false,
            specialError: null,
            savingKey: '', // 正在存台账的航班键（按钮转圈用）

            /**
             * 拉台账。不传参数取全量（当前 50 条量级，放本地筛选更灵活）。
             * 同时重算日历徽标。
             * @param {Object} [params] { date, from, to, callsign }
             * @returns {Promise<Array>} 台账行
             */
            fetchSpecialRecords: async (params = {}) => {
                set({ specialLoading: true, specialError: null })
                try {
                    const res = await specialApi.list(params)
                    const items = res?.items || []
                    const records = {}
                    items.forEach((r) => {
                        records[`${r.callsign}|${r.createdDate}`] = r
                    })
                    set({
                        specialRecords: records,
                        specialIndex: buildIndex(records),
                        specialLoading: false,
                        specialError: null,
                        dayMarkers: buildMarkers(get().freshFlights, records),
                    })
                    return items
                } catch (err) {
                    set({ specialLoading: false, specialError: err.message || '台账加载失败' })
                    throw err
                }
            },

            /** 刷新 = 航班源 + 台账 一起拉（任一失败都会抛出，页面上有 error 提示） */
            refreshAll: async () => {
                const results = await Promise.allSettled([
                    get().fetchFreshFlights(),
                    get().fetchSpecialRecords(),
                ])
                const failed = results.find((r) => r.status === 'rejected')
                if (failed) throw failed.reason
            },

            /**
             * 按日期参数取「页面行」（航班源生鲜 ∪ 台账）并过滤。
             * 与 /fips 页不同：那边由后端按日期筛，这边全量拿回来在本地筛。
             */
            rowsForDate: (params = {}) => {
                const s = get()
                return filterRowsByDate(mergePageRows(s.freshFlights, s.specialRecords), params)
            },

            /** 取某航班对应的台账行（大小写不敏感） */
            recordOf: (flight) => {
                const s = get()
                return s.specialIndex[indexKeyOf(flight?.flight_no, dateKeyOf(flight))] || null
            },

            /**
             * 把某航班当前的流程数据存进台账（按 航班号 + 归属日期 upsert）
             * @param {Object} flight
             * @param {Object} process 已解析的流程数据
             * @returns {Promise<Object>} 服务端返回的台账行
             */
            saveToLedger: async (flight, process) => {
                const { callsign, day } = ledgerKeyOf(flight)
                set({ savingKey: flightKeyOf(flight), specialError: null })
                try {
                    const prev = await findLedgerRow(get, callsign, day)
                    const row = await writeLedger(
                        prev,
                        callsign,
                        nodesOf(flight, process, prev),
                        flightUuidOf(flight),
                    )
                    set({ savingKey: '' })
                    return mergeLedgerRow(set, get, row)
                } catch (err) {
                    set({ savingKey: '', specialError: err.message || '存台账失败' })
                    throw err
                }
            },

            /** 删除一条台账记录（按主键） */
            removeLedgerRecord: async (id) => {
                await specialApi.remove(id)
                const hit = Object.entries(get().specialRecords).find(
                    ([, r]) => String(r.id) === String(id),
                )
                if (hit) dropLedgerRow(set, get, hit[0])
                return true
            },

            /* ---------------- 生鲜标记（/fips 页用，落在台账 nodes.freshMark） ---------------- */

            /**
             * 标记生鲜 —— 给该航班建（或补）一条 records_special 台账
             * ------------------------------------------------------------
             * ★ 为什么是「建台账」而不是写一张独立的标记表：
             *   后端 is_fresh 的判定就是「该航班有没有台账行」（EXISTS 子查询），
             *   标记内容本身放在 nodes.freshMark 里。
             * ★ 该航班已有台账（保障节点已填）时**只补 freshMark 子键**，
             *   不覆盖既有的板数 / 节点时间 —— 标记与保障数据互不干扰。
             * @param {Object} flight 航班行（需有 flight_no 与日期）
             * @param {Object} [content] 标记内容（默认空对象，原样存进 freshMark）
             * @returns {Promise<Object>} 服务端返回的台账行
             */
            markFresh: async (flight, content = {}) => {
                const { callsign, day } = ledgerKeyOf(flight)
                const prev = await findLedgerRow(get, callsign, day)
                // 已有台账只补 freshMark 子键，不覆盖既有的板数 / 节点时间
                const nodes = { ...(prev?.nodes || {}), freshMark: content }
                return mergeLedgerRow(
                    set,
                    get,
                    await writeLedger(prev, callsign, nodes, flightUuidOf(flight)),
                )
            },

            /**
             * 取消生鲜标记 —— 摘掉 nodes.freshMark
             * ------------------------------------------------------------
             * ★ 台账里只剩 freshMark 时**整行删除**：后端 is_fresh 看的是
             *   「有没有台账行」，只摘子键的话取消标记不会生效。
             *   还挂着保障节点时只摘子键，台账本身保留（别把保障数据一起删了）。
             * @param {Object} flight 航班行
             * @returns {Promise<Object|null>} 摘完剩下的台账行；整行删掉时返回 null
             */
            unmarkFresh: async (flight) => {
                const { callsign, day } = ledgerKeyOf(flight)
                const prev = await findLedgerRow(get, callsign, day)
                if (!prev) return null
                const nodes = { ...(prev.nodes || {}) }
                delete nodes.freshMark
                if (Object.keys(nodes).length === 0) {
                    await specialApi.remove(prev.id)
                    dropLedgerRow(set, get, `${prev.callsign}|${prev.createdDate}`)
                    return null
                }
                return mergeLedgerRow(
                    set,
                    get,
                    await specialApi.update(prev.id, { nodes, flightUuid: flightUuidOf(flight) }),
                )
            },

            /** 按日期过滤生鲜航班（保留旧接口；页面已改用 rowsForDate） */
            filterFreshByDate: (params = {}) => filterRowsByDate(get().freshFlights, params),

            /* ---------------- B. 保障过程数据（持久化） ---------------- */
            drawerOpen: true,
            processData: {}, // { [flightKey]: { boardCount, programStarted, steps: { [stepKey]: { time } } } }
            checks: {}, // { [flightKey]: { [itemKey]: true } }

            toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
            setDrawerOpen: (open) => set({ drawerOpen: !!open }),

            /** 环节时间节点（HH:mm 字符串；传空串 = 清空） */
            setStepTime: (flightKey, stepKey, time) =>
                set((s) => ({ processData: mergeStep(s.processData, flightKey, stepKey, { time }) })),

            /** 生鲜货物板数（存字符串，允许空；展示时再转数字） */
            setBoardCount: (flightKey, boardCount) =>
                set((s) => ({ processData: mergeProcess(s.processData, flightKey, { boardCount }) })),

            /** 是否启动保障程序 */
            setProgramStarted: (flightKey, programStarted) =>
                set((s) => ({ processData: mergeProcess(s.processData, flightKey, { programStarted }) })),

            /** 勾选 / 取消勾选一条清单 */
            toggleCheck: (flightKey, itemKey) =>
                set((s) => {
                    const cur = s.checks[flightKey] || {}
                    return { checks: { ...s.checks, [flightKey]: { ...cur, [itemKey]: !cur[itemKey] } } }
                }),

            /** 批量勾选 / 清空一组条目（整组确认 / 整组取消） */
            setAllChecked: (flightKey, itemKeys = [], checked = true) =>
                set((s) => {
                    const cur = { ...(s.checks[flightKey] || {}) }
                    itemKeys.forEach((k) => {
                        if (checked) cur[k] = true
                        else delete cur[k]
                    })
                    return { checks: { ...s.checks, [flightKey]: cur } }
                }),

            /** 清空某航班的保障过程数据（流程填写值 + 清单勾选）—— 只清本机，不动台账 */
            resetFlight: (flightKey) =>
                set((s) => {
                    const processData = { ...s.processData }
                    const checks = { ...s.checks }
                    delete processData[flightKey]
                    delete checks[flightKey]
                    return { processData, checks }
                }),
        }),
        {
            name: 'flight-dispatch:special',
            version: 1,
            // 只持久化「用户录入的过程数据」；航班列表 / 台账 / 日历标记每次重新拉取
            partialize: (s) => ({
                drawerOpen: s.drawerOpen,
                processData: s.processData,
                checks: s.checks,
            }),
        }
    )
)

/** 清单总条数（供组件直接引用，避免各页重复 reduce） */
export { CHECKLIST_TOTAL }
