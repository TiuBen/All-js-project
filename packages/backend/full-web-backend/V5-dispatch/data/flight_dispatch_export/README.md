# flight_dispatch 数据库导出包

本目录包含完整导出，用于在**阿里云服务器**（或其他任何装有 PostgreSQL 的 Linux/Windows 机器）上快速恢复 `flight_dispatch` 数据库。

## 文件清单

| 文件 | 说明 |
|---|---|
| `flight_dispatch.sql` | 数据库完整导出（3 张表结构 + 全部数据，UTF-8） |
| `import_flight_dispatch.sh` | 服务器一键导入脚本（Linux） |

## 数据内容（已验证）

| 表 | 行数 |
|---|---|
| `flights` | 10,310 |
| `fips` | 10,300 |
| `checklist_records` | 4 |

## 在阿里云服务器上导入（Linux）

```bash
# 1. 上传文件到服务器（任选其一）
scp flight_dispatch.sql import_flight_dispatch.sh root@服务器IP:/root/
# 或使用宝塔面板/阿里云控制台的文件管理上传

# 2. 编辑脚本，把密码改成你服务器的实际密码
vim /root/import_flight_dispatch.sh
#   修改：PG_PASSWORD="你的数据库密码"

# 3. 执行导入
cd /root
bash import_flight_dispatch.sh
```

脚本会自动：
1. 检查数据库是否存在，不存在则自动创建（UTF8）
2. 执行 SQL 导入（建表 + 数据）
3. 打印三张表的行数验证是否导入成功

## 在 Windows 上导入

`.sh` 在 Windows 上跑不了，同目录另配了两个等价文件：

| 文件 | 用途 |
|---|---|
| `import_flight_dispatch.ps1` | Windows 主脚本（逻辑同 `.sh`，多了安全检查） |
| `import_flight_dispatch.cmd` | 双击运行入口（内部调 `.ps1`） |

```powershell
# 方式一：直接双击 import_flight_dispatch.cmd（会提示输入密码）

# 方式二：在 PowerShell 里指定参数（推荐导到新库，不动现有 flight_dispatch）
cd "V5-dispatch\data\flight_dispatch_export"
.\import_flight_dispatch.ps1 -DbName flight_dispatch_restore -PgPassword admin
```

参数：`-PgHost -PgPort -PgUser -PgPassword -DbName -SqlFile -Force`
（密码留空时依次尝试 `$env:PGPASSWORD` → 后端 `.env` 的 `PG_PASSWORD` → 交互输入）

脚本做了什么：
1. 自动定位 `psql.exe`（PATH 里没有就去 `C:\Program Files\PostgreSQL\*\bin` 找）
2. 库不存在则 `CREATE DATABASE ... ENCODING 'UTF8'`
3. **目标库已有表时默认拒绝**（否则 `COPY` 会把 10300 行再追加一遍，fips 变两万行）→ 真要灌加 `-Force`
4. `PGCLIENTENCODING=UTF8` + `ON_ERROR_STOP=1` 导入：避免 GBK 读文件报「无效的 UTF8 编码字节顺序」，且任何一条 SQL 出错立即中断
5. 打印各表行数（`pg_stat` 估算 + `count(*)` 精确复核）

实测结果（本地 PG 18.3）：`flights` 10310 / `fips` 10300 / `checklist_records` 4，中文无乱码，耗时 < 1 秒。

> ⚠️ 已知坑：Windows PowerShell 5.1 把参数交给原生 exe 时按系统 ANSI(GBK) 转码，所以**不要**在 `psql -c "..."`
> 的 SQL 里写中文列别名，会报「无效的 UTF8 编码字节顺序」。脚本里已全部改用英文别名。

## 注意事项

- PostgreSQL 版本建议 ≥ 12（导出自 18.3）
- 若 `psql` 不在 PATH：装 PostgreSQL 客户端，或直接用安装目录下的 `bin`
- 导入后，后端 `.env` 的 `PG_DATABASE` / `DATABASE_URL` 要改指向目标库；连云服务器还要放通 5432 端口
- ⚠️ 本转储是**旧结构**：只有 `flights` / `fips` / `checklist_records` 三张表、整数主键（`checklist_records.flight_id` 为 `fips-10217` 这类字符串）。
  现在后端 `prisma/schema.prisma` 已经是 uuid 主键 + `records_checklist` / `records_special` / `manual_fips` / `ecyilang` / `user` 等表，
  **导入这份 SQL 并不能让当前后端跑起来**，只适合当作历史数据查看/迁移源。
