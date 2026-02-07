# 配置参数
$serverIP = "47.97.223.233"                      # 阿里云服务器IP
$username = "root"                               # 替换为您的服务器用户名（如 ecs-user、ubuntu 等）
# $pemPath = "C:\Users\HJW-AMD-PRP\Desktop\zhectower.pem"  # PEM密钥路径
$pemPath = "C:\Users\jserver\Desktop\zhectower.pem"  # PEM密钥路径
$remoteFile = "/usr/zhec-tower-server/test.db"           # 远程文件路径
$localPath = ".\v4\src\test.db"                         # 本地保存路径（当前目录）

# 检查PEM文件是否存在
if (-not (Test-Path $pemPath)) {
    Write-Host "ERROR:PEM no exist, check the path: $pemPath"
    exit
}

# 设置PEM文件权限（避免权限过宽报错）
try {
    icacls $pemPath /reset
    icacls $pemPath /grant:r "$env:USERNAME:(R)"
} catch {
    Write-Host "WARIN Failed to set permissions for PEM file (administrator rights may be required), continuing download attempt..."
}

# 使用SCP命令下载文件
Write-Host "downloading..."
scp -i $pemPath "${username}@${serverIP}:${remoteFile}" $localPath

# 检查结果
if (Test-Path $localPath) {
    Write-Host "OK downloaded!: $(Resolve-Path $localPath)"
} else {
    Write-Host "ERROR 下载失败，请检查："
    Write-Host "ERROR1. Is the server username correct?: $username）"
    Write-Host "ERROR2. Does the remote file path exist? (current path)    : $remoteFile）"
    Write-Host "ERROR3. Has the server security group opened port 22?    "
    Write-Host "ERROR4. Does the PEM key match this server?    "
}