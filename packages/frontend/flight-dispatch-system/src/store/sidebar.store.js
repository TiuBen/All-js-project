/**
 * ============================================================
 * sidebar.store —— 航班页左侧栏的状态与动作
 * ------------------------------------------------------------
 * 为什么单独一个 store：这些状态**只服务「侧栏按钮 + 选中行」**这层交互，
 * 与 fips.store 的「列表 + 表头配置」是两件事；放一起会让那个 store 什么都管。
 *
 * 四块：
 *   A. 选中航班（selectedFlight）—— 表格点一行写这里，侧栏所有按钮读它。
 *      ★ 存的是**整行对象**（原始行），不是 id：创建检查单要 uuid、生鲜台账要
 *        航班号 + 日期、修改对话框要整行字段。存单个 id 还得回来反查行，没意义。
 *
 *   B. 写航班表（只有 manual_fips 源能写；按钮在侧栏按源显示 / 隐藏）
 *      addFlight / updateFlight / removeFlight —— 写完统一让 fips.store 重拉列表。
 *
 *   C. 添加 / 修改对话框：addOpen + editing（null = 新增模式）
 *
 *   D. 对选中航班的操作：removeSelected / markSelectedFresh / unmarkSelectedFresh
 *      ★「生鲜」本质是台账（records_special）里的一条记录 —— 真正的写入在
 *        specialStore；这里只做转接 + 重拉列表把 is_fresh 刷回来。
 *
 * ★ 依赖方向只有单向：sidebar → fips.store（要 fetchFlights）。
 *   fips.store **不要**反过来 import 本文件，否则成环。
 * ★ specialStore 用动态 import：它静态 import 了 fips.store 的 fetchFlightRows，
 *   静态互指在 Vite 热更新时会拿到残缺的模块命名空间。
 * ============================================================
 */

import { create } from "zustand";
import { fipsApi } from "../api";
import { useFipsStore } from "./fips.store";

export const useSidebarStore = create((set, get) => ({
    /* ================= A. 选中航班（不落盘） ================= */

    /** 当前选中的航班行（原始行；null = 没选中） */
    selectedFlight: null,

    /** 点某一行 → 选中它 */
    setSelectedFlight: (selectedFlight) => set({ selectedFlight }),

    /** 清掉选中（换日期 / 换数据源 / 删完之后） */
    clearSelection: () => set({ selectedFlight: null }),

    /* ================= B. 写航班表（只读源在 http.js 侧就写不到别的表） ================= */
    // ★ 写接口不带 source —— 后端固定写 manual_fips；DELETE 由 http.js 强制带 source=manual_fips。

    /** 新增航班后刷新列表 */
    addFlight: async (data) => {
        await fipsApi.create(data);
        await useFipsStore.getState().fetchFlights();
    },

    /** 修改航班后刷新列表 */
    updateFlight: async (id, data) => {
        await fipsApi.update(id, data);
        await useFipsStore.getState().fetchFlights();
    },

    /** 删除航班后刷新列表（后端同一事务里连带清掉该航班的检查单 / 生鲜台账） */
    removeFlight: async (id) => {
        await fipsApi.remove(id);
        await useFipsStore.getState().fetchFlights();
    },

    /* ================= C. 添加 / 修改对话框 ================= */

    /** 对话框是否打开 */
    addOpen: false,

    /** 对话框的编辑对象：null = 新增模式；一行 = 修改模式 */
    editing: null,

    /** 打开「添加」对话框 */
    openAdd: () => set({ editing: null, addOpen: true }),

    /** 打开「修改」对话框（回填当前选中行；没选中就什么都不做） */
    openEdit: () => {
        const { selectedFlight } = get();
        if (selectedFlight) set({ editing: selectedFlight, addOpen: true });
    },

    /** 关掉对话框（顺带丢掉编辑对象，下次打开不会带上一轮的残留） */
    closeDialog: () => set({ addOpen: false, editing: null }),

    /* ================= D. 对选中航班的操作 ================= */

    /** 删除当前选中的航班（后端同事务连带清掉它的检查单 / 生鲜台账） */
    removeSelected: async () => {
        const { selectedFlight } = get();
        if (!selectedFlight) return;
        set({ selectedFlight: null });
        await get().removeFlight(selectedFlight.id);
    },

    /** 把当前选中的航班标记为生鲜 */
    markSelectedFresh: async () => {
        const { selectedFlight } = get();
        if (!selectedFlight) return;
        // 动态 import：断开与 specialStore 的静态互指环（见文件头注释）
        const { useSpecialStore } = await import("./specialStore");
        await useSpecialStore.getState().markFresh(selectedFlight);
        // bump 数据版本：store 重拉（FipsPage 的 effect 挂在 dataVersion 上）+ 原始快照表自拉都刷新，
        // 否则「只看生鲜」筛的是标记前的旧行（is_fresh 还是 false）
        useFipsStore.getState().bumpDataVersion();
    },

    /** 取消生鲜标记 */
    unmarkSelectedFresh: async () => {
        const { selectedFlight } = get();
        if (!selectedFlight) return;
        const { useSpecialStore } = await import("./specialStore");
        await useSpecialStore.getState().unmarkFresh(selectedFlight);
        useFipsStore.getState().bumpDataVersion();
    },
}));
