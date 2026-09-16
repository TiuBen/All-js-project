/**
 * ============================================================
 * 生成前端静态检查单数据（节点保障模板 + 视频监管重点）
 * ------------------------------------------------------------
 * 用途：把后端 `data/checklists/**／*.json` 全量内联成前端模块，
 *       落到 `src/pages/ChecklistPage/utils/`，使模板在**编译期**确定，
 *       前端不再请求 `/api/checklists/templates`。
 *
 * 用法（项目根，需已装 node）：
 *   node scripts/gen-checklist-static.cjs
 *
 * 何时需要重新运行：
 *   后端 `data/checklists/` 下的 JSON 内容变更后，重跑本脚本即可。
 *   产物文件顶部有 "本文件由脚本生成" 标记，**不要手改产物**。
 *
 * ⚠️ 导出标识符约定：**导出名 = 产物文件名（驼峰）**
 *   模板四份：cargoBypassFlight / cargoInitFlight / passengerInitFlight / passengerBypassFlight
 *   视频监管三份：PASSENGER_VIDEO_FOCUS / CARGO_VIDEO_FOCUS / SHUNHANG_VIDEO_FOCUS
 *   曾因统一 toUpperCase() 把 SHUNHANG_VIDEO_FOCUS 误写成 SHUNHANGVIDEOFOCUS
 *   导致构建失败（rollup: "X is not exported by ..."）——改动前先看清这张表。
 * ============================================================
 */
const fs = require("fs");
const path = require("path");

// 后端 JSON 根目录
// 本脚本位于 packages/frontend/flight-dispatch-system/scripts/ → 上溯 4 级到仓库根
const REPO_ROOT = path.resolve(__dirname, "../../../..");
const SRC = path.join(
  REPO_ROOT,
  "packages/backend/full-web-backend/V5-dispatch/data/checklists"
);
// 前端产物目录（本脚本上一级 = flight-dispatch-system/）
const OUT = path.resolve(__dirname, "../src/pages/ChecklistPage/utils");

// 源文件（相对 SRC）→ [产物文件名, 导出标识符, 产物中文注释名]
// 导出标识符 = 产物文件名去掉 .js（前端按同名 import，如 `import cargoBypassFlight from "../utils/cargoBypassFlight"`）
const MAP = [
  ["节点保障/客运始发航班.json", "passengerInitFlight.js", "passengerInitFlight", "客运始发航班"],
  ["节点保障/客运过站航班.json", "passengerBypassFlight.js", "passengerBypassFlight", "客运过站航班"],
  ["节点保障/货运始发航班.json", "cargoInitFlight.js", "cargoInitFlight", "货运始发航班"],
  ["节点保障/货运过站航班.json", "cargoBypassFlight.js", "cargoBypassFlight", "货运过站航班"],
  [
    "视频监管/客运航班视频监管重点.json",
    "passengerVideoFocus.js",
    "PASSENGER_VIDEO_FOCUS",
    "客运航班视频监管重点",
  ],
  [
    "视频监管/货运航班视频监管重点.json",
    "cargoVideoFocus.js",
    "CARGO_VIDEO_FOCUS",
    "货运航班视频监管重点",
  ],
  ["视频监管/顺航检查单.json", "shunhangVideoFocus.js", "SHUNHANG_VIDEO_FOCUS", "顺航航班视频监管重点"],
];

function build({ rel, outName, varName, title, data }) {
  const keys = Object.keys(data);
  const isVideo = keys.includes("groups");

  const header = [
    "/**",
    " * ============================================================",
    ` * ${title} —— ${isVideo ? "视频监管重点" : "节点保障检查单"}静态数据`,
    " * ------------------------------------------------------------",
    ` * 由后端 data/checklists/${rel} 全量内联而来。`,
    " * 编译期即随前端产物打包，不再请求 /api/checklists/templates。",
    ` * 顶层字段：${keys.join(" / ")}`,
    isVideo
      ? " * 结构：groups[] → items[]（id 为全局唯一 vCheckId，store 据此生成逐项 setter）"
      : " * 结构：schema[]（主监控节点）→ auxiliaries[]（辅助监控项），节点带 formula 供时间公式求值",
    " * ------------------------------------------------------------",
    " * ⚠️ 本文件由 scripts/gen-checklist-static.cjs 生成，请勿手改；",
    " *    改内容请改后端 JSON 后重跑该脚本。",
    " * ============================================================",
    " */",
    "",
  ].join("\n");

  return `${header}export const ${varName} = ${JSON.stringify(data, null, 4)}\n\nexport default ${varName}\n`;
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`源目录不存在：${SRC}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  const report = [];
  let failed = 0;

  for (const [rel, outName, varName, title] of MAP) {
    const src = path.join(SRC, rel);
    if (!fs.existsSync(src)) {
      console.error(`  缺失源文件：${rel}`);
      failed++;
      continue;
    }
    let data;
    try {
      data = JSON.parse(fs.readFileSync(src, "utf-8")); // 顺带校验 JSON 合法性
    } catch (e) {
      console.error(`  JSON 非法：${rel} → ${e.message}`);
      failed++;
      continue;
    }
    fs.writeFileSync(path.join(OUT, outName), build({ rel, outName, varName, title, data }), "utf-8");

    const stat = data.schema
      ? `${data.schema.length} 节点 / ${data.schema.reduce((s, n) => s + (n.auxiliaries || []).length, 0)} 辅助项`
      : `${data.groups.length} 分组 / ${data.groups.reduce((s, g) => s + (g.items || []).length, 0)} 条目`;
    report.push(`  ${outName.padEnd(26)} ${stat}`);
  }

  console.log(`已生成 ${MAP.length - failed}/${MAP.length} 个文件到 ${OUT}`);
  console.log(report.join("\n"));
  if (failed) process.exit(1);
}

main();
