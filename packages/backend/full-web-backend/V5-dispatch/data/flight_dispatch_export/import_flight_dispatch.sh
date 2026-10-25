#!/bin/bash
# ============================================================
# flight_dispatch 数据库一键导入脚本（阿里云 Linux 服务器）
# ------------------------------------------------------------
# 用法：
#   1. 把本脚本 和 flight_dispatch.sql 上传到服务器同一目录
#   2. 按需修改下方 PG 连接变量
#   3. 执行：bash import_flight_dispatch.sh
# ============================================================

# ---------- 连接配置（按服务器实际情况修改） ----------
PG_HOST="127.0.0.1"            # 本机 PG 一般用 127.0.0.1
PG_PORT="5432"
PG_USER="postgres"
PG_PASSWORD="你的数据库密码"    # ← 改成服务器上 postgres 的密码
DB_NAME="flight_dispatch"
SQL_FILE="flight_dispatch.sql" # 保持与本脚本同目录

set -e
export PGPASSWORD="$PG_PASSWORD"
# 强制客户端 UTF-8，避免终端/系统默认编码（如 Windows GBK）导致中文乱码或导入报错
export PGCLIENTENCODING=UTF8

echo "=============================================="
echo " 1/4 检查数据库是否存在"
echo "=============================================="
DB_EXISTS=$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d postgres -tAc \
  "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'")
if [ "$DB_EXISTS" = "1" ]; then
  echo "   数据库 ${DB_NAME} 已存在，将直接导入数据（保留原库内容）"
else
  echo "   创建数据库 ${DB_NAME} ..."
  psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d postgres -c "CREATE DATABASE ${DB_NAME} ENCODING 'UTF8'"
fi

echo "=============================================="
echo " 2/4 导入数据（${SQL_FILE}）"
echo "=============================================="
# 用 stdin 重定向方式导入（比 -f 更稳妥：不受系统编码影响）
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$DB_NAME" < "$SQL_FILE"
echo "   导入完成"

echo "=============================================="
echo " 3/4 验证数据量"
echo "=============================================="
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$DB_NAME" -c "
  SELECT 'flights' AS 表名, count(*) AS 行数 FROM flights
  UNION ALL SELECT 'fips', count(*) FROM fips
  UNION ALL SELECT 'checklist_records', count(*) FROM checklist_records;
"

echo "=============================================="
echo " 4/4 完成 ✅ 数据库 ${DB_NAME} 已就绪"
echo "=============================================="
