# 项目长期记忆 — All-js-project

## 结构
- `packages/frontend/flight-dispatch-system`：React + Vite + Zustand + Tailwind + ahooks，dev 5173
- `packages/backend/full-web-backend/V5-dispatch`：纯 Express + PostgreSQL，端口 5183
- 数据库结构权威来源 `V5-dispatch/data/schema.sql`；`src/db/schema.js` 严格对齐、不含兼容演进代码
- 线上 `dd.atc1215.cn`：nginx 同源反代 `/api` → 127.0.0.1:5183；配置副本 `packages/backend/nginx/nginx.conf`

## ChecklistPage 目录约定（2026-09-17 重构后）
```
ChecklistPage/
├── index.jsx                路由入口（Editor / Viewer 二选一）；负责 ?tpl= / ?recordId= 与模板加载
├── checklistTypeConfig.js   TYPE_BUTTONS / TYPE_BY_LABEL / resolveDefaultType / resolveTemplateIdByRecord
├── ChecklistEditor/
│   ├── index.jsx            只做编排：工具栏 + 视图分流（form|flow）+ 小地图
│   ├── useTimeFormulas.js   formulaCtx（引用稳定）
│   ├── useUiPrefs.js        布局偏好持久化（viewMode / thumbVisible）
│   ├── useDraftFlush.js     pagehide / visibilitychange / unmount 兜底落盘
│   ├── useSubmitChecklist.js 提交 + saveError
│   ├── Components/(9)       Main/Auxiliary/Video 的 Panel+Item(6) · TimeFormulaEngine · FlowStatusView · SaveErrorToast
│   └── Template/(5+barrel)  穷举法面板组 + index.js（resolvePanelGroup）
├── ChecklistViewer/         index.jsx · Components/(4)
├── ToolBar/                 index.jsx（本体）· Components/DraftDropdown
├── CommonComponents/(5)     ResizableColumns · PanelSwitcher · DraggableThumb · statusBadge · FlightInfoCard(未用)
└── utils/                   ★静态数据（原 videoFocus/ 已更名，勿再建）
```
- ⚠️ **深度规则（最易错）**：到 src 的层级 = 相对 `ChecklistPage` 的层数 + 2
  | 位置 | 到 src |
  |---|---|
  | `ChecklistPage/*`、`ChecklistEditor/index.jsx`、`ChecklistEditor/*.js`、`ToolBar/index.jsx`、`CommonComponents/*` | `../../../` |
  | `XX/Components/*`、`XX/Template/*`（深一层） | `../../../../` |
  - 跨目录回引：`Components/` 内 → `../../CommonComponents/X`；功能目录根下 → `../CommonComponents/X`
- 已废弃形态（别再造）：`ChecklistPage/components/`、`EditorComponents/`+`ViewerComponents/`、`ToolBarComponents/`、`videoFocus/`

## 穷举法：5 个面板组（一类型一组件）
`Template/` 下每个组件**静态 import** 自己的模板 + 视频监管数据（编译期确定、零网络）：
| 组件 | category | 模板 import | 视频监管 |
|---|---|---|---|
| `CargoBypassFlight` | 货运过站航班 | `cargoBypassFlight` | `CARGO_VIDEO_FOCUS` |
| `CargoInitFlight` | 货运始发航班 | `cargoInitFlight` | `CARGO_VIDEO_FOCUS` |
| `PassengerInitFlight` | 客运始发航班 | `passengerInitFlight` | `PASSENGER_VIDEO_FOCUS` |
| `PassengerBypassFlight` | 客运过站航班 | `passengerBypassFlight` | `PASSENGER_VIDEO_FOCUS` |
| `ShunhangFlight` | 顺航检查单 | `shunhangFlight`（手工占位） | `SHUNHANG_VIDEO_FOCUS` |

- `Template/index.js` barrel 导出 `PANEL_BY_CATEGORY` / `FALLBACK_CATEGORY` / `resolvePanelGroup(category)`（默认导出即后者）
  → `index.jsx` 只写 `const PanelGroup = resolvePanelGroup(template?.category)`；新增类型：建 utils 模板 + 建组件 + barrel 补一行
- 组件内：`nodes = <静态模板>?.schema` → `videoTotal`（货运版过滤 `applicable !== "客运"`，客运版全量）→ `focusNode`（setCurrentStep + `onFocusNode(n,{auxCount,videoCount})` + 锚点滚动）→ `activeNode`
- props（全部由 index.jsx 传入）：`flight · template · currentStep · formulaCtx · getNodeId · onFocusNode · auxPanelRef · videoPanelRef`
- 每个组件只返回 `<ResizableColumns>` 三列；工具栏 / 流程图 / 小地图留在 `index.jsx`
- ⚠️ **TDZ 坑**：`videoTotal` 必须定义在 `focusNode` 的 `useCallback` **之前**（`const` 不提升）

## 命名约定（**易错**）
- 模板导出标识符 = **文件名（camelCase）**；视频监管 = **大写下划线常量**
- 模板对象体内的 `category` 仍是**中文**（= 模板 id = 落库 `checklist_category`），**绝不改**
- 拼写已校正：`Filght`→`Flight`、`passanger`→`passenger`（含文件名）。**遇到拼写错误默认就改，别判定"故意保留"**
- 改命名同步 4 处：① `scripts/gen-checklist-static.cjs` 的 `MAP`（`outName`/`varName`）② 重跑脚本 ③ `utils/index.js` 的 import/export/`TEMPLATE_SOURCES` ④ 面板组 `.jsx` 的 import

## 静态化模板（编译期，不再请求后端）
- `utils/index.js`：`TEMPLATES`（中文 id → 模板，对象而非数组）/ `getTemplateById` / `resolveVideoFocus`（**顺航分支必须排在"货运"前**）/ `ALL_VIDEO_CHECK_IDS`
- `loadTemplate(id)` = `getTemplateById(id)` 查表（async 签名保留），**零网络**；后端模板接口已非前端依赖
- 生成脚本 `scripts/gen-checklist-static.cjs`（后端 JSON 改了就重跑；脚本在 `scripts/` → 后端目录上溯 4 级）
  - ⚠️ 只覆盖有后端 JSON 的 7 份（4 模板 + 3 视频监管）；`shunhangFlight.js` 手工占位，**不在 MAP**
- 内容基线：客运始发 13 节点 / 客运过站 17 / 货运始发 9（+22 辅助）/ 货运过站 14（+24 辅助）

## 顺航检查单（占位模板，schema 为空）
- 后端只有 `视频监管/顺航检查单.json`（4 组 42 条 `groups`），**无节点保障模板** → 空 schema 占位，不编造数据
- 表现：主/辅助列空态（「该航班类型的检查单暂未配置」），视频列 42 条顺航专属条目
- **待办**：拿到真实节点清单后只改 `utils/shunhangFlight.js` 的 `schema`
- ⚠️ 别把视频监管 JSON 当模板用（装的是 `groups` 不是 `schema`）

## 检查单业务约定
- category = 模板文件名 = dropdown label = 落库 `checklist_category`，四处一致
- 一航班一检查单：`flight_id` UNIQUE + upsert；已提交且超 24h 锁定（基准 `COALESCE(updated_at, created_at)`）
- 日期口径东八区：`(ts AT TIME ZONE 'UTC' + interval '8 hours')::date`（不可直接 `ts + interval '8 hours'`，会话时区会二次偏移）
- 五色（维护在 `checklistTypeConfig.js` 的 `TYPE_BUTTONS[].color`）：顺航 `#059669` / 货运始发 `#0891B2` / 货运过站 `#7C3AED` / 客运始发 `#D946EF` / 客运过站 `#6B2608`
- 下拉选中用 `Check`(✔)，文字取类别色；浅底浅边框用 `withAlpha(color, α)`
- **禁止 Tailwind 动态拼接类名**（`text-[${color}]` JIT 扫不到会静默失效）→ 一律 inline style

## 重渲染约定（核心性能约束）
- **编辑器 / 页面入口 / 5 个面板组都不得订阅 `items` / `header` / `videoItems`**；只用细粒度 selector
- 订阅下沉（**面板不订阅，单项自订阅**）：
  | 谁需要 | 谁订阅 |
  |---|---|
  | 主/辅助/视频单项 | `MainCheckItem`→`useMainItem`、`AuxiliaryCheckItem`→`useAuxItem`、`VideoCheckItem`→`useVideoCheckItem` |
  | 流程图 / 小地图 | `FlowStatusView`（挂载时才订阅） |
  | 公式自动计算 | `TimeFormulaEngine`（渲染 null） |
  | 工具栏草稿状态 | `ToolBar` 订阅 `draftPending`/`draftSavedAt` |
  | 草稿落盘 | store 内部（组件完全不订阅） |
- ⚠️ 血泪教训：`MainMonitoringPanel`/`AuxiliaryPanel` 曾整体订阅 `items` → 填一项就整列卡片重建（全闪）。改面板不订阅、卡片自订阅后根治
- `formulaCtx` 必须引用稳定（依赖只有 `template/nodes/flight/getNodeId`）；`vars`/`getEventTime` 用 getter 在求值那一刻 `getState()` 现读
- store 逐项 setter 只替换目标 key，未改动项引用不变 —— memo 命中的前提
- 回调稳定：`getNodeId`、`focusNode`、`switchType` 都用 `useCallback`

## 草稿（Draft）—— store 内无感落盘（**无跨标签页同步**）
- **没有"保存草稿"按钮**：改动类 action 末尾 `scheduleDraftPersist()` → 800ms 防抖 → `useDraftStore.upsertDraft()` 写 localStorage（key `flight_dispatch_drafts`，最多 5 条）
- 兜底：unmount / `pagehide` / `visibilitychange→hidden` 时 `flushDraft()`（现已抽成 `useDraftFlush`）
- 四道闸（命中即跳过）：无 flight ｜ `draftPersistEnabled===false` ｜ items 无 content ｜ 箱满 5 且本航班不在内
- 签名 `JSON.stringify([header, items, videoSupervision, inspector])` 相同不重写；`resetDraftTracking()` 供提交后重新编辑
- `ahooks` 只用于 `useLocalStorageState('checklist_ui_prefs')`，**不传 `listenStorageChange`**；逐字段 setter 值未变必须返回**原对象**
- `hydrateFromDraft`：`draft.videoSupervision` → `store.videoItems`（字段名不同）
- 订阅面大的组件只订阅 `s.drafts.length`，展开时 `getState()` 现取

## 视频监管数据约定
- item id 全局唯一（新增续编，勿复用）：客运 vCheckId1~38 ｜ 货运 vCheckId39~82 ｜ 顺航 vCheckId83~124（共 124 setter `set_vCheckIdN`）
- 顺航为独立一份：不含 `applicable=客运` 条目，另含 2 条机坪秩序项
- ⚠️ 长列表别订阅整个 `videoItems`；需全量时 `getState()`
- ⚠️ `VideoPanel` 的 `videoFocus` prop 由**面板组静态 import 传入**（store 里仍有该字段但编辑器不消费）

## 后端 data/checklists（V5-dispatch）
```
data/checklists/
├── 节点保障/   客运始发·客运过站·货运始发·货运过站.json（含 schema）
└── 视频监管/   客运·货运航班视频监管重点.json + 顺航检查单.json（含 groups）
```
- 判定：含 `schema` 或 `flightTypes` 才算模板；`groups` 文件只作数据源
- 节点级 `videoSupervision: []` 已从 4 份模板删除（49 处）；**记录侧 `video_supervision` 列照旧保留**
- 删 JSON 末位属性会留**悬空逗号** → 必须连带去掉上一行末尾逗号，删完 `JSON.parse` 校验

## 校验方式（前端）
- **首选 `vite build`**（验全项目 import + 语法 + 导出名）：`npx vite build` → 看 `EXIT: 0`；只报首个错误，修完再跑
- **运行时冒烟（更强）**：临时 `.mjs` 放**项目根**（放 `$env:TEMP` 会 `ERR_MODULE_NOT_FOUND: vite`），`createServer({server:{middlewareMode:true}})` + `ssrLoadModule("/src/...")` + `renderToStaticMarkup` 静态渲染比对字节数。用完 `fs.unlinkSync` 删除
- ⚠️ 本机 bash 常挂（shim 报 `dirname/cat/ls/tr: command not found`）→ 用 PowerShell
- ⚠️ PowerShell stdout 会被吞 → `Set-Content -Encoding UTF8` 写 `$env:TEMP\xxx.txt` 再 Read（`*>` 重定向会写成 UTF-16）
- ⚠️ `Remove-Item` 有时静默失效 → 用 Node `fs.unlinkSync`
- ⚠️ 临时文件写中文到 TEMP 读回常乱码，但 `OK`/`FAIL`/`EXIT: 0`/数字体积仍可判读
- ⚠️ 别用 esbuild `--outfile=/dev/null`（Windows 真会建出 `dev/null` 文件）
- 批量校验写成临时脚本放项目根、结果 `fs.writeFileSync` 落盘再 Read；别用 `node -e "..."`（PowerShell 嵌套引号易写坏）
