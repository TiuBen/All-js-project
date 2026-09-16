# 项目长期记忆 — All-js-project

## 结构
- `packages/frontend/flight-dispatch-system`：前端 React + Vite + Zustand + Tailwind，dev 5173
- `packages/backend/full-web-backend/V5-dispatch`：后端纯 Express + PostgreSQL，端口 5183
- 数据库结构权威来源 `V5-dispatch/data/schema.sql`；`src/db/schema.js` 严格对齐、不含兼容演进代码

## 检查单（Checklist）业务约定
- 模板 category = 模板文件名 = dropdown label = `checklist_records.checklist_category` 落库值，四处必须一致
- 一航班一检查单：`checklist_records.flight_id` UNIQUE + upsert；已提交且超 24h 禁止修改（基准 `COALESCE(updated_at, created_at)`，前端 409 拦截）
- 日期口径统一东八区：`(ts AT TIME ZONE 'UTC' + interval '8 hours')::date`（不可直接用 `ts + interval '8 hours'`，会话时区会二次偏移）
- 检查单类别五色（hex 主色统一维护在 `ChecklistPage/checklistTypeConfig.js` 的 `TYPE_BUTTONS[].color`）：
  顺航 `#059669` / 货运始发 `#0891B2` / 货运过站 `#7C3AED` / 客运始发 `#D946EF` / 客运过站 `#6B2608`
- 下拉项用 `Check`(✔) 表示选中，文字直接取类别色；触发按钮/标题同色，浅底浅边框用 `withAlpha(color, α)` 派生
- **禁止 Tailwind 动态拼接类名**（如 `text-[${color}]`），JIT 扫描不到会静默失效 —— 一律 inline style

## ChecklistPage 目录约定（页面目录 + 页面内 Components/ + 两个共享目录）
```
ChecklistPage/
├── index.jsx                    路由入口（Editor / Viewer 二选一）
├── checklistTypeConfig.js
├── ChecklistEditor/             index.jsx · useTimeFormulas.js · Components/(6)
├── ChecklistViewer/             index.jsx · Components/(4)
├── ToolBar/                     index.jsx（工具栏本体）· Components/(1) DraftDropdown
├── CommonComponents/(5)         ResizableColumns(分栏) · PanelSwitcher · DraggableThumb · statusBadge · FlightInfoCard
└── videoFocus/                  视频监管静态数据
```
- `ChecklistEditor/Components/`（8）：Main / Auxiliary / Video 的 **Panel 与 Item**（6）+ `TimeFormulaEngine`（公式自动计算，渲染 null）+ `FlowStatusView`（导出 `MainFlowView` / `FlowThumbView`，给流程图与小地图提供 statusMap）
- `ChecklistViewer/Components/`（4）：`ChecklistTreeView` / `AuxiliaryList` / `VideoList` / `statusView`
- 约定：**每个功能目录自己的入口一律叫 `index.jsx`**（ChecklistEditor / ChecklistViewer / ToolBar 都是），子组件统一放该目录下的 `Components/`
- ⚠️ **深度规则（最易错）**：到 src 的层级 = 文件所在目录相对 `ChecklistPage` 的层数 + 2
  | 位置 | 到 src | 示例 |
  |---|---|---|
  | `ChecklistPage/*.jsx`、`ChecklistEditor/index.jsx`、`ToolBar/index.jsx`、`CommonComponents/*.jsx` | `../../../` | `../../../lib/utils` |
  | `XX/Components/*.jsx`（深一层） | `../../../../` | `../../../../store/checklistStore` |
  - 即：**`index.jsx` 在功能目录根下 → 仍是 3 级**；只有进了 `Components/` 才是 4 级
  - 跨目录回引：`Components/` 内 → `../../CommonComponents/statusBadge`；功能目录根下 → `../CommonComponents/X`
- 引用约定：页面 index 引组件 `./Components/X`；工具栏 `../ToolBar`（目录默认解析 index.jsx）；Components/ 内部互引 `./X`
- ⚠️ 已废弃的中间形态：`ChecklistPage/components/`、同级并列的 `EditorComponents/` + `ViewerComponents/`、`ToolBarComponents/`
  - 三个**检查项组件**（填写态条目，编辑器三面板共用）：
    | 组件 | 用途 | 数据来源 |
    |---|---|---|
    | `MainCheckItem` | 主监控节点卡片 | props（纯展示，memo） |
    | `AuxiliaryCheckItem` | 辅助监控单项行 | props（纯展示，memo） |
    | `VideoCheckItem` | 视频监管单项 | **自行订阅 store**（useVideoCheckItem） |
  - 面板（MainMonitoringPanel / AuxiliaryPanel / VideoPanel）只负责标题栏 / 滚动 / 锚点 / 空态，条目渲染一律下沉到上述组件
  - memo 生效的三个前提（改这块务必遵守，另见「重渲染约定」一节）：
    1. `item` 传**原始引用**，勿写 `items[key] || {}`（新对象会让 memo 永久失效），空值由组件内 `item || {}` 兜底
    2. `formulaCtx` 引用稳定（不随 items 重建），只在 `node.formula`/`aux.formula` 存在时才传
    3. 回调必须稳定：`getNodeId`（useTimeFormulas 内 useCallback）、`focusNode`（editor 内 useCallback）
- 搬动组件务必同步改浅层 import；跨层级移动（进/出 `Components/`）才会动到 `../../../` ↔ `../../../../`
- `ResizableColumns` 用 flex 比例（flexGrow + flexBasis:0）铺满，不用固定 px；`columns` 需 `filter(Boolean)`
- `videoFocus/` 视频监管重点静态数据：数据源仍是后端 `data/checklists/` 下三份 JSON，但**前端内联**不再请求后端（后端接口已不返回 videoFocus）
  - 改内容流程：改后端 JSON → 重新生成前端 `passengerVideoFocus.js` / `cargoVideoFocus.js` / `shunhangVideoFocus.js`（结构勿手改）
  - 映射（`resolveVideoFocus`，**顺航分支必须排在"货运"之前**）：含"顺航"→顺航版；含"客运"→客运版；含"货运"→货运版
  - item id 全局唯一区间（新增清单务必续编，勿复用）：
    | 清单 | id 区间 | 条目 | 后端文件 |
    |---|---|---|---|
    | 客运 | vCheckId1~38 | 38 | 客运航班视频监管重点.json |
    | 货运 | vCheckId39~82 | 44 | 货运航班视频监管重点.json |
    | 顺航 | vCheckId83~124 | 42 | 顺航检查单.json |
  - 顺航为**独立一份**：不含 `applicable=客运` 的廊桥/桥载条目，另含 2 条机坪秩序项；顶层/组/条目 uuid 均与货运解耦
  - `videoItems` 的 key 就是 vCheckId；store 为每个 vCheckId 生成独立 setter `set_vCheckIdN`；组件用 `useVideoCheckItem(id)` 按 id 订阅，改一项只重渲染那一行
  - ⚠️ 长列表组件不要订阅整个 `videoItems`（会让面板整体重渲染）；需要读全量时用 `useChecklistStore.getState()`
  - ⚠️ `顺航检查单.json` 目前装的是**视频监管数据（groups）**，而它是被 `getTemplateById` 当**检查单模板（需 schema）**加载的 → 顺航类型显示空检查单；若需真正的顺航检查单节点要另建模板

## 重渲染约定（ChecklistPage 的核心性能约束，改这块务必遵守）
- **编辑器与页面入口都不得订阅 `items` / `header` / `videoItems`**，一律用细粒度 selector。一旦整份 `useChecklistStore()` 订阅，"编辑某一项"就会让整页（工具栏 + 三列 + 流程图）重渲染，memo 卡片全部白做（`ChecklistPage/index.jsx` 是编辑器的父级，同样要拆 selector）
- 订阅下沉到真正需要它的组件：
  | 谁需要 | 谁订阅 |
  |---|---|
  | 主 / 辅助面板列表 | `MainMonitoringPanel` / `AuxiliaryPanel` 内部 `useChecklistStore(s => s.items)` |
  | 视频监管单项 | `VideoCheckItem` → `useVideoCheckItem(vCheckId)`（逐 id） |
  | 流程图 / 小地图的状态映射 | `Components/FlowStatusView`（仅在挂载时才订阅） |
  | 公式自动计算 | `Components/TimeFormulaEngine`（渲染 null，只订阅 items + header） |
  | 草稿落盘 | store 内部（组件完全不需要订阅） |
  | 工具栏草稿状态 | `ToolBar` 自己订阅 `draftPending` / `draftSavedAt` |
- `formulaCtx` 必须**引用稳定**（`useTimeFormulas` 的 useMemo 依赖只有 `template/nodes/flight/getNodeId`，**不含 items/header**）：
  `vars` 与 `getEventTime` 用 getter / 函数在**求值那一刻** `useChecklistStore.getState()` 现读。
  以前把 items 放进依赖 → 填任何一项都重建 ctx → 所有带 formula 的卡片 props 变化 → memo 集体失效，这正是"改一项、全列重渲染"的根因
- store 逐项 setter 只替换目标 key（`{...s.items, [key]: {...}}`），未改动项的**对象引用保持不变** —— memo 命中的前提，单测里有断言守着

## 草稿（Draft）机制 —— store 内无感落盘（**无跨标签页同步**）
- **页面上没有"保存草稿"按钮**：草稿在 **store 内部**落盘，不放在页面组件里
  - 每个"会改动检查单内容"的 action（`setItemValue` / `setItems` / `set_vCheckIdN` / `setVideoValue` / `setHeaderField` / `setInspector`）末尾调用 `scheduleDraftPersist()`
  - 800ms 防抖后 `persistDraftNow()` 组装快照 → `useDraftStore.upsertDraft()` 写 localStorage
  - 好处：编辑器**完全不必为了草稿订阅 items/header/videoItems**，从根上避免重渲染
- 数据只在 localStorage，key = `flight_dispatch_drafts`，最多 5 条；**不写服务端 draft** —— 编辑器唯一显式动作是 `handleSubmit()`（只提交 `submitted`）
- 落盘时机：改动防抖 800ms ｜ 编辑器 unmount / `pagehide` / `visibilitychange → hidden` 时 `flushDraft()` 兜底
- 写入前四道闸（任一命中就跳过，且都会把 `draftPending` 复位）：无 flight ｜ `draftPersistEnabled === false`（已提交，由编辑器的 effect 随 `recordStatus` 同步）｜ `items` 无 content（status/time/note）｜ 草稿箱已满 5 且本航班不在箱内
- 内容签名：`JSON.stringify([header, items, videoSupervision, inspector])`（不含 updatedAt），与上次相同就不重复写，避免无谓的 drafts 列表刷新；`resetDraftTracking()` 用于提交后重新编辑时清签名
- `reset()` 会清掉防抖定时器、签名与三个草稿状态字段
- **跨标签页同步已按用户要求全部移除**（别再往回加）：`draftStore` 里没有 `storage` 监听 / `syncFromStorage` / `lastRemoteSyncAt` / `draftSignature` / `stableStringify`；编辑器里没有 `remoteDraft` 与那套三分支逻辑
- `ahooks`（^3.10.0）只用于**布局偏好持久化**：`useLocalStorageState('checklist_ui_prefs', { defaultValue })` 存 `{viewMode, thumbVisible, panels}`，**不传 `listenStorageChange`**（=不做跨标签页同步）
  - 逐字段 setter 必须"值未变时返回**原对象**"，否则 ahooks 的 `Object.is` 判定不等 → 白白 setState + 落盘
- `checklistStore.hydrateFromDraft(draft)`：注意 `draft.videoSupervision` → `store.videoItems`（字段名不同）
- 订阅面大的列表组件（`DraftDropdown` / `PageLayout`）只订阅 `s.drafts.length`，完整列表在展开时用 `getState()` 现取

## 部署
- 线上 `dd.atc1215.cn`：nginx 同源反代 `/api` → `127.0.0.1:5183`，浏览器同源 → CORS 不参与（`CORS_ORIGIN` 仅服务本地开发 5173→5183 跨端口）
- nginx 配置副本：`packages/backend/nginx/nginx.conf`
- `.env` 需随项目上传服务器，改 `PG_PASSWORD`（当前仓库内为明文默认值，无 .gitignore 保护）

## 校验方式（前端）
- 首选 `npx --yes esbuild@0.21.5 src/pages/ChecklistPage/index.jsx --bundle --jsx=automatic --format=esm`（能一次性验 import 路径 + 语法）
- 全量校验（含未被任何页面引用的孤立组件）：把 `find src/pages/ChecklistPage -name "*.jsx" -o -name "*.js"` 的路径列表整体作为 entry 传给 esbuild
- ⚠️ **不要用 `--outfile=/dev/null`**：Windows 下会真的建出 `dev/null` 文件（442KB，且被 git 跟踪），每次都要 `rm -rf packages/frontend/flight-dispatch-system/dev`
- ⚠️ **也不要用 `--outdir`**：产出的临时目录在 Windows 上删不掉 —— rm / Remove-Item / fs.rmSync 都被 safe-delete shim 拦成「trash 失败」，`[System.IO.Directory]::Delete($p,$true)` 才能删干净。直接 `> /dev/null` 走 stdout 最省事
- 备选（等价浏览器实际加载）：`curl "http://localhost:5173/src/<相对路径>"` 看是否 200 且无 `Transform failed`
- 前端项目本地**没装 esbuild**（`node_modules/esbuild` 不存在），`npx` 要联网装；Vite dev server 若在跑，直接用 5173 校验更快
- ⚠️ 本机 bash 偶发挂掉（shim 报 `dirname: command not found` + 误触发 wsl 黑名单），此时改用 PowerShell `Invoke-WebRequest` 打 5173；**注意 PowerShell 工具的 stdout 会被吞**，结果要 `Set-Content` 写到 `$env:TEMP\xxx.txt` 再用 Read 读回
- ⚠️ **Vite 500 的报错正文抓不到**：`Invoke-WebRequest` catch 出来后 body 是空的（流被吞）。改用托管 node 抓：
  `& "C:\Users\jserver\.workbuddy\binaries\node\versions\22.22.2-3\node.exe" -e "const http=require('http'),fs=require('fs');http.get('<url>',r=>{let d='';r.setEncoding('utf8');r.on('data',c=>d+=c);r.on('end',()=>fs.writeFileSync(process.env.TEMP+'\\x.txt',r.statusCode+'\n'+d.slice(0,4000)))})"`
  正文里的 `Failed to resolve import "<路径>" from "<文件>"` 就是真正的错误（本次靠它抓到 ToolBar/index.jsx 多写了一层 `../`）
- 判定「解析失败」要比对响应体里的 `Failed to resolve import` / `Transform failed`，不能只看状态码（200 也可能是 SPA fallback 的 index.html）
- 批量校验别用 `node -e "..."`（PowerShell 里嵌套引号极易写坏，且 stdout 被吞）。**写成临时 `.cjs` 脚本**放 `$env:TEMP`，结果 `fs.writeFileSync($env:TEMP/xxx.txt)` 再 Read：
  遍历路径 → `http.get('http://localhost:5173/'+p)` → 判 200 + 响应体无 `Failed to resolve|Transform failed` + 不是 `index.html` 内容
- 裸模块解析是否成功，看 Vite 转换后的 import 行：`import { useLocalStorageState } from "/node_modules/.vite/deps/ahooks.js?v=..."` 说明已预打包可用；若还留着裸 `"ahooks"` 就说明没解析成功
- 纯逻辑（store / 工具函数）可以脱离浏览器单测：写个 `setup.mjs` 把源文件读进来、只把相对导入改写成 `.mjs`/stub，落盘到 `packages/frontend/flight-dispatch-system/.tmp-verify/`（**放项目内是为了让 `import 'zustand'` 能沿目录向上解析到 node_modules**，裸模块名不用改）；`test.mjs` 里先伪造 `globalThis.window`（localStorage mock + 收集 addEventListener）再 `await import()`，用 `node:assert` 断言并等 `setTimeout` 跨过防抖。`type: module` 的包里 `.mjs` 一律按 ESM 跑。用完删目录（要用 `[System.IO.Directory]::Delete`）
