/**
 * ============================================================
 * 货运始发航班 —— 查看页「辅助监控指标」扁平视图数据
 * ------------------------------------------------------------
 * 由 EditorTemplateJson/cargoInitFlight.js（导出 cargoInitFlight）的 schema[].auxiliaries[] 拍平而来。
 * 结构：**一维数组**（无嵌套）—— 查看页的三个 List 直接 map 渲染。
 * 单项字段：key（aux-<uuid>）/ uuid / order / name / desc / parentUuid / parentName / parentOrder
 *   共 22 项。
 * ------------------------------------------------------------
 * ⚠️ 本文件由 scripts/gen-view-static.cjs 生成，请勿手改；
 *    改内容请改 EditorTemplateJson 对应的源文件后重跑该脚本。
 * ============================================================
 */
export const CARGO_INIT_FLIGHT_AUXILIARY_VIEW_JSON = [
    {
        "key": "aux-2293ca0f-46a1-4835-b946-2ff6de0f947f",
        "uuid": "2293ca0f-46a1-4835-b946-2ff6de0f947f",
        "order": 1,
        "name": "机务到位",
        "desc": "开驾驶舱门-5分钟",
        "parentUuid": "a13e6f95-b111-4666-be2a-82159dbfd151",
        "parentName": "开驾驶舱门",
        "parentOrder": 1
    },
    {
        "key": "aux-3b441580-9221-4eb6-860e-314053113584",
        "uuid": "3b441580-9221-4eb6-860e-314053113584",
        "order": 2,
        "name": "代办到位",
        "desc": "开驾驶舱门-5分钟",
        "parentUuid": "a13e6f95-b111-4666-be2a-82159dbfd151",
        "parentName": "开驾驶舱门",
        "parentOrder": 1
    },
    {
        "key": "aux-594f2b97-b148-49e0-9214-e2a2608101c0",
        "uuid": "594f2b97-b148-49e0-9214-e2a2608101c0",
        "order": 3,
        "name": "海关/边检到位",
        "desc": "开驾驶舱门+0分钟",
        "parentUuid": "a13e6f95-b111-4666-be2a-82159dbfd151",
        "parentName": "开驾驶舱门",
        "parentOrder": 1
    },
    {
        "key": "aux-fb233c7f-4551-4cf2-97c0-71366cb6674c",
        "uuid": "fb233c7f-4551-4cf2-97c0-71366cb6674c",
        "order": 4,
        "name": "登机梯/客梯车到位",
        "desc": "开驾驶舱门-5分钟",
        "parentUuid": "a13e6f95-b111-4666-be2a-82159dbfd151",
        "parentName": "开驾驶舱门",
        "parentOrder": 1
    },
    {
        "key": "aux-d1885553-92d7-41b9-8685-8494f824dd7c",
        "uuid": "d1885553-92d7-41b9-8685-8494f824dd7c",
        "order": 5,
        "name": "开始加油",
        "desc": "COBT-机型参考加油时间-5分钟（B747参考加油100分钟；B777参考加油70分钟；B737/B757/B767参考加油60分钟）",
        "parentUuid": "a13e6f95-b111-4666-be2a-82159dbfd151",
        "parentName": "开驾驶舱门",
        "parentOrder": 1
    },
    {
        "key": "aux-1f2c822e-a647-437f-80f0-1fd1614d716c",
        "uuid": "1f2c822e-a647-437f-80f0-1fd1614d716c",
        "order": 6,
        "name": "开始加清水/排污水",
        "desc": "需求申请时间+15分钟",
        "parentUuid": "a13e6f95-b111-4666-be2a-82159dbfd151",
        "parentName": "开驾驶舱门",
        "parentOrder": 1
    },
    {
        "key": "aux-6a77c1ed-1d1f-4c93-8b0e-5f0e50a19341",
        "uuid": "6a77c1ed-1d1f-4c93-8b0e-5f0e50a19341",
        "order": 7,
        "name": "接地面电源",
        "desc": "需求申请时间+15分钟",
        "parentUuid": "a13e6f95-b111-4666-be2a-82159dbfd151",
        "parentName": "开驾驶舱门",
        "parentOrder": 1
    },
    {
        "key": "aux-eadc522a-6855-4014-a090-7f8488fcdcc7",
        "uuid": "eadc522a-6855-4014-a090-7f8488fcdcc7",
        "order": 8,
        "name": "平台车到位",
        "desc": "开驾驶舱门-5分钟",
        "parentUuid": "a13e6f95-b111-4666-be2a-82159dbfd151",
        "parentName": "开驾驶舱门",
        "parentOrder": 1
    },
    {
        "key": "aux-d3ca88f7-9d66-433b-9b1d-14263d76fdb5",
        "uuid": "d3ca88f7-9d66-433b-9b1d-14263d76fdb5",
        "order": 9,
        "name": "出港货物交接",
        "desc": "窄体机CTOT-4小时；宽体机CTOT-6小时",
        "parentUuid": "04f51044-871b-4ca6-88aa-e459701a0fdb",
        "parentName": "开始装机",
        "parentOrder": 3
    },
    {
        "key": "aux-283fd3fd-5dae-458d-84ed-b05c023ed563",
        "uuid": "283fd3fd-5dae-458d-84ed-b05c023ed563",
        "order": 10,
        "name": "第一板出港货物到达机坪待装区",
        "desc": "开驾驶舱门-90分钟",
        "parentUuid": "04f51044-871b-4ca6-88aa-e459701a0fdb",
        "parentName": "开始装机",
        "parentOrder": 3
    },
    {
        "key": "aux-56b94fc3-4a69-44ce-8edd-9426304b4413",
        "uuid": "56b94fc3-4a69-44ce-8edd-9426304b4413",
        "order": 11,
        "name": "全部出港货物到达待装区/机坪",
        "desc": "开驾驶舱门-60分钟",
        "parentUuid": "04f51044-871b-4ca6-88aa-e459701a0fdb",
        "parentName": "开始装机",
        "parentOrder": 3
    },
    {
        "key": "aux-6dcb4872-847f-42af-8da2-90e9a3c17e71",
        "uuid": "6dcb4872-847f-42af-8da2-90e9a3c17e71",
        "order": 12,
        "name": "装机单接收",
        "desc": "开驾驶舱门-5分钟",
        "parentUuid": "04f51044-871b-4ca6-88aa-e459701a0fdb",
        "parentName": "开始装机",
        "parentOrder": 3
    },
    {
        "key": "aux-24c5f78c-05b9-4cc3-a0f5-3861beddcdba",
        "uuid": "24c5f78c-05b9-4cc3-a0f5-3861beddcdba",
        "order": 13,
        "name": "出港登临检查开始",
        "desc": "装机完成（或COBT-20分钟）",
        "parentUuid": "b1de26f3-1bb8-4df8-b2b1-c1a425bdb8a5",
        "parentName": "关货舱门",
        "parentOrder": 5
    },
    {
        "key": "aux-f4c7e0e1-9919-43fc-9c2e-09562ea839ce",
        "uuid": "f4c7e0e1-9919-43fc-9c2e-09562ea839ce",
        "order": 14,
        "name": "完成加油",
        "desc": "COBT-5分钟",
        "parentUuid": "81630a04-787b-47f2-8084-669a170e2dd7",
        "parentName": "关驾驶舱门",
        "parentOrder": 6
    },
    {
        "key": "aux-94829324-f27d-483e-aebb-eb52166f92af",
        "uuid": "94829324-f27d-483e-aebb-eb52166f92af",
        "order": 15,
        "name": "结束加清水/排污水",
        "desc": "COBT-15分钟",
        "parentUuid": "81630a04-787b-47f2-8084-669a170e2dd7",
        "parentName": "关驾驶舱门",
        "parentOrder": 6
    },
    {
        "key": "aux-78d7896c-8966-47db-9712-bec162a2f191",
        "uuid": "78d7896c-8966-47db-9712-bec162a2f191",
        "order": 16,
        "name": "出港登临检查结束",
        "desc": "装机完成+15分钟（或COBT-5分钟）",
        "parentUuid": "81630a04-787b-47f2-8084-669a170e2dd7",
        "parentName": "关驾驶舱门",
        "parentOrder": 6
    },
    {
        "key": "aux-55f6c569-3856-424b-90ed-34055f1bed5d",
        "uuid": "55f6c569-3856-424b-90ed-34055f1bed5d",
        "order": 17,
        "name": "出港机组到机下",
        "desc": "COBT-60分钟",
        "parentUuid": "81630a04-787b-47f2-8084-669a170e2dd7",
        "parentName": "关驾驶舱门",
        "parentOrder": 6
    },
    {
        "key": "aux-1da92f14-5a3f-41dd-8162-4f191109233b",
        "uuid": "1da92f14-5a3f-41dd-8162-4f191109233b",
        "order": 18,
        "name": "牵引车到位",
        "desc": "COBT-10分钟",
        "parentUuid": "15e3fd57-d3b6-4a55-8369-1d03edd812ed",
        "parentName": "推出",
        "parentOrder": 7
    },
    {
        "key": "aux-b867124a-d12e-4539-8e6c-adafe2247993",
        "uuid": "b867124a-d12e-4539-8e6c-adafe2247993",
        "order": 19,
        "name": "接气源车",
        "desc": "COBT-30分钟",
        "parentUuid": "15e3fd57-d3b6-4a55-8369-1d03edd812ed",
        "parentName": "推出",
        "parentOrder": 7
    },
    {
        "key": "aux-89d85db8-d462-4938-85cf-64a53f82061a",
        "uuid": "89d85db8-d462-4938-85cf-64a53f82061a",
        "order": 20,
        "name": "撤气源车/撤地面电源",
        "desc": "COBT-0分钟",
        "parentUuid": "15e3fd57-d3b6-4a55-8369-1d03edd812ed",
        "parentName": "推出",
        "parentOrder": 7
    },
    {
        "key": "aux-7358b754-cba7-4695-80a7-1068ee3fc1e6",
        "uuid": "7358b754-cba7-4695-80a7-1068ee3fc1e6",
        "order": 21,
        "name": "撤轮档",
        "desc": "COBT-机型标准撤轮挡时间（B747/B777为4分钟；B757/B767为3分钟；B737为2分钟）",
        "parentUuid": "15e3fd57-d3b6-4a55-8369-1d03edd812ed",
        "parentName": "推出",
        "parentOrder": 7
    },
    {
        "key": "aux-87f6faa6-5dbb-46c4-bb3e-0aeb619c2482",
        "uuid": "87f6faa6-5dbb-46c4-bb3e-0aeb619c2482",
        "order": 22,
        "name": "代办离场",
        "desc": "起飞时间+0分钟",
        "parentUuid": "7bed710a-378d-4641-8375-01a09429874a",
        "parentName": "起飞",
        "parentOrder": 9
    }
]

export default CARGO_INIT_FLIGHT_AUXILIARY_VIEW_JSON
