/**
 * ============================================================
 * 货运始发航班 —— 节点保障检查单静态数据
 * ------------------------------------------------------------
 * 由后端 data/checklists/节点保障/货运始发航班.json 全量内联而来。
 * 编译期即随前端产物打包，不再请求 /api/checklists/templates。
 * 顶层字段：uuid / category / source / generatedAt / checklistName / schemaVersion / variables / parameters / schema
 * 结构：schema[]（主监控节点）→ auxiliaries[]（辅助监控项），节点以 uuid 为唯一身份；
 *       节点带 formula 供时间公式求值，引用其它节点时用 refUUID（各模板 eventId 会撞号，不可跨模板引用）
 * ------------------------------------------------------------
 * ⚠️ 本文件由 scripts/gen-checklist-static.cjs 生成，请勿手改；
 *    改内容请改后端 JSON 后重跑该脚本。
 * ============================================================
 */
export const cargoInitFlight = {
    "uuid": "e808bd46-8a39-4238-88ec-18706f5565c3",
    "category": "货运始发航班",
    "source": "货运航班节点保障及合规性监控检查单.xlsx",
    "generatedAt": "2026-08-30T22:08:40.000Z",
    "checklistName": "始发航班",
    "schemaVersion": "3.0-origin",
    "variables": {
        "cobt": {
            "name": "计算撤轮挡时间",
            "type": "datetime",
            "source": "upstream",
            "description": "Calculated Off-Block Time"
        },
        "ctot": {
            "name": "计算起飞时间",
            "type": "datetime",
            "source": "upstream",
            "description": "Calculated Take-Off Time"
        },
        "aircraftType": {
            "name": "机型",
            "type": "enum",
            "source": "upstream",
            "options": [
                "B747",
                "B777",
                "B767",
                "B757",
                "B737"
            ]
        },
        "demandGroundPower": {
            "name": "地面电源需求申请时间",
            "type": "datetime",
            "source": "manual",
            "description": "机组提出地面电源需求的时刻"
        },
        "demandWater": {
            "name": "加清水/排污水需求申请时间",
            "type": "datetime",
            "source": "manual",
            "description": "机组提出加清水/排污水需求的时刻"
        }
    },
    "parameters": [
        {
            "code": "FUEL_TIME",
            "name": "机型参考加油时间",
            "type": "aircraft_type",
            "unit": "minutes",
            "description": "不同机型的标准加油作业时长",
            "values": {
                "B747": 100,
                "B777": 70,
                "B767": 60,
                "B757": 60,
                "B737": 60
            }
        },
        {
            "code": "LOAD_TIME",
            "name": "标准装机作业时长",
            "type": "aircraft_type",
            "unit": "minutes",
            "description": "不同机型的标准装机作业时长",
            "values": {
                "B747": 80,
                "B777": 80,
                "B767": 75,
                "B757": 50,
                "B737": 40
            }
        },
        {
            "code": "CHOCK_TIME",
            "name": "标准撤轮挡时间",
            "type": "aircraft_type",
            "unit": "minutes",
            "description": "不同机型的标准撤轮挡作业时长",
            "values": {
                "B747": 4,
                "B777": 4,
                "B767": 3,
                "B757": 3,
                "B737": 2
            }
        }
    ],
    "schema": [
        {
            "uuid": "a13e6f95-b111-4666-be2a-82159dbfd151",
            "eventId": "E001",
            "code": "OPEN_COCKPIT_DOOR",
            "category": "main",
            "name": "开驾驶舱门",
            "desc": "COBT-机型标准装机作业时长-30分钟",
            "formula": {
                "type": "binary",
                "operator": "-",
                "left": {
                    "type": "ref",
                    "target": "var",
                    "ref": "cobt"
                },
                "right": {
                    "type": "binary",
                    "operator": "+",
                    "left": {
                        "type": "lookup",
                        "param": "LOAD_TIME",
                        "key": {
                            "type": "ref",
                            "target": "var",
                            "ref": "aircraftType"
                        }
                    },
                    "right": {
                        "type": "literal",
                        "value": 30,
                        "unit": "minutes"
                    }
                }
            },
            "auxiliaries": [
                {
                    "uuid": "2293ca0f-46a1-4835-b946-2ff6de0f947f",
                    "code": "MECHANIC_ARRIVAL",
                    "type": "auxiliary",
                    "name": "机务到位",
                    "desc": "开驾驶舱门-5分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "a13e6f95-b111-4666-be2a-82159dbfd151"
                        },
                        "right": {
                            "type": "literal",
                            "value": 5,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "3b441580-9221-4eb6-860e-314053113584",
                    "code": "HANDLING_AGENT_ARRIVAL",
                    "type": "auxiliary",
                    "name": "代办到位",
                    "desc": "开驾驶舱门-5分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "a13e6f95-b111-4666-be2a-82159dbfd151"
                        },
                        "right": {
                            "type": "literal",
                            "value": 5,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "594f2b97-b148-49e0-9214-e2a2608101c0",
                    "code": "CUSTOMS_IMMIGRATION_ARRIVAL",
                    "type": "auxiliary",
                    "name": "海关/边检到位",
                    "desc": "开驾驶舱门+0分钟",
                    "formula": {
                        "type": "ref",
                        "target": "event",
                        "time": "actual",
                        "refUUID": "a13e6f95-b111-4666-be2a-82159dbfd151"
                    }
                },
                {
                    "uuid": "fb233c7f-4551-4cf2-97c0-71366cb6674c",
                    "code": "BOARDING_LADDER_ARRIVAL",
                    "type": "auxiliary",
                    "name": "登机梯/客梯车到位",
                    "desc": "开驾驶舱门-5分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "a13e6f95-b111-4666-be2a-82159dbfd151"
                        },
                        "right": {
                            "type": "literal",
                            "value": 5,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "d1885553-92d7-41b9-8685-8494f824dd7c",
                    "code": "START_FUELING",
                    "type": "auxiliary",
                    "name": "开始加油",
                    "desc": "COBT-机型参考加油时间-5分钟（B747参考加油100分钟；B777参考加油70分钟；B737/B757/B767参考加油60分钟）",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "cobt"
                        },
                        "right": {
                            "type": "binary",
                            "operator": "+",
                            "left": {
                                "type": "lookup",
                                "param": "FUEL_TIME",
                                "key": {
                                    "type": "ref",
                                    "target": "var",
                                    "ref": "aircraftType"
                                }
                            },
                            "right": {
                                "type": "literal",
                                "value": 5,
                                "unit": "minutes"
                            }
                        }
                    }
                },
                {
                    "uuid": "1f2c822e-a647-437f-80f0-1fd1614d716c",
                    "code": "START_WATER_SERVICE",
                    "type": "auxiliary",
                    "name": "开始加清水/排污水",
                    "desc": "需求申请时间+15分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "+",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "demandWater"
                        },
                        "right": {
                            "type": "literal",
                            "value": 15,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "6a77c1ed-1d1f-4c93-8b0e-5f0e50a19341",
                    "code": "CONNECT_GROUND_POWER",
                    "type": "auxiliary",
                    "name": "接地面电源",
                    "desc": "需求申请时间+15分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "+",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "demandGroundPower"
                        },
                        "right": {
                            "type": "literal",
                            "value": 15,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "eadc522a-6855-4014-a090-7f8488fcdcc7",
                    "code": "PLATFORM_LOADER_ARRIVAL",
                    "type": "auxiliary",
                    "name": "平台车到位",
                    "desc": "开驾驶舱门-5分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "a13e6f95-b111-4666-be2a-82159dbfd151"
                        },
                        "right": {
                            "type": "literal",
                            "value": 5,
                            "unit": "minutes"
                        }
                    }
                }
            ]
        },
        {
            "uuid": "c26192f8-59bd-4e0b-814d-db0418003d5b",
            "eventId": "E002",
            "code": "OPEN_CARGO_DOOR",
            "category": "main",
            "name": "开货舱门",
            "desc": "COBT-机型标准装机作业时长-30分钟",
            "formula": {
                "type": "binary",
                "operator": "-",
                "left": {
                    "type": "ref",
                    "target": "var",
                    "ref": "cobt"
                },
                "right": {
                    "type": "binary",
                    "operator": "+",
                    "left": {
                        "type": "lookup",
                        "param": "LOAD_TIME",
                        "key": {
                            "type": "ref",
                            "target": "var",
                            "ref": "aircraftType"
                        }
                    },
                    "right": {
                        "type": "literal",
                        "value": 30,
                        "unit": "minutes"
                    }
                }
            },
            "auxiliaries": []
        },
        {
            "uuid": "04f51044-871b-4ca6-88aa-e459701a0fdb",
            "eventId": "E003",
            "code": "START_LOAD",
            "category": "main",
            "name": "开始装机",
            "desc": "COBT-机型标准装机作业时长-20分钟",
            "formula": {
                "type": "binary",
                "operator": "-",
                "left": {
                    "type": "ref",
                    "target": "var",
                    "ref": "cobt"
                },
                "right": {
                    "type": "binary",
                    "operator": "+",
                    "left": {
                        "type": "lookup",
                        "param": "LOAD_TIME",
                        "key": {
                            "type": "ref",
                            "target": "var",
                            "ref": "aircraftType"
                        }
                    },
                    "right": {
                        "type": "literal",
                        "value": 20,
                        "unit": "minutes"
                    }
                }
            },
            "auxiliaries": [
                {
                    "uuid": "d3ca88f7-9d66-433b-9b1d-14263d76fdb5",
                    "code": "OUTBOUND_CARGO_HANDOVER",
                    "type": "auxiliary",
                    "name": "出港货物交接",
                    "desc": "窄体机CTOT-4小时；宽体机CTOT-6小时",
                    "formula": {
                        "type": "choice",
                        "options": [
                            {
                                "condition": "窄体机",
                                "formula": {
                                    "type": "binary",
                                    "operator": "-",
                                    "left": {
                                        "type": "ref",
                                        "target": "var",
                                        "ref": "ctot"
                                    },
                                    "right": {
                                        "type": "literal",
                                        "value": 240,
                                        "unit": "minutes"
                                    }
                                }
                            },
                            {
                                "condition": "宽体机",
                                "formula": {
                                    "type": "binary",
                                    "operator": "-",
                                    "left": {
                                        "type": "ref",
                                        "target": "var",
                                        "ref": "ctot"
                                    },
                                    "right": {
                                        "type": "literal",
                                        "value": 360,
                                        "unit": "minutes"
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "uuid": "283fd3fd-5dae-458d-84ed-b05c023ed563",
                    "code": "FIRST_PALLET_ARRIVAL",
                    "type": "auxiliary",
                    "name": "第一板出港货物到达机坪待装区",
                    "desc": "开驾驶舱门-90分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "a13e6f95-b111-4666-be2a-82159dbfd151"
                        },
                        "right": {
                            "type": "literal",
                            "value": 90,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "56b94fc3-4a69-44ce-8edd-9426304b4413",
                    "code": "ALL_OUTBOUND_CARGO_ARRIVAL",
                    "type": "auxiliary",
                    "name": "全部出港货物到达待装区/机坪",
                    "desc": "开驾驶舱门-60分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "a13e6f95-b111-4666-be2a-82159dbfd151"
                        },
                        "right": {
                            "type": "literal",
                            "value": 60,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "6dcb4872-847f-42af-8da2-90e9a3c17e71",
                    "code": "LOADING_MANIFEST_RECEIVE",
                    "type": "auxiliary",
                    "name": "装机单接收",
                    "desc": "开驾驶舱门-5分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "a13e6f95-b111-4666-be2a-82159dbfd151"
                        },
                        "right": {
                            "type": "literal",
                            "value": 5,
                            "unit": "minutes"
                        }
                    }
                }
            ]
        },
        {
            "uuid": "f512dfee-fa93-4c55-9175-608b67b0b991",
            "eventId": "E004",
            "code": "LOAD_COMPLETE",
            "category": "main",
            "name": "装机完成",
            "desc": "开始装机+机型标准装机作业时长（或COBT-20分钟）",
            "formula": {
                "type": "function",
                "name": "min",
                "args": [
                    {
                        "type": "binary",
                        "operator": "+",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "04f51044-871b-4ca6-88aa-e459701a0fdb"
                        },
                        "right": {
                            "type": "lookup",
                            "param": "LOAD_TIME",
                            "key": {
                                "type": "ref",
                                "target": "var",
                                "ref": "aircraftType"
                            }
                        }
                    },
                    {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "cobt"
                        },
                        "right": {
                            "type": "literal",
                            "value": 20,
                            "unit": "minutes"
                        }
                    }
                ]
            },
            "auxiliaries": []
        },
        {
            "uuid": "b1de26f3-1bb8-4df8-b2b1-c1a425bdb8a5",
            "eventId": "E005",
            "code": "CLOSE_CARGO_DOOR",
            "category": "main",
            "name": "关货舱门",
            "desc": "装机完成+15分钟（或COBT-5分钟）",
            "formula": {
                "type": "function",
                "name": "min",
                "args": [
                    {
                        "type": "binary",
                        "operator": "+",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "f512dfee-fa93-4c55-9175-608b67b0b991"
                        },
                        "right": {
                            "type": "literal",
                            "value": 15,
                            "unit": "minutes"
                        }
                    },
                    {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "cobt"
                        },
                        "right": {
                            "type": "literal",
                            "value": 5,
                            "unit": "minutes"
                        }
                    }
                ]
            },
            "auxiliaries": [
                {
                    "uuid": "24c5f78c-05b9-4cc3-a0f5-3861beddcdba",
                    "code": "OUTBOUND_INSPECTION_START",
                    "type": "auxiliary",
                    "name": "出港登临检查开始",
                    "desc": "装机完成（或COBT-20分钟）",
                    "formula": {
                        "type": "function",
                        "name": "min",
                        "args": [
                            {
                                "type": "ref",
                                "target": "event",
                                "time": "actual",
                                "refUUID": "f512dfee-fa93-4c55-9175-608b67b0b991"
                            },
                            {
                                "type": "binary",
                                "operator": "-",
                                "left": {
                                    "type": "ref",
                                    "target": "var",
                                    "ref": "cobt"
                                },
                                "right": {
                                    "type": "literal",
                                    "value": 20,
                                    "unit": "minutes"
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            "uuid": "81630a04-787b-47f2-8084-669a170e2dd7",
            "eventId": "E006",
            "code": "CLOSE_COCKPIT_DOOR",
            "category": "main",
            "name": "关驾驶舱门",
            "desc": "关货舱门+0分钟（或COBT-5分钟）",
            "formula": {
                "type": "function",
                "name": "min",
                "args": [
                    {
                        "type": "ref",
                        "target": "event",
                        "time": "actual",
                        "refUUID": "b1de26f3-1bb8-4df8-b2b1-c1a425bdb8a5"
                    },
                    {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "cobt"
                        },
                        "right": {
                            "type": "literal",
                            "value": 5,
                            "unit": "minutes"
                        }
                    }
                ]
            },
            "auxiliaries": [
                {
                    "uuid": "f4c7e0e1-9919-43fc-9c2e-09562ea839ce",
                    "code": "FUELING_COMPLETE",
                    "type": "auxiliary",
                    "name": "完成加油",
                    "desc": "COBT-5分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "cobt"
                        },
                        "right": {
                            "type": "literal",
                            "value": 5,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "94829324-f27d-483e-aebb-eb52166f92af",
                    "code": "WATER_SERVICE_COMPLETE",
                    "type": "auxiliary",
                    "name": "结束加清水/排污水",
                    "desc": "COBT-15分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "cobt"
                        },
                        "right": {
                            "type": "literal",
                            "value": 15,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "78d7896c-8966-47db-9712-bec162a2f191",
                    "code": "OUTBOUND_INSPECTION_COMPLETE",
                    "type": "auxiliary",
                    "name": "出港登临检查结束",
                    "desc": "装机完成+15分钟（或COBT-5分钟）",
                    "formula": {
                        "type": "function",
                        "name": "min",
                        "args": [
                            {
                                "type": "binary",
                                "operator": "+",
                                "left": {
                                    "type": "ref",
                                    "target": "event",
                                    "time": "actual",
                                    "refUUID": "f512dfee-fa93-4c55-9175-608b67b0b991"
                                },
                                "right": {
                                    "type": "literal",
                                    "value": 15,
                                    "unit": "minutes"
                                }
                            },
                            {
                                "type": "binary",
                                "operator": "-",
                                "left": {
                                    "type": "ref",
                                    "target": "var",
                                    "ref": "cobt"
                                },
                                "right": {
                                    "type": "literal",
                                    "value": 5,
                                    "unit": "minutes"
                                }
                            }
                        ]
                    }
                },
                {
                    "uuid": "55f6c569-3856-424b-90ed-34055f1bed5d",
                    "code": "OUTBOUND_CREW_ARRIVAL",
                    "type": "auxiliary",
                    "name": "出港机组到机下",
                    "desc": "COBT-60分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "cobt"
                        },
                        "right": {
                            "type": "literal",
                            "value": 60,
                            "unit": "minutes"
                        }
                    }
                }
            ]
        },
        {
            "uuid": "15e3fd57-d3b6-4a55-8369-1d03edd812ed",
            "eventId": "E007",
            "code": "PUSHBACK",
            "category": "main",
            "name": "推出",
            "desc": "关驾驶舱门+5分钟（或COBT+0分钟）",
            "formula": {
                "type": "function",
                "name": "min",
                "args": [
                    {
                        "type": "binary",
                        "operator": "+",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "81630a04-787b-47f2-8084-669a170e2dd7"
                        },
                        "right": {
                            "type": "literal",
                            "value": 5,
                            "unit": "minutes"
                        }
                    },
                    {
                        "type": "ref",
                        "target": "var",
                        "ref": "cobt"
                    }
                ]
            },
            "auxiliaries": [
                {
                    "uuid": "1da92f14-5a3f-41dd-8162-4f191109233b",
                    "code": "TOW_TRUCK_ARRIVAL",
                    "type": "auxiliary",
                    "name": "牵引车到位",
                    "desc": "COBT-10分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "cobt"
                        },
                        "right": {
                            "type": "literal",
                            "value": 10,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "b867124a-d12e-4539-8e6c-adafe2247993",
                    "code": "CONNECT_AIR_CART",
                    "type": "auxiliary",
                    "name": "接气源车",
                    "desc": "COBT-30分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "cobt"
                        },
                        "right": {
                            "type": "literal",
                            "value": 30,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "89d85db8-d462-4938-85cf-64a53f82061a",
                    "code": "DISCONNECT_AIR_AND_POWER",
                    "type": "auxiliary",
                    "name": "撤气源车/撤地面电源",
                    "desc": "COBT-0分钟",
                    "formula": {
                        "type": "ref",
                        "target": "var",
                        "ref": "cobt"
                    }
                },
                {
                    "uuid": "7358b754-cba7-4695-80a7-1068ee3fc1e6",
                    "code": "REMOVE_CHOCKS",
                    "type": "auxiliary",
                    "name": "撤轮档",
                    "desc": "COBT-机型标准撤轮挡时间（B747/B777为4分钟；B757/B767为3分钟；B737为2分钟）",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "cobt"
                        },
                        "right": {
                            "type": "lookup",
                            "param": "CHOCK_TIME",
                            "key": {
                                "type": "ref",
                                "target": "var",
                                "ref": "aircraftType"
                            }
                        }
                    }
                }
            ]
        },
        {
            "uuid": "2198c203-bca0-4ca7-8498-4dd2816942c2",
            "eventId": "E008",
            "code": "TAXI_OUT",
            "category": "main",
            "name": "滑出",
            "desc": "推出+5分钟（或COBT+5分钟）",
            "formula": {
                "type": "function",
                "name": "min",
                "args": [
                    {
                        "type": "binary",
                        "operator": "+",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "15e3fd57-d3b6-4a55-8369-1d03edd812ed"
                        },
                        "right": {
                            "type": "literal",
                            "value": 5,
                            "unit": "minutes"
                        }
                    },
                    {
                        "type": "binary",
                        "operator": "+",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "cobt"
                        },
                        "right": {
                            "type": "literal",
                            "value": 5,
                            "unit": "minutes"
                        }
                    }
                ]
            },
            "auxiliaries": []
        },
        {
            "uuid": "7bed710a-378d-4641-8375-01a09429874a",
            "eventId": "E009",
            "code": "TAKEOFF",
            "category": "main",
            "name": "起飞",
            "desc": "滑出+10分钟（或COBT+15分钟）",
            "formula": {
                "type": "function",
                "name": "min",
                "args": [
                    {
                        "type": "binary",
                        "operator": "+",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "2198c203-bca0-4ca7-8498-4dd2816942c2"
                        },
                        "right": {
                            "type": "literal",
                            "value": 10,
                            "unit": "minutes"
                        }
                    },
                    {
                        "type": "binary",
                        "operator": "+",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "cobt"
                        },
                        "right": {
                            "type": "literal",
                            "value": 15,
                            "unit": "minutes"
                        }
                    }
                ]
            },
            "auxiliaries": [
                {
                    "uuid": "87f6faa6-5dbb-46c4-bb3e-0aeb619c2482",
                    "code": "HANDLING_AGENT_DEPARTURE",
                    "type": "auxiliary",
                    "name": "代办离场",
                    "desc": "起飞时间+0分钟",
                    "formula": {
                        "type": "ref",
                        "target": "event",
                        "time": "actual",
                        "refUUID": "7bed710a-378d-4641-8375-01a09429874a"
                    }
                }
            ]
        }
    ]
}

export default cargoInitFlight
