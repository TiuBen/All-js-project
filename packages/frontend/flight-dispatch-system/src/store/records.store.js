/**
 * ============================================================
 * records.store —— 填写记录页（records_checklist）唯一 store
 * ------------------------------------------------------------
 * 仿 fips.store 的模式：页面组件（RecordsTable / RecordsSidebar）
 * **只订阅本 store，不接父组件 props**。
 *
 *   A. 数据（不落盘）
 *      rows       后端返回的原始行（records_checklist + source / flight_uuid / createdDate）
 *      visible    渲染用：rows → 异常数标注 → 关键词过滤 → 排序（一次算完）
 *      dayMarkers 日历徽标 { 'YYYY-MM-DD': { count, hasAbnormal } }（按北京创建日，
 *                 红 = 当日有异常项、绿 = 全部正常）—— 单独拉全量算，不受筛选影响
 *
 *   B. 交互（不落盘）
 *      keyword / selectedId / sortKey / sortDir
 *
 *   C. 动作
 *      fetchRecords()   日期参数现读 app.store（?date= / ?from=&to=，口径 = 北京创建日）
 *      fetchDayMarkers() 不带日期参数拉全量算徽标（检查单量小，可接受）
 *      setKeyword / selectRow / toggleSort（列头三态）/ deleteSelected
 *
 * ★ 修改记录后回到本页：组件 useEffect 依赖 refreshKey（提交 / 删除后 +1）自动重拉。
 * ============================================================
 */
import { create } from "zustand";
import { checklistApi } from "../api/checklist";
import { useAppStore, dateFilterParamsOf } from "./app.store";

/** 一条记录的异常项数 = items + video_supervision 里 status === 'abnormal' 的项数 */
export function countAbnormal(record) {
    const count = (list) => (Array.isArray(list) ? list.filter((it) => it?.status === "abnormal").length : 0);
    return count(record?.items) + count(record?.video_supervision);
}

/** 关键词过滤（航班号(callsign) / 机型 / 类型 / 检查人姓名） */
function matchKeyword(row, keyword) {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return true;
    // inspector 现在是 user 对象（{ id, name, telephone }），搜索按姓名
    return [row.callsign, row.aircraft_type, row.checklist_category, row.inspector?.name, row.flight_uuid].some((v) =>
        String(v || "").toLowerCase().includes(kw)
    );
}

/** 某列的可比较值（时间列按时间戳、异常按数字、检查人按姓名、其余按字符串） */
function sortValueOf(row, key) {
    const raw = row?.[key];
    if (key === "created_at" || key === "updated_at") return raw ? new Date(raw).getTime() || 0 : 0;
    if (key === "abnormal") return Number(raw) || 0;
    if (key === "inspector") return raw?.name ?? ""; // user 对象 → 按姓名排
    return raw == null ? "" : String(raw);
}

/** 改 state 后重算 visible（rows / keyword / 排序 任一变化都走它） */
function withDerived(state, patch = {}) {
    const next = { ...state, ...patch };

    // ① 逐条标注异常项数
    const enriched = next.rows.map((r) => ({ ...r, abnormal: countAbnormal(r) }));
    // ② 关键词过滤
    const kw = next.keyword.trim().toLowerCase();
    const filtered = kw
        ? enriched.filter((r) => matchKeyword(r, kw))
        : enriched;
    // ③ 排序（列头三态：无排序键 = 原样，即后端的 id desc）
    const { sortKey, sortDir } = next;
    const visible = sortKey && sortDir
        ? [...filtered].sort((a, b) => {
              const va = sortValueOf(a, sortKey);
              const vb = sortValueOf(b, sortKey);
              if (va < vb) return sortDir === "asc" ? -1 : 1;
              if (va > vb) return sortDir === "asc" ? 1 : -1;
              return 0;
          })
        : filtered;

    return { ...patch, visible, abnormalCount: visible.filter((r) => r.abnormal > 0).length };
}

export const useRecordsStore = create((set, get) => ({
    /* ================= A. 数据（不落盘） ================= */

    rows: [],
    visible: [],
    abnormalCount: 0,
    loading: false,
    error: null,

    /** 日历徽标：{ 'YYYY-MM-DD': { count, hasAbnormal } }（按北京创建日） */
    dayMarkers: {},

    /** 提交 / 删除后 +1，页面看到变化就重拉 */
    refreshKey: 0,

    /* ================= B. 交互（不落盘） ================= */

    keyword: "",
    setKeyword: (keyword) => set((s) => withDerived(s, { keyword })),

    selectedId: null,
    selectRow: (id) => set({ selectedId: id }),

    sortKey: null,
    sortDir: null,
    /** 列头点击三态：新列 = asc；同列 asc → desc → 取消 */
    toggleSort: (key) =>
        set((s) => {
            if (s.sortKey !== key) return withDerived(s, { sortKey: key, sortDir: "asc" });
            if (s.sortDir === "asc") return withDerived(s, { sortDir: "desc" });
            return withDerived(s, { sortKey: null, sortDir: null });
        }),

    /* ================= C. 动作 ================= */

    /**
     * 拉填写记录列表（日期口径 = created_at 的北京日，参数现读 app.store）
     * @returns {Promise<Array>} 原始行（失败会抛，页面自行 catch）
     */
    fetchRecords: async () => {
        set({ loading: true, error: null });
        try {
            const params = dateFilterParamsOf(useAppStore.getState());
            const d = await checklistApi.list(params);
            set((s) => withDerived(s, { rows: d?.items || [], loading: false, error: null }));
            return d?.items || [];
        } catch (err) {
            set({ loading: false, error: err.message || "加载失败" });
            throw err;
        }
    },

    /**
     * 拉日历徽标：不带日期参数拉全量，按北京创建日（后端每行回 createdDate）归档
     * 检查单记录量小，全量可接受；分页化时再换专门接口。
     */
    fetchDayMarkers: async () => {
        try {
            const d = await checklistApi.list();
            const markers = {};
            for (const r of d?.items || []) {
                if (!r.createdDate) continue;
                const m = (markers[r.createdDate] ??= { count: 0, hasAbnormal: false });
                m.count += 1;
                if (countAbnormal(r) > 0) m.hasAbnormal = true;
            }
            set({ dayMarkers: markers });
        } catch {
            // 徽标拉不到不影响主列表，静默即可
        }
    },

    /** 删除选中的记录（DELETE 只删这一条；成功后刷新 + 徽标重算 + 清选中） */
    deleteSelected: async () => {
        const { selectedId } = get();
        if (selectedId == null) return;
        await checklistApi.remove(selectedId);
        set((s) => ({ selectedId: null, refreshKey: s.refreshKey + 1 }));
        await get().fetchRecords().catch(() => {});
        await get().fetchDayMarkers();
    },

    /** 提交 / 删除后回本页的统一刷新入口 */
    refresh: async () => {
        set((s) => ({ refreshKey: s.refreshKey + 1 }));
        await get().fetchRecords().catch(() => {});
        await get().fetchDayMarkers();
    },
}));
