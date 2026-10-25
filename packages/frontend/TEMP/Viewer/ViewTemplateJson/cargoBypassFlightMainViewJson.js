/**
 * ============================================================
 * 货运过站航班 —— 查看页「主监控指标」扁平视图数据
 * ------------------------------------------------------------
 * 由 EditorTemplateJson/cargoBypassFlight.js（导出 cargoBypassFlight）的 schema[] 拍平而来。
 * 结构：**一维数组**（无嵌套）—— 查看页的三个 List 直接 map 渲染。
 * 单项字段：key（main-<uuid>，记录定位键）/ uuid / order / name / desc
 *   共 14 项。
 * ------------------------------------------------------------
 * ⚠️ 本文件由 scripts/gen-view-static.cjs 生成，请勿手改；
 *    改内容请改 EditorTemplateJson 对应的源文件后重跑该脚本。
 * ============================================================
 */
export const CARGO_BYPASS_FLIGHT_MAIN_VIEW_JSON = [
    {
        "key": "main-a7e089ed-0f9b-404d-974b-0777b74ec89d",
        "uuid": "a7e089ed-0f9b-404d-974b-0777b74ec89d",
        "order": 1,
        "name": "预计落地",
        "desc": "预计落地"
    },
    {
        "key": "main-35c6f11f-6d9c-4020-9798-31509396a93b",
        "uuid": "35c6f11f-6d9c-4020-9798-31509396a93b",
        "order": 2,
        "name": "入位",
        "desc": "实际落地时间+10分钟"
    },
    {
        "key": "main-4b411293-c1f8-4ce5-8db4-9e4636aff6ba",
        "uuid": "4b411293-c1f8-4ce5-8db4-9e4636aff6ba",
        "order": 3,
        "name": "开始挡轮挡",
        "desc": "入位时间+0分钟"
    },
    {
        "key": "main-1526b9aa-7a8e-4525-a133-a97429312b47",
        "uuid": "1526b9aa-7a8e-4525-a133-a97429312b47",
        "order": 4,
        "name": "开驾驶舱门",
        "desc": "开始挡轮挡+10分钟"
    },
    {
        "key": "main-6499b169-933c-4aad-a204-859a829f9ef6",
        "uuid": "6499b169-933c-4aad-a204-859a829f9ef6",
        "order": 5,
        "name": "开货舱门",
        "desc": "开驾驶舱门+5分钟"
    },
    {
        "key": "main-00fbfdb9-f0f0-49c3-bf56-d8f4d056034f",
        "uuid": "00fbfdb9-f0f0-49c3-bf56-d8f4d056034f",
        "order": 6,
        "name": "开始卸机",
        "desc": "开货舱门+10分钟"
    },
    {
        "key": "main-f2d47971-dee5-4f97-99af-6a91da5faf93",
        "uuid": "f2d47971-dee5-4f97-99af-6a91da5faf93",
        "order": 7,
        "name": "卸机完成",
        "desc": "开始卸机+机型标准卸机作业时长"
    },
    {
        "key": "main-42c02836-951e-4176-b95b-f8ab6b42c50c",
        "uuid": "42c02836-951e-4176-b95b-f8ab6b42c50c",
        "order": 8,
        "name": "开始装机",
        "desc": "卸机完成+0分钟（或COBT-机型标准装机作业时长-20分钟）"
    },
    {
        "key": "main-7843b7fe-6ee6-49ff-88a4-cbc25acf3d63",
        "uuid": "7843b7fe-6ee6-49ff-88a4-cbc25acf3d63",
        "order": 9,
        "name": "装机完成",
        "desc": "开始装机+机型标准装机作业时长"
    },
    {
        "key": "main-349a1528-8cca-4e06-832f-1da2823daa7b",
        "uuid": "349a1528-8cca-4e06-832f-1da2823daa7b",
        "order": 10,
        "name": "关货舱门",
        "desc": "装机完成+15分钟（或COBT-5分钟）"
    },
    {
        "key": "main-69b44c8c-49e3-462c-a069-a09029bf12ef",
        "uuid": "69b44c8c-49e3-462c-a069-a09029bf12ef",
        "order": 11,
        "name": "关驾驶舱门",
        "desc": "关货舱门+0分钟（或COBT-5分钟）"
    },
    {
        "key": "main-0241073a-18d0-4df4-8e38-2729a661b729",
        "uuid": "0241073a-18d0-4df4-8e38-2729a661b729",
        "order": 12,
        "name": "推出",
        "desc": "关驾驶舱门+5分钟（或COBT+0分钟）"
    },
    {
        "key": "main-f624de97-ef00-4fe7-8608-c4755245f165",
        "uuid": "f624de97-ef00-4fe7-8608-c4755245f165",
        "order": 13,
        "name": "滑出",
        "desc": "推出+5分钟"
    },
    {
        "key": "main-77b2ca02-c0c3-47d5-93fa-4ea68eacf46d",
        "uuid": "77b2ca02-c0c3-47d5-93fa-4ea68eacf46d",
        "order": 14,
        "name": "起飞",
        "desc": "滑出+10分钟"
    }
]

export default CARGO_BYPASS_FLIGHT_MAIN_VIEW_JSON
