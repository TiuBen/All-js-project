#!/bin/bash
# ============================================================
# flight_dispatch 数据库【免密码】一键导入脚本（Linux 服务器）
# ------------------------------------------------------------
# 本脚本不需要填写任何数据库密码，自动检测免密连接方式：
#   方式1（推荐）：当前用户有 sudo 权限 → 自动用 postgres 系统用户，
#                 通过 PG 本地 peer 认证免密执行（PG 默认配置即可）
#   方式2：PG 配置为 trust 本地信任 → 直接用 postgres 用户连接
#
# 用法：
#   1. 上传本脚本 + flight_dispatch_full_YYYYMMDD.sql 到服务器同一目录
#   2. 以 root 执行：bash import_flight_dispatch.sh
#      指定文件：    bash import_flight_dispatch.sh 另一个.sql
#
# ⚠️ 请勿再使用老的 flight_dispatch.sql（2026-09 之前导出）：
#    它只有 checklist_records / fips / flights 三张表，
#    缺少 manual_fips（航班列表数据源）与 fresh_air_cargo，
#    导进去前台会直接报错。
# ============================================================

set -e
export PGCLIENTENCODING=UTF8   # 强制 UTF-8，避免中文乱码

DB_NAME="flight_dispatch"
# 默认用最新的全量快照；也可以命令行传一个文件名覆盖
SQL_FILE="${1:-flight_dispatch_full_20260923.sql}"

echo "=============================================="
echo " 0/5 环境自检"
echo "=============================================="

if [ ! -f "$SQL_FILE" ]; then
  echo "❌ 找不到 SQL 文件：$SQL_FILE"
  echo "   当前目录下的 .sql 文件有："
  ls -1 ./*.sql 2>/dev/null || echo "   （一个都没有，请先上传）"
  exit 1
fi
echo "✅ 待导入文件：$SQL_FILE  ($(du -h "$SQL_FILE" | cut -f1))"

# PostgreSQL 版本提示：快照由 PG 18 导出，uuid 默认值依赖 gen_random_uuid()
# （PG 13+ 内置；12 及以下需要 pgcrypto 扩展，本脚本会自动尝试创建）
if command -v psql >/dev/null 2>&1; then
  echo "   psql 客户端版本：$(psql --version)"
else
  echo "⚠️  未找到 psql 命令，请先安装 postgresql-client"
fi

# ---------- 自动检测可用的免密 psql 命令 ----------
detect_psql() {
  # 方式1: sudo -u postgres（peer 认证，最通用）
  if command -v sudo >/dev/null 2>&1 && sudo -u postgres psql -d postgres -tAc "SELECT 1" >/dev/null 2>&1; then
    echo "sudo -u postgres psql"
    return 0
  fi
  # 方式2: 直接 postgres 用户（trust 认证）
  if psql -U postgres -d postgres -tAc "SELECT 1" >/dev/null 2>&1; then
    echo "psql -U postgres"
    return 0
  fi
  return 1
}

PSQL_CMD="$(detect_psql)" || {
  echo "❌ 无法免密连接 PostgreSQL，请选择以下任一方式处理："
  echo "   a) 以 root 用户运行本脚本（多数服务器 root 可 sudo -u postgres）"
  echo "   b) 给 postgres 设置密码后，改用带密码版本脚本"
  echo "      sudo -u postgres psql -c \"ALTER USER postgres WITH PASSWORD '你的密码';\""
  exit 1
}
echo "✅ 已使用免密方式：${PSQL_CMD}"

echo "=============================================="
echo " 1/5 检查数据库是否存在"
echo "=============================================="
DB_EXISTS=$($PSQL_CMD -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'")
if [ "$DB_EXISTS" = "1" ]; then
  echo "   数据库 ${DB_NAME} 已存在，将直接导入数据（保留原库内容）"
else
  echo "   创建数据库 ${DB_NAME} ..."
  $PSQL_CMD -d postgres -c "CREATE DATABASE ${DB_NAME} ENCODING 'UTF8'"
fi

echo "=============================================="
echo " 2/5 预置 uuid 生成函数（PG 12 及以下需要）"
echo "=============================================="
$PSQL_CMD -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;" >/dev/null 2>&1 \
  && echo "   pgcrypto 已就绪" \
  || echo "   跳过（PG 13+ 已内置 gen_random_uuid，无需扩展）"

echo "=============================================="
echo " 3/5 导入数据（${SQL_FILE}）"
echo "=============================================="
# 用 stdin 重定向方式导入（比 -f 更稳妥：不受系统编码影响）
$PSQL_CMD -d "$DB_NAME" < "$SQL_FILE"
echo "   导入完成"

echo "=============================================="
echo " 4/5 验证数据量"
echo "=============================================="
$PSQL_CMD -d "$DB_NAME" -c "
  SELECT 'fips' AS 表名, count(*) AS 行数 FROM fips
  UNION ALL SELECT 'flights', count(*) FROM flights
  UNION ALL SELECT 'manual_fips', count(*) FROM manual_fips
  UNION ALL SELECT 'checklist_records', count(*) FROM checklist_records
  UNION ALL SELECT 'fresh_air_cargo', count(*) FROM fresh_air_cargo;
"

echo "=============================================="
echo " 5/5 验证关键结构（缺了前台会直接报错）"
echo "=============================================="
# manual_fips.uuid 是航班身份字段，前端创建检查单靠它
UUID_COL=$($PSQL_CMD -d "$DB_NAME" -tAc "
  SELECT count(*) FROM information_schema.columns
  WHERE table_name='manual_fips' AND column_name='uuid'")
if [ "$UUID_COL" = "1" ]; then
  echo "✅ manual_fips.uuid 列存在"
else
  echo "❌ manual_fips.uuid 列缺失！前端创建检查单会失败。"
  echo "   补救：$PSQL_CMD -d $DB_NAME -c \"ALTER TABLE manual_fips ADD COLUMN uuid VARCHAR(64) NOT NULL DEFAULT gen_random_uuid()::text;\""
  echo "         $PSQL_CMD -d $DB_NAME -c \"CREATE UNIQUE INDEX IF NOT EXISTS manual_fips_uuid_key ON manual_fips(uuid);\""
fi

echo "=============================================="
echo " 完成 ✅ 数据库 ${DB_NAME} 已就绪（全程未使用密码）"
echo " 下一步：配置 .env 的 PG_PASSWORD，然后启动后端"
echo "=============================================="
