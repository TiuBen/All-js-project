# 项目长期记忆 — All-js-project

## 全栈速查
- 前端 `packages/frontend/flight-dispatch-system`：React+Vite+Zustand+Tailwind+ahooks，dev 5173；后端 `V5-dispatch`：Express+PG 5183，分层 config/db/utils/services/controllers/routes，无鉴权；线上 dd.atc1215.cn nginx 反代 /api
- 表：`fips`(Excel导入)·`manual_fips`(16字段+**uuid varchar64 NOT NULL UNIQUE 默认 gen_random_uuid()::text,2026-09-20 加列,航班身份字段**；列表数据源)·`fresh_air_cargo`(FK+JSONB)·`checklist_records`(flight_id **非唯一,2026-09-22 摘掉唯一索引+普通索引 idx_records_flight**——一个航班可有多份检查单;**无外键**删源表留孤儿)；模板走文件系统不入库（templateService 扫目录）
- 路由（2026-09-20 Outlet 化）：App.jsx 用 `<Route element={<MainPageLayout/>}>` 布局路由包全部子路由（MainPageLayout 渲染顶部导航+`<Outlet/>`，**不再收 children**）；`/`→redirect /fips · `/fips` 航班列表（**原 FlightSchedulePage 已并入 FipsPage.jsx**，flowchart/AddFlightDialog/Sidebar 都在 FipsPage/ 下）· `/checklist`（兼容 `/checklists`）草稿工作台(ChecklistPage/Drafts/Drafts.jsx) · `/checklists/flight/:flightId` 编辑器（**`?record=<id>`=修改模式；不带=新建模式；`?checkTemplate=1~5` 指定类型**）· `/checklists/:checkedId` → ChecklistViewer 直挂（**原分发入口 index.jsx 已删,未恢复**）· `/records` 填写记录页（**2026-09-22 实现**：RecordsPage/RecordsPage.jsx + components/RecordsSidebar.jsx，仿 FipsPage 侧栏+表格，**日期口径=创建日 created_at**）· `/special` → SpecialPage（原 FreshGuaranteePage）· 兜底→/fips
- FlowChart 唯一位置：`pages/FipsPage/flowchart/FlowChart.jsx`（编辑器 DraggableThumb/FlowStatusView 经 `../../../../../pages/FipsPage/flowchart/FlowChart` 引用）
- 24h 锁定：后端 `EDIT_LOCK_HOURS=24` 抛 409；前端 LOCK_HOURS 只在 checklistStore
- 布局组件在 `src/Layout/{MainPageLayout, ContentLayout(可选侧栏360+内容)}`；旧 components/PageLayout 已删
- **创建检查表链路（2026-09-22 简化）**：FipsPage「创建检查表」= `useChecklistStore.getState().reset()` + `navigate('/checklists/flight/'+f.uuid)`；**装载全部交给编辑器按 URL 调 `openFlight`**（一处装载逻辑，刷新/直链/草稿箱跳转同路）；草稿键 = **航班键(uuid)::模板id**（复合键，见 checklistDraft.draftKeyOf）；提交成功后草稿清理 = `removeDraftsByFlight(uuid)` + `removeIdbDraftsByFlight(uuid)`（该航班各类型草稿一起清）；API payload 的 flightId 仍用数字 flight.id（裸数字后端也认 → checklist_uuid 能回写了）
- **检查项截图体系（2026-09-22）**：每项**最多 1 张** `image = { id,name,type,size,blob?,url? }`（blob=本地二进制，url=已上传；可只存其一）。组件三件套：`components/BaseCheckInput.jsx`（文字+截图输入：Ctrl+V 粘贴/点选/拖拽/替换/删除/看大图，**受控** note+image，零 store 依赖）、`components/CheckImage.jsx`（缩略图+大图，填写端与查看端共用；objectURL 用 useMemo 建、**卸载时"推迟一拍"释放**——见下方 ⚠️ 坑）、`utils/checkImage.js`（imageFromFile/filesFromClipboard/imageMeta/imageSig/newImageId，纯函数）。**禁止 Base64**：blob 直接进 IndexedDB（结构化克隆）、上传走原始二进制
- **⚠️ objectURL 与 StrictMode（2026-09-23 踩坑，症状="图片永远没预览"）**：`main.jsx` 开着 StrictMode，dev 下 effect 是「挂载 → 立刻卸载 → 再挂载」。若在卸载清理里**同步** `URL.revokeObjectURL(useMemo 刚建的 url)`，那张 URL 会在真挂载前作废，`<img>` 拿到失效地址（`naturalWidth=0`、`fetch(blob:…)` 直接失败）——**只有"该 CheckImage 第一次出现"的那张图会坏**（后续换图时组件已挂着，清理的是旧 URL），所以现象是"粘贴的图没预览、刷新后依旧没预览"。修法：`CheckImage.jsx` 的 `revokeLater(url)` 用 `setTimeout(…,0)` 推迟释放 + 重挂载时 `keepAlive(url)` 取消（双调用在同一任务内，定时器来不及跑）。**本项目凡"渲染期建 objectURL"一律照此办理**
- **辅助项也带截图（2026-09-23）**：`AuxiliaryCheckItem` 的备注 textarea → 换成 `BaseCheckInput`（note+image 受控；时间输入仍走 `register("time")`），截图存 `items['aux-<uuid>'].image`。配套三处：①`checklistDraft.boxSnapshot()` 对 **items 与 videoItems 都剥 image 二进制**（否则 localStorage 里 `JSON.stringify(Blob)` → `{}`）；②`checklistStore.uploadDraftImages()` 现在返回 `{items, videoItems}`（**两份都要扫、都要同步换 url**），调用处 `buildPayload(s,{...d,items,videoItems})`——只回 videoItems 的话辅助项截图会被 JSON 静默吃掉；③查看页 `AuxiliaryList` 用 `CheckImage` 展示截图（顺带修掉 `{aItem.note}是` 的笔误）。主监控项（MainCheckItem）**仍是纯时间卡片，未接截图**
- **截图上传（2026-09-22）**：`POST /api/checklists/uploads?name=` body=图片原始字节（`express.raw({type:'image/*'})`，**不用 multer/FormData**）→ 落盘 `V5-dispatch/data/uploads/`，文件名服务端自造（时间戳+随机串，防穿越）→ 返回 `{url:'/api/uploads/xxx.png'}`。静态托管挂在 **`/api` 前缀下**（`config.uploadsUrlPrefix`）—— vite 代理与线上 nginx 都只反代 /api，两个环境都**无需改配置**。上限 8MB；非 image/* → 415、空体 → 400。`data/uploads/` 已加 .gitignore
- **提交才上传（2026-09-22）**：`checklistStore.uploadDraftImages(d)` 在 create/update 之前把「有 blob 且无 url」的图逐个上传，内存 image 同步换成 `{...meta,url}`（重复提交不重传）；**上传失败即中止落库**（saveError 提示），绝不让截图静默消失
- **新建 / 更新 / 删除 三分（2026-09-22 根治"点新建却改了旧记录"）**:后端 POST **永远 INSERT**（原按 flight_id upsert 是病根，已删除）+ 摘掉 flight_id 唯一约束，PUT 只改 `:id`，DELETE 只删 `:id`；每次增删改后 `syncChecklistUuid(flight_id)` 用子查询**重算来源表 checklist_uuid = 该航班最新一份 id（无则 NULL）**，`parseFlightRef` 同时认 `fips-1` / `manual-1` / 裸数字(=manual_fips)
- **✅ 业务口径已定稿（2026-09-22 用户确认）**：一个航班**允许任意多份**检查单，不做 `(flight_id, category)` 唯一限制、POST 不返回 409；「创建就是创建」。checklist_uuid 只是"最近一份"的展示标记，不承担唯一性判定（别再造 `已有检查单→禁止新建` 的 gate）。旧的 `findRecordByFlightId`（一航班一检查单时代的 upsert 助手）**已删除**——无调用方，留着容易被人用来写回 upsert

## ChecklistPage 速查（2026-09-19 整理后）
- 结构：index.jsx(入口+类型解析) / ChecklistEditor(具名 ChecklistEditor.jsx,零props) hooks(useTimeFormulas·useRegister) Components(CheckComponents×6·OtherComponents×6·ToolBar/Toolbar.jsx+Components×5) Template(XxxFlight×5 + **EditorTemplateJson×8 + ViewTemplateJson×15**，无 index.js) / ChecklistViewer(具名,2026-09-22 已零 props 化)
- ⚠️ 深度规则：到 src 的层级=目录深度；`Components/*` 5 层 `../../../../../`；`ToolBar/Components/*` 6 层；**无 ToolBar/index.jsx**（叫 Toolbar.jsx）
- 已废弃别再造：TemplateJson/index.js(查表在 store)、checklistTypeConfig、barrel Template/index.js、getNodeId、useUiPrefs、ChecklistPage/utils 等
- **2026-09-23 目录改名**：`Template/TemplateJson` → **`Template/EditorTemplateJson`**（编辑器用的模板+视频监管数据，gen-checklist-static.cjs 的产物目录）；新增 **`Template/ViewTemplateJson`**（查看页用的扁平一维视图数据，gen-view-static.cjs 的产物目录）

## 类型体系
- TYPE_COLORS/TYPE_ORDER/typeColorOf/withAlpha/typeOfCheckTemplate/checkTemplateOfType 都在 checklistStore（唯一定义处）；五色 #059669/#0891B2/#7C3AED/#D946EF/#6B2608；键=模板id=category=落库 checklist_category
- 默认类型由 store 保证（FALLBACK_TEMPLATE_ID=货运过站航班）→ 组件无需 `|| 兜底`；⚠️ 禁止 Tailwind 动态拼接类名 → inline style
- 5 面板组一类型一组件（PANEL_BY_CATEGORY 在 ChecklistEditor.jsx）；列条件式 `panels.includes("main") && {...}`；新增类型=建 EditorTemplateJson+Template+TYPE_COLORS 补项+import/映射各一行，再跑 gen-view-static.cjs 补三份视图数据 + 三个 List 的映射各一行

## 查看页（ChecklistViewer，2026-09-23 改为一维三列表）
- 结构：`MainCheckList` / `AuxiliaryCheckList` / `VideoCheckList` 三个**零 props** 组件（各自订阅 `template.id` + `loadedRecord`，各自 import 自己那 5 份视图数据并自带 category→数组映射表），+ 公共外壳 `ViewListShell`（统计条+列表容器）+ `statusView.jsx`（状态色/图标）；**`ChecklistTreeView` / `AuxiliaryList` / `VideoCheckView` 已删**（树形 → 一维列表）
- **树 → 一维的拍平在编译期完成**：`EditorTemplateJson`（树：schema[]→auxiliaries[]）经 `scripts/gen-view-static.cjs` 生成 `ViewTemplateJson` 的 5 类型 × 3 列表 = 15 个文件（`xxxFlight\{Main,Auxiliary,Video\}ViewJson.js`，导出 `XXX_FLIGHT_MAIN_VIEW_JSON` 等）。List 只管 `rows.map`，不再遍历层级
- 单项字段：Main `{key:main-<uuid>,uuid,order,name,desc}`；Auxiliary 同前 + `{parentUuid,parentName,parentOrder}`（列表里显示「↳ N. 主节点名」）；Video `{key:uuid,order,name,groupUuid,groupName,groupOrder}`（**一维数据靠"上一项 groupUuid 变了"插分组标题**，视觉分组、结构不嵌套）
- **`utils/ViewColor.js` = 查看页唯一配色源**：异常 `#dc2626` 红，不适用/待检查/正常**暂时统一灰 `#64748b`**；`viewStatusOf(status)` 归一化（空/未填→pending）、`VIEW_STATUS_ORDER`（异常最先）、`countViewStatus(items)` 统计、`VIEW_LIST`（三列表标题/主色，现统一中性灰）。改配色只改这一个文件；一律 inline style（禁 Tailwind 动态类名）
- **列表不做 sticky 吸附**（分组标题也随内容滚走）；容器 `flex-col xl:flex-row` 三列并排，窄窗自动堆叠；页面主体仍是「顶部标题栏 + 三列表」，两个出口（新建不带 `?record` / 修改带 `?record=`）不变

## 零 props / 非受控
- 组件自订阅 store；表单仿 RHF `{...register("time")}` DOM 持值；工具栏/下拉/提示条/编辑器/查看器**全部零 props**（2026-09-22 收口）
- useRegister 必须保留「values→推回 DOM」同步 effect（判据 `el.value!==v`），否则公式引擎/hydrate 的值不显示（静默坏）
- 口诀：用 React API→hook；纯进纯出→utils；共享数据→store

## checklistStore / checklistDraft
- store 只存工具栏/节点/后端态：template·flight·selectedCheckNode·panels·viewMode·thumbVisible（内存态,reset 不清）·记录元数据·saveStatus/saveError；actions：loadTemplate·**openFlight(flightKey,templateId?)=编辑器唯一装载入口**（换航班→reset+反查行+setFlight+openDraft(键,类型)+loadTemplate(草稿类型)+setDraftContext；同航班→只 switchChecklistType）·switchChecklistType(flushDraft 存旧类型草稿 → openDraft(键,新类型) → loadTemplate，**不再 clearMemory**)·loadRecord(checkedId,查看页唯一数据入口：记录→flight(flightOfRecord 归一 origin/destination/flightDate,uuid 优先 manual_fips 行)+template+记录元数据,并 hydrateFromRecord 灌填写层)·submit(**仅剩自动分流器** `recordId ? updateRecord : createRecord`；失败不抛,默认 status='submitted',返回 record)·**openRecordForEdit(recordId, fallbackFlightKey?) = 编辑器 `?record=` 装载入口**(reset→loadRecord→灌填写层；取不到则退回 openFlight 新建态并写 saveError)·createRecord/updateRecord/deleteRecord(分别 POST/PUT/DELETE；buildPayload/afterSaved 为 factory 内共用 helper)·togglePanel 等
- 提交后跳转（2026-09-22）：Toolbar.handleSubmit = **`recordId ? updateRecord() : createRecord()`**（不让 store 猜）→ `navigate('/checklists/'+record.id,{replace:true})`；按钮文案随之变「保存修改 / 提交」，InfoDisplay 显示「修改 #id / 新建」chip；ChecklistViewer 已零 props 化（useParams().checkedId → loadRecord，store 里同一条则跳过请求，flight 为空时渲染 loading）；**查看页两出口**：「新建检查单」（默认，`reset()` → URL **不带 ?record** → 提交走 POST 新增）+「修改」（次要，URL 带 `?record=<id>` → 提交走 PUT 改这一条）；两者 24h 锁定后皆禁用；填写记录页行内/侧栏也加了「修改」（同 `?record=` 路径）
- **填写记录页（recordsStore，2026-09-22）**：日期口径=**创建日 created_at**（后端 listRecords 的 date/from-to 过滤与 ORDER BY 同步改为 `COALESCE(created_at, updated_at)`）；`countAbnormal(record)` 统计 items+video_supervision 里 status='abnormal'；dayMarkers 红/绿徽标同口径；fetchRecords 带 error 态；页面列=创建日期/航班号/机型/检查单类型(配色点)/检查人/状态/异常/最后更新
- **URL 是唯一驱动源（2026-09-22）**：编辑器 `ChecklistEditor` effect 读 `:flightId` + `?checkTemplate` / **`?record`** → 有 record 走 `openRecordForEdit(record, routeFlightId)`（此时忽略 checkTemplate，类型由记录决定），否则 `openFlight(id, typeOfCheckTemplate(param))`；openFlight 的"同航班早退"加了 `&& !recordId` 条件（否则点新建会被早退吃掉 recordId，提交又变成改旧记录）；类型下拉 handleSelect **只写 URL**，不再直接调 switchChecklistType（否则两处驱动重复装载）；编辑器 `flight` 为空时渲染 loading 守卫（避免"上个航班模板+空数据"错觉）
- 填写层在 `checklistDraft.js`：内存 {flightId(=航班键 uuid),flightNo,templateId,items,videoItems,inspector} → 800ms 防抖 IndexedDB(`flight_dispatch`/`checklist_drafts`,**DB v2 keyPath 'key'**,预留 Blob)+draftStore 箱索引(localStorage≤5,也按 key 唯一)；**后端无草稿态**。⚠️ 2026-09-22 三个坑已修：①`hasContent()` 原来只看 items → 只填视频项/只贴张截图时草稿**根本不落盘**（现计入 videoItems 的 status/note/image）；②落盘签名 `contentSig()` 序列化时**摘掉 blob**（否则 `JSON.stringify(Blob)={}` 会漏判"换了张图"）；③写 localStorage 草稿箱用 `boxSnapshot()` 把 image 换成元信息（二进制只进 IndexedDB；**items 与 videoItems 都要剥**）
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
- ✅ **SSR 探针渲染"订阅 zustand 的组件"（2026-09-23 打通，比只加载模块强一档）**：createServer({server:{middlewareMode:true},optimizeDeps:{noDiscovery:true,include:[]}}) + `ssrLoadModule` 组件 + **原生** `import('react-dom/server')`/`import('react')` + `renderToStaticMarkup(createElement(C))`（**必须 createElement，直接当函数调 → Invalid hook call**）。⚠️ 两个必踩的坑：①`ssrLoadModule('react-dom/server')` 必然报 `require is not defined`（vite 把 CJS 当 ESM 内联，`ssr.external` 也拦不住）→ 只能原生 import；②原生 react-dom/server 与"组件经 zustand 取到的 react"是两个实例时 → `Cannot read properties of null (reading 'useCallback')`（dispatcher 为 null）。**破法：用插件 `resolveId` 把 `store/checklistStore` 换成"无 hooks 的纯选择器桩"**（`(selector)=>selector(state)` + `__setState`，`enforce:'pre'`，正则 `/(^|[/\\])store[/\\]checklistStore(\.js)?$/`——**不能用 resolve.alias**，它会把相对说明符拼成 `../../../..D:/...` 这种坏 id），先摆好状态再同步渲染，等价于"记录已加载"那一刻，然后就能断言真实 HTML（含 inline style 颜色、分组标题、空态、回退）
- ⚠️ 渲染层别指望 SSR 探针：react-router-dom v7 的 dist 是 CJS/ESM 双语法文件 → Node 原生 import 报 `ERR_AMBIGUOUS_MODULE_SYNTAX`；`ssr.noExternal:true` 又让 react(CJS) 报 `module is not defined`（**只对 react-router 这类依赖成立；上面的 stub 法已能跑通纯展示组件**）
- **页面实测用系统 Chrome 无头**（agent-browser 要下 Chromium，storage.googleapis.com 常超时）：`chrome.exe --headless=new --disable-gpu --user-data-dir=<temp目录> --hide-scrollbars --window-size=1600,1000 --virtual-time-budget=9000 --screenshot=x.png URL`；要断言 DOM 就把 `--screenshot` 换成 `--dump-dom`（拿到 hydrate 后的真实 DOM，可正则取表格行/徽标；有 `vite-error-overlay` = 页面报错）
- **真交互实测用内置 CDP（2026-09-22，比 dump-dom 强一档，零依赖）**：`chrome --headless=new --remote-debugging-port=9222 --user-data-dir=临时目录 about:blank` → `GET /json/version` 再 `/json/list` 拿 `webSocketDebuggerUrl` → **Node 22 自带全局 `WebSocket`** 直连，`Page.enable`/`Runtime.enable`/`Page.navigate` + `Runtime.evaluate{awaitPromise:true,returnByValue:true}`（异常从 `exceptionDetails` 抛回）、`Page.captureScreenshot` 存 PNG。能做的：派发 `ClipboardEvent('paste',{clipboardData:new DataTransfer()})` 造粘贴、用 `HTMLTextAreaElement.prototype.value` 的 setter + `new Event('input')` 触发受控输入的 onChange、直接读页内 IndexedDB 校验落盘、点按钮走完提交链路。⚠️ 两个坑：①页面里 `sleep` 要先注入 `window.__sleep`；②React 同一 tick 连点两下会拿到旧 props（状态循环点击要**分次 evaluate**）；③要测「选文件」路径就 `DOM.getDocument` + `DOM.querySelector` 拿 nodeId（先在页面里给目标 `input[type=file]` 打个 `data-probe` 属性更好定位，页面上有 40+ 个同名 input）再 `DOM.setFileInputFiles`；④CDP 与 `_cprofile` 目录用完要删（Chrome 进程没退干净时 EPERM，稍后重试）
- bash shim 常挂（dirname/ls/tail not found）但 **`node -e` 可用**；PowerShell 吞 stdout、`*>` 写成 UTF-16；批量替换用一次性 .cjs 每处 includes() 校验；删文件用 fs.unlinkSync
- ⚠️ 用户编辑器可能把旧缓冲回写磁盘（改完的 App.jsx 标签被还原过）→ 改完必须重读核对

## 部署（V5-dispatch → 阿里云，2026-09-23 核对）
- 入口是**根 `server.js`**（不是 src/server.js）；`npm start` = `node server.js`；PM2 必须 `pm2 start server.js --name v5-dispatch --cwd /opt/v5-dispatch`（`dotenv.config()` 读的是 **CWD/.env**，从别处启动读不到配置）
- 「代码自动建表」与「导 SQL」两条路都要出正确结构：`src/db/schema.js` ↔ `data/schema.sql` **列级对齐已实测**（manual_fips 22 列含 uuid + manual_fips_uuid_key + fresh_air_cargo 外键）；**改表结构两处都得改**
- 部署产物在 `frontend/flight-dispatch-system/资料/`：`flight_dispatch_full_20260923.sql`（全量 6 表，已剔除 pg_dump18 的 `\restrict`/`transaction_timeout`）+ `import_flight_dispatch.sh`（免密导入 + 校验 uuid 列）；⚠️ 旧 `flight_dispatch.sql` 只有 3 表别用，`V5-dispatch/flight_info.sql` 是 MySQL 的
- nginx：`backend/nginx/sites-available/dd.atc1215.cn.conf`（前端 dist + `/api/` 反代 5183，同源无跨域）；**必须 `client_max_body_size 20m`**（默认 1m → 8MB 截图 413）；`location /api/` 的 proxy_pass **不带尾斜杠**
- 环境：后端 5183 / Node≥18 / PG≥13（gen_random_uuid）；只开 80/443 走反代，5183 别对公网（接口全无鉴权）
- 数据基线：fips 10300 · flights 10310 · manual_fips 8 · checklist_records 8 · fresh_air_cargo 1 · flight_info 203（遗留表，代码未引用）
