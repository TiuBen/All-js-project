import { useCallback } from "react";
// ahooks 的 useLocalStorageState：布局偏好本地持久化（不同步到其他标签页）
import { useLocalStorageState } from "ahooks";

/**
 * ============================================================
 * useUiPrefs —— 检查单页布局偏好的读写（ChecklistEditor 私有 hook）
 * ------------------------------------------------------------
 * 持久化字段（localStorage key: checklist_ui_prefs）：
 *   - viewMode      form（检查项）| flow（流程图全屏）
 *   - thumbVisible  右下角缩略图小窗（默认关闭）
 *
 * 注：三列可见性（panels）已随"穷举法"下沉 —— 各检查单面板组固定渲染三列，
 *     这里不再保存 panels；旧数据里的该字段会被忽略。
 *
 * ★ 逐字段 setter：值未变化时**返回原对象** → ahooks 内部 Object.is 判定相等，
 *   跳过 setState 与落盘，避免无意义的重渲染。
 *
 * @returns {{ viewMode, thumbVisible, setViewMode, setThumbVisible }}
 * ============================================================
 */
const UI_PREFS_KEY = "checklist_ui_prefs";
export const DEFAULT_UI_PREFS = { viewMode: "form", thumbVisible: false };

export default function useUiPrefs() {
    const [uiPrefs, setUiPrefs] = useLocalStorageState(UI_PREFS_KEY, {
        defaultValue: DEFAULT_UI_PREFS,
    });

    const prefs = uiPrefs || DEFAULT_UI_PREFS;
    const viewMode = prefs.viewMode || "form"; // form | flow
    const thumbVisible = !!prefs.thumbVisible; // 点"显示小地图"开启

    const setViewMode = useCallback(
        (next) =>
            setUiPrefs((p) => {
                const cur = p || DEFAULT_UI_PREFS;
                const value = typeof next === "function" ? next(cur.viewMode || "form") : next;
                return value === cur.viewMode ? cur : { ...cur, viewMode: value };
            }),
        [setUiPrefs]
    );

    const setThumbVisible = useCallback(
        (next) =>
            setUiPrefs((p) => {
                const cur = p || DEFAULT_UI_PREFS;
                const value = typeof next === "function" ? next(!!cur.thumbVisible) : next;
                return value === !!cur.thumbVisible ? cur : { ...cur, thumbVisible: value };
            }),
        [setUiPrefs]
    );

    return { viewMode, thumbVisible, setViewMode, setThumbVisible };
}
