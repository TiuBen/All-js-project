import SettingCodeTable from "./SettingCodeTable";

/**
 * ============================================================
 * AirplaneCompanySetting —— 航司码板块
 * ------------------------------------------------------------
 * 对应表 airplane_company_name_code（后端 kind = airlines）：
 *   中文名称（必填、唯一） / IATA 码 / ICAO 码（各列均唯一）
 *
 * 只有列定义是本板块特有的，其余交互全部复用 SettingCodeTable。
 * ★ 列 key 必须 = 后端返回体里的字段名（就是**数据库原始列名**，后端不做驼峰转换），
 *   否则表格取不到值只能显示「—」。
 * ============================================================
 */
const COLUMNS = [
    { key: "chinese_airplane_company_name", label: "中文名称", required: true, placeholder: "如：顺丰航空" },
    { key: "airplane_company_iata_code", label: "IATA 码", upper: true, maxLength: 8, placeholder: "如：O3" },
    { key: "airplane_company_icao_code", label: "ICAO 码", upper: true, maxLength: 8, placeholder: "如：CSS" },
];

export default function AirplaneCompanySetting() {
    return (
        <SettingCodeTable
            kind="airlines"
            title="航司码"
            subtitle="航空公司中文名称 ↔ IATA / ICAO 代码"
            columns={COLUMNS}
            addLabel="新增航司"
            emptyHint="还没有航司码，点「新增航司」添加第一条"
        />
    );
}
