# 项目长期记忆 — All-js-project

## 全栈速查
- 前端 `packages/frontend/flight-dispatch-system`：React+Vite+Zustand+Tailwind+ahooks，dev 5173；后端 `V5-dispatch`：Express+PG 5183，分层 config/db/utils/services/controllers/routes，无鉴权；线上 dd.atc1215.cn nginx 反代 /api
- 表：`fips`(Excel导入)·`manual_fips`(16字段+**uuid varchar64 NOT NULL UNIQUE 默认 gen_random_uuid()::text,2026-09-20 加列,航班身份字段**；列表数据源)·`fresh_air_cargo`(FK+JSONB)·`checklist_records`(flight_id **非唯一,2026-09-22 摘掉唯一索引+普通索引 idx_records_flight**——一个航班可有多份检查单;**无外键**删源表留孤儿)；模板走文件系统不入库（templateService 扫目录）
- 路由（2026-09-20 Outlet 化）：App.jsx 用 `<Route element={<MainPageLayout/>}>` 布局路由包全部子路由（MainPageLayout 渲染顶部导航+`<Outlet/>`，**不再收 children**）；`/`→redirect /fips · `/fips` 航班列表（**原 FlightSchedulePage 已并入 FipsPage.jsx**，flowchart/AddFlightDialog/Sidebar 都在 FipsPage/ 下）· `/checklist`（兼容 `/checklists`）草稿工作台(ChecklistPage/Drafts/Drafts.jsx) · `/checklists/flight/:flightId` 编辑器（**`?record=<id>`=修改模式；不带=新建模式；`?checkTemplate=1~5` 指定类型**）· `/checklists/:checkedId` → ChecklistViewer 直挂（**原分发入口 index.jsx 已删,未恢复**）· `/records` 填写记录页（**2026-09-22 实现**：RecordsPage/RecordsPage.jsx + components/RecordsSidebar.jsx，仿 FipsPage 侧栏+表格，**日期口径=创建日 created_at**）· `/special` → SpecialPage（原 FreshGuaranteePage）· 兜底→/fips
- FlowChart 唯一位置：`pages/FipsPage/flowchart/FlowChart.jsx`（编辑器 DraggableThumb/FlowStatusView 经 `../../../../../pages/FipsPage/flowchart/FlowChart` 引用）
- 24h 锁定：后端 `EDIT_LOCK_HOURS=24` 抛 409；前端 LOCK_HOURS 只在 checklistStore
- 布局组件在 `src/Layout/{MainPageLayout, ContentLayout(可选侧栏360+内容)}`；旧 components/PageLayout 已删
- **创建检查表链路（2026-09-22 简化）**：FipsPage「创建检查表」= `useChecklistStore.getState().reset()` + `navigate('/checklists/flight/'+f.uuid)`；**装载全部交给编辑器按 URL 调 `openFlight`**（一处装载逻辑，刷新/直链/草稿箱跳转同路）；草稿键 = **航班键(uuid)::模板id**（复合键，见 checklistDraft.draftKeyOf）；提交成功后草稿清理 = `removeDraftsByFlight(uuid)` + `removeIdbDraftsByFlight(uuid)`（该航班各类型草稿一起清）；API payload 的 flightId 仍用数字 flight.id（裸数字后端也认 → checklist_uuid 能回写了）
- **新建 / 更新 / 删除 三分（2026-09-22 根治"点新建却改了旧记录"）**：后端 POST **永远 INSERT**（原按 flight_id upsert 是病根，已删除）+ 摘掉 flight_id 唯一约束，PUT 只改 `:id`，DELETE 只删 `:id`；每次增删改后 `syncChecklistUuid(flight_id)` 用子查询**重算来源表 checklist_uuid = 该航班最新一份 id（无则 NULL）**，`parseFlightRef` 同时认 `fips-1` / `manual-1` / 裸数字(=manual_fips)
- **✅ 业务口径已定稿（2026-09-22 用户确认）**：一个航班**允许任意多份**检查单，不做 `(flight_id, category)` 唯一限制、POST 不返回 409；「创建就是创建」。checklist_uuid 只是"最近一份"的展示标记，不承担唯一性判定（别再造 `已有检查单→禁止新建` 的 gate）。旧的 `findRecordByFlightId`（一航班一检查单时代的 upsert 助手）**已删除**——无调用方，留着容易被人用来写回 upsert

## ChecklistPage 速查（2026-09-19 整理后）
- 结构：index.jsx(入口+类型解析) / ChecklistEditor(具名 ChecklistEditor.jsx,零props) hooks(useTimeFormulas·useRegister) Components(CheckComponents×6·OtherComponents×6·ToolBar/Toolbar.jsx+Components×5) Template(XxxFlight×5+TemplateJson×8,无 index.js) / ChecklistViewer(具名,2026-09-22 已零 props 化)
- ⚠️ 深度规则：到 src 的层级=目录深度；`Components/*` 5 层 `../../../../../`；`ToolBar/Components/*` 6 层；**无 ToolBar/index.jsx**（叫 Toolbar.jsx）
- 已废弃别再造：TemplateJson/index.js(查表在 store)、checklistTypeConfig、barrel Template/index.js、getNodeId、useUiPrefs、ChecklistPage/utils 等

## 类型体系
- TYPE_COLORS/TYPE_ORDER/typeColorOf/withAlpha/typeOfCheckTemplate/checkTemplateOfType 都在 checklistStore（唯一定义处）；五色 #059669/#0891B2/#7C3AED/#D946EF/#6B2608；键=模板id=category=落库 checklist_category
- 默认类型由 store 保证（FALLBACK_TEMPLATE_ID=货运过站航班）→ 组件无需 `|| 兜底`；⚠️ 禁止 Tailwind 动态拼接类名 → inline style
- 5 面板组一类型一组件（PANEL_BY_CATEGORY 在 ChecklistEditor.jsx）；列条件式 `panels.includes("main") && {...}`；新增类型=建 TemplateJson+Template+TYPE_COLORS 补项+import/映射各一行

## 零 props / 非受控
- 组件自订阅 store；表单仿 RHF `{...register("time")}` DOM 持值；工具栏/下拉/提示条/编辑器/查看器**全部零 props**（2026-09-22 收口）
- useRegister 必须保留「values→推回 DOM」同步 effect（判据 `el.value!==v`），否则公式引擎/hydrate 的值不显示（静默坏）
- 口诀：用 React API→hook；纯进纯出→utils；共享数据→store

## checklistStore / checklistDraft
- store 只存工具栏/节点/后端态：template·flight·selectedCheckNode·panels·viewMode·thumbVisible（内存态,reset 不清）·记录元数据·saveStatus/saveError；actions：loadTemplate·**openFlight(flightKey,templateId?)=编辑器唯一装载入口**（换航班→reset+反查行+setFlight+openDraft(键,类型)+loadTemplate(草稿类型)+setDraftContext；同航班→只 switchChecklistType）·switchChecklistType(flushDraft 存旧类型草稿 → openDraft(键,新类型) → loadTemplate，**不再 clearMemory**)·loadRecord(checkedId,查看页唯一数据入口：记录→flight(flightOfRecord 归一 origin/destination/flightDate,uuid 优先 manual_fips 行)+template+记录元数据,并 hydrateFromRecord 灌填写层)·submit(**仅剩自动分流器** `recordId ? updateRecord : createRecord`；失败不抛,默认 status='submitted',返回 record)·**openRecordForEdit(recordId, fallbackFlightKey?) = 编辑器 `?record=` 装载入口**(reset→loadRecord→灌填写层；取不到则退回 openFlight 新建态并写 saveError)·createRecord/updateRecord/deleteRecord(分别 POST/PUT/DELETE；buildPayload/afterSaved 为 factory 内共用 helper)·togglePanel 等
- 提交后跳转（2026-09-22）：Toolbar.handleSubmit = **`recordId ? updateRecord() : createRecord()`**（不让 store 猜）→ `navigate('/checklists/'+record.id,{replace:true})`；按钮文案随之变「保存修改 / 提交」，InfoDisplay 显示「修改 #id / 新建」chip；ChecklistViewer 已零 props 化（useParams().checkedId → loadRecord，store 里同一条则跳过请求，flight 为空时渲染 loading）；**查看页两出口**：「新建检查单」（默认，`reset()` → URL **不带 ?record** → 提交走 POST 新增）+「修改」（次要，URL 带 `?record=<id>` → 提交走 PUT 改这一条）；两者 24h 锁定后皆禁用；填写记录页行内/侧栏也加了「修改」（同 `?record=` 路径）
- **填写记录页（recordsStore，2026-09-22）**：日期口径=**创建日 created_at**（后端 listRecords 的 date/from-to 过滤与 ORDER BY 同步改为 `COALESCE(created_at, updated_at)`）；`countAbnormal(record)` 统计 items+video_supervision 里 status='abnormal'；dayMarkers 红/绿徽标同口径；fetchRecords 带 error 态；页面列=创建日期/航班号/机型/检查单类型(配色点)/检查人/状态/异常/最后更新
- **URL 是唯一驱动源（2026-09-22）**：编辑器 `ChecklistEditor` effect 读 `:flightId` + `?checkTemplate` / **`?record`** → 有 record 走 `openRecordForEdit(record, routeFlightId)`（此时忽略 checkTemplate，类型由记录决定），否则 `openFlight(id, typeOfCheckTemplate(param))`；openFlight 的"同航班早退"加了 `&& !recordId` 条件（否则点新建会被早退吃掉 recordId，提交又变成改旧记录）；类型下拉 handleSelect **只写 URL**，不再直接调 switchChecklistType（否则两处驱动重复装载）；编辑器 `flight` 为空时渲染 loading 守卫（避免"上个航班模板+空数据"错觉）
- 填写层在 `checklistDraft.js`：内存 {flightId(=航班键 uuid),flightNo,templateId,items,videoItems,inspector} → 800ms 防抖 IndexedDB(`flight_dispatch`/`checklist_drafts`,**DB v2 keyPath 'key'**,预留 Blob)+draftStore 箱索引(localStorage≤5,也按 key 唯一)；**后端无草稿态**
- ⚠️ 草稿键 = `draftKeyOf(航班键, 模板id)` = `"{uuid}::{类型名}"`：只用航班键→同航班不同检查单类型互相覆盖；只用模板 id→不同航班撞成一份（拿到别的航班数据）。openDraft **无草稿也必须清空内存**（否则残留上一个航班的 items，落盘落到错键）
- 模块级 setter 引用稳定：setItemValue/setItems/setVideoItemField；hooks：useMainItem/useAuxItem/useVideoCheckItem/useDraftStatus/useDraftVersion
- ⚠️ useSyncExternalStore 必须传 getServerSnapshot；SSR 探针验证 store 要 mutate `getInitialState()` 返回对象
- 进入流程（2026-09-22）：openFlight（编辑器按 URL）或 loadRecord（查看页按记录 id）；两处内部都调 openDraft/hydrateFromRecord + setDraftContext；unmount/pagehide flushDraft；草稿箱 UI 删除草稿要**同时删** draftStore 索引 + removeIdbDraft(key)

## 重渲染约定
- 面板组/编辑器/入口**不得订阅 items/videoItems**；单项用 useXxxItem、全量用 useDraftVersion；纯副作用用 store.subscribe
- 逐项 setter 只换目标 key（memo 命中前提）；点一张卡预期：新旧卡片重渲染，其余不动

## 模板数据（uuid 体系）
- 节点/辅助/视频一律 **uuid** 身份（无 id）；items key `main-<uuid>`/`aux-<uuid>`；事件关联 refUUID（eventId 跨模板撞号,仅展示）
- 视频监管 120 条按类型分离，VideoPanel 不过滤；顺航无模板→shunhangFlight.js 空占位（待真实 schema）
- 改条目：改后端 `data/checklists` 源 JSON→重跑 `gen-checklist-static.cjs`（先快照事后 diff；JSON 悬空逗号要 parse 校验）

## 校验/环境坑
- 首选 `vite build` EXIT 0；更强用项目根临时 `.mjs` SSR 探针（ssrLoadModule 加载 store/hooks，用完删）
- ⚠️ 渲染层别指望 SSR 探针：react-router-dom v7 的 dist 是 CJS/ESM 双语法文件 → Node 原生 import 报 `ERR_AMBIGUOUS_MODULE_SYNTAX`；`ssr.noExternal:true` 又让 react(CJS) 报 `module is not defined`
- **页面实测用系统 Chrome 无头**（agent-browser 要下 Chromium，storage.googleapis.com 常超时）：`chrome.exe --headless=new --disable-gpu --user-data-dir=<temp目录> --hide-scrollbars --window-size=1600,1000 --virtual-time-budget=9000 --screenshot=x.png URL`；要断言 DOM 就把 `--screenshot` 换成 `--dump-dom`（拿到 hydrate 后的真实 DOM，可正则取表格行/徽标；有 `vite-error-overlay` = 页面报错）
- bash shim 常挂（dirname/ls/tail not found）但 **`node -e` 可用**；PowerShell 吞 stdout、`*>` 写成 UTF-16；批量替换用一次性 .cjs 每处 includes() 校验；删文件用 fs.unlinkSync
- ⚠️ 用户编辑器可能把旧缓冲回写磁盘（改完的 App.jsx 标签被还原过）→ 改完必须重读核对
