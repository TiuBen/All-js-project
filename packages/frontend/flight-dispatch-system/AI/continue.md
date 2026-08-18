# 航班调度检查系统 —— AI 对话继续指南（continue.md）

> 把本文件内容完整提供给新的 AI 对话，即可无缝继续本项目开发。
> 更新至 2026-08-18 项目状态，涉及**前后端分离**的全栈项目。

---

## 1. 项目一句话

鄂州货运机场「航班调度检查系统」：调度员在航班列表页管理手动添加的航班（可标记生鲜），进入检查单页按节点填写检查项（主要监控指标 / 辅助监控指标(time) / 视频监管检查重点(video)），节点时间支持 timeLink 联动自动带出，进度用流程图小地图展示，填写记录可回溯查询。

## 2. 仓库位置与技术栈

Monorepo（pnpm workspace）：`C:\Users\HJW-AMD-PRP\Documents\GitHub\All-js-project`

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
data/checklists/*.json   # 检查单模板（cargo-checklist.json / passenger-checklist.json）
scripts/                 # init_seed.js / excel_to_tree.py 等
```

**前端 `src/`**：

```
pages/
  FlightSchedulePage/        # 航班列表（手动航班 + 生鲜标记）
    components/AddFlightDialog.jsx   # 添加/修改航班对话框（fips 16 字段）
  ChecklistPage/             # 检查单填写页（品字布局 + 小地图 + 滚轮横滚）
    components/（DraftDropdown / FlightInfoCard）
  ChecklistSelectPage / RecordsPage / FlowchartPage
components/
  layout.jsx                 # 顶部导航（高亮 = location.pathname 驱动）
  layout/PageLayout.jsx      # 公共页布局（sidebar 插槽 + children）
  search/FlightSearchCard.jsx# 搜索卡（含生鲜 Badge 筛选）
  ui/DateFilterPanel.jsx / ui/FlightNoInput.jsx（航班号大写组件）
  flowchart/FlowChart.jsx    # 节点流程图（mini/full）
  checklist/DraggableThumb.jsx
store/  tabsStore / flightsStore / checklistStore / draftStore
api/index.js  # flightsApi/checklistsApi/fipsApi/manualFipsApi/freshAirCargoApi
AI/continue.md  # 本文件
```

## 5. 数据库设计（4 张表）

| 表 | 用途 | 关键字段 |
|---|---|---|
| `flights` | 预置/演示航班 | id, flight_no, category, has_checklist… |
| `checklist_records` | 检查单填写记录 | flight_id, items JSONB, video_supervision JSONB, status(draft/submitted) |
| `manual_fips` | **手动添加航班**（16 字段对齐 fips 表） | id, task, flight_no, origin/dest/landing_station, in_out_time, sobt/eobt/atot/sibt/eldt/aldt（LOC 时间字符串）, corridor, runway, stand, aircraft_type |
| `fresh_air_cargo` | **生鲜标记关联表** | id, `manual_fips_id` UNIQUE FK(CASCADE), content JSONB（预留） |

生鲜用**关联表**（UNIQUE 一航班一标记，content JSON 独立）。`manualFipsService.listManualFips()` LEFT JOIN → 附带 `is_fresh` + `fresh_content`。

## 6. ⭐ 检查单模板 JSON 新结构（cargo-checklist.json —— 最重要）

**2026-08-18 重构完成**，与旧结构（flightTypes + seq + auxiliary 嵌套）**不兼容**，前端已全部适配（双兼容可读旧模板）：

```json
{
  "uuid": "8a942e2f-...",
  "category": "货运航班",
  "source": "货运航班节点保障及合规性监控检查单.xlsx",
  "generatedAt": "2026-08-06T13:59:38",
  "checklistName": "常规航班",
  "schema": [
    {
      "id": 2,
      "uuid": "35c6f11f-...",
      "name": "入位",
      "desc": "实际落地时间+10分钟",
      "timeLink": { "refUuid": "...", "offsetMinutes": 10 },   // main 的 timeLink（对象或数组）
      "auxiliaries": [
        {
          "id": 3, "uuid": "...", "type": "time",
          "name": "机务到位", "desc": "入位时间-5分钟",
          "timeLink": { "refUuid": "", "refId": 2, "offsetMinutes": -5, "calcLogic": "and" }
        }
      ],
      "videoSupervision": [
        { "id": 4, "uuid": "...", "type": "video", "name": "", "desc": "...", "group": "视频监管检查重点（入位前检查）" }
      ]
    }
  ]
}
```

**结构要点**：
- **顶层**：`schema`（节点数组，替代旧 `flightTypes`）+ `checklistName`（单航班类型）
- **main 节点**：`id`(全局唯一 1~65) + `uuid` + `name` + `desc` + `timeLink` + `auxiliaries[]` + `videoSupervision[]`；**没有** source/type
- **auxiliaries 元素**（type: `"time"`）：id/uuid/name/desc + `timeLink{refUuid, refId, offsetMinutes, calcLogic}`（无 source）
- **videoSupervision 元素**（type: `"video"`）：id/uuid/name/desc/group（无 source）
- **timeLink 语义**：参照指标输入时间后，本节点时间 = 参照时间 + offsetMinutes（可负）；`calcLogic: "and"` 为多参照组合逻辑（预留）
- passenger-checklist.json 仍是旧结构（flightTypes），前端**双兼容**读取

## 7. API 清单

```
GET  /api/health
GET/POST/PUT/DELETE  /api/manual-fips[/:id]      # 手动航班增删改查
GET/POST/DELETE      /api/fresh-air-cargo[/mark/:manualFipsId]  # 生鲜标记
GET  /api/flights[/:id]      # id 支持 fips- / manual- 前缀
GET  /api/checklists/templates[/:id] / records[/:id]
GET  /api/fips/:id           # fips 原始行详情
```

## 8. 已实现功能清单（截至 2026-08-18）

- **航班列表页**：手动航班 CRUD + 生鲜标记/筛选 + 添加对话框（fips 16 字段，时间标「LOC 时间」、航班号大写过滤）+ 行选中 + 搜索卡生鲜 Badge（点击筛选、颜色表示选中、不可删除）
- **检查单填写页**：品字布局（主要监控横向卡片流 + 辅助 time + 视频 video 并排）；滚轮横滚（wheel passive:false + scrollBy smooth 0.65）；右下角可拖动小地图；点击节点联动（currentStep + 锚点 + 顶部 banner fixed）；**已适配新模板结构（schema/id/videoSupervision 顶层，getNodeId = n.id ?? n.source?.seq ?? n.seq）**
- **填写记录页**：日期筛选 + 关键词 + 状态展示
- **公共布局 PageLayout**（sidebar 插槽）；**导航高亮路径驱动**（location.pathname）
- **FlightNoInput 组件**：航班号强制大写 + 仅 A-Z0-9（中文/符号忽略）
- **timeLink 数据已配**（cargo 常规航班 10 个 main 节点 + 用户已填部分 auxiliaries 引用），前端联动逻辑未实现
- **模板容错**：后端 loadTemplates 单文件解析失败跳过（不 500）

## 9. 关键约定与坑（务必先读）

1. **节点定位键**：`n.id ?? n.source?.seq ?? n.seq`（新结构用 id；旧结构 seq 兼容）。前端已统一为 `getNodeId`（ChecklistPage）/ `p.id ?? p.source?.seq ?? p.seq`（FlowChart）
2. **中国时区取本地日期**不能用 `toISOString().slice(0,10)`（差一天），用本地格式化（tabsStore localDateStr）
3. **React 19 onWheel 默认 passive**：要 preventDefault 必须原生 `addEventListener('wheel', fn, { passive: false })` + callback ref 绑定
4. **lucide-react 无 `LeafOff`**（export 错），取消类图标用 `Ban`
5. **模板 JSON 不要用编辑器/Write 工具直接改**（沙箱写保护 EPERM），用 Python 脚本改；**JSON 不允许注释和尾逗号**（用户手动编辑易引入，需清理：`re.sub(r',\s*([}\]])', r'\1', text)`）
6. 手动航班跳检查单 `/checklist/manual-${id}`；后端 getFlight 对 manual- 前缀查 manual_fips 构造兼容对象（category='货运航班'、destination='鄂州'）
7. 生鲜标记 POST `/fresh-air-cargo/mark`（upsert）+ DELETE `/fresh-air-cargo/mark/:manualFipsId`；is_fresh 由 LEFT JOIN 附带
8. 时间字段（sobt/aldt 等）为本地时间字符串（LOC），后端只存不转时区
9. 页面高度约定 `h-[calc(100vh-90px)]`；检查单页 `h-[calc(100vh-112px)]`
10. **data/checklists/ 下有用户临时文件**（`cargo-checklist copy.json` / `todochekc.json` 损坏）——loadTemplates 已容错跳过，**不要删除**（用户文件），如新增模板请用规范文件名
11. **后端 server.js 在根目录**（不在 src/）；启动 `node server.js`
12. 保存/草稿的 items 键：`main-${id}` / `aux-${a.id}` / `video-${v.uuid}`

## 10. 尚未完成 / 下一步方向

- **timeLink 前端联动**：模板已配好，检查单页输入某节点时间后自动带出关联节点时间（手动优先）——核心待办
- 涉及"机型标准作业时长"的动态偏移（卸机完成/开始装机/装机完成）未结构化（durationRef 或机型时长映射表）
- 视频监管截图上传、货运考核指标（Sheet3/4）、客运 phaseNotes 界面化
- 独立展示页（FlowchartPage）主体内容、生鲜航班检查单特殊流程
- `fresh_air_cargo.content` JSON 内容结构未定义

## 11. 给 AI 的提示

- 后端改动重启（5183）；前端 Vite 热更新
- 新增路由遵循 routes → controllers → services → db/schema.js 分层；前端公共布局用 `PageLayout`
- 数据库改动用 `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE ADD COLUMN IF NOT EXISTS`（幂等，重启生效）
- 验证 API 用 curl（后端 5183）；改模板 JSON 用 Python 脚本
