# 航班调度检查系统 —— AI 对话继续指南（continue.md）

> 把本文件内容完整提供给新的 AI 对话，即可无缝继续本项目开发。
> **更新至 2026-08-30**。全栈项目：React 前端 + Express/PostgreSQL 后端，pnpm monorepo。
> ⚠️ 路径以各电脑实际仓库位置为准（本文默认 `.../All-js-project`），下文一律用相对路径。

---

## 1. 项目一句话

鄂州（ZHEC）机场「航班调度检查系统」：调度员在**航班列表页**管理手动添加的航班（manual_fips，可标记生鲜），按**创建日期**筛选、三态视图（全部/进港左离港右/离港左进港右）；点「创建检查表」进入**检查单页**，按节点填写检查项（主要监控指标 main / 辅助监控指标 auxiliary(time) / 视频监管 video），支持 5 种检查单类型切换（顺航/始发货航/过站货航/始发客运/过站客运，各配 5 色）；填写记录可回溯查询（日历按创建日期标数量、异常标红）。

## 2. 仓库位置与技术栈

Monorepo（pnpm workspace）：`All-js-project`

| 端 | 路径 | 技术栈 |
|---|---|---|
| **前端** | `packages/frontend/flight-dispatch-system` | React 19 + Vite 7 + Zustand（persist）+ TailwindCSS + Radix UI + react-day-picker v9 + lucide-react + dayjs |
| **后端** | `packages/backend/full-web-backend/V5-dispatch` | Node 22 + Express + PostgreSQL（pg 驱动，ESM） |

- 前端端口 **5173**（Vite 代理 /api → 5183）；后端端口 **5183**
- 数据库：`flight_dispatch`（`PG_USER=postgres PG_PASSWORD=admin`，在 `V5-dispatch/.env`）
- 预置数据：`V5-dispatch/scripts/init_seed.js`（10 架航班 + 4 份已填检查单）

## 3. 启动方式（注意 server.js 在根目录！）

```bash
# 后端（5183）—— server.js 在 V5-dispatch 根目录，不在 src/ 下！
cd packages/backend/full-web-backend/V5-dispatch
NODE_OPTIONS=--use-system-ca node server.js

# 前端（5173）
cd packages/frontend/flight-dispatch-system
pnpm dev
```

后端改动需**重启**；前端 Vite 热更新。

## 4. 前后端目录结构

**后端 `V5-dispatch/`**：

```
server.js                # 入口（根目录！Express + 中间件）
src/
  config/index.js        # 配置（端口、PG 连接）
  db/schema.js           # 建库建表（幂等，启动自动执行）
  db/pool.js             # PG 连接池
  routes/                # index.js 汇总：flight/checklist/manualFips/freshAirCargo
  controllers/           # HTTP 语义层（参数校验、404）
  services/              # fips/flight/manualFips/freshAirCargo/checklist/template
  utils/                 # asyncHandler / mapper / time / airports
data/checklists/*.json   # 检查单模板（cargo-checklist / passenger-checklist / new-test2 / passage-checklist1）
scripts/                 # init_seed.js / excel_to_tree.py / excel_passenger_to_tree.py
```

**前端 `src/`**：

```
pages/
  FlightSchedulePage/            # 航班列表（manual_fips + 生鲜 + 三态视图 + 创建日期筛选）
    components/AddFlightDialog.jsx   # 添加/修改航班（含航班类别下拉、大写约束、跑道四选一）
    components/Sidebar.jsx            # 左侧边栏（搜索+日期+增删改+生鲜按钮）
    old.jsx                           # 旧 fips 列表实现（保留参考，不删）
  ChecklistPage/                 # 检查单填写页（品字布局 + 小地图 + 滚轮横滚）
    components/（ChecklistToolbar / MainMonitoringPanel / AuxiliaryPanel / VideoPanel /
                DraggableThumb / DraftDropdown / FlightInfoCard / statusBadge）
    checklistTypeConfig.js            # ★ 5 种检查单类型配置 + 默认类型前缀规则（可编辑）
    useTimeFormulas.js                # v3 公式时间计算（formula 表达式）
  ChecklistSelectPage/           # 检查单工作台（草稿箱）
  RecordsPage/                   # 填写记录（日历 dayMarkers 按创建日期统计）
  FreshGuaranteePage/            # 生鲜保障（占位，路由 /fresh）
  FlowchartPage/                 # 独立展示页
components/
  PageLayout.jsx                # ★ 页面外壳：顶部导航（路径驱动高亮）
  layout/ContentLayout.jsx      # ★ 页面内容区（sidebar 可选 + children）
  search/FlightSearchCard.jsx   # 搜索卡（含生鲜 Badge 筛选）
  ui/DateFilterPanel.jsx        # 日期选择（今天蓝字加粗、当前月加粗）
  ui/FlightNoInput.jsx          # 航班号大写组件
  flowchart/FlowChart.jsx       # 节点流程图（mini/full）
store/
  tabsStore / draftStore / checklistStore / manualFipsStore   # ★ manualFipsStore 管理 manual_fips
api/index.js  # flightsApi/checklistsApi/fipsApi/manualFipsApi/freshAirCargoApi
AI/continue.md  # 本文件
```

## 5. 数据库设计（5 张表）

| 表 | 用途 | 关键字段 |
|---|---|---|
| `flights` | 预置/演示航班 | id, flight_no, category, has_checklist… |
| `checklist_records` | 检查单填写记录 | flight_id, header JSONB（含 template 元信息）, items JSONB, video_supervision JSONB, status(draft/submitted), flight_date |
| `manual_fips` | **手动添加航班** | id, task, flight_no, origin/dest/landing_station, in_out_time, sobt/eobt/atot/sibt/eldt/aldt, corridor, runway, stand, aircraft_type, **checklist_category**, **checklist_uuid** |
| `fips` | 历史航班（只读） | 同 manual_fips 结构 + **checklist_category / checklist_uuid**（幂等 ALTER 补列） |
| `fresh_air_cargo` | **生鲜标记关联表** | id, `manual_fips_id` UNIQUE FK(CASCADE), content JSONB（预留） |

**2026-08-23/24 新增**：`checklist_category`（货运航班/客运航班，决定检查单模板）+ `checklist_uuid`（模板 UUID，暂空）。`getManualFlight` 的 category **读 checklist_category**（不再硬编码货运）。

## 6. ⭐ 检查单模板结构（两种并存，前端双兼容）

**新结构（v3，cargo-checklist.json / new-test2.json / passage-checklist1.json）**：

```json
{
  "uuid": "...", "category": "货运航班", "checklistName": "常规航班", "schemaVersion": "3.0-test",
  "variables": { "ctot": {...}, "aircraftType": {...} },     // v3 公式变量
  "parameters": [ { "code": "STAIR_CONNECT", "values": {"B747": 120, ...} } ],  // 机型→分钟 查表
  "schema": [
    {
      "id": 2, "uuid": "...", "eventId": "E002", "code": "STAIR_CONNECT",
      "category": "main",            // main=时间节点；video=视频分组（无 formula）；guarantee=汇总
      "name": "客梯车对接", "desc": "标准要求...",
      "formula": { "type": "binary", "operator": "-",
        "left": {"type": "ref", "target": "var", "ref": "ctot"},
        "right": { "type": "lookup", "param": "STAIR_CONNECT",
                   "key": {"type": "ref", "target": "var", "ref": "aircraftType"} } },
      "auxiliaries": [ { "id": 3, "uuid": "...", "type": "time", "name": "...", "desc": "...",
                         "timeLink": {"refUuid": "", "refId": 2, "offsetMinutes": -5, "calcLogic": "and"} } ],
      "videoSupervision": [ { "id": 4, "uuid": "...", "type": "video", "name": "", "desc": "...", "group": "..." } ]
    }
  ]
}
```

**要点**：
- 顶层 `schema` 数组；main 节点带 `formula`（v3 公式树：binary/ref/lookup/literal）
- 旧结构（passenger-checklist.json）：`flightTypes`（{航空器始发:13, 航空器过站:17, 航后阶段:1}）+ `phaseOrder` + `videoSupervisionGroups` + `phaseNotes`，节点含 responsible/category
- 前端取节点键统一：`n.id ?? n.source?.seq ?? n.seq`；nodes = `template.schema || template.flightTypes?.[activeType]`

## 7. API 清单

```
GET  /api/health
GET/POST/PUT/DELETE  /api/manual-fips[/:id]      # 手动航班增删改查（含 checklist_category）
GET/POST/DELETE      /api/fresh-air-cargo[/mark/:manualFipsId]  # 生鲜标记
GET  /api/flights[/:id]      # id 支持 fips- / manual- 前缀
GET  /api/checklists/templates[/:id] / records[/:id]
POST /api/checklists/records                 # 创建记录（header 已注入 template 元信息）
PUT  /api/checklists/records/:id             # 更新记录
DELETE /api/checklists/records/:id           # 删除记录（清理测试/误建）
GET  /api/fips/:id           # fips 原始行详情
```

## 8. ⭐ 5 种检查单类型（checklistTypeConfig.js —— 新增核心）

`src/pages/ChecklistPage/checklistTypeConfig.js` 集中管理：

```js
export const TYPE_BUTTONS = [
  { label: "顺航检查单",     routeId: "template1", tplId: "cargo-checklist",    flightType: "常规航班",
    dot: "bg-green-500",  activeCls: "border-green-400 bg-green-100 text-green-800",
    textCls: "text-green-800", titleCls: "text-green-800" },
  { label: "始发货航检查单", routeId: "template2", tplId: "cargo-checklist",    flightType: "始发航班", ... purple },
  { label: "过站货航检查单", routeId: "template3", tplId: "cargo-checklist",    flightType: "过站航班", ... cyan },
  { label: "始发客运检查单", routeId: "template4", tplId: "passenger-checklist", flightType: "航空器始发", ... teal },
  { label: "过站客运检查单", routeId: "template5", tplId: "passenger-checklist", flightType: "航空器过站", ... lime },
];
// 默认类型规则（可配置）：航班号前缀 → 检查单类型
export const CHECKLIST_TYPE_PREFIX_RULES = { "顺航检查单": ["CSS"] };   // CSS 开头→顺航
export const DEFAULT_CHECKLIST_TYPE = "过站货航检查单";                  // 其他→过站货航
export const resolveDefaultType = (flightNo) => {...};
```

- **5 色**：顺航=green / 始发货航=purple / 过站货航=cyan / 始发客运=teal / 过站客运=lime（样式 `bg-*-100 text-*-800`）
- 检查单页标题航班号+类型名同色；工具栏下拉切换（ChecklistToolbar），切换只清填写数据（`useChecklistStore.setState({items:{},videoItems:{},currentStep:null,recordId:null})`），**不 reset flight/header**（避免整页重渲染）
- cargo 模板是 v3 单 schema（14 节点），三个货运类型目前共用同一节点集；客运按 flightTypes[activeType]

## 9. 关键约定与坑（务必先读）

1. **布局命名**：`components/PageLayout.jsx`=页面外壳（顶部导航）；`components/layout/ContentLayout.jsx`=页面内容区（`sidebar` 可选，不传则全宽）；页面私有 Sidebar 放 `pages/xxx/components/Sidebar.jsx`
2. **节点定位键**：`n.id ?? n.source?.seq ?? n.seq`；前端统一 `getNodeId`
3. **中国时区取本地日期**不能用 `toISOString().slice(0,10)`（差一天），用本地格式化（dayjs(ts).format("YYYY-MM-DD")）
4. **React 19 onWheel 默认 passive**：要 preventDefault 必须原生 `addEventListener('wheel', fn, { passive: false })` + callback ref
5. **lucide-react 无 `LeafOff`**，取消类图标用 `Ban`
6. **模板 JSON 不要用编辑器/Write 工具直接改**（沙箱写保护 EPERM），用 Python 脚本；JSON 不允许注释/尾逗号
7. **航班列表默认类型**：CSS 开头→顺航，其他→过站货航（checklistTypeConfig 配置）；客运航班→模板首个 flightTypes
8. **记录页 dayMarkers 按创建/检查日期**（checked_at/created_at 本地日）统计，异常 items.status==='abnormal' 标红；**日期过滤兼容 flight_date IS NULL**（手动航班始终可见）
9. **草稿箱**：检查单页只在 items 有内容时写入草稿（`hasContent` 判断，避免空草稿）；提交成功后 removeDraft
10. **时间字段**（sobt/aldt 等）为本地时间字符串（LOC），后端只存不转时区
11. 页面高度 `h-[calc(100vh-90px)]`（内容区）；航班列表选中行深蓝 `bg-primary-600 text-white`
12. **data/checklists/ 下有用户临时文件**（cargo-checklist copy.json / todochekc.json 损坏）——loadTemplates 容错跳过，**不要删除**；新增模板用规范文件名
13. **后端 server.js 在根目录**；数据库改动用幂等 ALTER（重启生效）
14. 保存/草稿的 items 键：`main-${id}` / `aux-${a.id}` / `video-${v.uuid}`；header 保存时注入 `template:{uuid,category,checklistName,schemaVersion}`
15. **航班列表路由**：`/` 与 `/fips` 均渲染 FlightSchedulePage（fips tab 在两者都高亮）

## 10. 已实现功能清单（截至 2026-08-30）

- **航班列表页**：manualFipsStore 数据源；按创建日期筛选（DateFilterPanel 全局日期，日期变更清空选中行）；三态视图（全部单表全列 / 进港左离港右 / 离港左进港右，进港=landing||dest==ZHEC、离港=origin==ZHEC，双表去对应机场列）；手动航班 CRUD + 生鲜标记；AddFlightDialog（航班类别下拉、起飞/目的/落地站大写字母、走廊口/停机位大写+数字、跑道 01L/01R/19L/19R 下拉）
- **检查单页**：ChecklistToolbar 组件化（标题+操作+类型下拉）；5 种类型切换（5 色）；标题同色；品字布局 + 小地图 + 滚轮横滚 + 节点联动 banner；v3 公式时间计算（useTimeFormulas）；草稿自动同步（有内容才写）
- **填写记录页**：dayMarkers 按创建日期、异常标红；日期过滤兼容无日期航班；DELETE 记录接口
- **生鲜保障页**：FreshGuaranteePage 占位（/fresh）
- **客运模板**：passage-checklist1.json（航空器始发 13 main + 2 video 分组 + 1 guarantee，按 new-test2 格式）
- **后端**：manual_fips/fips 加 checklist_category + checklist_uuid；getManualFlight 透传 category；listRecords 日期兼容；DELETE /records/:id

## 11. 尚未完成 / 下一步方向

- **货运始发/过站模板**：cargo 目前只有 v3 单 schema（常规 14 节点），始发货航/过站货航类型需要对应节点模板（可参考客运 flightTypes 结构扩展）
- **timeLink 前端联动**（旧结构）：参照指标输入后自动带出关联节点时间——仍未实现
- 视频监管截图上传（图片表 checklist_images 规划：UUID/ID 关联 videoSupervision 项）、货运考核指标（Sheet3/4）、客运 phaseNotes 细分界面化
- 生鲜保障页（/fresh）具体流程；`fresh_air_cargo.content` JSON 结构未定义
- 独立展示页 FlowchartPage 主体内容

## 12. 给 AI 的提示

- 后端改动重启（5183）；前端 Vite 热更新；验证 API 用 curl（后端 5183）
- 新增路由遵循 routes → controllers → services → db/schema.js 分层；前端公共布局用 ContentLayout
- 数据库改动用 `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE ADD COLUMN IF NOT EXISTS`（幂等，重启生效）
- 改模板 JSON 用 Python 脚本（勿用 Write 工具）；用户要求"值先可为空"的字段先落库不强制
- 参考文件：`checklistTypeConfig.js`（类型配置）、`manualFipsStore.js`（列表 store 模式）、`ChecklistToolbar.jsx`（组件化范例）
