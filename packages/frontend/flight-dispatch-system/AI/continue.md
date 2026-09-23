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
  ChecklistPage/                 # 检查单填写页（三列可拖拽 · 列显隐 · 小地图）
    index.jsx                         # 入口：加载航班/记录/模板 → Editor | Viewer 分流
    ChecklistEditor/                  # 编辑器（零 props；按 category 选面板组）
      hooks/                          # useTimeFormulas（公式上下文）· useRegister（仿 RHF 表单）
      Components/CheckComponents/     # Main/Auxiliary/Video 的 Panel + Item
      Components/OtherComponents/     # FlowStatusView · ResizableColumns · SaveErrorToast
                                      # TimeFormulaEngine · DraggableThumb · statusBadge
      Components/ToolBar/Toolbar.jsx  # 工具栏（零 props）
      Components/ToolBar/Components/  # InfoDisplay（★ 类型配色表 TYPE_META 在此）· DraftDropdown · PanelSwitcher
      Template/XxxFlight.jsx × 5      # 穷举法面板组（一类型一组件）
      Template/EditorTemplateJson/    # ★ 静态模板 + 视频监管数据（编译期确定，零网络，编辑器用）
      Template/ViewTemplateJson/      # ★ 查看页用的扁平一维视图数据（5 类型 × 主/辅/视频，生成物）
    ChecklistViewer/                  # 只读查看（三个一维 CheckList：主监控/辅助监控/视频监管）
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

