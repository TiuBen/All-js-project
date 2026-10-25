import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useSettingStore } from "../../../store/settingStore";
import { cn } from "../../../utils/cn";
import { Ban, Check, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";

/**
 * ============================================================
 * SettingCodeTable —— 码表通用表格（航司码 / 机场码共用）
 * ------------------------------------------------------------
 * 两张码表的「列表 + 搜索 + 增删改」交互完全一样，只有列不同，
 * 所以抽出一套实现，由调用方传 kind + columns 描述列：
 *
 *   columns: [{ key, label, required?, upper?, maxLength?, placeholder? }]
 *     key   —— 字段名，必须与后端返回体一致（= **数据库原始列名**，后端不做驼峰转换）
 *     upper —— 输入时自动转大写（IATA / ICAO 都是大写代码）
 *
 * 交互约定：
 *   - 搜索：输入后**防抖 250ms** 再请求（服务端 ?q= 模糊匹配）
 *   - 新增/编辑：就地展开一行输入框（不弹窗），Enter 保存 / Esc 取消；
 *     「新增行」常驻表格顶部，编辑行替换原数据行
 *   - 唯一约束（中文名 / IATA / ICAO 三者都唯一）冲突时后端回 409，
 *     错误信息就地显示在编辑行下方，不打断整页
 *   - 删除：window.confirm 二次确认
 * ============================================================
 */
export default function SettingCodeTable({ kind, title, subtitle, columns, addLabel = "新增", emptyHint }) {
    // ===== store 订阅（细粒度）=====
    const rows = useSettingStore((s) => s.rowsByKind[kind]);
    const keyword = useSettingStore((s) => s.keywordByKind[kind]);
    const setKeyword = useSettingStore((s) => s.setKeyword);
    const loadingKind = useSettingStore((s) => s.loadingKind);
    const error = useSettingStore((s) => s.error);
    const fetchRows = useSettingStore((s) => s.fetchRows);
    const createRow = useSettingStore((s) => s.createRow);
    const updateRow = useSettingStore((s) => s.updateRow);
    const removeRow = useSettingStore((s) => s.removeRow);

    const loading = loadingKind === kind;
    const list = rows || [];

    // ===== 编辑态 =====
    // editingId：null 无 / 'new' 新增 / 行 id（整数）编辑
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState({});
    const [formError, setFormError] = useState("");
    const [busy, setBusy] = useState(false);

    // 挂载 / 切码表 / 搜索词变化 → 拉取（防抖 250ms，避免逐字符打请求）
    useEffect(() => {
        const t = setTimeout(() => {
            fetchRows(kind).catch(() => {});
        }, 250);
        return () => clearTimeout(t);
    }, [kind, keyword, fetchRows]);

    // 切码表时退出编辑态（上一个表的草稿不该留在新表里）
    useEffect(() => {
        setEditingId(null);
        setDraft({});
        setFormError("");
    }, [kind]);

    const setField = (key, value, upper) =>
        setDraft((d) => ({ ...d, [key]: upper ? value.toUpperCase() : value }));

    const startAdd = () => {
        const base = {};
        columns.forEach((c) => (base[c.key] = ""));
        setDraft(base);
        setEditingId("new");
        setFormError("");
    };

    const startEdit = (row) => {
        const base = {};
        columns.forEach((c) => (base[c.key] = row[c.key] ?? ""));
        setDraft(base);
        setEditingId(row.id);
        setFormError("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraft({});
        setFormError("");
    };

    const submit = async () => {
        // 必填校验（后端也会拦，这里先给即时反馈）
        const missing = columns.filter((c) => c.required && !String(draft[c.key] ?? "").trim());
        if (missing.length) {
            setFormError(`${missing.map((c) => c.label).join("、")}不能为空`);
            return;
        }
        setBusy(true);
        setFormError("");
        try {
            if (editingId === "new") await createRow(kind, draft);
            else await updateRow(kind, editingId, draft);
            cancelEdit();
        } catch (e) {
            // 409 重复 / 400 校验失败 / 网络错误都在这里原地提示
            setFormError(e.message || "保存失败");
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (row) => {
        const name = row[columns[0].key] || row.id;
        if (!window.confirm(`确定删除「${name}」吗？此操作不可撤销。`)) return;
        try {
            await removeRow(kind, row.id);
        } catch (e) {
            window.alert(`删除失败：${e.message}`);
        }
    };

    /** 编辑态的单元格输入框 */
    const renderInput = (col, autoFocus) => (
        <input
            value={draft[col.key] ?? ""}
            onChange={(e) => setField(col.key, e.target.value, col.upper)}
            onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") cancelEdit();
            }}
            placeholder={col.placeholder || col.label}
            maxLength={col.maxLength}
            autoFocus={autoFocus}
            className="input h-7 py-0 text-xs"
        />
    );

    /** 编辑行的操作按钮 */
    const renderEditorActions = () => (
        <div className="flex items-center gap-1">
            <Button size="sm" onClick={submit} disabled={busy} title="保存（Enter）">
                {busy ? <Loader2 className="animate-spin" size={13} /> : <Check size={13} />} 保存
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEdit} disabled={busy} title="取消（Esc）">
                <Ban size={13} /> 取消
            </Button>
        </div>
    );

    return (
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <CardHeader className="shrink-0">
                <div className="flex items-center gap-3">
                    <CardTitle>
                        {title}{" "}
                        <span className="ml-1 text-xs font-normal text-slate-400">{subtitle}</span>
                    </CardTitle>
                    {!loading && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            共 {list.length} 条
                        </span>
                    )}
                    {loading && <Loader2 className="animate-spin text-slate-400" size={16} />}
                </div>

                <div className="flex items-center gap-2">
                    {/* 搜索（服务端模糊匹配中文名 / 英文名 / IATA / ICAO） */}
                    <div className="relative">
                        <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(kind, e.target.value)}
                            placeholder="搜索名称 / 代码…"
                            className="input h-8 w-56 py-0 pl-7 pr-7 text-xs"
                        />
                        {keyword && (
                            <button
                                onClick={() => setKeyword(kind, "")}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                title="清空搜索"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetchRows(kind).catch(() => {})}
                        disabled={loading}
                        title="重新加载当前码表"
                    >
                        <RefreshCw size={13} className={cn(loading && "animate-spin")} /> 刷新
                    </Button>

                    <Button size="sm" onClick={startAdd} disabled={editingId === "new"} title={addLabel}>
                        <Plus size={13} /> {addLabel}
                    </Button>
                </div>
            </CardHeader>

            {error && (
                <div className="mx-3 mt-1 rounded bg-red-50 px-3 py-1.5 text-xs text-red-600">
                    加载失败：{error}
                </div>
            )}

            <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                        <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                            <th className="w-14 whitespace-nowrap px-2 py-1.5 font-medium">序号</th>
                            {columns.map((col) => (
                                <th key={col.key} className="whitespace-nowrap px-2 py-1.5 font-medium">
                                    {col.label}
                                    {col.required && <span className="ml-0.5 text-red-500">*</span>}
                                </th>
                            ))}
                            <th className="w-32 whitespace-nowrap px-2 py-1.5 font-medium">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 新增行（常驻顶部，编辑中才出现） */}
                        {editingId === "new" && (
                            <tr className="border-b border-primary-100 bg-primary-50/50">
                                <td className="px-2 py-1.5 align-middle text-xs text-primary-600">新</td>
                                {columns.map((col, i) => (
                                    <td key={col.key} className="px-2 py-1.5 align-middle">
                                        {renderInput(col, i === 0)}
                                    </td>
                                ))}
                                <td className="px-2 py-1.5 align-middle">{renderEditorActions()}</td>
                            </tr>
                        )}

                        {list.map((row, idx) =>
                            editingId === row.id ? (
                                <tr key={row.id} className="border-b border-primary-100 bg-primary-50/50">
                                    <td className="px-2 py-1.5 align-middle text-xs text-slate-400">{row.id}</td>
                                    {columns.map((col, i) => (
                                        <td key={col.key} className="px-2 py-1.5 align-middle">
                                            {renderInput(col, i === 0)}
                                        </td>
                                    ))}
                                    <td className="px-2 py-1.5 align-middle">{renderEditorActions()}</td>
                                </tr>
                            ) : (
                                <tr
                                    key={row.id}
                                    className="border-b border-slate-100 transition-colors hover:bg-primary-50/40"
                                >
                                    <td className="px-2 py-1.5 align-middle text-xs tabular-nums text-slate-400">
                                        {idx + 1}
                                    </td>
                                    {columns.map((col) => (
                                        <td key={col.key} className="whitespace-nowrap px-2 py-1.5 align-middle">
                                            {col.key === columns[0].key ? (
                                                <span className="font-medium text-slate-800">
                                                    {row[col.key] || "—"}
                                                </span>
                                            ) : (
                                                <span
                                                    className={cn(
                                                        "tabular-nums",
                                                        row[col.key] ? "text-slate-600" : "text-slate-300"
                                                    )}
                                                >
                                                    {row[col.key] || "—"}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="whitespace-nowrap px-2 py-1.5 align-middle">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => startEdit(row)}
                                                disabled={editingId != null}
                                                title="修改这一条"
                                            >
                                                <Pencil size={13} /> 修改
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDelete(row)}
                                                disabled={editingId != null}
                                                title="删除这一条"
                                            >
                                                <Trash2 size={13} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>

                {list.length === 0 && !loading && editingId !== "new" && (
                    <div className="py-10 text-center text-sm text-slate-400">
                        {keyword ? `没有匹配「${keyword}」的记录，换个关键词试试` : emptyHint || "暂无数据"}
                    </div>
                )}
            </div>

            {/* 保存错误：就地常驻在表格底部（409 重复 / 400 校验失败） */}
            {formError && (
                <div className="shrink-0 border-t border-red-100 bg-red-50 px-3 py-1.5 text-xs text-red-600">
                    {formError}
                </div>
            )}
        </Card>
    );
}
