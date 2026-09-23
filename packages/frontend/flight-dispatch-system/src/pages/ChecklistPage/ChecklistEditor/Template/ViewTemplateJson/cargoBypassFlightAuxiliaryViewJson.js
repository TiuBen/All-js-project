/**
 * ============================================================
 * 货运过站航班 —— 查看页「辅助监控指标」扁平视图数据
 * ------------------------------------------------------------
 * 由 EditorTemplateJson/cargoBypassFlight.js（导出 cargoBypassFlight）的 schema[].auxiliaries[] 拍平而来。
 * 结构：**一维数组**（无嵌套）—— 查看页的三个 List 直接 map 渲染。
 * 单项字段：key（aux-<uuid>）/ uuid / order / name / desc / parentUuid / parentName / parentOrder
 *   共 24 项。
 * ------------------------------------------------------------
 * ⚠️ 本文件由 scripts/gen-view-static.cjs 生成，请勿手改；
 *    改内容请改 EditorTemplateJson 对应的源文件后重跑该脚本。
 * ============================================================
 */
export const CARGO_BYPASS_FLIGHT_AUXILIARY_VIEW_JSON = [
    {
        "key": "aux-63c4783d-4271-4546-8daf-f205f59242f0",
        "uuid": "63c4783d-4271-4546-8daf-f205f59242f0",
        "order": 1,
        "name": "机务到位",
        "desc": "入位时间-5分钟",
        "parentUuid": "35c6f11f-6d9c-4020-9798-31509396a93b",
        "parentName": "入位",
        "parentOrder": 2
    },
    {
        "key": "aux-6904f6d9-ec2e-4e8d-a671-8c43ad85d750",
        "uuid": "6904f6d9-ec2e-4e8d-a671-8c43ad85d750",
        "order": 2,
        "name": "接地面电源",
        "desc": "需求申请时间+15分钟",
        "parentUuid": "4b411293-c1f8-4ce5-8db4-9e4636aff6ba",
        "parentName": "开始挡轮挡",
        "parentOrder": 3
    },
    {
        "key": "aux-0fdfcaff-e2bd-4f85-9cbd-5a735132cb76",
        "uuid": "0fdfcaff-e2bd-4f85-9cbd-5a735132cb76",
        "order": 3,
        "name": "登机梯/客梯车到位",
        "desc": "入位时间-5分钟",
        "parentUuid": "1526b9aa-7a8e-4525-a133-a97429312b47",
        "parentName": "开驾驶舱门",
        "parentOrder": 4
    },
    {
        "key": "aux-22a30937-ac79-4f27-b8d4-2bc04c1ebbc4",
        "uuid": "22a30937-ac79-4f27-b8d4-2bc04c1ebbc4",
        "order": 4,
        "name": "代办到位",
        "desc": "入位时间-5分钟",
        "parentUuid": "1526b9aa-7a8e-4525-a133-a97429312b47",
        "parentName": "开驾驶舱门",
        "parentOrder": 4
    },
    {
        "key": "aux-6c360b32-f27a-4308-8878-0338f9e740ed",
        "uuid": "6c360b32-f27a-4308-8878-0338f9e740ed",
        "order": 5,
        "name": "海关/边检到位",
        "desc": "入位时间+0分钟",
        "parentUuid": "1526b9aa-7a8e-4525-a133-a97429312b47",
        "parentName": "开驾驶舱门",
        "parentOrder": 4
    },
    {
        "key": "aux-451e6387-2932-45d6-9eb4-cc27c299edaf",
        "uuid": "451e6387-2932-45d6-9eb4-cc27c299edaf",
        "order": 6,
        "name": "开始加油",
        "desc": "COBT-机型参考加油时间-5分钟",
        "parentUuid": "1526b9aa-7a8e-4525-a133-a97429312b47",
        "parentName": "开驾驶舱门",
        "parentOrder": 4
    },
    {
        "key": "aux-d1b363c6-69ba-4232-860d-eda60fbab601",
        "uuid": "d1b363c6-69ba-4232-860d-eda60fbab601",
        "order": 7,
        "name": "开始加清水/排污水",
        "desc": "需求申请时间+15分钟",
        "parentUuid": "1526b9aa-7a8e-4525-a133-a97429312b47",
        "parentName": "开驾驶舱门",
        "parentOrder": 4
    },
    {
        "key": "aux-b61e0c0c-cd93-406a-8ae0-4d08d09bad61",
        "uuid": "b61e0c0c-cd93-406a-8ae0-4d08d09bad61",
        "order": 8,
        "name": "平台车到位",
        "desc": "入位时间-5分钟",
        "parentUuid": "1526b9aa-7a8e-4525-a133-a97429312b47",
        "parentName": "开驾驶舱门",
        "parentOrder": 4
    },
    {
        "key": "aux-6d63367c-f805-4a39-b24b-692f21b598bd",
        "uuid": "6d63367c-f805-4a39-b24b-692f21b598bd",
        "order": 9,
        "name": "海关/边检进港登临检查结束",
        "desc": "开驾驶舱门+15分钟",
        "parentUuid": "6499b169-933c-4aad-a204-859a829f9ef6",
        "parentName": "开货舱门",
        "parentOrder": 5
    },
    {
        "key": "aux-ad1479db-a34c-4747-91cb-ccbfc4c3bb49",
        "uuid": "ad1479db-a34c-4747-91cb-ccbfc4c3bb49",
        "order": 10,
        "name": "进港货物交接",
        "desc": "入位时间+80分钟",
        "parentUuid": "f2d47971-dee5-4f97-99af-6a91da5faf93",
        "parentName": "卸机完成",
        "parentOrder": 7
    },
    {
        "key": "aux-1647aa82-dafc-4cdb-b47e-49164cea4ddc",
        "uuid": "1647aa82-dafc-4cdb-b47e-49164cea4ddc",
        "order": 11,
        "name": "出港货物交接",
        "desc": "窄体机CTOT-4小时；宽体机CTOT-6小时",
        "parentUuid": "42c02836-951e-4176-b95b-f8ab6b42c50c",
        "parentName": "开始装机",
        "parentOrder": 8
    },
    {
        "key": "aux-e651e4a9-2f73-4eb1-8153-861eac7d1083",
        "uuid": "e651e4a9-2f73-4eb1-8153-861eac7d1083",
        "order": 12,
        "name": "第一板出港货物到达机坪待装区",
        "desc": "预计落地时间-90分钟",
        "parentUuid": "42c02836-951e-4176-b95b-f8ab6b42c50c",
        "parentName": "开始装机",
        "parentOrder": 8
    },
    {
        "key": "aux-6c8b3827-0c8c-4c71-9c41-37e22959b99e",
        "uuid": "6c8b3827-0c8c-4c71-9c41-37e22959b99e",
        "order": 13,
        "name": "全部出港货物到达待装区/机坪",
        "desc": "预计落地时间-60分钟",
        "parentUuid": "42c02836-951e-4176-b95b-f8ab6b42c50c",
        "parentName": "开始装机",
        "parentOrder": 8
    },
    {
        "key": "aux-b2e76d59-5dec-4e71-b7bb-ff5464046bdb",
        "uuid": "b2e76d59-5dec-4e71-b7bb-ff5464046bdb",
        "order": 14,
        "name": "装机单接收",
        "desc": "预计落地时间-5分钟",
        "parentUuid": "42c02836-951e-4176-b95b-f8ab6b42c50c",
        "parentName": "开始装机",
        "parentOrder": 8
    },
    {
        "key": "aux-f56931df-41f2-4471-9ff0-6a0d968ddadc",
        "uuid": "f56931df-41f2-4471-9ff0-6a0d968ddadc",
        "order": 15,
        "name": "出港登临检查开始",
        "desc": "装机完成（或COBT-20分钟）",
        "parentUuid": "349a1528-8cca-4e06-832f-1da2823daa7b",
        "parentName": "关货舱门",
        "parentOrder": 10
    },
    {
        "key": "aux-eaefd4a7-18e2-4bf1-b3f3-52535dd574d6",
        "uuid": "eaefd4a7-18e2-4bf1-b3f3-52535dd574d6",
        "order": 16,
        "name": "完成加油",
        "desc": "COBT-5分钟",
        "parentUuid": "69b44c8c-49e3-462c-a069-a09029bf12ef",
        "parentName": "关驾驶舱门",
        "parentOrder": 11
    },
    {
        "key": "aux-21f16589-3adb-4b34-ae6d-c53882f266f6",
        "uuid": "21f16589-3adb-4b34-ae6d-c53882f266f6",
        "order": 17,
        "name": "结束加清水/排污水",
        "desc": "COBT-15分钟",
        "parentUuid": "69b44c8c-49e3-462c-a069-a09029bf12ef",
        "parentName": "关驾驶舱门",
        "parentOrder": 11
    },
    {
        "key": "aux-f262c0e1-7dff-4c6e-a1f5-b48cba44d767",
        "uuid": "f262c0e1-7dff-4c6e-a1f5-b48cba44d767",
        "order": 18,
        "name": "出港登临检查结束",
        "desc": "装机完成+15分钟（或COBT-5分钟）",
        "parentUuid": "69b44c8c-49e3-462c-a069-a09029bf12ef",
        "parentName": "关驾驶舱门",
        "parentOrder": 11
    },
    {
        "key": "aux-f2ee8c9b-bfeb-4229-94b0-cba3e88fa93b",
        "uuid": "f2ee8c9b-bfeb-4229-94b0-cba3e88fa93b",
        "order": 19,
        "name": "出港机组到机下",
        "desc": "COBT-60分钟",
        "parentUuid": "69b44c8c-49e3-462c-a069-a09029bf12ef",
        "parentName": "关驾驶舱门",
        "parentOrder": 11
    },
    {
        "key": "aux-91bb8c2f-fae0-4ceb-bd23-7a31a2400939",
        "uuid": "91bb8c2f-fae0-4ceb-bd23-7a31a2400939",
        "order": 20,
        "name": "牵引车到位",
        "desc": "COBT-10分钟",
        "parentUuid": "0241073a-18d0-4df4-8e38-2729a661b729",
        "parentName": "推出",
        "parentOrder": 12
    },
    {
        "key": "aux-560d315d-4e5a-4357-870e-fa326818c141",
        "uuid": "560d315d-4e5a-4357-870e-fa326818c141",
        "order": 21,
        "name": "接气源车",
        "desc": "COBT-30分钟",
        "parentUuid": "0241073a-18d0-4df4-8e38-2729a661b729",
        "parentName": "推出",
        "parentOrder": 12
    },
    {
        "key": "aux-9c39c79a-acff-4d34-b5ae-5e68a3285fc4",
        "uuid": "9c39c79a-acff-4d34-b5ae-5e68a3285fc4",
        "order": 22,
        "name": "撤气源车/撤地面电源",
        "desc": "COBT-0分钟",
        "parentUuid": "0241073a-18d0-4df4-8e38-2729a661b729",
        "parentName": "推出",
        "parentOrder": 12
    },
    {
        "key": "aux-4357fb89-eb96-4bf3-a4a8-91c675282301",
        "uuid": "4357fb89-eb96-4bf3-a4a8-91c675282301",
        "order": 23,
        "name": "撤轮档",
        "desc": "COBT-机型标准撤轮挡时间",
        "parentUuid": "0241073a-18d0-4df4-8e38-2729a661b729",
        "parentName": "推出",
        "parentOrder": 12
    },
    {
        "key": "aux-d64d4cac-02e7-4a1b-b163-19fb83b46701",
        "uuid": "d64d4cac-02e7-4a1b-b163-19fb83b46701",
        "order": 24,
        "name": "代办离场",
        "desc": "起飞时间+0分钟",
        "parentUuid": "77b2ca02-c0c3-47d5-93fa-4ea68eacf46d",
        "parentName": "起飞",
        "parentOrder": 14
    }
]

export default CARGO_BYPASS_FLIGHT_AUXILIARY_VIEW_JSON
