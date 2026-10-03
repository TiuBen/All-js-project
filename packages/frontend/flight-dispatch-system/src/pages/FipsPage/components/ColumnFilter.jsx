/**
 * ============================================================
 * ColumnFilter —— 航班列表「表头筛选」交互组件
 * ------------------------------------------------------------
 * 两个导出：
 *   ColumnFilterBar  表头筛选操作条（放在表格标题栏 / 表头条里）
 *                     未编辑 → 「表头筛选」按钮
 *                     编辑中 → 「全选 / 默认 / 取消 / 确认」
 *   ColumnToggle     表头单元格里的「列勾选框」（仅编辑态渲染）
 *                     勾选 = 显示该列；取消勾选 = 隐藏该列
 *                     附上移 / 下移箭头调整列顺序（写回 colOrder）
 *
 * 状态全部在 store/fips.store.js：
 *   编辑中只改草稿（draftHeaders），点「确认」才写回生效配置并落 localStorage；
 *   「取消」丢弃草稿。所以本组件是纯展示 + 派发，不持有本地状态。
 * ============================================================
 */

import { ArrowDown, ArrowUp, Check, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import { useFipsStore } from '../../../store/fips.store'
import { cn } from '../../../lib/utils'

const BTN =
    'inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-40'

/**
 * 表头筛选操作条
 * @param {{view: 'all'|'in'|'out', className?: string}} props
 */
export function ColumnFilterBar({ view, className }) {
    const editingView = useFipsStore((s) => s.editingView)
    const beginEdit = useFipsStore((s) => s.beginEdit)
    const cancelEdit = useFipsStore((s) => s.cancelEdit)
    const confirmEdit = useFipsStore((s) => s.confirmEdit)
    const resetDraft = useFipsStore((s) => s.resetDraft)
    const showAllDraft = useFipsStore((s) => s.showAllDraft)

    const editing = editingView === view

    // ---- 未编辑：单个「表头筛选」按钮 ----
    if (!editing) {
        return (
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    beginEdit(view)
                }}
                className={cn(
                    BTN,
                    'border-current/25 bg-white/70 hover:bg-white',
                    className,
                )}
                title="表头筛选：勾选要显示的列，确认后配置会保存在本机浏览器"
            >
                <SlidersHorizontal size={12} /> 表头筛选
            </button>
        )
    }

    // ---- 编辑中：全选 / 默认 / 取消 / 确认 ----
    return (
        <div
            className={cn('inline-flex items-center gap-1', className)}
            onClick={(e) => e.stopPropagation()}
        >
            <span className="mr-0.5 hidden text-[11px] font-normal opacity-70 xl:inline">
                勾选要显示的列
            </span>
            <button
                type="button"
                onClick={() => showAllDraft()}
                className={cn(BTN, 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50')}
                title="全部勾选"
            >
                全选
            </button>
            <button
                type="button"
                onClick={() => resetDraft(view)}
                className={cn(BTN, 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50')}
                title="恢复默认列与顺序（仍需点确认保存）"
            >
                <RotateCcw size={11} /> 默认
            </button>
            <button
                type="button"
                onClick={() => cancelEdit()}
                className={cn(BTN, 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50')}
                title="放弃本次修改"
            >
                <X size={11} /> 取消
            </button>
            <button
                type="button"
                onClick={() => confirmEdit()}
                className={cn(
                    BTN,
                    'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700',
                )}
                title="保存并应用（记到本机浏览器，刷新后仍生效）"
            >
                <Check size={11} /> 确认
            </button>
        </div>
    )
}

/**
 * 表头单元格里的列勾选框（仅编辑态渲染）
 * @param {{col: {key:string,label:string,isHide:boolean,colOrder:number}}} props
 */
export function ColumnToggle({ col }) {
    const toggleDraft = useFipsStore((s) => s.toggleDraft)
    const moveDraft = useFipsStore((s) => s.moveDraft)

    return (
        <span
            className="inline-flex items-center gap-1 font-normal"
            onClick={(e) => e.stopPropagation()}
        >
            <input
                type="checkbox"
                checked={!col.isHide}
                onChange={() => toggleDraft(col.key)}
                className="h-3 w-3 shrink-0 cursor-pointer accent-primary-600"
                title={col.isHide ? '已隐藏，勾选以显示该列' : '显示中，取消勾选以隐藏该列'}
            />
            <span
                className={cn(
                    'select-none whitespace-nowrap transition-colors',
                    col.isHide ? 'text-slate-300 line-through' : 'text-slate-600',
                )}
            >
                {col.label}
            </span>
            <span className="ml-0.5 inline-flex flex-col -space-y-1">
                <button
                    type="button"
                    onClick={() => moveDraft(col.key, 'up')}
                    className="text-slate-300 transition-colors hover:text-primary-600"
                    title="该列前移"
                >
                    <ArrowUp size={9} />
                </button>
                <button
                    type="button"
                    onClick={() => moveDraft(col.key, 'down')}
                    className="text-slate-300 transition-colors hover:text-primary-600"
                    title="该列后移"
                >
                    <ArrowDown size={9} />
                </button>
            </span>
        </span>
    )
}
