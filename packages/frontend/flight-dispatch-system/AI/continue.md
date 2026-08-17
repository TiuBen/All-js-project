# 航班调度检查系统 —— AI 对话继续指南（continue.md）

> 把本文件内容完整提供给新的 AI 对话，即可无缝继续本项目开发。
> 本文档由 2026-08-17 的项目状态整理，涉及**前后端分离**的全栈项目。

---

## 1. 项目一句话

鄂州货运机场「航班调度检查系统」：调度员在航班列表页管理手动添加的航班（可标记生鲜），进入检查单页按节点填写检查项（主要监控指标 / 辅助监控指标 / 视频监管检查重点），节点进度用流程图小地图展示，填写记录可回溯查询。

## 2. 仓库位置与技术栈

Monorepo（pnpm workspace）：`C:\Users\HJW-AMD-PRP\Documents\GitHub\All-js-project`

| 端 | 路径 | 技术栈 |
|---|---|---|
| **前端** | `packages/frontend/flight-dispatch-system` | React 19 + Vite 7 + Zustand（persist 持久化）+ TailwindCSS + Radix UI + react-day-picker v9 + lucide-react + dayjs |
| **后端** | `packages/backend/full-web-backend/V5-dispatch` | Node 22 + Express + PostgreSQL（pg 驱动，ESM 模块） |

- 前端端口 **5173**，Vite 代理 `/api` → 后端 5183；后端端口 **5183**
- 数据库：`flight_dispatch`（PostgreSQL，`PG_USER=postgres PG_PASSWORD=admin`，记录在 `V5-dispatch/.env`）
- 预置数据脚本：`V5-dispatch/scripts/init_seed.js`（10 架航班 + 4 份已填检查单）

## 3. 启动方式

```bash
# 后端（5183）
cd packages/backend/full-web-backend/V5-dispatch
NODE_OPTIONS=--use-system-ca node src/server.js

# 前端（5173）
cd packages/frontend/flight-dispatch-system
pnpm dev
```

## 4. 前后端目录结构

**后端 `V5-dispatch/src/`**（分层：routes → controllers → services → db）：

```
config/index.js          # 配置（端口、PG 连接）
server.js                # 入口（Express + 中间件）
db/schema.js             # 建库建表（幂等，启动自动执行）
db/pool.js               # PG 连接池
routes/                  # index.js 汇总 + 各资源路由
  flightRoutes.js / checklistRoutes.js / manualFipsRoutes.js / freshAirCargoRoutes.js
controllers/             # HTTP 语义层（参数校验、404）
services/                # 业务逻辑（SQL）
  fipsService.js         # 历史航班 fips 表
  flightService.js       # flights 表 + manual- 前缀兼容
  manualFipsService.js   # 手动添加航班
  freshAirCargoService.js# 生鲜标记
  checklistService.js / templateService.js  # 检查单记录/模板
utils/                   # asyncHandler / mapper / time / airports
```

**前端 `src/`**：

```
pages/
  FlightSchedulePage/        # 航班列表页（手动航班 + 生鲜）
    components/AddFlightDialog.jsx   # 添加/修改航班对话框（fips 全字段）
  ChecklistPage/             # 检查单填写页（品字布局 + 小地图 + 滚轮横滚）
    components/（DraftDropdown / FlightInfoCard）
  ChecklistSelectPage/       # 检查单选择页
  RecordsPage/               # 填写记录页
  FlowchartPage/             # 独立展示页（目前主体留空，预留）
components/
  layout.jsx                 # 顶部导航（高亮 = location.pathname 驱动）
  layout/PageLayout.jsx      # 公共页布局（sidebar 插槽 + children）
  search/FlightSearchCard.jsx# 搜索卡（含生鲜 Badge 筛选）
  ui/DateFilterPanel.jsx     # 日期组件（单选/范围）
  flowchart/FlowChart.jsx    # 节点流程图（mini/full，滚轮横滚）
  checklist/DraggableThumb.jsx # 右下角可拖动节点小地图
store/
  tabsStore.js  # activeTab + 日期（persist）
  flightsStore.js / checklistStore.js / draftStore.js
api/index.js    # flightsApi / checklistsApi / fipsApi / manualFipsApi / freshAirCargoApi
```

## 5. 数据库设计（4 张表）

| 表 | 用途 | 关键字段 |
|---|---|---|
| `flights` | 预置/演示航班（检查单 has_checklist 状态） | id, flight_no, category, has_checklist… |
| `checklist_records` | 检查单填写记录 | flight_id, items JSONB, video_supervision JSONB, status(draft/submitted) |
| `manual_fips` | **手动添加航班**（16 字段对齐 fips 表） | id, task, flight_no, origin/dest/landing_station, in_out_time, sobt/eobt/atot/sibt/eldt/aldt（LOC 时间字符串）, corridor, runway, stand, aircraft_type |
| `fresh_air_cargo` | **生鲜标记关联表** | id, `manual_fips_id` UNIQUE FK(ON DELETE CASCADE), content JSONB（预留未定内容） |

设计决策：生鲜标记用**关联表**而非给 manual_fips 加字段（UNIQUE 保证一航班最多一标记，content JSON 独立存储）。`manualFipsService.listManualFips()` LEFT JOIN fresh_air_cargo → 每行附带 `is_fresh` + `fresh_content`。

## 6. API 清单

```
GET  /api/health
GET/POST/PUT/DELETE  /api/manual-fips[/:id]      # 手动航班增删改查
GET/POST/DELETE      /api/fresh-air-cargo[/mark/:manualFipsId]  # 生鲜标记
GET  /api/flights[/:id]      # id 支持 fips- 前缀（历史）与 manual- 前缀（手动，返回兼容对象）
GET  /api/checklists/templates[/:id] / records[/:id]
GET  /api/fips/:id           # fips 原始行详情
```

## 7. 已实现功能清单（截至 2026-08-17）

- **航班列表页**：不再展示 fips 假数据，改为手动航班（manual_fips）；左侧 搜索卡 / 日期组件 / 操作按钮区（添加、修改、删除 + 标记为生鲜、取消生鲜标记）；添加/修改共用对话框（字段对齐 fips 表 16 项，7 个时间字段标注「（LOC 时间）」用 datetime-local，**航班号输入自动转大写且只允许 A-Z0-9**）；行单击选中（高亮供修改/删除/生鲜操作），行内"创建检查表"跳 `/checklist/manual-N`；搜索卡内置「生鲜」Badge（Leaf 图标 + 数量徽章，点击切换只展示生鲜，颜色表示选中，不可删除）
- **检查单填写页**：品字布局（主要监控指标跨两列横向卡片流在最顶部，辅助监控 + 视频监管检查重点并排第二行）；主要监控卡片流超宽出横向滚动条，**鼠标滚轮上下 → 水平移动**（原生 wheel listener passive:false + scrollBy smooth 0.65 系数，callback ref 绑定防视图切换失效）；节点小地图（右下角可拖动 FlowChart mini）同样支持滚轮横滚；点击节点选中联动（currentStep 高亮 + 辅助/视频锚点 + 顶部 banner 悬浮在窗体顶部居中）；顶部 banner 为 fixed 悬浮层
- **填写记录页**：按日期筛选 + 关键词搜索 + 状态（草稿/已提交）展示，可跳回查看
- **公共布局**：`PageLayout`（sidebar 插槽 + children），航班列表/填写记录两页统一左侧 360px、gap-3、固定视口内部滚动
- **导航高亮**：layout.jsx 用 `location.pathname` 匹配（flights=`/` 精确、checklist/records 前缀），任何入口跳转都准确
- **独立展示页**：FlowchartPage 主体留空（预留），按钮字体与检查单页统一 text-xs（size=sm）

## 8. 关键约定与坑（务必先读）

1. **树形结构 seq 在 `n.source.seq`**，前端取 seq 一律 `n.source?.seq ?? n.seq`（检查单模板 main/auxiliaries/videoSupervision 树）
2. **中国时区取本地日期**不能用 `toISOString().slice(0,10)`（差一天），用本地格式化（tabsStore 有 localDateStr）
3. **React 19 的 onWheel 默认 passive**，要 preventDefault 必须原生 `addEventListener('wheel', fn, { passive: false })`；绑定用 **callback ref**（useEffect([]) 在视图切换后新元素无 handler）
4. **lucide-react 无 `LeafOff`**（报 export 错），取消类图标用 `Ban`
5. 检查单模板 JSON 在 `V5-dispatch/data/checklists/*.json`，**不要用编辑器/Write 工具直接改**（沙箱写保护 EPERM），通过脚本/API 更新
6. 手动航班 id 为数字，前端跳检查单用 `/checklist/manual-${id}`；后端 `flightService.getFlight` 对 `manual-` 前缀查 manual_fips 并构造兼容对象（category 默认'货运航班'、destination='鄂州'）
7. 生鲜标记用 POST `/fresh-air-cargo/mark`（upsert）+ DELETE `/fresh-air-cargo/mark/:manualFipsId`；列表 is_fresh 由 LEFT JOIN 附带
8. 时间字段（sobt/aldt 等）为**本地时间字符串**（LOC），后端只存不转时区
9. 页面高度约定：`h-[calc(100vh-90px)]`（导航 64px + main 内边距）；检查单页 `h-[calc(100vh-112px)]`

## 9. 尚未完成 / 下一步方向

- `fresh_air_cargo.content` JSON 尚未定义具体内容结构（用户预留）
- 视频监管的截图上传功能、货运考核指标（Sheet3/4）界面对接、客运 phaseNotes 细分类型界面化
- 独立展示页（FlowchartPage）主体内容待设计
- 生鲜航班在检查单页的特殊展示/流程未做

## 10. 给 AI 的提示

- 后端改动后需重启（5183）；前端 Vite 热更新
- 新增路由请遵循 routes → controllers → services → db/schema.js 分层
- 新增前端页面/组件遵循现有目录风格，公共布局用 `PageLayout`
- 数据库改动用 `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE ADD COLUMN IF NOT EXISTS`（幂等，重启自动生效）
- 验证 API 用 curl（后端在 5183）
