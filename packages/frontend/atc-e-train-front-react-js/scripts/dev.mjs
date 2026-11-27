// scripts/dev.mjs - 一键启动开发环境
//
// 解决的问题：单独 pnpm dev 只起 Vite，后端 e-train(3206) 没在运行时
// 页面所有 /api 请求都会报 proxy error ECONNREFUSED。
//
// 流程：探测 3206 健康 → 没起就先拉后端 → 等健康检查通过 → 再起 Vite
//       退出（Ctrl+C / vite 关闭）时顺带收掉自己拉起的后端
// 如果 3206 已经有服务在跑（比如手动起的），直接复用，退出时不杀它
import { spawn } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const FRONTEND_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BACKEND_DIR = path.resolve(FRONTEND_DIR, '../../backend/full-web-backend');
const PORT = 3206;

// 健康检查：GET /health，200 即就绪
function checkHealth() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${PORT}/health`, { timeout: 1000 }, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

// 轮询等待后端就绪（最多 15 秒）
async function waitBackendReady() {
  for (let i = 0; i < 30; i++) {
    if (await checkHealth()) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

const backendAlive = await checkHealth();
let backendProc = null;

if (backendAlive) {
  console.log(`[dev] 后端 3206 已在运行，直接复用`);
} else {
  // 只拉起 e-train 这一个微服务，不动 full-web-backend 根 index.js 里的其他服务
  backendProc = spawn(
    process.execPath,
    ['-e', `require('./v6-e-train/app').listen(${PORT}, () => console.log('[dev] E-Train API on ${PORT}'))`],
    { cwd: BACKEND_DIR, stdio: 'inherit' }
  );
  backendProc.on('exit', (code) => console.log(`[dev] 后端退出（code=${code}）`));

  const ready = await waitBackendReady();
  if (!ready) {
    console.error('[dev] 后端 15 秒内未就绪，请检查数据库/依赖后手动启动');
    backendProc.kill();
    process.exit(1);
  }
  console.log('[dev] 后端已就绪');
}

// 起 Vite（Windows 下 pnpm 是 .cmd，必须 shell:true）
const viteProc = spawn('pnpm', ['run', 'dev:vite'], { cwd: FRONTEND_DIR, stdio: 'inherit', shell: true });

// 收尾：vite 退出或 Ctrl+C 时，杀掉自己拉起的后端（不是自己拉起的不动）
function cleanup() {
  if (backendProc && !backendProc.killed) backendProc.kill();
}
viteProc.on('exit', (code) => {
  cleanup();
  process.exit(code ?? 0);
});
process.on('SIGINT', () => {
  cleanup();
  viteProc.kill();
  process.exit(0);
});
