/**
 * ============================================================
 * 生成查看页（ChecklistViewer）用的「扁平一维视图数据」
 * ------------------------------------------------------------
 * 输入：EditorTemplateJson/（编辑器用的模板 + 视频监管数据，编译期静态）
 * 输出：Template/ViewTemplateJson/ 下 5 类型 × 3 列表 = 15 个模块
 *
 *   xxx Flight MainViewJson      → 主监控指标（schema[] 拍平）
 *   xxx Flight AuxiliaryViewJson → 辅助监控指标（各节点 auxiliaries[] 汇总拍平，带父节点信息）
 *   xxx Flight VideoViewJson     → 视频监管检查重点（groups[].items[] 拍平，带分组信息）
 *
 * ★ 为什么要有这一层（而不是查看页自己遍历模板）
 *   编辑器需要「树」：主节点 → auxiliaries[]，好按节点分组填写；
 *   查看页需要「一维列表」：三个 List 各自一条一条往下排。
 *   形状需求不同 → 在编译期把树拍平、把定位键（main-<uuid> / aux-<uuid> / <uuid>）
 *   一并算好，List 组件只管 map，不再关心层级与键的拼法。
 *
 * ★ 每项都带 key：与填写端写进 record.items / record.video_supervision 的键**完全一致**，
 *   查看页拿 items[item.key] 就能取到这一项的填写结果（status / time / note / image）。
 *
 * 用法（项目根，需已装 node）：
 *   node scripts/gen-view-static.cjs
 * 何时重跑：EditorTemplateJson 内容变更后（即后端 JSON 变更、重跑
 *   gen-checklist-static.cjs 之后）再跑本脚本。
 *
 * ⚠️ 本脚本的 15 个导出标识符是**手写**的（不做驼峰→大写下划线自动转换）：
 *   自动转换曾把 SHUNHANG_VIDEO_FOCUS 误写成 SHUNHANGVIDEOFOCUS 导致构建失败。
 * ============================================================
 */
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

// 前端项目根（本脚本位于 flight-dispatch-system/scripts/）
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src/pages/ChecklistPage/ChecklistEditor/Template/EditorTemplateJson");
const OUT = path.join(ROOT, "src/pages/ChecklistPage/ChecklistEditor/Template/ViewTemplateJson");

/**
 * 5 个检查单类型（category = 模板 id = 落库 checklist_category）
 *   key       —— 文件名前缀（驼峰）
 *   category  —— 检查单类型名
 *   tpl       —— 节点保障模板文件（EditorTemplateJson）
 *   tplExport —— 模板导出名
 *   vid       —— 视频监管数据文件
 *   vidExport —— 视频监管导出名
 * 顺序 = 类型规范顺序（顺航 · 货运始发 · 货运过站 · 客运始发 · 客运过站）
 */
const CATS = [
  {
    key: "shunhang",
    category: "顺航检查单",
    tpl: "shunhangFlight.js",
    tplExport: "shunhangFlight",
    vid: "shunhangVideoFocus.js",
    vidExport: "SHUNHANG_VIDEO_FOCUS",
  },
  {
    key: "cargoInit",
    category: "货运始发航班",
    tpl: "cargoInitFlight.js",
    tplExport: "cargoInitFlight",
    vid: "cargoVideoFocus.js",
    vidExport: "CARGO_VIDEO_FOCUS",
  },
  {
    key: "cargoBypass",
    category: "货运过站航班",
    tpl: "cargoBypassFlight.js",
    tplExport: "cargoBypassFlight",
    vid: "cargoVideoFocus.js",
    vidExport: "CARGO_VIDEO_FOCUS",
  },
  {
    key: "passengerInit",
    category: "客运始发航班",
    tpl: "passengerInitFlight.js",
    tplExport: "passengerInitFlight",
    vid: "passengerVideoFocus.js",
    vidExport: "PASSENGER_VIDEO_FOCUS",
  },
  {
    key: "passengerBypass",
    category: "客运过站航班",
    tpl: "passengerBypassFlight.js",
    tplExport: "passengerBypassFlight",
    vid: "passengerVideoFocus.js",
    vidExport: "PASSENGER_VIDEO_FOCUS",
  },
];

/** 三个列表：中文名 / 文件名中段 / 导出名中段 */
const KINDS = [
  { kind: "Main", cn: "主监控指标", exp: "MAIN" },
  { kind: "Auxiliary", cn: "辅助监控指标", exp: "AUXILIARY" },
  { kind: "Video", cn: "视频监管检查重点", exp: "VIDEO" },
];

/** 主监控指标：schema[] → 一维（保留序号与定位键） */
const toMain = (schema) =>
  (schema || []).map((n, i) => ({
    key: `main-${n.uuid}`,
    uuid: n.uuid,
    order: i + 1,
    name: n.name,
    desc: n.desc || "",
  }));

/** 辅助监控指标：各节点 auxiliaries[] 汇总拍平（带父节点信息，便于列表里标注归属） */
const toAuxiliary = (schema) => {
  const out = [];
  (schema || []).forEach((n, ni) => {
    (n.auxiliaries || []).forEach((a) => {
      out.push({
        key: `aux-${a.uuid}`,
        uuid: a.uuid,
        order: out.length + 1,
        name: a.name,
        desc: a.desc || "",
        parentUuid: n.uuid,
        parentName: n.name,
        parentOrder: ni + 1,
      });
    });
  });
  return out;
};

/** 视频监管检查重点：groups[].items[] 拍平（带分组信息；列表靠 groupUuid 变化插分组标题） */
const toVideo = (data) => {
  const out = [];
  (data?.groups || []).forEach((g, gi) => {
    (g.items || []).forEach((it) => {
      out.push({
        key: it.uuid,
        uuid: it.uuid,
        order: out.length + 1,
        name: it.name || it.desc || "",
        groupUuid: g.uuid,
        groupName: g.name,
        groupOrder: gi + 1,
      });
    });
  });
  return out;
};

/** 产物文件头（与 gen-checklist-static.cjs 同一风格：首行说明「勿手改」） */
function header({ category, cn, sourceLine, shapeLine, count }) {
  return [
    "/**",
    " * ============================================================",
    ` * ${category} —— 查看页「${cn}」扁平视图数据`,
    " * ------------------------------------------------------------",
    ` * ${sourceLine}`,
    " * 结构：**一维数组**（无嵌套）—— 查看页的三个 List 直接 map 渲染。",
    ` * 单项字段：${shapeLine}`,
    ` *   共 ${count} 项。`,
    " * ------------------------------------------------------------",
    " * ⚠️ 本文件由 scripts/gen-view-static.cjs 生成，请勿手改；",
    " *    改内容请改 EditorTemplateJson 对应的源文件后重跑该脚本。",
    " * ============================================================",
    " */",
    "",
  ].join("\n");
}

function build({ category, cn, exp, sourceLine, shapeLine, rows }) {
  return `${header({ category, cn, sourceLine, shapeLine, count: rows.length })}export const ${exp} = ${JSON.stringify(
    rows,
    null,
    4
  )}\n\nexport default ${exp}\n`;
}

/* ------------------------------------------------------------
 * 导出名（手写，不用自动转换 —— 见文件顶部警告）
 * ------------------------------------------------------------ */
const EXPORTS = {
  shunhang: {
    Main: "SHUNHANG_FLIGHT_MAIN_VIEW_JSON",
    Auxiliary: "SHUNHANG_FLIGHT_AUXILIARY_VIEW_JSON",
    Video: "SHUNHANG_FLIGHT_VIDEO_VIEW_JSON",
  },
  cargoInit: {
    Main: "CARGO_INIT_FLIGHT_MAIN_VIEW_JSON",
    Auxiliary: "CARGO_INIT_FLIGHT_AUXILIARY_VIEW_JSON",
    Video: "CARGO_INIT_FLIGHT_VIDEO_VIEW_JSON",
  },
  cargoBypass: {
    Main: "CARGO_BYPASS_FLIGHT_MAIN_VIEW_JSON",
    Auxiliary: "CARGO_BYPASS_FLIGHT_AUXILIARY_VIEW_JSON",
    Video: "CARGO_BYPASS_FLIGHT_VIDEO_VIEW_JSON",
  },
  passengerInit: {
    Main: "PASSENGER_INIT_FLIGHT_MAIN_VIEW_JSON",
    Auxiliary: "PASSENGER_INIT_FLIGHT_AUXILIARY_VIEW_JSON",
    Video: "PASSENGER_INIT_FLIGHT_VIDEO_VIEW_JSON",
  },
  passengerBypass: {
    Main: "PASSENGER_BYPASS_FLIGHT_MAIN_VIEW_JSON",
    Auxiliary: "PASSENGER_BYPASS_FLIGHT_AUXILIARY_VIEW_JSON",
    Video: "PASSENGER_BYPASS_FLIGHT_VIDEO_VIEW_JSON",
  },
};

const SHAPES = {
  Main: "key（main-<uuid>，记录定位键）/ uuid / order / name / desc",
  Auxiliary: "key（aux-<uuid>）/ uuid / order / name / desc / parentUuid / parentName / parentOrder",
  Video: "key（= uuid）/ uuid / order / name / groupUuid / groupName / groupOrder",
};

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`源目录不存在：${SRC}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  const cache = new Map();
  const load = async (file) => {
    if (!cache.has(file)) cache.set(file, await import(pathToFileURL(path.join(SRC, file)).href));
    return cache.get(file);
  };

  const report = [];
  let failed = 0;

  for (const c of CATS) {
    let tplMod, vidMod;
    try {
      tplMod = await load(c.tpl);
      vidMod = await load(c.vid);
    } catch (e) {
      console.error(`  ✗ 加载失败 ${c.key}：${e.message}`);
      failed++;
      continue;
    }
    const tpl = tplMod[c.tplExport];
    const vid = vidMod[c.vidExport];
    if (!tpl || !vid) {
      console.error(`  ✗ 导出缺失 ${c.key}：${c.tplExport} / ${c.vidExport}`);
      failed++;
      continue;
    }

    const schema = tpl.schema || [];
    const rowsBy = {
      Main: toMain(schema),
      Auxiliary: toAuxiliary(schema),
      Video: toVideo(vid),
    };

    for (const k of KINDS) {
      const exp = EXPORTS[c.key][k.kind];
      if (!exp) {
        console.error(`  ✗ 缺导出名映射：${c.key}.${k.kind}`);
        failed++;
        continue;
      }
      const outName = `${c.key}Flight${k.kind}ViewJson.js`;
      const sourceLine =
        k.kind === "Video"
          ? `由 EditorTemplateJson/${c.vid}（导出 ${c.vidExport}）的 groups[].items[] 拍平而来。`
          : `由 EditorTemplateJson/${c.tpl}（导出 ${c.tplExport}）的 schema[]${
              k.kind === "Auxiliary" ? ".auxiliaries[]" : ""
            } 拍平而来。`;

      fs.writeFileSync(
        path.join(OUT, outName),
        build({
          category: c.category,
          cn: k.cn,
          exp,
          sourceLine,
          shapeLine: SHAPES[k.kind],
          rows: rowsBy[k.kind],
        }),
        "utf-8"
      );
      report.push(`  ${outName.padEnd(44)} ${String(rowsBy[k.kind].length).padStart(3)} 项   ${exp}`);
    }
  }

  console.log(`已生成 ${CATS.length * KINDS.length - failed}/${CATS.length * KINDS.length} 个文件到 ${OUT}`);
  console.log(report.join("\n"));
  if (failed) process.exit(1);
}

main();
