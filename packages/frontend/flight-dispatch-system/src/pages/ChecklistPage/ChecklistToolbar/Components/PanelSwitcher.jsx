import { cn } from "../../../../utils/cn";
import { useChecklistStore } from "../../../../store/checklistEditorPage.store";

/**
 * ============================================================
 * PanelSwitcher —— 列显隐多选分段控制器（模仿 iOS Segmented Control，但可多选）
 * ============================================================
 */
export default function PanelSwitcher() {
    // ===== 订阅 store（细粒度 selector，均为原始值 / 稳定引用）=====
    const mainColVisible = useChecklistStore((s) => s.mainColVisible);
    const auxColVisible = useChecklistStore((s) => s.auxColVisible);
    const videoColVisible = useChecklistStore((s) => s.videoColVisible);
    const setColVisible = useChecklistStore((s) => s.setColVisible); // create() 时定义一次，引用永久稳定

    return (
        <div className="border rounded-md">
            <button
                type="button"
                onClick={() => setColVisible("main", !mainColVisible)}
                className={cn(
                    "rounded-l-md px-3.5 py-1.5",
                    "text-[13px] font-medium leading-5",
                    "whitespace-nowrap select-none",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-indigo-400 focus-visible:ring-offset-1",

                    mainColVisible
                        ? ["bg-white text-slate-800", "shadow-sm", "ring-1 ring-black/[0.04]"].join(" ")
                        : [
                              "bg-transparent text-slate-500",
                              "hover:bg-white/60 hover:text-slate-700",
                              "active:bg-white/80",
                          ].join(" ")
                )}
            >
                主要
            </button>
            <button
                type="button"
                onClick={() => setColVisible("aux", !auxColVisible)}
                className={cn(
                    "px-3.5 py-1.5",
                    "text-[13px] font-medium leading-5",
                    "whitespace-nowrap select-none",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-indigo-400 focus-visible:ring-offset-1",

                    auxColVisible
                        ? ["bg-white text-slate-800", "shadow-sm", "ring-1 ring-black/[0.04]"].join(" ")
                        : [
                              "bg-transparent text-slate-500",
                              "hover:bg-white/60 hover:text-slate-700",
                              "active:bg-white/80",
                          ].join(" ")
                )}
            >
                辅助
            </button>
            <button
                type="button"
                onClick={() => setColVisible("video", !videoColVisible)}
                className={cn(
                    "rounded-r-md px-3.5 py-1.5",
                    "text-[13px] font-medium leading-5",
                    "whitespace-nowrap select-none",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-indigo-400 focus-visible:ring-offset-1",

                    videoColVisible
                        ? ["bg-white text-slate-800", "shadow-sm", "ring-1 ring-black/[0.04]"].join(" ")
                        : [
                              "bg-transparent text-slate-500",
                              "hover:bg-white/60 hover:text-slate-700",
                              "active:bg-white/80",
                          ].join(" ")
                )}
            >
                视频
            </button>
        </div>
    );
}
