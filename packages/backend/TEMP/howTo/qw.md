系统已经做好，并用你这两份真实快照跑通验证。

你的设想是对的，我把它落成了一个可运行的监控程序

核心模型：维护一个 SQLite 持久化的「当日航班集合」，集合内以航班号为唯一键（出发航班号 d_flight_no_full 缺失的国际到达航班，用到达航班号 a_flight_no_full 兜底，实测 70 条正好 70 个唯一航班号）。每次拉到新数据后逐航班 diff：

集合里没有的航班号 → 新增航班通知
已有航班属性变了 → 航班变更通知，精确到每个字段的「旧值 → 新值」

用你的两份快照实测（15:28 → 16:56）
第 1 批：集合为空 → 70 条全部新增
第 2 批：无新增无删除 → 9 个航班变更，如 BK3064 出发状态 None→正在值机、实际到达时间 17:50→17:19；EY9681 到达状态 前方起飞→到达；多个国际航班出发类型 None→H/Z

变更检测、去重、字段级 diff 全部按预期触发。

交付文件（flight_monitor 目录）
flight_monitor.py — 主程序，支持 --demo（用快照演示）/--once（配合 crontab 定时拉一次）/--watch（常驻轮询服务器）/--reset
config.json — 配置数据源（改 type 为 http 并填 URL 即对接你的服务器）、轮询间隔、通知 webhook、屏蔽噪声字段
README.md — 设计与对接说明
data_sources/ — 两份快照作为离线演示样例

你接下来只需两步
把 config.json 的 source 改成 http + 填你的接口地址（返回结构就是你现在这个 {data:[...]}，已适配）；
在 notify.webhook_url 填钉钉/企微/飞书机器人地址，即可把通知推到群里；填 ignore_fields 可屏蔽你不关心的抖动字段。

需要我把通知改成短信/邮件、加"变化达到阈值才通知"的去抖动逻辑，或做成 systemd 常驻服务，告诉我即可。










已为你生成相关文件，请查收


已经全部搞定了。你的项目是 Node.js + Express.js 技术栈，我直接给你写了一套纯 JavaScript 的航班监控模块，可以直接集成到你现有的 Express 项目里。

## 交付内容 (`flight-monitor` 目录)

**核心文件：**

- **`flight-monitor.js`** — 监控核心模块，`require` 即用。维护一个 `Map<航班号, 航班数据>` 集合，每次拉到新数据后逐航班 diff：
  - 集合里没有的航班号 → 发射 `newFlight` 事件
  - 已有航班属性变了 → 发射 `flightChanged` 事件（精确到每个字段的旧值→新值）
  - 上次有本次没有的 → 发射 `flightDeleted` 事件
  - 航班唯一键：优先 `d_flight_no_full`，缺失时用 `a_flight_no_full` 兜底（处理国际到达航班）

- **`example-express.js`** — Express 集成示例，包含 4 个 REST API 接口：
  - `GET /api/flights` — 获取当前航班集合
  - `GET /api/flights/:flightNo` — 查询单个航班
  - `POST /api/flights/refresh` — 手动触发拉取
  - `POST /api/flights/reset` — 重置集合（跨天用）

- **`example-demo.js`** — 独立演示脚本，用你的两份快照（15:28 → 16:56）跑一遍验证变更检测

- **`config.json`** — 配置数据源地址、轮询间隔、webhook 通知地址、忽略字段

- **`data_sources/`** — 你的两份快照文件，供离线测试用

## 你集成到你项目里就三步

1. `npm install axios node-cron`
2. 把 `flight-monitor.js` 和 `config.json` 复制到项目目录
3. 参考 `example-express.js` 里的方式 `require` 并监听事件，把 `config.source.url` 改成你的服务器地址就行

通知渠道（钉钉/企微/飞书机器人 webhook）在 `config.notification.webhookUrl` 填上地址就自动推送。需要加去抖动逻辑或者换其他通知方式随时说。















