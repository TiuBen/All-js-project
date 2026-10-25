/**
 * ============================================================
 * checklist.editor.store —— 检查单**编辑器**的会话态
 * ------------------------------------------------------------
 * 只放编辑器界面自己的状态：当前航班 / 当前模板 / 列显隐 / 小地图 / 选中节点。
 * 填写数据（items / videoItems / inspector）不在这里 —— 那是非受控的内存草案，
 * 在 store/checklist.store.js 的填写层。
 * ============================================================
 */
import { create } from "zustand";
import { useFipsStore } from "./fips.store";

// 三列的固定顺序（与面板组 columns 的 key 一致；panels 为内存态，不持久化）。
// 原本只在 checklist.store.js 里作为模块私有常量存在（未导出），本文件独立成篇后
// 只能自带一份 —— 接线时若那边改成 export，这里换成 import 即可。
const PANEL_KEYS = ["main", "aux", "video"];

export const useChecklistStore = create((set, get) => {
    return {
        // 当前航班信息 从fips.store 里面的 selectedFlight 读取
        editingFlight: () => {
            const { selectedId, rowOf } = useFipsStore.getState();
            return selectedId == null ? null : rowOf(selectedId) || null;
        },

        // 写入航班信息（从未提交草稿页面进入具体检查单页 / 流程图页时调用）
        setEditingFlight: (editingFlight) =>
            set({
                editingFlight,
            }),

        // ============================================================
        // 2) 当前模板
        // ============================================================
        templateType: null, // 检查单模板（JSON，主监控/辅助节点）
        setTemplateType: (templateType) =>
            set({
                templateType,
            }),

        /**
         * 切换某一列的显示（main / aux / video）
         * 至少保留一列：仅剩一列时再点它无效。
         * 结果按 PANEL_KEYS 顺序归一，顺序天然稳定。
         */
        panels: ["main", "aux", "video"], // 可见列（main/aux/video 的子集，至少一列）

        togglePanel: (key) => {
            if (!PANEL_KEYS.includes(key)) return;
            const cur = get().panels;
            const has = cur.includes(key);
            if (has && cur.length <= 1) return; // 不允许把最后一列也关掉
            set({ panels: PANEL_KEYS.filter((k) => (k === key ? !has : cur.includes(k))) });
        },

        // 右下角小地图开关
        thumbVisible: false,
        setThumbVisible: (next) => {
            const value = !!next;
            if (value === get().thumbVisible) return;
            set({ thumbVisible: value });
        },
        toggleThumbVisible: () => get().setThumbVisible(!get().thumbVisible),

        //  选中某个检查节点
        selectedCheckNode: null, // 原 currentStep
        setSelectedCheckNode: (nodeId) => set({ selectedCheckNode: nodeId }),
    };
});
