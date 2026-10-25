/**
 * ============================================================
 * 客运过站航班 —— 查看页「主监控指标」扁平视图数据
 * ------------------------------------------------------------
 * 由 EditorTemplateJson/passengerBypassFlight.js（导出 passengerBypassFlight）的 schema[] 拍平而来。
 * 结构：**一维数组**（无嵌套）—— 查看页的三个 List 直接 map 渲染。
 * 单项字段：key（main-<uuid>，记录定位键）/ uuid / order / name / desc
 *   共 17 项。
 * ------------------------------------------------------------
 * ⚠️ 本文件由 scripts/gen-view-static.cjs 生成，请勿手改；
 *    改内容请改 EditorTemplateJson 对应的源文件后重跑该脚本。
 * ============================================================
 */
export const PASSENGER_BYPASS_FLIGHT_MAIN_VIEW_JSON = [
    {
        "key": "main-dcf4ee8b-7d6f-4fcf-8d7c-682b824a584f",
        "uuid": "dcf4ee8b-7d6f-4fcf-8d7c-682b824a584f",
        "order": 1,
        "name": "航空器入位",
        "desc": "接机人员应不晚于航班计划/预计到港时间前5分钟到达机位。"
    },
    {
        "key": "main-9f8dedb9-c36e-446e-8b23-9d3e4fbb84f7",
        "uuid": "9f8dedb9-c36e-446e-8b23-9d3e4fbb84f7",
        "order": 2,
        "name": "轮挡与反光锥形标志物放置",
        "desc": "500座以上：4分钟  251-500座：4分钟  151-250座：3分钟  61-150座：3分钟  60座以下：2分钟"
    },
    {
        "key": "main-171b4956-e417-471a-bc1d-334d190f72c6",
        "uuid": "171b4956-e417-471a-bc1d-334d190f72c6",
        "order": 3,
        "name": "廊桥对接",
        "desc": "对接操作应在机务给出对接指令后进行。"
    },
    {
        "key": "main-7e030894-51a5-43b6-83ca-0961a32ec03a",
        "uuid": "7e030894-51a5-43b6-83ca-0961a32ec03a",
        "order": 4,
        "name": "客梯车对接",
        "desc": "客梯车应在航班计划/预计到港时间前5分钟到达机位。"
    },
    {
        "key": "main-555a9601-fbb8-4c0d-adcd-dcdeaaaeb5bb",
        "uuid": "555a9601-fbb8-4c0d-adcd-dcdeaaaeb5bb",
        "order": 5,
        "name": "客舱门开启",
        "desc": "客舱门开启操作应在廊桥或客梯车对接完毕确认后进行。"
    },
    {
        "key": "main-6b0c6528-75c7-495b-975f-90e85acd8995",
        "uuid": "6b0c6528-75c7-495b-975f-90e85acd8995",
        "order": 6,
        "name": "货舱门开启",
        "desc": "货舱门开启应在机务给出指令后立即进行。"
    },
    {
        "key": "main-6327dff2-8d2c-44e1-8519-f72121dcb992",
        "uuid": "6327dff2-8d2c-44e1-8519-f72121dcb992",
        "order": 7,
        "name": "客舱清洁",
        "desc": "客舱清洁应在旅客下机完毕后立即进行，开始登机前完成。"
    },
    {
        "key": "main-8d188972-9119-4d3c-8e5a-39cb5cf45b40",
        "uuid": "8d188972-9119-4d3c-8e5a-39cb5cf45b40",
        "order": 8,
        "name": "污水操作",
        "desc": "污水操作完成时间应不晚于计划/目标离港时间前15分钟。"
    },
    {
        "key": "main-f64c0e41-de96-4f71-8754-3f4022ddf826",
        "uuid": "f64c0e41-de96-4f71-8754-3f4022ddf826",
        "order": 9,
        "name": "清水操作",
        "desc": "清水操作完成时间应不晚于计划/目标离港时间前15分钟。"
    },
    {
        "key": "main-8312ff54-8dc5-4d87-8006-af86ca4dc7f0",
        "uuid": "8312ff54-8dc5-4d87-8006-af86ca4dc7f0",
        "order": 10,
        "name": "餐食及机供品配供",
        "desc": "餐食及机供品配供应在开始登机前完成。"
    },
    {
        "key": "main-69c82eb4-5c85-40ac-a3ad-64f60cae38b6",
        "uuid": "69c82eb4-5c85-40ac-a3ad-64f60cae38b6",
        "order": 11,
        "name": "航油加注",
        "desc": "航油加注应在开始登机前5分钟完成。"
    },
    {
        "key": "main-99c2588a-efb1-4e47-8bf9-1488d3ca2413",
        "uuid": "99c2588a-efb1-4e47-8bf9-1488d3ca2413",
        "order": 12,
        "name": "装卸人员及装卸设备",
        "desc": "在航班计划／预计到港时间前5分钟到位。"
    },
    {
        "key": "main-632974e5-4bde-4508-96f8-6a6a3f632045",
        "uuid": "632974e5-4bde-4508-96f8-6a6a3f632045",
        "order": 13,
        "name": "货邮、行李装载",
        "desc": "货邮、行李装载应在计划/目标离港时间前5分钟完成。"
    },
    {
        "key": "main-9ce4bce8-77f3-4a73-9445-e6ea15b8b1ee",
        "uuid": "9ce4bce8-77f3-4a73-9445-e6ea15b8b1ee",
        "order": 14,
        "name": "客舱门关闭",
        "desc": "客舱门关闭时间不晚于计划/目标离港时间前5分钟。"
    },
    {
        "key": "main-d2c3b1da-d5b0-47fc-bef5-858c018a084c",
        "uuid": "d2c3b1da-d5b0-47fc-bef5-858c018a084c",
        "order": 15,
        "name": "廊桥撤离",
        "desc": "廊桥撤离应在客舱门关闭后开始。"
    },
    {
        "key": "main-e3c8ffe5-bc97-4841-990c-01016926be64",
        "uuid": "e3c8ffe5-bc97-4841-990c-01016926be64",
        "order": 16,
        "name": "牵引车、机务到位",
        "desc": "牵引车、机务到位时间不晚于计划/目标离港时间前10分钟。"
    },
    {
        "key": "main-c8b6ded2-0722-4e4f-8481-072ded9d2ad2",
        "uuid": "c8b6ded2-0722-4e4f-8481-072ded9d2ad2",
        "order": 17,
        "name": "航空器推出",
        "desc": "从接到指令到航空器开始撤离机位不应超过3分钟。"
    }
]

export default PASSENGER_BYPASS_FLIGHT_MAIN_VIEW_JSON
