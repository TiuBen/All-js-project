# 项目长期记忆 — All-js-project

> 详细过程看 `.workbuddy/memory/YYYY-MM-DD.md`；这里只留「先看这条就不会踩坑」的结论。

## 0. 环境与启动
- 前端 `packages/frontend/flight-dispatch-system`（React 19 + Vite + Zustand + Tailwind + ahooks，dev **5173**，proxy `/api`→127.0.0.1:5183）
- 后端 `packages/backend/full-web-backend/V5-dispatch`（Express + PG，**5183**），入口是**根 `server.js`**（不是 `src/server.js`），`npm start`=`node server.js`，无鉴权，线上 dd.atc1215.cn nginx 反代 /api
- 包管理**一律 pnpm**；本机 pnpm 10.28.2 / Node 22.22.2 / **PG 18.3**（`C:\Program Files\PostgreSQL\18\bin` 已在 PATH）
- `.env`（在 V5-dispatch 根）：`PG_*` = postgres/admin@127.0.0.1:5432/flight_dispatch；`DATABASE_URL` 要与 `PG_*` 一致（Prisma 不收分散变量）。PM2 启动必须带 `--cwd`（`dotenv` 读 CWD/.env）

## 1. 数据现状（2026-10-26 下午复核，已与代码对齐）
- **本地 `flight_dispatch` 已重建为新的 9 表结构**（uuid 主键 + `records_checklist` / `records_special` / `user` / `user_login_log` / 两张码表），旧的 `flights`/`fresh_air_cargo`/`special` 已不存在
- 当前行数：`airplane_company_name_code` 15 · `airport_name_code` 74 · `user` 40 · `ecyilang` 52 · `fips` 0 · `manual_fips` 0 · `records_checklist` 0 · `records_special` 0 · `user_login_log` 0 —— **航班主数据还基本是空的**，要跑通列表页得先灌 fips / manual_fips
- ⚠️ 上午 09:50 时这个库还是旧结构（integer 主键 + flights 10310 行），下午已被整体重建 → **遇到「表/行数对不上」先看时间点，别急着怀疑代码**
- 线上库口径（2026-10-03 清空后）：fips 10300 · manual_fips 8 · ecyilang 265 · checklist_records 0 · special_records 0
- 另有 `flight_dispatch_restore` 库 = 2026-10-26 上午从旧转储 `data/flight_dispatch_export/flight_dispatch.sql` 还原的**旧结构**副本（flights 10310 / fips 10300 / checklist_records 4），留作历史数据查看

## 2. 表结构（新结构，权威入口 = `prisma/schema.prisma`）
- 7 张：`fips`(Excel 导入，列表数据源) · `manual_fips`(16 字段，手动加航班) · `ecyilang`(外部同步，`*_name_iata_code/_name_icao_code`) · `checklist_records` · `special_records`(原 `special`，生鲜台账，`nodesTime` JSONB) · `airplane_company_name_code` / `airport_name_code`(IATA↔ICAO，**id 仍整数自增**)。模板走文件系统不入库
- **已删除，别再引用**：`flights`(→fips) · `flight_info` · `fresh_air_cargo`(并入 `special_records."nodesTime"->'freshMark'`) · `flight_uuid_registry`
- **主键全量 UUID 化**：五张业务表 `id` = `uuid DEFAULT gen_random_uuid()`，**id 就是航班身份**；`checklist_records.flight_uuid` / `special_records.flight_uuid` 只存一个 uuid 即可跨表无歧义（**不需要名字簿/source_table**）。三张航班表原来那个独立 `uuid` 列已并入 id，整数序列全删。迁移脚本 `migrate-pk-to-uuid.mjs` / `migrate-uuid-column-position.mjs`（都幂等、支持 `--dry`）
- **Prisma 约定**：7 个 model，**模型名=表名、字段名=列名、不加 @@map/@map**（db push 才不会重命名，可与 raw SQL 共存）。Prisma 7 硬要求：① 必须有 `prisma.config.mjs`，连接串写它的 `datasource.url`（写 schema 里报 **P1012**）；② CLI 不自动读 .env → 首行 `import 'dotenv/config'`；③ `provider="prisma-client"` + `output` 必填；④ 用 `.mjs` 不用 `.ts`
- 运行时**不再读 DDL**：`src/db/tableMeta.js` 启动解析 schema.prisma 得列清单（`SPECIAL_SELECT`/`ECYILANG_COLUMNS`/`FLIGHT_TABLES`）→ **加删列只改 schema.prisma 一处**。`server.js` 已去掉 `initDb()`，启动不建表、**孤儿清理也随之下线**
- 库内 4 个自定义函数不在 Prisma 视野：`base_flight_uuid` / `flight_no_variants` / `try_date` / `resolve_flight_uuid`（src 有 9 处调用），固化在 `prisma/migrations/0_init/migration.sql`。已有库要 `prisma migrate resolve --applied 0_init`，**别直接 deploy**
- `db_seed/` = 用户自己挪出来的暂存目录（`src/db/{schema,specialSchema,ecyilangSchema,flightRefSchema,nameCodeSchema}.js`、`src/db/*.json`、`tools/`、`data/schema.sql`、`flight_info.sql`）。**src/db/ 现在只有 `pool.js`**，后端起不来先看这里

## 3. 数据口径（改 SQL 前必读）
- **`resolve_flight_uuid(callsign, day)` 是航班匹配唯一口径**，`ORDER BY dist, prio, fuuid`：日期只当 tiebreaker（ecyilang 与台账区间常不重叠，硬卡同一天会一条都挂不上），优先级 ecyilang > fips > manual_fips，最后按 uuid 定序。配套 `flight_no_variants(text[])`（IATA↔ICAO + `&&` 交叠）、`try_date`、`base_flight_uuid`（剥 `-d`/`-a` 航段后缀）
- **别再用 `ORDER BY id` 当业务顺序**（uuid 后顺序永久消失，11 种候选键都还原不出）。已统一按航班时间：fips `sobt,atot,flight_no` / manual_fips `aldt,sobt,flight_no` / ecyilang `批次日期,COALESCE(d_plan_time,a_plan_time),航班号`。FipsPage 默认顺序完全由后端决定
- **⚠️ PG 占位符只能有一种推断类型**：同一 `$n` 出现在两种类型上下文（varchar vs text 都够）→ `inconsistent types deduced for parameter $1`。修法：**拆成两个占位符传同一个值**（实例：`specialService` 的 `$1`→`$4`；`syncChecklistUuid` 的 `WHERE id = $2::uuid` 与 `$1::text` 分开）。表达式间转换没问题，只有参数严格
- **⚠️⚠️ 写入关口（曾差点自毁数据）**：`createRecord` 收到前端字段 `flightId`（名没改，**值必须真 uuid**）先过 `flightService.resolveFlightRef()` —— 只接受标准 uuid（可带 `-d`/`-a`）且必须存在于三表之一，否则 400。历史病根：`buildPayload` 发 `s.flight.id`（曾是数字）→ 存进去被启动清理**静默删除**。**原则：宁可写入报错，绝不放行非法值**。所有按主键的 service 都要 `UUID_RE` 守卫，否则非 uuid 参数变 500 而非 404
- 列顺序：`special_records`/`checklist_records` 的 `flight_uuid` 在第 2 列；`fips.checklist_uuid` 存 `checklist_records.id`（也是 uuid）

## 4. 检查单业务口径（2026-09-22 用户定稿）
- **一航班允许任意多份检查单**：不做 `(flight,category)` 唯一、POST 不返 409。「创建就是创建」。`checklist_uuid` 只是"最近一份"展示标记，**不承担唯一性**（别再造"已有检查单禁止新建"的 gate）
- **新建/更新/删除三分**：POST **永远 INSERT**（原 upsert 是病根，已删）、PUT 只改 `:id`、DELETE 只删 `:id`。每次增删改后 `syncChecklistUuid()` 遍历 **`CHECKLIST_LINK_TABLES=['fips','manual_fips']`**（**不是** FLIGHT_TABLES —— `ecyilang` 没有 `checklist_uuid` 列，写进去直接报错），用 `base_flight_uuid()` 比对，重算为该航班最新一份 id。原 `parseFlightRef`（认 `fips-1`/`manual-1`/裸数字）**已删除**
- **创建链路**：FipsPage「创建检查表」= `reset()` + `navigate('/checklists/flight/'+f.uuid)`；装载全部交给编辑器按 URL 调 `openFlight`。草稿键 = **`{航班uuid}::{类型名}`**（复合键 `draftKeyOf`）。提交后清理 = `removeDraftsByFlight` + `removeIdbDraftsByFlight`
- **24h 锁定**：后端 `EDIT_LOCK_HOURS=24` 抛 409；前端 LOCK_HOURS 只在 checklistStore

## 5. 前端结构
- 路由（Outlet 化，`MainPageLayout` 渲染导航+`<Outlet/>`，**不收 children**）：`/`→/fips · `/fips`(FipsPage，原 FlightSchedulePage 已并入) · `/checklist`(兼容 `/checklists`) 草稿工作台 · `/checklists/flight/:flightId` 编辑器（`?record=<id>`=修改，不带=新建，`?checkTemplate=1~5` 指定类型）· `/checklists/:checkedId` ChecklistViewer 直挂 · `/records` 填写记录页（日期口径=**创建日 created_at**）· `/special` SpecialPage · 兜底 /fips
- FlowChart 唯一位置 `pages/FipsPage/flowchart/FlowChart.jsx`；布局在 `src/Layout/{MainPageLayout, ContentLayout}`
- **URL 是唯一驱动源**：编辑器 effect 读 `:flightId`+`?checkTemplate`/`?record` → 有 record 走 `openRecordForEdit`，否则 `openFlight`；类型下拉**只写 URL**，不直接调 switchChecklistType
- ChecklistPage 结构：`index.jsx` / `ChecklistEditor.jsx` / `hooks(useTimeFormulas·useRegister)` / `Components(CheckComponents×6·OtherComponents×6·ToolBar/→Toolbar.jsx)` / `Template(XxxFlight×5 + EditorTemplateJson×8 + ViewTemplateJson×15)`；深度规则到 src 层级，`Components/*` 5 层、`ToolBar/Components/*` 6 层
- 查看页：三个零 props 组件 `MainCheckList`/`AuxiliaryCheckList`/`VideoCheckList` + 外壳 `ViewListShell` + `statusView.jsx`；树→一维在**编译期**拍平（`gen-view-static.cjs` 生成 ViewTemplateJson 的 5类型×3列表=15 个文件），列表只 `rows.map`。`utils/ViewColor.js` 是查看页**唯一配色源**（异常 `#dc2626` 红，其余暂统一灰 `#64748b`），一律 inline style
- **零 props / 非受控**：组件自订阅 store，表单仿 RHF `{...register("time")}` DOM 持值。`useRegister` 必须保留「values→推回 DOM」effect（判据 `el.value!==v`），删了公式引擎的值就不显示
- **重渲染约定**：面板组/编辑器/入口**不得订阅 items/videoItems**；单项用 `useXxxItem`，全量用 `useDraftVersion`。逐项 setter 只换目标 key
- 类型体系：`TYPE_COLORS/TYPE_ORDER/typeColorOf/typeOfCheckTemplate` 都在 checklistStore（唯一定义处），五色 `#059669/#0891B2/#7C3AED/#D946EF/#6B2608`，键=模板 id=category=落库 `checklist_category`。**禁 Tailwind 动态拼接类名** → inline style。新增类型 = EditorTemplateJson + Template + TYPE_COLORS + import 映射 + 跑 `gen-view-static.cjs` 补三份视图数据 + 三个 List 映射
- **FipsPage 表头配置**：列清单唯一来源 `store/fips.store.js` 的 `BASE_COLUMNS`（14 列，顺序=默认 colOrder）；视图键 `all/in/out`；每列 `{key,label,isHide,colOrder}`；persist key `flight-dispatch:fips:table-headers`，`partialize` 只存 `tableHeaders`；交互 `beginEdit→toggleDraft/moveDraft/showAllDraft/resetDraft→confirmEdit|cancelEdit`，切视图必须 `cancelEdit()`。**编辑态取消勾选只压暗不消失**（否则列没了没法勾回），编辑态禁用表头排序。`renderEmpty(colCount)` 的 colSpan 必须传当前列数。tooltip 词典 `utils/shortCutFullNameTooltip.js`。命名例外：其余 store 都是 `xxxStore.js`，唯独这个叫 `fips.store.js`

## 6. 草稿与截图
- 草稿层 `checklistDraft.js`：内存 `{flightId,flightNo,templateId,items,videoItems,inspector}` → 800ms 防抖写 IndexedDB（`flight_dispatch`/`checklist_drafts`，**DB v2 keyPath 'key'**）+ localStorage 草稿箱索引（≤5，按 key 唯一）。**后端无草稿态**
- ⚠️ 三个已修坑：①`hasContent()` 只看 items → 只填视频项/只贴图时草稿不落盘（现计入 videoItems）；②签名 `contentSig()` 序列化要**摘掉 blob**（`JSON.stringify(Blob)={}` 会漏判换图）；③写 localStorage 用 `boxSnapshot()` 剥 image 二进制，**items 与 videoItems 都要剥**
- **截图体系**：每项最多 1 张 `image={id,name,type,size,blob?,url?}`。`components/BaseCheckInput.jsx`（粘贴/点选/拖拽/替换/删除/大图，受控）+ `components/CheckImage.jsx`（填写端与查看端共用）+ `utils/checkImage.js`。**禁止 Base64**：blob 直接进 IndexedDB、上传走原始二进制
- **⚠️ objectURL × StrictMode**：dev 下 effect 挂载→卸载→再挂载，若卸载时**同步** `revokeObjectURL`，首次出现的那张图 URL 就废了（现象=「粘贴的图永远没预览」）。修法 `revokeLater(url)` 用 `setTimeout(…,0)` 推迟 + 重挂时 `keepAlive(url)` 取消。**凡渲染期建 objectURL 一律照此办理**
- 上传：`POST /api/checklists/uploads?name=` body=原始字节（`express.raw({type:'image/*'})`，不用 multer）→ 存 `data/uploads/`，文件名服务端自造 → `{url:'/api/uploads/xxx.png'}`。静态托管挂 `/api` 前缀下（vite 代理和 nginx 都只反代 /api，无需改配置）。上限 8MB。**提交时才上传**（`uploadDraftImages` 扫 items+videoItems，失败即中止落库）

## 7. 验证手法（没有测试框架）
- 首选 `vite build` EXIT 0；更强用根目录临时 `.mjs` **SSR 探针**（`ssrLoadModule` 加载 store/组件 + **原生** `import('react-dom/server')` + `renderToStaticMarkup(createElement(C))`，**必须 createElement**）。要让订阅 zustand 的组件跑起来：用插件 `resolveId`（`enforce:'pre'`）把 `store/checklistStore` 换成无 hooks 选择器桩（**不能用 resolve.alias**）
- 页面实测用系统 Chrome 无头：`--headless=new --virtual-time-budget=9000 --screenshot=x.png URL`（断言 DOM 换 `--dump-dom`，出现 `vite-error-overlay` = 页面报错）
- 真交互用内置 CDP（零依赖，Node 22 自带 WebSocket）：`--remote-debugging-port=9222` → `/json/list` 拿 ws → `Runtime.evaluate{awaitPromise:true}`。能造粘贴事件、触发受控输入 onChange、读页内 IndexedDB、`DOM.setFileInputFiles`。⚠️ React 同 tick 连点两下会拿旧 props（分次 evaluate）；CDP 临时 profile 目录用完要删
- 环境坑：bash shim 常挂（dirname/tail not found）但 `node -e` 可用；PowerShell 吞 stdout；用户编辑器可能把旧缓冲回写磁盘 → **改完必须重读核对**

## 8. 部署（阿里云）
- nginx `backend/nginx/sites-available/dd.atc1215.cn.conf`：前端 dist + `/api/` 反代 5183（proxy_pass **不带尾斜杠**），**必须 `client_max_body_size 20m`**（默认 1m 会让 8MB 截图 413）。只开 80/443，5183 别对公网
- 回滚备份在 `D:/GitHub/_backup_flight_dispatch_20261003_*.sql`；`V5-dispatch/flight_info.sql` 是 MySQL 老文件（对应表已删），**保留作原始数据唯一副本别删**
- 交付物在 `frontend/flight-dispatch-system/资料/`：`flight_dispatch_full_20260923.sql`（**2026-09-23 快照，只有 6 表，需重新导出**）+ `import_flight_dispatch.sh`

## 9. 数据库导入导出（2026-10-26 新增）
- `V5-dispatch/data/flight_dispatch_export/`：`flight_dispatch.sql`（**旧结构**转储，只有 flights/fips/checklist_records 三表、整数主键）+ `import_flight_dispatch.sh`(Linux) + **`import_flight_dispatch.ps1` / `.cmd`(Windows，本次新增，已实测)** + `README.md`
- Windows 用法：`.\import_flight_dispatch.ps1 -DbName <库名> -PgPassword admin`（密码留空则依次取 `$env:PGPASSWORD`→后端 .env→交互）。脚本会自找 psql、缺库自动建（UTF8）、**目标库已有表默认拒跑**（否则 COPY 把数据再追加一遍）、`PGCLIENTENCODING=UTF8`+`ON_ERROR_STOP=1` 导入、最后打印行数
- **⚠️ Windows 专有坑**：PS 5.1（以及 Git Bash）把参数交给原生 exe 时按系统 ANSI(GBK) 转码 → `psql -c "...中文..."` 必报「无效的 UTF8 编码字节顺序」。**带中文的 SQL 一律走 `-f` 文件或 stdin heredoc，不要塞进 `-c`**。`psql -f` 本身没问题（设了 PGCLIENTENCODING 就行），README 里"必须用 `<` 重定向"的旧说法已更正
- ⚠️ 这份转储**不能**让当前后端跑起来（结构对不上，见第 1 条），只当历史数据源
