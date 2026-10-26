<#
.SYNOPSIS
    flight_dispatch 数据库一键导入脚本（Windows / PowerShell 版）
    与 import_flight_dispatch.sh 功能等价。

.DESCRIPTION
    1. 自动定位 psql.exe（PATH 里找不到就去 C:\Program Files\PostgreSQL\*\bin 找）
    2. 检查目标库是否存在，不存在则自动创建（UTF8）
    3. 目标库已有表时默认拒绝导入（防止把数据重复追加进去），加 -Force 才继续
    4. 强制 PGCLIENTENCODING=UTF8 导入，避免 Windows 默认 GBK 造成中文乱码
    5. 导入后打印各表行数

.EXAMPLE
    .\import_flight_dispatch.ps1
    使用脚本内置默认配置导入到 flight_dispatch。

.EXAMPLE
    .\import_flight_dispatch.ps1 -DbName flight_dispatch_restore -PgPassword admin
    导入到一个新库，不动现有库（推荐做法）。

.EXAMPLE
    .\import_flight_dispatch.ps1 -DbName flight_dispatch -Force
    目标库已有表也强行继续（会重复追加数据，慎用）。
#>
[CmdletBinding()]
param(
    [string] $PgHost     = '127.0.0.1',
    [int]    $PgPort     = 5432,
    [string] $PgUser     = 'postgres',
    [string] $PgPassword = '',                          # 留空则依次尝试 $env:PGPASSWORD、后端 .env
    [string] $DbName     = 'flight_dispatch',
    [string] $SqlFile    = '',                          # 留空 = 本脚本同目录的 flight_dispatch.sql
    [switch] $Force
)

$ErrorActionPreference = 'Stop'

function Write-Step([string] $text) {
    Write-Host '=============================================='
    Write-Host " $text"
    Write-Host '=============================================='
}

# ---------- 1. 定位 psql.exe ----------
function Resolve-Psql {
    $cmd = Get-Command psql.exe -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $roots = @("$env:ProgramFiles\PostgreSQL", "${env:ProgramFiles(x86)}\PostgreSQL")
    foreach ($root in $roots) {
        if (-not (Test-Path $root)) { continue }
        $hit = Get-ChildItem $root -Directory -ErrorAction SilentlyContinue |
               Sort-Object { [int]($_.Name -replace '\D', '') } -Descending |
               ForEach-Object { Join-Path $_.FullName 'bin\psql.exe' } |
               Where-Object { Test-Path $_ } |
               Select-Object -First 1
        if ($hit) { return $hit }
    }
    throw "找不到 psql.exe。请安装 PostgreSQL 客户端，或把它的 bin 目录（如 C:\Program Files\PostgreSQL\18\bin）加入 PATH。"
}

# ---------- 2. 解析密码 ----------
function Resolve-Password([string] $given) {
    if ($given) { return $given }
    if ($env:PGPASSWORD) { return $env:PGPASSWORD }

    $envFile = Join-Path $PSScriptRoot '..\..\.env'
    if (Test-Path $envFile) {
        $m = Select-String -Path $envFile -Pattern '^\s*PG_PASSWORD\s*=\s*(.+?)\s*$' -ErrorAction SilentlyContinue |
             Select-Object -First 1
        if ($m) { return $m.Matches[0].Groups[1].Value.Trim('"', "'") }
    }

    $sec = Read-Host "请输入 $PgUser 的数据库密码" -AsSecureString
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}

$psql = Resolve-Psql
if (-not $PgPassword) { $PgPassword = Resolve-Password $PgPassword }

if (-not $SqlFile) { $SqlFile = Join-Path $PSScriptRoot 'flight_dispatch.sql' }
if (-not (Test-Path $SqlFile)) { throw "找不到 SQL 文件：$SqlFile" }

$env:PGPASSWORD       = $PgPassword
$env:PGCLIENTENCODING = 'UTF8'   # 关键：不设的话 Windows 会按 GBK 读文件，报「无效的 UTF8 编码字节顺序」

Write-Host ''
Write-Host "psql   : $psql"
Write-Host "目标   : $PgUser@${PgHost}:${PgPort}/$DbName"
Write-Host "SQL    : $SqlFile"
Write-Host ''

# 通用执行器：统一拼参数，避免引号/空格踩坑
# 注意：SQL 里**不要写中文**（列别名等）。Windows PowerShell 5.1 把参数交给原生 exe 时
# 会按系统 ANSI(GBK) 转码，中文字节传到 psql 就成了非法 UTF-8 → 报「无效的 UTF8 编码字节顺序」。
function Invoke-Psql {
    param([string] $Database, [string[]] $Arguments)
    $all = @('-h', $PgHost, '-p', "$PgPort", '-U', $PgUser, '-d', $Database) + $Arguments
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'   # 让 psql 的报错正常回显，而不是抛 NativeCommandError
    try {
        $out  = & $psql @all 2>&1 | ForEach-Object { "$_" }
        $code = $LASTEXITCODE
    }
    finally { $ErrorActionPreference = $prev }
    return @{ Code = $code; Out = $out }
}

# ---------- 3. 检查 / 创建数据库 ----------
Write-Step ' 1/4 检查数据库是否存在'
$r = Invoke-Psql -Database 'postgres' -Arguments @('-tAc', "SELECT 1 FROM pg_database WHERE datname='$DbName'")
if ($r.Code -ne 0) { throw "连接 PostgreSQL 失败，请检查主机/端口/用户名/密码。`n$($r.Out -join "`n")" }

$dbExists = ($r.Out | Out-String).Trim() -eq '1'
if ($dbExists) {
    Write-Host "   数据库 $DbName 已存在"
    $r2 = Invoke-Psql -Database $DbName -Arguments @('-tAc', "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'")
    $tblCount = [int](($r2.Out | Out-String).Trim())
    if ($tblCount -gt 0) {
        if (-not $Force) {
            Write-Host "   [拒绝执行] 该库已有 $tblCount 张表，继续导入会重复追加数据（如 fips 会变成两万行）。" -ForegroundColor Yellow
            Write-Host '   若要导入到干净环境，换一个库名，例如：' -ForegroundColor Yellow
            Write-Host "       .\import_flight_dispatch.ps1 -DbName ${DbName}_restore" -ForegroundColor Yellow
            Write-Host '   确实要往现有库里继续灌，加 -Force。' -ForegroundColor Yellow
            exit 2
        }
        Write-Host "   [警告] 该库已有 $tblCount 张表，-Force 已指定，继续导入。" -ForegroundColor Yellow
    }
}
else {
    Write-Host "   创建数据库 $DbName ..."
    $r = Invoke-Psql -Database 'postgres' -Arguments @('-v', 'ON_ERROR_STOP=1', '-c', "CREATE DATABASE `"$DbName`" TEMPLATE template0 ENCODING 'UTF8'")
    if ($r.Code -ne 0) { throw "创建数据库失败：`n$($r.Out -join "`n")" }
}

# ---------- 4. 导入 ----------
Write-Step " 2/4 导入数据（$(Split-Path $SqlFile -Leaf)）"
# 用 -f 直接读文件（已设 PGCLIENTENCODING=UTF8，不会走 GBK）；
# ON_ERROR_STOP=1 保证任何一条 SQL 出错就立刻停下，而不是带着报错继续灌数据。
$r = Invoke-Psql -Database $DbName -Arguments @('-v', 'ON_ERROR_STOP=1', '-f', $SqlFile)
if ($r.Code -ne 0) {
    Write-Host ($r.Out | Out-String)
    throw '导入失败（已中断，未写入后续语句）'
}
Write-Host '   导入完成'

# ---------- 5. 验证 ----------
Write-Step ' 3/4 验证数据量'
$sql = "SELECT relname AS table_name, n_live_tup AS row_count FROM pg_stat_user_tables WHERE schemaname = 'public' ORDER BY relname;"
$r = Invoke-Psql -Database $DbName -Arguments @('-c', $sql)
Write-Host ($r.Out | Out-String)
if ($r.Code -ne 0) { Write-Host '   [警告] 行数统计失败，请手工确认' -ForegroundColor Yellow }

# 用精确 count(*) 复核关键表（pg_stat 的 n_live_tup 是估算值，刚导入可能为 0）
foreach ($t in @('flights', 'fips', 'checklist_records')) {
    $rc = Invoke-Psql -Database $DbName -Arguments @('-tAc', "SELECT count(*) FROM $t")
    if ($rc.Code -eq 0) {
        Write-Host ("   {0,-20} {1}" -f $t, (($rc.Out | Out-String).Trim()))
    }
}

Write-Step " 4/4 完成 - 数据库 $DbName 已就绪"
Write-Host ''
Write-Host '提示：要让后端连到这个库，改 .env 里的 PG_DATABASE（和 DATABASE_URL 里的库名）。' -ForegroundColor DarkGray
exit 0
