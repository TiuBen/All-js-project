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
#   1. 上传本脚本 + flight_dispatch.sql 到服务器同一目录
#   2. 以 root 执行：bash import_flight_dispatch.sh
# ============================================================

set -e
export PGCLIENTENCODING=UTF8   # 强制 UTF-8，避免中文乱码

DB_NAME="flight_dispatch"
SQL_FILE="flight_dispatch.sql"

echo "=============================================="
echo " 0/4 自动检测免密连接方式"
echo "=============================================="

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
echo " 1/4 检查数据库是否存在"
echo "=============================================="
DB_EXISTS=$($PSQL_CMD -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'")
if [ "$DB_EXISTS" = "1" ]; then
  echo "   数据库 ${DB_NAME} 已存在，将直接导入数据（保留原库内容）"
else
  echo "   创建数据库 ${DB_NAME} ..."
  $PSQL_CMD -d postgres -c "CREATE DATABASE ${DB_NAME} ENCODING 'UTF8'"
fi

echo "=============================================="
echo " 2/4 导入数据（${SQL_FILE}）"
echo "=============================================="
# 用 stdin 重定向方式导入（比 -f 更稳妥：不受系统编码影响）
$PSQL_CMD -d "$DB_NAME" < "$SQL_FILE"
echo "   导入完成"

echo "=============================================="
echo " 3/4 验证数据量"
echo "=============================================="
$PSQL_CMD -d "$DB_NAME" -c "
  SELECT 'flights' AS 表名, count(*) AS 行数 FROM flights
  UNION ALL SELECT 'fips', count(*) FROM fips
  UNION ALL SELECT 'checklist_records', count(*) FROM checklist_records;
"

echo "=============================================="
echo " 4/4 完成 ✅ 数据库 ${DB_NAME} 已就绪（全程未使用密码）"
echo "=============================================="
