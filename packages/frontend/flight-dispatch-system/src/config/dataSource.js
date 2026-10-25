/**
 * ============================================================
 * 航班数据源 —— 常量与展示定义
 * ------------------------------------------------------------
 * 三个源就是三张航班表，取值 = 表名（与后端 /api/fips?source= 一一对应）：
 *   fips        历史流量明细（只读）
 *   manual_fips 手动添加航班（唯一可写）
 *   ecyilang    花湖翼览（后端航班计划快照，只读，默认）
 *
 * ★ 以前这里是从 VITE_FLIGHT_SOURCE 读出来的**编译期常量**（要改源得带环境
 *   变量重启），现在改成运行期可切：当前值存在浏览器本地缓存里，读写都在
 *   utils/flightSource.js（发请求时现读，切完下一个请求就生效）。
 *
 * ★ 本文件只保留「常量 + 展示文案 + 纯函数」，不碰缓存、不读环境变量。
 *   组件里要拿当前源，请读 useAppStore(s => s.source)（响应式）：
 *   源一变，页面自动重渲染并按新源重新拉数。
 * ============================================================
 */

/** 支持的数据源标识（= 表名） */
export const FLIGHT_SOURCES = ["fips", "ecyilang", "manual_fips"];

/** 默认数据源：花湖翼览（航班计划快照，开箱即有数据） */
export const DEFAULT_FLIGHT_SOURCE = "ecyilang";

/** 唯一可写的数据源：所有写接口固定落这张表（见 api/http.js 的 DELETE 处理） */
export const WRITABLE_FLIGHT_SOURCE = "manual_fips";

/** 是否是合法的数据源标识 */
export const isFlightSource = (v) => FLIGHT_SOURCES.includes(v);

/**
 * 设置页「数据源」板块的选项（数组顺序 = 界面上的排列顺序）
 * @property {string} id       取值（= 表名）
 * @property {string} label    界面短名
 * @property {string} desc     一句话说明
 * @property {boolean} readonly 是否只读（只有 manual_fips 可写）
 */
export const SOURCE_OPTIONS = [
    {
        id: "fips",
        label: "FIPS",
        desc: "历史流量明细导出的航班，只读。",
        readonly: true,
    },
    {
        id: "manual_fips",
        label: "手动",
        desc: "在航班列表页手动录入的航班，支持增删改。",
        readonly: false,
    },
    {
        id: "ecyilang",
        label: "花湖翼览",
        desc: "后端从花湖翼览抓取的航班计划快照，数据最全，开箱即有数据。",
        readonly: true,
    },
];

/** 侧边栏左下角的数据源说明（长文案） */
const SOURCE_LABELS = {
    fips: "数据源：历史流量明细（fips）",
    ecyilang: "数据源：花湖翼览（ecyilang）",
    manual_fips: "数据源：手动添加航班（manual_fips）",
};

/** 侧边栏展示用的数据源说明（未知取值原样兜底） */
export const sourceLabelOf = (source) => SOURCE_LABELS[source] || `数据源：${source}`;

/** 数据源短名（radio 文案）；未知取值原样返回 */
export const sourceNameOf = (source) => SOURCE_OPTIONS.find((o) => o.id === source)?.label || source;

/**
 * 该数据源是否只读。
 * ★ 只有 manual_fips 可写 —— fips / ecyilang 后端都只提供 GET。
 */
export const isReadonlySource = (source) => source !== WRITABLE_FLIGHT_SOURCE;

/** 只读源上执行写操作时的提示语；可写源返回空串 */
export const readonlyHintOf = (source) =>
    isReadonlySource(source)
        ? `当前数据源（${sourceNameOf(source)} · ${source}）只读，不能增删改航班；写入固定落在 manual_fips 表`
        : "";

const TemplateChooseSetting = {
    客运始发航班: {
        IATA_CODE: ["CZ"],
        ICAO_CODE: ["CSN"],
    },
    顺航检查单: {
        IATA_CODE: ["O3"],
        ICAO_CODE: ["CSS"],
    },
    货运过站航班: {
        IATA_CODE: ["5Y"],
        ICAO_CODE: ["GTI"],
    },
    货运始发航班: {
        IATA_CODE: [],
        ICAO_CODE: [],
    },
    客运过站航班: {
        IATA_CODE: ["BK"],
        ICAO_CODE: ["OKA"],
    },
};

/**
 * 检查单模板「标识」—— 即 Const 目录下模板对象的变量名
 * （cargoBypassFlight / shunhangFlight / cargoInitFlight /
 *   passengerInitFlight / passengerBypassFlight），拿去拼路由、存落盘键都用它。
 *
 * ★ 键 = 模板类型中文名，必须与上面 TemplateChooseSetting 的键、
 *   以及 Editor.jsx 的 TEMPLATE_BY_TYPE 的键**逐字一致**（三处同一套名字）。
 * ★ 值只能在这里写死：JS 运行期拿不到变量的名字，没法从模板对象反查出标识。
 */
export const TEMPLATE_KEY_BY_TYPE = {
    货运过站航班: "cargoBypassFlight",
    顺航检查单: "shunhangFlight",
    货运始发航班: "cargoInitFlight",
    客运始发航班: "passengerInitFlight",
    客运过站航班: "passengerBypassFlight",
};

/**
 * 上表的反向映射（标识 → 中文类型名），由 TEMPLATE_KEY_BY_TYPE 派生，别手写第二份。
 * ★ 用途：Editor 读 URL 上的 ?template=<标识> 时，要翻译回 store.templateType 的中文类型名。
 */
export const TEMPLATE_TYPE_BY_KEY = Object.fromEntries(
    Object.entries(TEMPLATE_KEY_BY_TYPE).map(([type, key]) => [key, type]),
);

/**
 * 由**航班号**决定用哪套检查单模板，返回模板标识（cargoBypassFlight 这类），
 * 供拼路由 / 选模板用。
 *
 * 规则：拿航班号开头的两个字母当 IATA 码、三个字母当 ICAO 码，
 *       去 TemplateChooseSetting 里逐条比对各模板的 IATA_CODE / ICAO_CODE ——
 *       命中就返回该模板的标识；多个都命中时按 TemplateChooseSetting 的书写顺序取第一个。
 *
 * ★ 认不出来（空值 / 不是字母开头 / 一个都没匹配上）返回是 cargoBypassFligh
 * @param {string} flightNo 如 'CZ1234'（IATA）/ 'CSN1234'（ICAO）
 * @returns {string} 如 'shunhangFlight '；认不出来返回 'cargoBypassFlight'
 */
export const templateKeyOf = (flightNo) => {
    const letters = (String(flightNo ?? "")
        .trim()
        .toUpperCase()
        .match(/^[A-Z0-9]+/) || [""])[0];

    if (!letters || !/^[A-Z]/.test(letters)) {
        return "cargoBypassFlight";
    }

    const iata = letters.slice(0, 2);
    const icao = letters.slice(0, 3);

    for (const [type, rule] of Object.entries(TemplateChooseSetting)) {
        const hitIata = (rule.IATA_CODE || []).includes(iata);
        const hitIcao = letters.length >= 3 && (rule.ICAO_CODE || []).includes(icao);

        if (hitIata || hitIcao) {
            return TEMPLATE_KEY_BY_TYPE[type] || "cargoBypassFlight";
        }
    }

    // 无法识别时，默认使用货运过站航班
    return "cargoBypassFlight";
};
