对，我看完你这个 JSON 和图片后，**你的判断是对的：现在这个结构能“描述表格”，但还不能真正成为一个可计算、可追溯、可扩展的规则模型。**

尤其是你这张表，本质上并不是简单的：

> 一个节点 → 一个时间公式

而是同时包含：

1. **主监控节点**
2. **辅助监控节点**
3. **视频监管节点**
4. **标准时间**
5. **标准时间的计算公式**
6. **一个节点可能有多个候选公式**
7. **候选公式可能存在 OR / AND**
8. **公式依赖航班动态数据**
9. **公式依赖机型参数**
10. **实际完成时间与标准时间的偏差判断**
11. **有些指标没有时间公式，只是一个状态/事件**
12. **最终还需要生成你图片里的那种展示结构**

而你目前的 JSON 把这些东西揉在了 `timeLink`、`desc`、`auxiliaries` 里面，所以越做到后面越难。

你现在 JSON 中已经出现了很典型的问题，比如：

* `timeLink` 有时候是对象
* 有时候是数组
* 有时候 `offsetMinutes` 是数字
* 有时候是数组
* 有时候甚至出现 `"offsetMinutes": ["options", -5]`
* `timeLink.option` 和 `timeLink` 两套 OR 表达方式并存
* 有些辅助项的 `refUuid/refId` 是空的，但实际上它是依赖某个外部事件的
* `desc` 同时承担了**人类描述**和**计算逻辑说明**

例如你现在的“开始装机”：

> 卸机完成+0分钟（或 COBT-机型标准装机作业时长-20分钟）

JSON 里面变成了 `option` + `calcLogic:"or"`。

这已经说明一个问题：

**你其实已经在自己设计一套“规则引擎”了，只是目前还没有把它正式抽象出来。**

---

# 一、我建议你彻底换一个思路

不要再把 JSON 设计成：

```text
主指标
 ├── timeLink
 ├── auxiliaries
 └── videoSupervision
```

而是拆成：

```text
航班保障检查单
│
├── 节点定义
│
├── 标准规则
│
├── 计算参数
│
├── 监控项
│
└── 实际执行结果
```

其中最重要的是：

> **“节点是什么”和“节点什么时候应该发生”必须分开。**

---

# 二、先把你的表格理解成一个“事件时间轴”

比如你的前几个节点：

```text
预计落地
   ↓
入位
   ↓
开始挡轮挡
   ↓
开驾驶舱门
   ↓
开货舱门
   ↓
开始卸机
   ↓
卸机完成
   ↓
开始装机
   ↓
装机完成
   ↓
关货舱门
   ↓
关驾驶舱门
   ↓
推出
   ↓
滑出
   ↓
起飞
```

这些实际上是**航班事件 Event**。

而：

```text
机务到位
登机梯/客梯车到位
代办到位
海关/边检到位
开始加油
平台车到位
```

也是 Event，只不过它们是：

> **辅助事件**

所以不要把辅助事件设计成主事件的附属属性。

更好的方式是：

```text
Event
 ├── 主事件
 ├── 辅助事件
 └── 视频检查项
```

---

# 三、第一层：节点定义

我建议先把所有节点统一成：

```json
{
  "id": "E001",
  "code": "LANDING",
  "name": "预计落地",
  "category": "main",
  "type": "time_event"
}
```

例如：

```json
{
  "id": "E002",
  "code": "IN_POSITION",
  "name": "入位",
  "category": "main",
  "type": "time_event"
}
```

辅助：

```json
{
  "id": "A001",
  "code": "MECHANIC_ARRIVAL",
  "name": "机务到位",
  "category": "auxiliary",
  "type": "time_event"
}
```

视频：

```json
{
  "id": "V001",
  "code": "GROUND_EQUIPMENT_WAIT",
  "name": "车辆、人员、设备、货物、行李在指定区域等待",
  "category": "video",
  "type": "video_check"
}
```

这样以后你根本不需要：

```json
auxiliaries: []
videoSupervision: []
```

因为所有东西都是节点。

---

# 四、第二层：标准时间规则单独出来

这是我认为你整个项目最应该改的地方。

不要：

```json
{
  "name": "入位",
  "desc": "实际落地时间+10分钟",
  "timeLink": {
    "refId": 1,
    "offsetMinutes": 10
  }
}
```

而应该：

```json
{
  "eventId": "E002",
  "rules": [
    {
      "type": "offset",
      "base": {
        "event": "E001",
        "time": "actual"
      },
      "offsetMinutes": 10
    }
  ]
}
```

这样你的意思就非常明确：

```text
E002 标准时间
=
E001 实际时间
+
10分钟
```

---

# 五、最关键：不要让 `desc` 参与计算

这是你当前 JSON 最大的问题之一。

比如：

```json
"desc": "开始挡轮挡+10分钟"
```

这个字段只能用于：

> 给人看

不能用于：

> 程序计算

你应该同时拥有：

```json
{
  "description": "开始挡轮挡+10分钟",

  "rule": {
    "type": "offset",
    "base": {
      "event": "IN_POSITION",
      "time": "actual"
    },
    "offsetMinutes": 10
  }
}
```

于是：

### description

负责：

```text
开始挡轮挡+10分钟
```

### rule

负责：

```text
真正计算
```

这两个必须分开。

---

# 六、你的公式实际上应该做成“表达式树”

比如：

## 入位

图片：

> 实际落地时间 + 10分钟

就是：

```json
{
  "type": "offset",
  "base": {
    "event": "LANDING",
    "time": "actual"
  },
  "offsetMinutes": 10
}
```

---

## 开驾驶舱门

图片：

> 开始挡轮挡 + 10分钟

就是：

```json
{
  "type": "offset",
  "base": {
    "event": "START_CHOCK",
    "time": "actual"
  },
  "offsetMinutes": 10
}
```

你现在这部分其实已经比较接近正确方向了。

---

# 七、遇到机型参数怎么办？

这才是你现在 JSON 真正开始复杂的地方。

比如：

> 开始加油
> COBT - 机型参考加油时间 - 5分钟

你的 JSON 当前已经试图这样做：

```json
"options": [
  {
    "aircraftType": "B747",
    "offsetMinutes": -100
  },
  {
    "aircraftType": "B777",
    "offsetMinutes": -70
  }
]
```



但是这个结构有一个问题：

**你把“参数表”和“计算公式”混在一起了。**

应该拆开。

---

## 参数表

```json
{
  "parameterSet": "FUEL_SERVICE_DURATION",
  "values": {
    "B747": 100,
    "B777": 70,
    "B767": 60,
    "B757": 60,
    "B737": 60
  }
}
```

---

## 公式

```json
{
  "type": "offset",
  "base": {
    "event": "COBT",
    "time": "planned"
  },
  "offset": {
    "type": "subtract",
    "value": {
      "type": "parameter",
      "name": "FUEL_SERVICE_DURATION",
      "keyFrom": "aircraftType"
    }
  },
  "additionalOffsetMinutes": -5
}
```

当然我甚至建议进一步简化成：

```json
{
  "type": "formula",
  "expression": [
    {
      "type": "event",
      "code": "COBT"
    },
    {
      "type": "parameter",
      "code": "FUEL_SERVICE_DURATION",
      "key": "aircraftType",
      "operator": "-"
    },
    {
      "type": "constant",
      "value": 5,
      "operator": "-"
    }
  ]
}
```

这样以后就不怕复杂公式。

---

# 八、你还需要支持 `OR`

这是你现在非常头疼的地方。

例如：

> 开始装机
> 卸机完成 + 0分钟
> **或**
> COBT - 机型标准装机作业时长 - 20分钟

你现在：

```json
"calcLogic": "or"
```

这个方向没错。

但应该明确：

```json
{
  "ruleType": "alternative",
  "rules": [
    {
      "type": "offset",
      "base": {
        "event": "UNLOAD_COMPLETE",
        "time": "actual"
      },
      "offsetMinutes": 0
    },
    {
      "type": "formula",
      "base": {
        "event": "COBT",
        "time": "planned"
      },
      "operations": [
        {
          "operator": "-",
          "value": {
            "type": "parameter",
            "code": "LOADING_DURATION",
            "keyFrom": "aircraftType"
          }
        },
        {
          "operator": "-",
          "value": 20
        }
      ]
    }
  ]
}
```

也就是：

```text
Rule
 └── alternative
       ├── Rule A
       └── Rule B
```

---

# 九、甚至还有 AND

例如你表格里面：

```text
主指标：开驾驶舱门
标准：开始挡轮挡 + 10分钟

辅助指标：
├── 登机梯到位       入位 - 5
├── 代办到位         入位 - 5
├── 海关/边检到位    入位 + 0
├── 开始加油         COBT - 机型参数 - 5
├── 开始清水排污     需求申请 + 15
└── 平台车到位       入位 - 5
```

这里实际上是：

```text
一个阶段
│
├── 主监控目标
│
└── 多个辅助监控目标
```

所以我建议再增加：

```json
"group"
```

例如：

```json
{
  "groupId": "PHASE_04",
  "name": "开驾驶舱门阶段"
}
```

然后：

```text
PHASE_04
│
├── MAIN
│   └── 开驾驶舱门
│
└── AUXILIARY
    ├── 登机梯/客梯车到位
    ├── 代办到位
    ├── 海关/边检到位
    ├── 开始加油
    ├── 开始清水/排污水
    └── 平台车到位
```

这样就和你的 Excel / 图片结构高度一致了。

---

# 十、我甚至建议你不要叫 `schema`

你的：

```json
"schema": []
```

实际上里面混了三种东西：

```text
业务节点定义
+
计算规则
+
监控规则
```

我建议变成：

```json
{
  "checklist": {},
  "events": [],
  "rules": [],
  "parameters": [],
  "checks": []
}
```

---

# 十一、我给你一个完整的推荐顶层结构

我认为这个结构比较适合你后面继续发展：

```json
{
  "id": "checklist_001",
  "category": "货运航班",
  "name": "常规航班",
  "version": 1,

  "parameters": [],

  "events": [],

  "rules": [],

  "checks": []
}
```

---

# 十二、`events`

例如：

```json
{
  "id": "E001",
  "code": "LANDING",
  "name": "预计落地",
  "category": "main",
  "type": "time_event"
}
```

```json
{
  "id": "E002",
  "code": "IN_POSITION",
  "name": "入位",
  "category": "main",
  "type": "time_event"
}
```

```json
{
  "id": "A001",
  "code": "MECHANIC_ARRIVAL",
  "name": "机务到位",
  "category": "auxiliary",
  "type": "time_event"
}
```

---

# 十三、`rules`

然后：

```json
{
  "id": "R001",
  "targetEvent": "E002",

  "description": "实际落地时间+10分钟",

  "formula": {
    "type": "offset",

    "base": {
      "event": "E001",
      "time": "actual"
    },

    "offsetMinutes": 10
  }
}
```

第二个：

```json
{
  "id": "R002",
  "targetEvent": "E005",

  "description": "入位时间+0分钟",

  "formula": {
    "type": "offset",
    "base": {
      "event": "E002",
      "time": "actual"
    },
    "offsetMinutes": 0
  }
}
```

---

# 十四、参数单独管理

例如：

```json
{
  "code": "UNLOADING_DURATION",
  "name": "标准卸机作业时长",
  "type": "aircraft_type",

  "values": {
    "B747": 80,
    "B777": 80,
    "B767": 75,
    "B757": 50,
    "B737": 40
  }
}
```

你的“卸机完成”实际上就是：

> 开始卸机 + 标准卸机时长

你 JSON 目前已经表达了这个意思。

那么公式就是：

```json
{
  "type": "add",

  "operands": [
    {
      "type": "event",
      "event": "START_UNLOAD",
      "time": "actual"
    },
    {
      "type": "parameter",
      "code": "UNLOADING_DURATION",
      "key": "aircraftType"
    }
  ]
}
```

---

# 十五、这样就可以支持非常复杂的公式

你以后完全可以支持：

### A + 10

```json
{
  "type": "offset",
  "base": "A",
  "offsetMinutes": 10
}
```

### A - 5

```json
{
  "type": "offset",
  "base": "A",
  "offsetMinutes": -5
}
```

### A + 参数

```json
{
  "type": "add",
  "operands": [
    "A",
    {
      "type": "parameter",
      "code": "X"
    }
  ]
}
```

### A - 参数 - 20

```json
{
  "type": "subtract",
  "operands": [
    "A",
    {
      "type": "parameter",
      "code": "X"
    },
    20
  ]
}
```

### A 或 B

```json
{
  "type": "anyOf",
  "rules": [
    "A",
    "B"
  ]
}
```

### A 且 B

```json
{
  "type": "allOf",
  "rules": [
    "A",
    "B"
  ]
}
```

### 根据机型

```json
{
  "type": "parameter",
  "code": "LOADING_DURATION",
  "key": {
    "field": "aircraftType"
  }
}
```

---

# 十六、但还有一个非常重要的问题

你图片里的：

**“完成情况”**

我建议你**绝对不要放到这个静态 JSON 里面。**

例如图片：

| 主要监控指标 | 标准描述     | 完成情况  |
| ------ | -------- | ----- |
| 入位     | 实际落地+10  | 09:12 |
| 开驾驶舱门  | 开始挡轮挡+10 | 09:25 |

这里：

```text
标准描述
```

属于规则。

但是：

```text
完成情况
```

属于**一次航班执行结果**。

所以必须分开。

---

# 十七、最终实际上应该有三套数据

这是我最推荐你采用的架构：

```text
                检查单模板
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
     Event         Rule       Parameter
       │            │            │
       └────────────┼────────────┘
                    ↓
                航班执行
                    │
                    ↓
               Actual Event
                    │
                    ↓
              Compliance Result
```

例如：

## 模板

```text
入位
标准：落地+10
```

## 航班实际

```text
实际落地：10:00
实际入位：10:08
```

## 系统计算

```text
标准时间 = 10:10
实际时间 = 10:08

偏差 = -2分钟
```

## 最终结果

```json
{
  "event": "IN_POSITION",
  "standardTime": "10:10",
  "actualTime": "10:08",
  "deviationMinutes": -2,
  "status": "early"
}
```

这才是你以后真正能够做：

> **自动计算 + 自动判断 + 自动展示 + AI分析**

的基础。

---

# 十八、你的图片其实可以非常自然地映射到这个结构

图片中的：

```text
序号
```

只是：

```json
"sequence": 1
```

---

```text
主要监控指标
```

对应：

```json
"category": "main"
```

---

```text
辅助监控指标
```

对应：

```json
"category": "auxiliary"
```

---

```text
标准描述
```

对应：

```json
"description"
```

---

```text
完成情况
```

**不要放模板里**，而是执行数据：

```json
"actualTime"
```

---

```text
备注
```

可以作为：

```json
"notes"
```

---

# 十九、我建议最终采用这种关系

最核心的一层：

```text
Checklist
│
├── Phase 1
│   ├── Main Event
│   ├── Auxiliary Event
│   └── Auxiliary Event
│
├── Phase 2
│   ├── Main Event
│   ├── Auxiliary Event
│   └── Video Check
│
├── Phase 3
│   └── Main Event
│
└── ...
```

然后每一个 Event：

```text
Event
│
├── 基础信息
│
├── 标准规则
│    ├── Formula
│    ├── Condition
│    └── Alternative
│
├── 展示信息
│
└── 监控要求
```

---

# 二十、还有一个特别重要的优化：不要使用 `id + uuid` 双重引用

你现在大量出现：

```json
"refUuid": "...",
"refId": 2
```

实际上很容易造成：

```text
到底 uuid 是主键？
还是 id 是主键？
```

建议统一：

```json
"eventRef": "E002"
```

例如：

```json
{
  "type": "offset",
  "base": {
    "eventRef": "E002",
    "time": "actual"
  },
  "offsetMinutes": -5
}
```

数据库内部你可以使用 UUID：

```text
E002 -> UUID
```

但是规则 JSON **只使用稳定的 code / uuid 之一**。

我更推荐：

```text
code
```

比如：

```text
LANDING
IN_POSITION
START_CHOCK
OPEN_COCKPIT_DOOR
START_UNLOAD
UNLOAD_COMPLETE
START_LOAD
LOAD_COMPLETE
CLOSE_CARGO_DOOR
CLOSE_COCKPIT_DOOR
PUSHBACK
TAXI_OUT
TAKEOFF
```

因为这样规则一眼就能看懂。

---

# 二十一、最终你的计算器就会非常简单

以后 Node.js 里面甚至可以做：

```js
calculateRule(rule, context)
```

例如：

```js
calculateRule({
    type: "offset",
    base: {
        eventRef: "IN_POSITION",
        time: "actual"
    },
    offsetMinutes: 10
}, context);
```

得到：

```js
"2026-08-18 10:20:00"
```

再比如：

```js
calculateRule({
    type: "add",
    operands: [
        {
            type: "event",
            eventRef: "START_UNLOAD",
            time: "actual"
        },
        {
            type: "parameter",
            code: "UNLOADING_DURATION",
            key: "aircraftType"
        }
    ]
}, context);
```

如果：

```text
START_UNLOAD = 10:00
aircraftType = B737
UNLOADING_DURATION[B737] = 40
```

结果：

```text
10:40
```

---

# 二十二、所以我对你现在这个 JSON 的评价

**不是说你现在的 JSON 写错了，而是你已经走到了“继续堆字段就会崩”的阶段。**

你现在的设计已经暴露出了几个明显信号：

```text
timeLink
    ↓
开始出现 object / array 混用

offsetMinutes
    ↓
开始出现 number / array / parameter 混用

calcLogic
    ↓
开始出现 and / or

options
    ↓
开始表达条件分支

refUuid / refId
    ↓
开始表达依赖关系

desc
    ↓
同时承担展示 + 计算说明
```

例如“关货舱门”已经出现了：

> 装机完成+15分钟 **或** COBT-5分钟。

“推出”又出现：

> 关驾驶舱门+5分钟 **或** COBT+0分钟。

这说明你的业务规则已经不是普通 JSON 配置，而是一个**小型规则引擎**。

---

## 我最推荐你的最终方向

不要继续在现在这个结构上打补丁。

直接改成：

```text
                Checklist
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
      Events       Rules     Parameters
        │           │           │
        │           └─────┬─────┘
        │                 ↓
        └────────────── Rule Engine
                          │
                          ↓
                    Flight Context
                          │
                          ↓
                    Actual Events
                          │
                          ↓
                  Compliance Result
                          │
                          ↓
                    React 展示
```

**这样你的图片只是这个系统的一种“展示视图”，而不是你的数据结构本身。**

而且以后你要做的东西——比如：

* 自动计算每个节点标准时间
* 自动判断提前/正常/超时
* 机型自动套参数
* COBT 改变后全部重新计算
* 实际时间录入后自动判定
* 主指标/辅助指标分组展示
* 视频监管单独展示
* 不同航班类型使用不同规则
* 同一个规则模板版本管理
* AI 根据实际执行情况生成总结

都会比较顺。

**如果是我来做这个项目，我会把你现在这份 JSON 作为“第一版业务数据”，重新转换成 `events + rules + parameters + execution` 四层，而不是继续修改 `timeLink`。**这会是后面最省事的方案。
