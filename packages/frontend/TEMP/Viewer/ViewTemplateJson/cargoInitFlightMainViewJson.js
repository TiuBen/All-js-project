/**
 * ============================================================
 * 货运始发航班 —— 查看页「主监控指标」扁平视图数据
 * ------------------------------------------------------------
 * 由 EditorTemplateJson/cargoInitFlight.js（导出 cargoInitFlight）的 schema[] 拍平而来。
 * 结构：**一维数组**（无嵌套）—— 查看页的三个 List 直接 map 渲染。
 * 单项字段：key（main-<uuid>，记录定位键）/ uuid / order / name / desc
 *   共 9 项。
 * ------------------------------------------------------------
 * ⚠️ 本文件由 scripts/gen-view-static.cjs 生成，请勿手改；
 *    改内容请改 EditorTemplateJson 对应的源文件后重跑该脚本。
 * ============================================================
 */
export const CARGO_INIT_FLIGHT_MAIN_VIEW_JSON = [
    {
        "key": "main-a13e6f95-b111-4666-be2a-82159dbfd151",
        "uuid": "a13e6f95-b111-4666-be2a-82159dbfd151",
        "order": 1,
        "name": "开驾驶舱门",
        "desc": "COBT-机型标准装机作业时长-30分钟"
    },
    {
        "key": "main-c26192f8-59bd-4e0b-814d-db0418003d5b",
        "uuid": "c26192f8-59bd-4e0b-814d-db0418003d5b",
        "order": 2,
        "name": "开货舱门",
        "desc": "COBT-机型标准装机作业时长-30分钟"
    },
    {
        "key": "main-04f51044-871b-4ca6-88aa-e459701a0fdb",
        "uuid": "04f51044-871b-4ca6-88aa-e459701a0fdb",
        "order": 3,
        "name": "开始装机",
        "desc": "COBT-机型标准装机作业时长-20分钟"
    },
    {
        "key": "main-f512dfee-fa93-4c55-9175-608b67b0b991",
        "uuid": "f512dfee-fa93-4c55-9175-608b67b0b991",
        "order": 4,
        "name": "装机完成",
        "desc": "开始装机+机型标准装机作业时长（或COBT-20分钟）"
    },
    {
        "key": "main-b1de26f3-1bb8-4df8-b2b1-c1a425bdb8a5",
        "uuid": "b1de26f3-1bb8-4df8-b2b1-c1a425bdb8a5",
        "order": 5,
        "name": "关货舱门",
        "desc": "装机完成+15分钟（或COBT-5分钟）"
    },
    {
        "key": "main-81630a04-787b-47f2-8084-669a170e2dd7",
        "uuid": "81630a04-787b-47f2-8084-669a170e2dd7",
        "order": 6,
        "name": "关驾驶舱门",
        "desc": "关货舱门+0分钟（或COBT-5分钟）"
    },
    {
        "key": "main-15e3fd57-d3b6-4a55-8369-1d03edd812ed",
        "uuid": "15e3fd57-d3b6-4a55-8369-1d03edd812ed",
        "order": 7,
        "name": "推出",
        "desc": "关驾驶舱门+5分钟（或COBT+0分钟）"
    },
    {
        "key": "main-2198c203-bca0-4ca7-8498-4dd2816942c2",
        "uuid": "2198c203-bca0-4ca7-8498-4dd2816942c2",
        "order": 8,
        "name": "滑出",
        "desc": "推出+5分钟（或COBT+5分钟）"
    },
    {
        "key": "main-7bed710a-378d-4641-8375-01a09429874a",
        "uuid": "7bed710a-378d-4641-8375-01a09429874a",
        "order": 9,
        "name": "起飞",
        "desc": "滑出+10分钟（或COBT+15分钟）"
    }
]

export default CARGO_INIT_FLIGHT_MAIN_VIEW_JSON
