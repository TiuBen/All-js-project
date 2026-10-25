# 组件拆分方案

按照你的代码习惯，我把 `MainList`、`MainCheckItem`、`Auxiliary`、`AuxiliaryItem` 拆成独立文件，缓存层复用现有的 `cache.store.js`（每个节点的 uuid 就是缓存 key）。

数据形状：`{ state, text, time, images }`，`state` 五态切换（`""` / `"ok"` / `"abnormal"` / `"na"`，你写"5个状态"我把 `""` 待检查也算一态，共 4 个 + 实际落地后由时间推断的"完成"——下面按你说的 4 个下拉态实现，若要第 5 态再加）。

---

## 1. `Components/MainCheckItem.js`

```jsx
/**
 * ============================================================
 * MainCheckItem —— 主监控节点卡片（非受控 / 带本地缓存）
 * ------------------------------------------------------------
 * 展示：eventId + name + desc
 * 交互：时间填写 + 状态切换（待检查 / 正常 / 异常 / 不适用）
 * 缓存：每个 main.uuid 一条记录，走 cache.store 的 MutilTypeInput 同款逻辑，
 *       下次挂载自动恢复；标题栏的「清空」按钮 = 状态循环切换
 *
 * props:
 *   node      必填，主监控节点对象（含 uuid / eventId / name / desc）
 *   index     序号（展示用）
 *   selected  是否选中（高亮）
 *   onSelect  点击卡片回调，参数为 node
 * ============================================================
 */
import { useMemo } from "react";
import { CalendarClock } from "lucide-react";

import useMutilTypeInputStore from "../../../cache/cache.store";
import { STATUS_ICONS, STATUS_LABELS, STATUS_COLORS, nextStatus } from "../statusBadge";

function MainCheckItem({ node, index, selected = false, onSelect }) {
    const uuid = node?.uuid;

    // 只订阅自己这条，互不牵连重渲染
    const item = useMutilTypeInputStore((s) => s.items[uuid]);
    const initItem = useMutilTypeInputStore((s) => s.initItem);
    const setNote = useMutilTypeInputStore((s) => s.setNote);
    const flushItem = useMutilTypeInputStore((s) => s.flushItem);

    // 复用 note 字段存 JSON（state + time），避免动 cache.store 结构
    const value = useMemo(() => {
        try {
            return item?.note ? JSON.parse(item.note) : { state: "", time: "" };
        } catch {
            return { state: "", time: "" };
        }
    }, [item?.note]);

    // 首次挂载 / 切换 node 时恢复缓存
    useMemo(() => {
        if (uuid) initItem(uuid);
    }, [uuid, initItem]);

    const state = value.state ?? "";
    const time = value.time ?? "";

    const update = (patch) => {
        if (!uuid) return;
        setNote(uuid, JSON.stringify({ ...value, ...patch }));
        flushItem(uuid);
    };

    const handleCycle = (e) => {
        e.stopPropagation();
        update({ state: nextStatus(state) });
    };

    if (!node) return null;

    return (
        <div
            onClick={() => onSelect?.(node)}
            className={`cursor-pointer rounded-md border bg-white px-3 py-2 transition-colors ${
                selected
                    ? "border-primary-400 ring-1 ring-primary-200"
                    : "border-slate-200 hover:border-slate-300"
            }`}
        >
            {/* 标题行：eventId + name + 状态切换按钮 */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                        {node.eventId}
                    </span>
                    <span className="truncate text-[13px] font-medium text-slate-700">
                        {node.name}
                    </span>
                </div>

                {/* 「清空」位替换为状态循环切换 */}
                <button
                    type="button"
                    onClick={handleCycle}
                    title={`当前：${STATUS_LABELS[state]}（点击切换）`}
                    className={`shrink-0 ${STATUS_COLORS[state]}`}
                >
                    {STATUS_ICONS[state]}
                </button>
            </div>

            {node.desc && (
                <div className="mt-0.5 truncate text-[11px] text-slate-400">{node.desc}</div>
            )}

            {/* 时间填写 */}
            <div className="mt-1.5 flex items-center gap-1.5">
                <CalendarClock size={12} className="text-slate-400" />
                <input
                    type="time"
                    value={time}
                    onChange={(e) => update({ time: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-600 outline-none focus:border-primary-300"
                />
                <span
                    className={`ml-auto text-[10px] ${STATUS_COLORS[state]}`}
                >
                    {STATUS_LABELS[state]}
                </span>
            </div>
        </div>
    );
}

export default MainCheckItem;
```

---

## 2. `Components/MainList.js`

```jsx
/**
 * ============================================================
 * MainList —— 主监控节点列表
 * ------------------------------------------------------------
 * 只做遍历 + 选中态透传，具体卡片行为在 MainCheckItem 里。
 * ============================================================
 */
import MainCheckItem from "./MainCheckItem";

function MainList({ mains = [], selectedMainUuid, onSelect }) {
    return (
        <div className="flex min-h-0 flex-col gap-2">
            {mains.map((item, index) => (
                <MainCheckItem
                    key={item.uuid}
                    node={item}
                    index={index}
                    selected={item.uuid === selectedMainUuid}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}

export default MainList;
```

---

## 3. `Components/AuxiliaryItem.js`

```jsx
/**
 * ============================================================
 * AuxiliaryItem —— 辅助监控项卡片（非受控 / 带本地缓存）
 * ------------------------------------------------------------
 * 数据形状：{ state, text, time, images }
 *   - state  待检查 / 正常 / 异常 / 不适用（标题栏图标循环切换）
 *   - text   文字备注
 *   - time   时间
 *   - images 图片（复用 MutilTypeInput 的 addImage/removeImage）
 *
 * 缓存：每个 aux.uuid 一条，与 MainCheckItem 共用 cache.store，
 *       note 里存 JSON（state + text + time），图片单独走 images 库。
 *
 * props:
 *   node  必填，辅助项对象（含 uuid / eventId / name / desc）
 * ============================================================
 */
import { useMemo } from "react";
import { ImagePlus, X } from "lucide-react";

import useMutilTypeInputStore from "../../../cache/cache.store";
import { STATUS_ICONS, STATUS_LABELS, STATUS_COLORS, nextStatus } from "../statusBadge";
import MutilTypeInput from "../../../components/MutilTypeInput"; // 按你实际路径改

function AuxiliaryItem({ node }) {
    const uuid = node?.uuid;

    const item = useMutilTypeInputStore((s) => s.items[uuid]);
    const initItem = useMutilTypeInputStore((s) => s.initItem);
    const setNote = useMutilTypeInputStore((s) => s.setNote);
    const flushItem = useMutilTypeInputStore((s) => s.flushItem);

    useMemo(() => {
        if (uuid) initItem(uuid);
    }, [uuid, initItem]);

    const value = useMemo(() => {
        try {
            return item?.note ? JSON.parse(item.note) : { state: "", text: "", time: "" };
        } catch {
            return { state: "", text: "", time: "" };
        }
    }, [item?.note]);

    const state = value.state ?? "";
    const text = value.text ?? "";
    const time = value.time ?? "";

    const update = (patch) => {
        if (!uuid) return;
        setNote(uuid, JSON.stringify({ ...value, ...patch }));
        flushItem(uuid);
    };

    if (!node) return null;

    return (
        <div className="rounded border border-slate-200 bg-white p-2">
            {/* 标题行：eventId + name + 状态切换 */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                    <span className="shrink-0 text-[10px] text-slate-400">{node.eventId}</span>
                    <span className="truncate text-[12px] text-slate-600">{node.name}</span>
                </div>
                <button
                    type="button"
                    onClick={() => update({ state: nextStatus(state) })}
                    title={`当前：${STATUS_LABELS[state]}（点击切换）`}
                    className={`shrink-0 ${STATUS_COLORS[state]}`}
                >
                    {STATUS_ICONS[state]}
                </button>
            </div>

            {node.desc && (
                <div className="mt-0.5 truncate text-[10px] text-slate-400">{node.desc}</div>
            )}

            {/* 时间 */}
            <input
                type="time"
                value={time}
                onChange={(e) => update({ time: e.target.value })}
                className="mt-1.5 rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-600 outline-none focus:border-primary-300"
            />

            {/* 文字备注 */}
            <textarea
                value={text}
                onChange={(e) => update({ text: e.target.value })}
                onBlur={() => flushItem(uuid)}
                rows={2}
                placeholder="备注…"
                className="mt-1.5 block w-full resize-y rounded border border-slate-200 px-1.5 py-1 text-[11px] text-slate-600 outline-none focus:border-primary-300"
            />

            {/* 图片：直接复用 MutilTypeInput（内部已处理 blob / 预览 / 缓存） */}
            <MutilTypeInput
                uuid={`${uuid}__aux`}
                label=""
                rows={1}
                placeholder="图片备注…"
            />
        </div>
    );
}

export default AuxiliaryItem;
```

> 说明：`AuxiliaryItem` 里图片我建议**直接复用 `MutilTypeInput`**（它已经把 blob / objectURL / 缓存都做好了），只要用一个派生 uuid（`${uuid}__aux`）就不会和主项冲突。如果你希望 `images` 严格放进同一个 JSON 结构里，告诉我，我再写一版手动的图片区（含 addImage/removeImage/预览/放大）。

---

## 4. `Components/Auxiliary.js`

```jsx
/**
 * ============================================================
 * Auxiliary —— 辅助监控项列表
 * ------------------------------------------------------------
 * 根据选中的 main 渲染其 auxiliaries；未选中时提示先选主项。
 * ============================================================
 */
import AuxiliaryItem from "./AuxiliaryItem";

function Auxiliary({ main }) {
    if (!main) {
        return <div className="p-3 text-[12px] text-slate-400">请先选择一个主项</div>;
    }

    return (
        <div className="rounded border border-slate-200 bg-slate-50 p-2">
            <div className="mb-2 text-[12px] font-semibold text-slate-600">
                {main.eventId} - {main.name} 的辅助项
            </div>

            {main.auxiliaries?.length ? (
                <div className="flex flex-col gap-2">
                    {main.auxiliaries.map((aux) => (
                        <AuxiliaryItem key={aux.uuid} node={aux} />
                    ))}
                </div>
            ) : (
                <div className="text-[11px] text-slate-400">暂无辅助项</div>
            )}
        </div>
    );
}

export default Auxiliary;
```

---

## 5. 改一版 `Editor.js`（接入新组件）

```jsx
import { useState } from "react";
import ChecklistToolbar from "./Components/ToolBar/Toolbar";
import ContentLayout from "../../../Layout/ContentLayout";
import { useChecklistStore } from "../../../store/checklistEditorPage.store";
import {
    CARGO_VIDEO_FOCUS,
    SHUNHANG_VIDEO_FOCUS,
    PASSENGER_VIDEO_FOCUS,
    cargoBypassFlight,
} from "../Const/index";
import VideoPanel from "./Components/VideoPanel";
import MainList from "./Components/MainList";
import Auxiliary from "./Components/Auxiliary";

function Editor({ main = cargoBypassFlight }) {
    const [selectedMainUuid, setSelectedMainUuid] = useState(null);

    // ★ 用 uuid 找选中项，之前写死 main[0] 会一直显示第一项
    const selectedMain = main.schema.find((m) => m.uuid === selectedMainUuid) ?? null;

    const mainColVisible = useChecklistStore((s) => s.mainColVisible);
    const auxColVisible = useChecklistStore((s) => s.auxColVisible);
    const videoColVisible = useChecklistStore((s) => s.videoColVisible);
    const templateType = useChecklistStore((s) => s.templateType);

    const selectedVideo = templateType.includes("货运")
        ? CARGO_VIDEO_FOCUS
        : templateType.includes("顺航")
        ? SHUNHANG_VIDEO_FOCUS
        : PASSENGER_VIDEO_FOCUS;

    return (
        <ContentLayout>
            <ChecklistToolbar />
            <div className="flex min-h-0 flex-row gap-2 flex-1">
                <div className={`${!mainColVisible ? "hidden" : ""} flex-1 overflow-y-auto`}>
                    <MainList
                        mains={main.schema}
                        selectedMainUuid={selectedMainUuid}
                        onSelect={(node) => setSelectedMainUuid(node.uuid)}
                    />
                </div>
                <div className={`${!auxColVisible ? "hidden" : ""} flex-1 overflow-y-auto`}>
                    <Auxiliary main={selectedMain} />
                </div>
                <div className={`${!videoColVisible ? "hidden" : ""} flex-1 overflow-y-auto`}>
                    <VideoPanel groups={selectedVideo.groups} />
                </div>
            </div>
        </ContentLayout>
    );
}

export default Editor;
```

---

## 需要你确认的两点

1. **状态数量**：你说"5 个状态"，但 `statusBadge.js` 里只有 4 个（待检查 / 正常 / 异常 / 不适用）。如果要第 5 个（比如"完成"），在 `STATUS_CYCLE` / `STATUS_ICONS` / `STATUS_LABELS` / `STATUS_COLORS` 各加一项即可，组件不用改。

2. **AuxiliaryItem 的图片**：我复用了 `MutilTypeInput`（派生 uuid），这样 blob/预览/缓存全部白嫖。若你要求 `images` 必须落在 `AuxiliaryItem` 自己的 JSON 里、且用你 `cache.store` 的 `addImage/removeImage` 手写图片区，说一声我再给那版（大概多 60 行，含缩略图、删除、放大预览）。

需要的话，我也可以再补一个 `collect` 的兄弟方法 `collectChecklist()`，把主项 + 辅助项 + 图片一次性整理成可提交结构。