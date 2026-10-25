import SettingCodeTable from "./SettingCodeTable";

/**
 * ============================================================
 * AirportSetting —— 机场码板块
 * ------------------------------------------------------------
 * 对应表 airport_name_code（后端 kind = airports）：
 *   中文名称（必填、唯一） / 英文名 / IATA 码 / ICAO 码（各列均唯一）
 *
 * 与航司码相比多一列英文名，其余交互全部复用 SettingCodeTable。
 * ★ 列 key 必须 = 后端返回体里的字段名（就是**数据库原始列名**，后端不做驼峰转换）。
 * ★ 这张表是 ecyilang 航班按中文名反查 IATA / ICAO 的依据 ——
 *   机场名不在码表里时，航班的代码列会留空，需要在这里补录。
 * ============================================================
 */
const COLUMNS = [
    { key: "chinese_airport_name", label: "中文名称", required: true, placeholder: "如：北京首都" },
    { key: "english_airport_name", label: "英文名称", maxLength: 96, placeholder: "如：Beijing Capital" },
    { key: "airport_iata_code", label: "IATA 码", upper: true, maxLength: 8, placeholder: "如：PEK" },
    { key: "airport_icao_code", label: "ICAO 码", upper: true, maxLength: 8, placeholder: "如：ZBAA" },
];

export default function AirportSetting() {
    return (
        <SettingCodeTable
            kind="airports"
            title="机场码"
            subtitle="机场中英文名称 ↔ IATA / ICAO 代码"
            columns={COLUMNS}
            addLabel="新增机场"
            emptyHint="还没有机场码，点「新增机场」添加第一条"
        />
    );
}
