# 航班调度检查系统 (Flight Dispatch Check System)

前后端分离的航班调度检查系统：按航班类型生成调度席检查单，逐项填写检查结果，
支持流程图（鱼骨图）节点进度查看。

## 技术栈

| 端 | 技术 |
|---|---|
| 前端 | React 19 + Vite 7 + Zustand + TailwindCSS + Radix UI + react-day-picker |
| 后端 | Node.js + Express + PostgreSQL |
| 数据结构 | Excel (资料/*.xlsx) → JSON (检查单模板) + JSON (航班 mock 数据) + PG (填写记录) |

## 目录结构

```
flight-dispatch-system/               # 前端
├── src/
│   ├── pages/
│   │   ├── FlightSchedulePage.jsx    # Tab1: 日历 + 航班表格
│   │   ├── ChecklistSelectPage.jsx   # Tab2: 检查单模板与搜索
│   │   ├── ChecklistPage.jsx         # 单个航班的检查单填写页
│   │   ├── FlowchartPage.jsx         # 流程图独立展示页
│   │   └── RecordsPage.jsx           # Tab3: 填写记录
│   ├── components/
│   │   ├── ui/                       # Button / Card / Badge
│   │   ├── checklist/                # 检查单组件
│   │   └── flowchart/FlowChart.jsx   # SVG 节点流程图（鱼骨图）
│   ├── store/                        # Zustand: tabs(持久化) / flights / checklist
│   ├── api/index.js                  # 后端 API 封装
│   └── lib/utils.js
└── 资料/                             # 原始 Excel 与截图

packages/backend/full-web-backend/V5-dispatch/   # 后端
├── src/
│   ├── server.js                     # Express 入口 (端口 5183)
│   ├── db.js                         # PostgreSQL 连接 + 建库建表（flights + checklist_records）
│   └── routes/
│       ├── flights.js                # 航班 CRUD（PG 存储，不再用 JSON 文件）
│       └── checklists.js             # 检查单模板 + 记录 CRUD (PG 存储)
├── data/
│   └── checklists/*.json             # 检查单模板 (从 Excel 解析)
├── scripts/
│   ├── init_seed.js                  # ★ 预置数据（航班 + 已填好的示例检查单）
│   ├── excel_to_tree.py              # 货运 Excel → 树形 JSON
│   ├── excel_passenger_to_tree.py    # 客运 Excel → 树形 JSON
│   └── verify_flow.mjs               # 联调验证脚本
└── .env                              # PG 连接配置
```

## 启动方式（推荐：一键脚本）

在项目根目录 `All-js-project` 下双击运行 **`start-dev.bat`**，会自动：
1. 预置数据到 PostgreSQL（航班 10 架 + 已填好的检查单 4 份）
2. 启动后端 (5183)
3. 启动前端 (5173) 并打开浏览器

### 手动启动

### 1. 后端（端口 5183）

```bash
cd packages/backend/full-web-backend/V5-dispatch
npm install          # 首次
node scripts/init_seed.js   # 预置数据（航班 + 已填好的示例检查单）
node src/server.js          # 启动
```

> 依赖 PostgreSQL 本地安装。连接配置在 `.env`：
> `PG_HOST=127.0.0.1 PG_PORT=5432 PG_USER=postgres PG_PASSWORD=admin PG_DATABASE=flight_dispatch`
> 若需重新生成检查单 JSON：`python scripts/excel_to_tree.py` + `python scripts/excel_passenger_to_tree.py`（需 Python + openpyxl）

### 2. 前端（端口 5173）

```bash
cd packages/frontend/flight-dispatch-system
npm install          # 首次（本项目用 pnpm 管理 monorepo，也可 pnpm install）
npm run dev
```

浏览器访问 http://localhost:5173

## 功能说明

### TAB 导航（记住上次选择）
顶部三个 TAB：**航班列表 / 检查单 / 填写记录**，选择会持久化到 localStorage，
刷新页面后仍保持上次的 TAB。

### Tab1 航班列表
- 左侧日历支持 **单选日** 或 **范围选择**（右上角切换）
- 右侧表格列：航班号 / 始发地 / 起飞时间(UTC) / 目的地 / 降落时间(UTC) / 航班状态 / 航班类型 / 创建调度检查表
- 点击「创建检查表」进入该航班的检查单填写页；已创建过的显示纸张图标，点击可继续填写
- 航班数据来源：`data/flights/flights.json`，首次进入自动生成 Mock 数据（每天 5 架，覆盖今天±3天）
- 「补充数据」按钮可追加更多 Mock 航班

### 检查单填写页（/checklist/:flightId）
- 根据航班 `category`（货运/客运）自动选择对应检查单模板
- 按航班 `flightType`（常规/始发）渲染对应节点结构：
  - 主监控指标（序号、标准描述/时间要求、完成情况、实际时间、备注）
  - 辅助监控指标（1对多，挂在主节点下）
  - 视频监管检查重点（分组：入位前检查 / 靠机作业 / 机坪秩序）
- 顶部内置**小地图（流程图）**，实时显示各节点完成状态
- **切换展示**：检查项目 ↔ 流程图 视图一键切换
- **独立展示**：新开页面展示大流程图（/flowchart/:flightId）
- 填写内容保存到 PostgreSQL（`checklist_records` 表），支持草稿/提交

### 检查单数据结构（JSON）
从 `资料/货运航班节点保障及合规性监控检查单.xlsx` 解析：
- Sheet1 → `flightTypes.常规航班`（14 主节点）+ `flightTypes.始发航班`（9 主节点）+ `videoSupervision`（3 组视频监管）
- Sheet2 → `originatingFillForm`
- Sheet3 → `assessment`（航空器保障 15 项 / 机坪保障 5 项 / 货物保障 7 项含机型数据）
- Sheet4 → `cargoSupport`（过站/始发货物保障）

节点层级：**大类别航班（货运/客运） → 航班类型（常规/始发） → 主监控节点 → 辅助监控项**

## API 一览

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /api/flights?date=&from=&to= | 航班列表（按日期过滤） |
| POST | /api/flights | 新增航班 |
| GET | /api/flights/seed/mock | 生成 Mock 数据 |
| GET | /api/checklists/templates | 检查单模板列表 |
| GET | /api/checklists/templates/:id | 检查单模板详情 |
| GET | /api/checklists/records?flightId= | 填写记录列表 |
| POST | /api/checklists/records | 创建填写记录 |
| PUT | /api/checklists/records/:id | 更新填写记录 |
