结合你现在的 `ecyilang`、`airport_name_code`、`airplane_company_name_code` 三张表，以及你后续可能需要处理大量航班数据的情况，我建议采用：

**独立字典表 + PostgreSQL 后端 JOIN + 前端控制显示方式。**

不过，你目前的数据库设计还有一个值得考虑的问题：**航空公司和机场名称的映射应该由后端统一处理，而不是每次导入航班时，都把 IATA、ICAO 代码写进 `ecyilang`。**

## 一、先明确这三种方案的区别

| 对比项目 | 方案 A：每行存储代码 | 方案 B：前端映射 | 方案 C：字典表 + 后端 JOIN |
|---|---|---|---|
| `ecyilang` 存储内容 | 名称、IATA、ICAO | 名称 | 名称 |
| 字典数据存放位置 | 航班表 | 前端 | 独立字典表 |
| 查询时是否需要 JOIN | 不需要 | 不需要 | 需要 |
| 字典更新后的维护成本 | 可能需要更新大量航班 | 更新前端字典 | 更新字典表即可 |
| 后端按 ICAO 筛选 | 可以 | 不方便 | 可以 |
| 后端按 ICAO 排序 | 可以 | 不方便 | 可以 |
| 服务端分页 | 可以 | 需要额外处理 | 可以 |
| 数据一致性 | 可能出现不一致 | 取决于前端字典 | 较容易统一维护 |
| 推荐程度 | 数据量小、查询简单 | 纯展示用途 | **推荐用于你的系统** |

需要注意：方案 A 本身并不会因为数据量大就必然出现性能问题。它的主要问题是冗余存储和字典更新维护，而方案 C 则更适合需要统一维护、筛选和排序的业务系统。

## 二、你的数据库应该如何设计？

你已经建立了以下字典表：

- `airport_name_code`：机场名称与 IATA、ICAO 代码的映射。
- `airplane_company_name_code`：航空公司名称与 IATA、ICAO 代码的映射。

这两张表可以继续使用，不需要为了实现这个功能再建立一套重复的字典。

### 1. 航班表只保留业务需要的原始字段

例如，你的 `ecyilang` 中可以保留：

```prisma
model ecyilang {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid

  flight_readable_id String?  @unique(map: "ecyilang_readable_id_key") @db.VarChar(256)

  d_flight_date      DateTime? @db.Date
  d_flight_no_full   String?   @db.VarChar(32)
  d_name             String?   @db.VarChar(64)

  a_flight_date      DateTime? @db.Date
  a_flight_no_full   String?   @db.VarChar(32)
  a_name             String?   @db.VarChar(64)

  // 其他原有业务字段保持不变
}
```

这只是展示核心字段的简化示例，并不是让你直接用它替换现有的完整模型。

如果远程接口返回的 `d_name`、`a_name` 是机场中文名称，那么后端就可以根据这两个字段，关联 `airport_name_code`。

但是，如果这两个字段实际上表示航空公司名称，就应该关联 `airplane_company_name_code`。

**首先要确认字段的业务含义。** 从你的字段注释来看，`d_name_iata_code`、`a_name_iata_code` 对应的字典类型需要根据真实数据确定，不能仅凭字段名判断。

### 2. 独立字典表负责统一维护

你的机场字典可以继续保持现有结构：

```prisma
model airport_name_code {
  id                   Int     @id @default(autoincrement())

  chinese_airport_name String  @unique(map: "airport_name_code_name_key") @db.VarChar(64)
  english_airport_name String? @db.VarChar(96)

  airport_iata_code    String? @unique(map: "airport_name_code_iata_key") @db.VarChar(8)
  airport_icao_code    String? @unique(map: "airport_name_code_icao_key") @db.VarChar(8)
}
```

例如，字典表中保存：

| chinese_airport_name | english_airport_name | airport_iata_code | airport_icao_code |
|---|---|---|---|
| 北京首都国际机场 | Beijing Capital International Airport | PEK | ZBAA |
| 上海浦东国际机场 | Shanghai Pudong International Airport | PVG | ZSPD |

上面是结构示例，实际数据应以你维护的机场字典为准。

以后如果需要补充英文名、修正机场代码，只需要修改字典表，不需要批量更新所有航班记录。

---

## 三、后端查询时使用 JOIN

假设 `d_name` 存储的是机场中文名称。

你可以在 PostgreSQL 中这样查询：

```sql
SELECT
    e.id,
    e.d_flight_date,
    e.d_flight_no_full,
    e.d_name,

    a.english_airport_name AS d_name_english,
    a.airport_iata_code AS d_name_iata_code,
    a.airport_icao_code AS d_name_icao_code

FROM public.ecyilang AS e

LEFT JOIN public.airport_name_code AS a
    ON e.d_name = a.chinese_airport_name

WHERE e.d_flight_date = DATE '2026-10-26'

ORDER BY e.d_time ASC

LIMIT 100;
```

这里有几个关键点。

**第一，使用 `LEFT JOIN`。**

即使某个机场暂时没有录入字典，航班记录仍然会返回，只是对应的英文名和代码为 `NULL`。

**第二，先过滤、排序，再分页。**

数据库只需要返回符合查询条件的 100 条记录，不需要把全部航班拉到前端再筛选。

**第三，JOIN 不意味着必须把结果写回航班表。**

`d_name_iata_code`、`d_name_icao_code` 可以作为查询结果中的别名返回，而不一定需要作为 `ecyilang` 的实际存储列。

如果你使用 Prisma 7，可以根据当前项目的数据库访问方式选择 Prisma 查询、原生 SQL 或封装后的查询服务。

---

## 四、你提到的 `english: true`、`icao: false` 应该放在哪里？

这部分应该放在前端。

例如，你可以设置：

```javascript
const airportDisplayConfig = {
    english: true,
    icao: false,
};
```

后端始终返回完整的机场信息：

```json
{
  "d_name": "北京首都国际机场",
  "d_name_english": "Beijing Capital International Airport",
  "d_name_iata_code": "PEK",
  "d_name_icao_code": "ZBAA"
}
```

前端根据配置选择展示内容：

```javascript
function getAirportDisplayName(airport, config) {
    if (!airport) {
        return "";
    }

    if (config.icao) {
        return airport.d_name_icao_code ?? "";
    }

    if (config.english) {
        return airport.d_name_english ?? airport.d_name ?? "";
    }

    return airport.d_name ?? "";
}
```

使用：

```javascript
const displayName = getAirportDisplayName(flight, {
    english: true,
    icao: false,
});
```

输出：

```text
Beijing Capital International Airport
```

如果配置改为：

```javascript
{
    english: false,
    icao: true,
}
```

输出：

```text
ZBAA
```

这里的规则是：**前端负责展示，后端负责查询，数据库负责保存事实数据和字典数据。**

需要注意，如果 `english` 和 `icao` 同时为 `true`，上面的函数会优先显示 ICAO。如果不允许同时开启，建议使用一个明确的枚举配置，例如 `displayMode: "chinese" | "english" | "iata" | "icao"`，避免布尔配置产生歧义。

---

## 五、如果未来航班数据达到百万级，应该注意什么？

真正影响查询效率的，不只是 JOIN，而是查询条件、索引、分页方式以及字典匹配方式。

### 1. 确保字典关联字段有唯一约束

你已经为 `chinese_airport_name` 设置了唯一约束，这意味着数据库可以保证一个中文名称最多对应一条机场记录。

如果未来需要通过英文名称查询，也可以根据业务需求考虑为 `english_airport_name` 添加唯一约束，但前提是你的数据确实能够保证英文名称唯一。

### 2. 为常用航班查询建立索引

你已经有：

```prisma
@@index([d_flight_date], map: "idx_ecyilang_d_flight_date")
@@index([a_flight_date], map: "idx_ecyilang_a_flight_date")
```

如果经常按照离港日期和计划时间查询，可以进一步评估复合索引：

```sql
CREATE INDEX idx_ecyilang_d_date_time
ON public.ecyilang (d_flight_date, d_time);
```

是否需要这个索引，应根据实际查询语句和 `EXPLAIN ANALYZE` 的执行计划判断，而不是无条件增加索引。

### 3. 使用服务端分页

数据量增大后，优先让 PostgreSQL 完成筛选和排序，再返回当前页面需要的数据。

如果数据规模继续增长，且需要频繁翻阅大量历史航班，可以考虑基于时间和唯一 ID 的游标分页，而不是不断增大 `OFFSET`。

### 4. 关注 JOIN 的实际执行计划

对于机场这种小型字典表，JOIN 通常不会是主要性能瓶颈。

即使 `ecyilang` 达到百万级记录，也不能仅凭数据量判断 JOIN 一定很慢。需要结合索引、查询条件、返回行数和执行计划来优化。

---

## 六、结合你现有项目，我的最终建议

| 数据或逻辑 | 建议存放位置 |
|---|---|
| 航班原始数据 | `ecyilang` |
| 机场中文名、英文名、IATA、ICAO | `airport_name_code` |
| 航空公司中文名、IATA、ICAO | `airplane_company_name_code` |
| 航班历史属性变化快照 | `ecyilang.changelog` |
| 字典映射与 JOIN 查询 | 后端 |
| `english`、`icao` 等展示偏好 | React 前端 |
| 筛选、排序、分页 | PostgreSQL / 后端 |
| 机场或航空公司字典的维护 | 独立字典表 |

**还有一个对你目前系统尤其重要的细节：**

你的 `ecyilang` 采用 `flight_readable_id` 作为增量更新的可读唯一键，并通过 `changelog` 记录原始快照。因此，不建议仅仅为了显示英文名或 ICAO 代码，就改变这套航班数据同步机制。

可以先让后端在查询时 JOIN 字典表，并将需要的字段返回给 React。这样既保留了你现有的增量更新和历史快照设计，也能让前端灵活切换中文、英文、IATA 和 ICAO 显示方式。

如果以后确实出现 JOIN 查询的性能问题，再根据实际数据量、查询频率和执行计划，决定是否增加缓存或冗余字段，而不必现在提前把所有代码写进每一条航班记录。


```
SELECT
    e.id,
    e.d_flight_date,
    e.d_flight_no_full,
    e.d_name,

    a.english_airport_name AS d_name_english,
    a.airport_iata_code AS d_name_iata_code,
    a.airport_icao_code AS d_name_icao_code

FROM public.ecyilang AS e

LEFT JOIN public.airport_name_code AS a
    ON e.d_name = a.chinese_airport_name

WHERE e.d_flight_date = DATE '2026-10-26'

ORDER BY e.d_time ASC 第一，使用 LEFT JOIN。
```

如何让我没有d_name_english 的时候 默认中文


在 PostgreSQL 中使用 `COALESCE()`，就可以实现：**如果没有英文名，就默认返回中文名。**

### 修改后的 SQL

```sql
SELECT
    e.id,
    e.d_flight_date,
    e.d_flight_no_full,
    e.d_name,

    -- 优先英文名，没有英文名则使用中文名
    COALESCE(
        NULLIF(TRIM(a.english_airport_name), ''),
        e.d_name
    ) AS d_name_english,

    a.airport_iata_code AS d_name_iata_code,
    a.airport_icao_code AS d_name_icao_code

FROM public.ecyilang AS e

LEFT JOIN public.airport_name_code AS a
    ON e.d_name = a.chinese_airport_name

WHERE e.d_flight_date = DATE '2026-10-26'

ORDER BY e.d_time ASC;
```

### 为什么这样写？

```sql
COALESCE(
    NULLIF(TRIM(a.english_airport_name), ''),
    e.d_name
) AS d_name_english
```

它会按照以下顺序处理：

1. `TRIM()`：去掉英文名首尾的空格。
2. `NULLIF(..., '')`：如果英文名为空字符串，就将其转换为 `NULL`。
3. `COALESCE()`：如果英文名为 `NULL`，就返回 `e.d_name`，也就是原始中文名。

| english_airport_name | d_name | 最终返回的 d_name_english |
|---|---|---|
| Beijing Capital International Airport | 北京首都国际机场 | Beijing Capital International Airport |
| `NULL` | 北京首都国际机场 | 北京首都国际机场 |
| 空字符串 `''` | 北京首都国际机场 | 北京首都国际机场 |
| `NULL` | `NULL` | `NULL` |

即使机场字典表中完全没有对应记录，`LEFT JOIN` 也会保留航班数据，并且最终返回中文名。

**建议：** 你可以将这种处理方式用于所有需要优先显示英文名、缺失时回退到中文名的字段。至于 IATA、ICAO 代码，如果没有对应值，通常建议保留 `NULL`，避免把中文名称误当成机场代码。