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

## 如果服务器是 Windows

把 `flight_dispatch.sql` 放到任意目录，然后：

```powershell
# 在 PG 的 bin 目录（如 C:\Program Files\PostgreSQL\18\bin）执行：
$env:PGPASSWORD = "你的密码"
$env:PGCLIENTENCODING = "UTF8"

# 建库（不存在才建）
psql -U postgres -h 127.0.0.1 -p 5432 -d postgres -c "SELECT 1 FROM pg_database WHERE datname='flight_dispatch'" | findstr "1" || psql -U postgres -h 127.0.0.1 -p 5432 -d postgres -c "CREATE DATABASE flight_dispatch ENCODING 'UTF8'"

# 导入（务必用 < 重定向方式，用 -f 会在中文编码上出错）
psql -U postgres -h 127.0.0.1 -p 5432 -d flight_dispatch < D:\flight_dispatch.sql
```

> ⚠️ 经验：Windows 下 `psql -f 文件` 会用系统 GBK 编码读 UTF-8 文件导致报错（`无效的 UTF8 编码字节顺序`），
> 用 `<` 重定向 + `PGCLIENTENCODING=UTF8` 即可正常导入（已在本地完整验证：flights 10310 / fips 10300 / checklist_records 4）。

## 注意事项

- 服务器 PostgreSQL 版本建议 ≥ 12（导出自 18.3，向下兼容较好；若服务器版本过低，`CREATE TABLE`/`COPY` 语法依然兼容）
- 如果服务器上 `psql` 命令不在 PATH：Ubuntu/Debian 用 `sudo apt install postgresql-client`，CentOS 用 `sudo yum install postgresql`，或直接用 PG 安装目录下的 bin
- 导入后，后端 `.env` 连接配置需指向服务器数据库（如 `PG_HOST=服务器地址`、`PG_PASSWORD=实际密码`），并确认服务器安全组放通 5432 端口
