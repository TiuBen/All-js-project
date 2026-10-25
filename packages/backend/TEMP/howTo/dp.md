# Node.js + Express 航班监控系统设计方案

好，那我们把方案落到 Node.js 生态里。整体架构不变，只是换成 JS 的写法。

---

## 一、技术选型建议

| 用途 | 推荐库 | 说明 |
|------|--------|------|
| 定时拉取 | `node-cron` 或 `setInterval` | 简单够用，复杂场景用 `bull` + Redis |
| 快照存储 | `ioredis` 或 `better-sqlite3` | 内存会丢，生产必须持久化 |
| 差分比较 | `lodash.isEqual` 或自写 | 只比关键字段 |
| 通知 | `axios`（钉钉/企微 webhook） | 简单直接 |
| 实时推送 | `socket.io` 或 `ws` | 如果前端要实时看 |
| 日志 | `pino` 或 `winston` | |

---

## 二、项目目录结构

```
flight-monitor/
├── src/
│   ├── index.js                 # Express 入口
│   ├── config.js                # 配置
│   ├── services/
│   │   ├── fetcher.js           # 拉取远程数据
│   │   ├── store.js             # 快照存储（Redis）
│   │   ├── differ.js            # 差分核心
│   │   ├── notifier.js          # 通知
│   │   └── monitor.js           # 调度主流程
│   ├── routes/
│   │   └── flights.js           # 查询 API
│   └── utils/
│       ├── flightKey.js         # 唯一键生成
│       └── timeParser.js        # "23:50(-1)" 解析
├── package.json
└── .env
```

---

## 三、核心：唯一键生成

```js
// src/utils/flightKey.js

/**
 * 生成航班唯一键
 * 注意：d_flight_no_full 可能为 null（只有到达信息），用 a_flight_no_full 兜底
 */
function buildFlightKey(f) {
  const flightNo = f.d_flight_no_full || f.a_flight_no_full;
  const date = (f.d_flight_date || f.a_flight_date || '').slice(0, 10); // "2026-10-12"
  const dep = f.d_name || '';
  const arr = f.a_name || '';

  // 如果同一航班号同一天有多段，加 dep/arr 区分
  return `${flightNo}_${date}_${dep}_${arr}`;
}

module.exports = { buildFlightKey };
```

> ⚠️ **强烈建议先跑一遍你手上的 4 个文件**，统计 `flightNo + date` 是否唯一。如果唯一，可以简化 key；如果不唯一（比如 `O37290` 义乌→义乌 这种往返），就必须加 `dep/arr`。

---

## 四、快照存储（Redis）

```js
// src/services/store.js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

const KEY_PREFIX = 'flight:snapshot:';
const INDEX_KEY = 'flight:index'; // 存当前所有 key 的 Set

async function getSnapshot() {
  const keys = await redis.smembers(INDEX_KEY);
  if (!keys.length) return {};
  const values = await redis.mget(keys.map(k => KEY_PREFIX + k));
  const result = {};
  keys.forEach((k, i) => {
    if (values[i]) result[k] = JSON.parse(values[i]);
  });
  return result;
}

async function saveSnapshot(newMap) {
  const pipeline = redis.pipeline();
  const oldKeys = await redis.smembers(INDEX_KEY);

  // 删除已经不存在的
  for (const k of oldKeys) {
    if (!(k in newMap)) {
      pipeline.del(KEY_PREFIX + k);
      pipeline.srem(INDEX_KEY, k);
    }
  }

  // 写入新的
  for (const [k, v] of Object.entries(newMap)) {
    pipeline.set(KEY_PREFIX + k, JSON.stringify(v));
    pipeline.sadd(INDEX_KEY, k);
  }

  await pipeline.exec();
}

module.exports = { getSnapshot, saveSnapshot };
```

---

## 五、差分核心

```js
// src/services/differ.js

// 只关心这些字段的变化
const WATCH_FIELDS = [
  'd_plan_time', 'a_plan_time',
  'd_time', 'a_time',
  'd_state_name', 'a_state_name',
  'd_abnormal_state', 'a_abnormal_state',
  'd_jx', 'a_jx',
  'd_name', 'a_name',
];

function diff(oldSnapshot, newList, buildKey) {
  const newMap = {};
  for (const f of newList) {
    newMap[buildKey(f)] = f;
  }

  const added = [];
  const removed = [];
  const changed = [];

  // 新增
  for (const [k, v] of Object.entries(newMap)) {
    if (!oldSnapshot[k]) added.push({ key: k, flight: v });
  }

  // 消失
  for (const k of Object.keys(oldSnapshot)) {
    if (!newMap[k]) removed.push({ key: k, flight: oldSnapshot[k].data });
  }

  // 变化
  for (const [k, newF] of Object.entries(newMap)) {
    if (!oldSnapshot[k]) continue;
    const oldF = oldSnapshot[k].data;
    const changes = {};
    for (const field of WATCH_FIELDS) {
      if (oldF[field] !== newF[field]) {
        changes[field] = { old: oldF[field], new: newF[field] };
      }
    }
    if (Object.keys(changes).length) {
      changed.push({ key: k, flight: newF, changes });
    }
  }

  return { added, removed, changed, newMap };
}

module.exports = { diff, WATCH_FIELDS };
```

---

## 六、通知规则引擎（关键，避免刷屏）

```js
// src/services/notifier.js
const axios = require('axios');

// 状态推进顺序（只前进才通知）
const STATE_ORDER = {
  null: 0,
  '前方起飞': 1,
  '正在值机': 2,
  '起飞': 3,
  '到达': 4,
};

function stateAdvanced(oldS, newS) {
  const o = STATE_ORDER[oldS ?? 'null'] ?? -1;
  const n = STATE_ORDER[newS ?? 'null'] ?? -1;
  return n > o;
}

async function notify(message) {
  console.log('[NOTIFY]', message);
  // 钉钉示例
  // await axios.post(process.env.DINGTALK_WEBHOOK, {
  //   msgtype: 'text',
  //   text: { content: message },
  // });
}

/**
 * 判断一次变化是否需要通知
 * 返回 string[] 要通知的消息
 */
function buildNotifications(diffResult) {
  const msgs = [];

  // 1. 新航班
  for (const { key, flight } of diffResult.added) {
    msgs.push(`🆕 新航班 ${flight.d_flight_no_full} ${flight.d_name}→${flight.a_name} 计划${flight.d_plan_time}`);
  }

  // 2. 变化
  for (const { key, flight, changes } of diffResult.changed) {
    // 2.1 异常状态（重点）
    for (const f of ['d_abnormal_state', 'a_abnormal_state']) {
      if (changes[f] && changes[f].new) {
        msgs.push(`⚠️ ${flight.d_flight_no_full} ${f} 异常: ${changes[f].new}`);
      }
    }

    // 2.2 状态推进
    for (const f of ['d_state_name', 'a_state_name']) {
      if (changes[f] && stateAdvanced(changes[f].old, changes[f].new)) {
        msgs.push(`🔄 ${flight.d_flight_no_full} ${f}: ${changes[f].old ?? '无'} → ${changes[f].new}`);
      }
    }

    // 2.3 实际时间变化（节流：只报 >= 10 分钟的差异）
    for (const f of ['d_time', 'a_time']) {
      if (changes[f] && changes[f].old && changes[f].new) {
        const diffMin = Math.abs(toMinutes(changes[f].new) - toMinutes(changes[f].old));
        if (diffMin >= 10) {
          msgs.push(`⏰ ${flight.d_flight_no_full} ${f}: ${changes[f].old} → ${changes[f].new}`);
        }
      }
    }

    // 2.4 计划时间变化（说明调机）
    for (const f of ['d_plan_time', 'a_plan_time']) {
      if (changes[f]) {
        msgs.push(`📋 ${flight.d_flight_no_full} ${f}: ${changes[f].old} → ${changes[f].new}`);
      }
    }
  }

  // 3. 消失（可选，可能只是到达后清理）
  // for (const { key, flight } of diffResult.removed) {
  //   msgs.push(`❌ 航班消失 ${flight.d_flight_no_full}`);
  // }

  return msgs;
}

function toMinutes(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

module.exports = { buildNotifications, notify };
```

---

## 七、调度主流程

```js
// src/services/monitor.js
const { fetchFlights } = require('./fetcher');
const { getSnapshot, saveSnapshot } = require('./store');
const { diff } = require('./differ');
const { buildNotifications, notify } = require('./notifier');
const { buildFlightKey } = require('../utils/flightKey');

let running = false;

async function tick() {
  if (running) {
    console.warn('[monitor] 上一次还没跑完，跳过本次');
    return;
  }
  running = true;
  try {
    const newList = await fetchFlights();
    console.log(`[monitor] 拉到 ${newList.length} 条`);

    const oldSnapshot = await getSnapshot();
    const result = diff(oldSnapshot, newList, buildFlightKey);

    console.log(`[monitor] 新增 ${result.added.length}, 消失 ${result.removed.length}, 变化 ${result.changed.length}`);

    // 通知
    const msgs = buildNotifications(result);
    for (const m of msgs) {
      await notify(m);
    }

    // 保存新快照（注意加 data 包装，和 oldSnapshot 结构一致）
    const newMap = {};
    const now = new Date().toISOString();
    for (const [k, v] of Object.entries(result.newMap)) {
      newMap[k] = { data: v, lastSeen: now };
    }
    await saveSnapshot(newMap);
  } catch (err) {
    console.error('[monitor] 出错', err);
  } finally {
    running = false;
  }
}

module.exports = { tick };
```

---

## 八、Fetcher（拉取远程数据）

```js
// src/services/fetcher.js
const axios = require('axios');

async function fetchFlights() {
  const url = process.env.FLIGHT_API_URL;
  const { data } = await axios.get(url, { timeout: 15000 });
  if (data.code !== 0) throw new Error(`接口返回异常: ${data.msg}`);
  return data.data || [];
}

module.exports = { fetchFlights };
```

---

## 九、Express 入口 + 定时任务

```js
// src/index.js
require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { tick } = require('./services/monitor');
const { getSnapshot } = require('./services/store');

const app = express();
app.use(express.json());

// 手动触发一次（调试用）
app.post('/admin/tick', async (req, res) => {
  await tick();
  res.json({ ok: true });
});

// 查看当前快照
app.get('/flights', async (req, res) => {
  const snap = await getSnapshot();
  res.json({
    count: Object.keys(snap).length,
    data: Object.values(snap).map(x => x.data),
  });
});

// 按航班号查询
app.get('/flights/:no', async (req, res) => {
  const snap = await getSnapshot();
  const list = Object.values(snap)
    .map(x => x.data)
    .filter(f => f.d_flight_no_full === req.params.no || f.a_flight_no_full === req.params.no);
  res.json(list);
});

// 每 2 分钟跑一次
cron.schedule('*/2 * * * *', () => {
  tick().catch(err => console.error('tick error', err));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Flight monitor on :${PORT}`));
```

---

## 十、先用你手上的 4 个文件验证差分逻辑

在正式接远程接口前，写个离线脚本把这 4 个文件按顺序喂进去，看 diff 是否合理：

```js
// scripts/test-diff.js
const fs = require('fs');
const path = require('path');
const { diff } = require('../src/services/differ');
const { buildFlightKey } = require('../src/utils/flightKey');

const files = [
  'ecyilang202610122021.json',
  'ecyilang202610122132.json',
  'ecyilang202610141528.json',
  'ecyilang202610141656.json',
];

let snapshot = {};

for (const file of files) {
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'samples', file), 'utf8'));
  const list = raw.data;

  const result = diff(snapshot, list, buildFlightKey);

  console.log(`\n===== ${file} =====`);
  console.log(`新增 ${result.added.length}, 消失 ${result.removed.length}, 变化 ${result.changed.length}`);

  // 打印变化详情
  for (const c of result.changed) {
    console.log(`  变化: ${c.key}`);
    for (const [f, v] of Object.entries(c.changes)) {
      console.log(`    ${f}: ${v.old} → ${v.new}`);
    }
  }
  for (const a of result.added) {
    console.log(`  新增: ${a.key}`);
  }
  for (const r of result.removed) {
    console.log(`  消失: ${r.key}`);
  }

  // 更新快照
  snapshot = {};
  const now = new Date().toISOString();
  for (const [k, v] of Object.entries(result.newMap)) {
    snapshot[k] = { data: v, lastSeen: now };
  }
}
```

跑完你会看到：
- `202610122021` → `202610122132`：只有 `O3168` 的 `a_time` 从 `21:28` 变 `21:24`，状态从"前方起飞"变"到达"
- `202610141528` → `202610141656`：`BK3064` 从 `a_state_name: null` 变 `前方起飞`，`d_state_name: null` 变 `正在值机`

正好验证状态机是否工作正常。

---

## 十一、几个 Node 特有的坑

### 1. 异步竞态
定时器和手动 `/admin/tick` 可能同时触发，用 `running` 标志位挡住（上面已加）。生产建议用 `bull` 队列串行化。

### 2. Redis JSON 序列化
`null` 和 `undefined` 在 `JSON.stringify` 后不同，比较时注意：
```js
// 统一把 undefined 当 null
const norm = v => v === undefined ? null : v;
```

### 3. 时区
`d_flight_date: "2026-10-12T08:00:00"` 这个 `08:00:00` 是什么？看起来是"航班日从早上8点算起"的标记。做日期切片时 `.slice(0, 10)` 是安全的，但如果要算"当天航班"要确认这个 8 点的含义。

### 4. 内存泄漏
不要把所有历史快照都留在内存里，只保留最新一份。历史变化如果要审计，写日志或落库。

### 5. Express 长任务
`tick()` 可能跑几秒（拉数据 + Redis + 通知），不要放在请求主线程里阻塞，用 `setImmediate` 或队列。

---

## 十二、进阶：如果前端要实时看

加 `socket.io`，`tick()` 结束后把 diff 结果 emit 给前端：

```js
// index.js
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);

// monitor.js 里 tick 完
io.emit('flight-diff', { added, removed, changed, ts: Date.now() });

server.listen(PORT);
```

前端订阅 `flight-diff` 就能实时更新列表 + 高亮变化。

---

## 下一步建议

1. **先跑 `scripts/test-diff.js`**，用你手上 4 个文件验证逻辑，看输出是否符合预期
2. **确认唯一键**：统计 `flightNo + date` 是否唯一，不唯一就加 `dep/arr`
3. **确认通知白名单**：哪些字段变化值得推送，避免刷屏
4. **接真实接口**：把 `FLIGHT_API_URL` 配到 `.env`
5. **落 Redis**：替换内存快照

需要我帮你把哪部分写得更完整？比如：
- **离线验证脚本**的完整可运行版本（含 4 个 sample 文件）
- **Redis + Bull 队列**的生产级调度
- **钉钉/企微机器人**的具体推送格式
- **Socket.io 前端实时**的完整示例

告诉我你想先深入哪块。