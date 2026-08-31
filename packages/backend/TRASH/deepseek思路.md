你的这份 JSON 结构已经做得**非常细致**了（UUID设计、主/辅指标分组、视频监管项都保留得很好），但它确实存在一个**致命硬伤**：**“计算公式”被拆解得支离破碎，且关键变量（如 COBT、CTOT、机型、需求申请时间）没有定义来源**。程序拿到这份 JSON 根本无法自动算出“标准时间”，只能拿去做展示。

为了让你能**正确实现公式计算**，我基于你现有的结构，给你一套 **“无痛升级”的优化方案**（保留你 80% 的字段，只重点改造 `timeLink` 和顶层参数）。

---

### 🔍 你现有 JSON 的 4 个核心痛点

1. **“幽灵变量”未定义**：代码里出现了 `"refUuid": "COBT"`、`"需求申请时间"`、`"CTOT"`，但 JSON 里没有任何地方告诉程序这些值从哪来、是多少。
2. **“或（OR）”逻辑表达模糊**：例如“开始装机”有两个条件（卸机完成+0 **或** COBT-...），你用数组表示，但没告诉程序是取**最早**还是**最晚**，还是满足其一即可。
3. **机型参数混在数组里**：`"offsetMinutes": [{"aircraftType":"B747","offsetMinutes":80}]`，程序每次计算都要遍历数组查表，效率低且无法复用。
4. **`calcLogic: "and"` 基本是摆设**：因为你没有把“加减乘除”和“括号”结构化，`and` 无法作用于数值计算。

---

### 🚀 优化方案：改造为“可执行表达式树”

我建议把原来的 `timeLink` **统一替换**为 `formula` 字段，采用**递归的表达式树结构**。同时，在顶层增加 `variables`（输入参数）和 `lookupTables`（机型参数表）。

#### 第一步：顶层增加变量与参数表
```json
{
  "uuid": "8a942e2f-...",
  "category": "货运航班",
  "variables": {
    // 这些由上游系统传入或人工填入
    "actualLanding": "2026-08-18T10:00:00",
    "cobt": "2026-08-18T11:30:00",
    "ctot": "2026-08-18T12:00:00",
    "aircraftType": "B747",
    "demandGroundPower": "2026-08-18T10:15:00",
    "demandWater": "2026-08-18T10:20:00"
  },
  "lookupTables": {
    "fuelTime": { "B747": 100, "B777": 70, "B767": 60, "B757": 60, "B737": 60 },
    "unloadTime": { "B747": 80, "B777": 80, "B767": 75, "B757": 50, "B737": 40 },
    "loadTime": { "B747": 80, "B777": 80, "B767": 75, "B757": 50, "B737": 40 },
    "chockTime": { "B747": 4, "B777": 4, "B767": 3, "B757": 3, "B737": 2 }
  },
  "checklistName": "常规航班",
  "schema": [ ... ]
}
```

#### 第二步：改造指标中的 `timeLink` 为 `formula`（重点）

**（1）简单的引用 + 加减（如“入位”）**
```json
// 旧写法（容易丢失上下文）
"timeLink": { "refUuid": "a7e089ed-...", "offsetMinutes": 10 }

// ✅ 新写法（自解释，且便于程序递归求值）
"formula": {
  "type": "binary",
  "operator": "+",
  "left": { "type": "ref", "target": "metric", "uuid": "a7e089ed-..." }, // 引用其他指标
  "right": { "type": "literal", "value": 10, "unit": "minutes" }
}
```

**（2）依赖机型参数的复杂公式（如“开始加油”：COBT - 机型参考加油时间 - 5）**
```json
// 你的旧写法： "refUuid": "COBT", "offsetMinutes": ["options", -5]  （程序完全懵）
// ✅ 新写法（清晰的运算树 + 查表）
"formula": {
  "type": "binary",
  "operator": "-",
  "left": { "type": "ref", "target": "var", "name": "cobt" }, // 引用顶层变量
  "right": {
    "type": "binary",
    "operator": "+",
    "left": { 
      "type": "lookup", 
      "table": "fuelTime", 
      "key": { "type": "ref", "target": "var", "name": "aircraftType" } 
    },
    "right": { "type": "literal", "value": 5 }
  }
}
```

**（3）“或（OR）”逻辑（如“开始装机”：卸机完成+0 或 COBT-机型标准装机-20）**
注意：业务上“A或B”通常取**两者中较早（min）**或**较晚（max）**，这里明确用 `min` 函数最合适。

```json
// 旧写法：数组里塞两个对象，不知道取哪个
// ✅ 新写法：明确用 min 函数
"formula": {
  "type": "function",
  "name": "min",
  "args": [
    { "type": "ref", "target": "metric", "uuid": "卸机完成的uuid" }, // 即卸机完成+0
    {
      "type": "binary",
      "operator": "-",
      "left": { "type": "ref", "target": "var", "name": "cobt" },
      "right": {
        "type": "binary",
        "operator": "+",
        "left": { "type": "lookup", "table": "loadTime", "key": { "type": "ref", "target": "var", "name": "aircraftType" } },
        "right": { "type": "literal", "value": 20 }
      }
    }
  ]
}
```

**（4）处理“需求申请时间”这类自定义变量**
只需在顶层 `variables` 里加入 `"demandGroundPower": "2026-08-18T10:15:00"`，然后公式里直接 `{ "type": "ref", "target": "var", "name": "demandGroundPower" }` 即可。

---

### 📦 给你一个改造后的完整指标示例（以 ID 12“开始加油”为例）

```json
{
  "uuid": "451e6387-2932-45d6-9eb4-cc27c299edaf",
  "id": 12,
  "type": "time",
  "name": "开始加油",
  "desc": "COBT-机型参考加油时间-5分钟",
  // 删掉原来的 options 和混乱的 timeLink，改为以下结构
  "formula": {
    "type": "binary",
    "operator": "-",
    "left": { "type": "ref", "target": "var", "name": "cobt" },
    "right": {
      "type": "binary",
      "operator": "+",
      "left": { 
        "type": "lookup", 
        "table": "fuelTime", 
        "key": { "type": "ref", "target": "var", "name": "aircraftType" } 
      },
      "right": { "type": "literal", "value": 5 }
    }
  },
  "completion": null,  // 保留这个字段用于填写实际完成时间
  "actualTime": null   // 或者用这个存实际值
}
```

---

### ⚙️ 程序如何计算？（给你一个极简求值逻辑）

你只需要写一个递归函数 `evaluate(node, context)`：
- `context` 包含：`variables`、已计算出的其他指标结果（按 UUID 存）、`lookupTables`。
- 遇到 `"ref"` 就去 context 里取值；
- 遇到 `"binary"` 就递归算左右再运算；
- 遇到 `"lookup"` 就去表里取值；
- 遇到 `"function"`（如 min）就对数组内所有值求值后取最小。

这样，你的 JSON 就从“死文本”变成了“活公式”，任何时间变动（如 COBT 变更）只需改顶层 `variables`，所有指标标准时间一键重新计算。

---

### ✨ 总结：你要改动的就 3 点

1. **顶部加 `variables` 和 `lookupTables`**（把 COBT、机型、需求申请时间等收归一处）。
2. **所有 `timeLink` 替换为结构化的 `formula` 表达式树**（引用用 `ref`，计算用 `binary`/`function`，查表用 `lookup`）。
3. **删除原有的 `options` 和混乱的 `offsetMinutes` 数组**，统一用公式树表达。

这套结构**完全保留了你的 UUID、auxiliaries、videoSupervision**，只是把核心计算逻辑升级成了计算机可读的 AST（抽象语法树）。照着这个改，你图片里的所有公式都能 100% 精确实现！如果有哪个具体指标（比如“撤轮档”或“出港登临检查”）不知道怎么改写，随时发我，我直接帮你转成新格式。