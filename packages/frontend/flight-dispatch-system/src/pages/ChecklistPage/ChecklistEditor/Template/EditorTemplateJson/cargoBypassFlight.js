/**
 * ============================================================
 * 货运过站航班 —— 节点保障检查单静态数据
 * ------------------------------------------------------------
 * 由后端 data/checklists/节点保障/货运过站航班.json 全量内联而来。
 * 编译期即随前端产物打包，不再请求 /api/checklists/templates。
 * 顶层字段：uuid / category / source / generatedAt / checklistName / schemaVersion / variables / parameters / schema
 * 结构：schema[]（主监控节点）→ auxiliaries[]（辅助监控项），节点以 uuid 为唯一身份；
 *       节点带 formula 供时间公式求值，引用其它节点时用 refUUID（各模板 eventId 会撞号，不可跨模板引用）
 * ------------------------------------------------------------
 * ⚠️ 本文件由 scripts/gen-checklist-static.cjs 生成，请勿手改；
 *    改内容请改后端 JSON 后重跑该脚本。
 * ============================================================
 */
export const cargoBypassFlight = {
    "uuid": "8a942e2f-0783-4ce5-9d28-39c1d650b8a2",
    "category": "货运过站航班",
    "source": "货运航班节点保障及合规性监控检查单.xlsx",
    "generatedAt": "2026-08-06T13:59:38.679869",
    "checklistName": "常规航班",
    "schemaVersion": "3.0-test",
    "variables": {
        "estimatedLanding": {
            "name": "预计落地时间",
            "type": "datetime",
            "source": "upstream",
            "required": true,
            "description": "报文预计落地时刻"
        },
        "actualLanding": {
            "name": "实际落地时间",
            "type": "datetime",
            "source": "upstream",
            "required": true,
            "description": "航空器实际落地时刻"
        },
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
            "code": "UNLOAD_TIME",
            "name": "标准卸机作业时长",
            "type": "aircraft_type",
            "unit": "minutes",
            "description": "不同机型的标准卸机作业时长",
            "values": {
                "B747": 80,
                "B777": 80,
                "B767": 75,
                "B757": 50,
                "B737": 40
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
            "uuid": "a7e089ed-0f9b-404d-974b-0777b74ec89d",
            "eventId": "E001",
            "code": "LANDING",
            "category": "main",
            "name": "预计落地",
            "desc": "预计落地",
            "formula": {
                "type": "ref",
                "target": "var",
                "ref": "estimatedLanding"
            },
            "auxiliaries": []
        },
        {
            "uuid": "35c6f11f-6d9c-4020-9798-31509396a93b",
            "eventId": "E002",
            "code": "IN_POSITION",
            "category": "main",
            "name": "入位",
            "desc": "实际落地时间+10分钟",
            "formula": {
                "type": "binary",
                "operator": "+",
                "left": {
                    "type": "ref",
                    "target": "var",
                    "ref": "actualLanding"
                },
                "right": {
                    "type": "literal",
                    "value": 10,
                    "unit": "minutes"
                }
            },
            "auxiliaries": [
                {
                    "uuid": "63c4783d-4271-4546-8daf-f205f59242f0",
                    "code": "MECHANIC_ARRIVAL",
                    "type": "auxiliary",
                    "name": "机务到位",
                    "desc": "入位时间-5分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "35c6f11f-6d9c-4020-9798-31509396a93b"
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
            "uuid": "4b411293-c1f8-4ce5-8db4-9e4636aff6ba",
            "eventId": "E003",
            "code": "START_CHOCK",
            "category": "main",
            "name": "开始挡轮挡",
            "desc": "入位时间+0分钟",
            "formula": {
                "type": "ref",
                "target": "event",
                "time": "actual",
                "refUUID": "35c6f11f-6d9c-4020-9798-31509396a93b"
            },
            "auxiliaries": [
                {
                    "uuid": "6904f6d9-ec2e-4e8d-a671-8c43ad85d750",
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
                }
            ]
        },
        {
            "uuid": "1526b9aa-7a8e-4525-a133-a97429312b47",
            "eventId": "E004",
            "code": "OPEN_COCKPIT_DOOR",
            "category": "main",
            "name": "开驾驶舱门",
            "desc": "开始挡轮挡+10分钟",
            "formula": {
                "type": "binary",
                "operator": "+",
                "left": {
                    "type": "ref",
                    "target": "event",
                    "time": "actual",
                    "refUUID": "4b411293-c1f8-4ce5-8db4-9e4636aff6ba"
                },
                "right": {
                    "type": "literal",
                    "value": 10,
                    "unit": "minutes"
                }
            },
            "auxiliaries": [
                {
                    "uuid": "0fdfcaff-e2bd-4f85-9cbd-5a735132cb76",
                    "code": "BOARDING_LADDER_ARRIVAL",
                    "type": "auxiliary",
                    "name": "登机梯/客梯车到位",
                    "desc": "入位时间-5分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "35c6f11f-6d9c-4020-9798-31509396a93b"
                        },
                        "right": {
                            "type": "literal",
                            "value": 5,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "22a30937-ac79-4f27-b8d4-2bc04c1ebbc4",
                    "code": "HANDLING_AGENT_ARRIVAL",
                    "type": "auxiliary",
                    "name": "代办到位",
                    "desc": "入位时间-5分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "35c6f11f-6d9c-4020-9798-31509396a93b"
                        },
                        "right": {
                            "type": "literal",
                            "value": 5,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "6c360b32-f27a-4308-8878-0338f9e740ed",
                    "code": "CUSTOMS_IMMIGRATION_ARRIVAL",
                    "type": "auxiliary",
                    "name": "海关/边检到位",
                    "desc": "入位时间+0分钟",
                    "formula": {
                        "type": "ref",
                        "target": "event",
                        "time": "actual",
                        "refUUID": "35c6f11f-6d9c-4020-9798-31509396a93b"
                    }
                },
                {
                    "uuid": "451e6387-2932-45d6-9eb4-cc27c299edaf",
                    "code": "START_FUELING",
                    "type": "auxiliary",
                    "name": "开始加油",
                    "desc": "COBT-机型参考加油时间-5分钟",
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
                    "uuid": "d1b363c6-69ba-4232-860d-eda60fbab601",
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
                    "uuid": "b61e0c0c-cd93-406a-8ae0-4d08d09bad61",
                    "code": "PLATFORM_LOADER_ARRIVAL",
                    "type": "auxiliary",
                    "name": "平台车到位",
                    "desc": "入位时间-5分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "35c6f11f-6d9c-4020-9798-31509396a93b"
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
            "uuid": "6499b169-933c-4aad-a204-859a829f9ef6",
            "eventId": "E005",
            "code": "OPEN_CARGO_DOOR",
            "category": "main",
            "name": "开货舱门",
            "desc": "开驾驶舱门+5分钟",
            "formula": {
                "type": "binary",
                "operator": "+",
                "left": {
                    "type": "ref",
                    "target": "event",
                    "time": "actual",
                    "refUUID": "1526b9aa-7a8e-4525-a133-a97429312b47"
                },
                "right": {
                    "type": "literal",
                    "value": 5,
                    "unit": "minutes"
                }
            },
            "auxiliaries": [
                {
                    "uuid": "6d63367c-f805-4a39-b24b-692f21b598bd",
                    "code": "CUSTOMS_ARRIVAL_CHECK_COMPLETE",
                    "type": "auxiliary",
                    "name": "海关/边检进港登临检查结束",
                    "desc": "开驾驶舱门+15分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "+",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "1526b9aa-7a8e-4525-a133-a97429312b47"
                        },
                        "right": {
                            "type": "literal",
                            "value": 15,
                            "unit": "minutes"
                        }
                    }
                }
            ]
        },
        {
            "uuid": "00fbfdb9-f0f0-49c3-bf56-d8f4d056034f",
            "eventId": "E006",
            "code": "START_UNLOAD",
            "category": "main",
            "name": "开始卸机",
            "desc": "开货舱门+10分钟",
            "formula": {
                "type": "binary",
                "operator": "+",
                "left": {
                    "type": "ref",
                    "target": "event",
                    "time": "actual",
                    "refUUID": "6499b169-933c-4aad-a204-859a829f9ef6"
                },
                "right": {
                    "type": "literal",
                    "value": 10,
                    "unit": "minutes"
                }
            },
            "auxiliaries": []
        },
        {
            "uuid": "f2d47971-dee5-4f97-99af-6a91da5faf93",
            "eventId": "E007",
            "code": "UNLOAD_COMPLETE",
            "category": "main",
            "name": "卸机完成",
            "desc": "开始卸机+机型标准卸机作业时长",
            "formula": {
                "type": "binary",
                "operator": "+",
                "left": {
                    "type": "ref",
                    "target": "event",
                    "time": "actual",
                    "refUUID": "00fbfdb9-f0f0-49c3-bf56-d8f4d056034f"
                },
                "right": {
                    "type": "lookup",
                    "param": "UNLOAD_TIME",
                    "key": {
                        "type": "ref",
                        "target": "var",
                        "ref": "aircraftType"
                    }
                }
            },
            "auxiliaries": [
                {
                    "uuid": "ad1479db-a34c-4747-91cb-ccbfc4c3bb49",
                    "code": "INBOUND_CARGO_HANDOVER",
                    "type": "auxiliary",
                    "name": "进港货物交接",
                    "desc": "入位时间+80分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "+",
                        "left": {
                            "type": "ref",
                            "target": "event",
                            "time": "actual",
                            "refUUID": "35c6f11f-6d9c-4020-9798-31509396a93b"
                        },
                        "right": {
                            "type": "literal",
                            "value": 80,
                            "unit": "minutes"
                        }
                    }
                }
            ]
        },
        {
            "uuid": "42c02836-951e-4176-b95b-f8ab6b42c50c",
            "eventId": "E008",
            "code": "START_LOAD",
            "category": "main",
            "name": "开始装机",
            "desc": "卸机完成+0分钟（或COBT-机型标准装机作业时长-20分钟）",
            "formula": {
                "type": "functions",
                "relation": "or",
                "args": [
                    {
                        "type": "ref",
                        "target": "event",
                        "time": "actual",
                        "refUUID": "f2d47971-dee5-4f97-99af-6a91da5faf93"
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
                    }
                ]
            },
            "auxiliaries": [
                {
                    "uuid": "1647aa82-dafc-4cdb-b47e-49164cea4ddc",
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
                    "uuid": "e651e4a9-2f73-4eb1-8153-861eac7d1083",
                    "code": "FIRST_PALLET_ARRIVAL",
                    "type": "auxiliary",
                    "name": "第一板出港货物到达机坪待装区",
                    "desc": "预计落地时间-90分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "estimatedLanding"
                        },
                        "right": {
                            "type": "literal",
                            "value": 90,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "6c8b3827-0c8c-4c71-9c41-37e22959b99e",
                    "code": "ALL_OUTBOUND_CARGO_ARRIVAL",
                    "type": "auxiliary",
                    "name": "全部出港货物到达待装区/机坪",
                    "desc": "预计落地时间-60分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "estimatedLanding"
                        },
                        "right": {
                            "type": "literal",
                            "value": 60,
                            "unit": "minutes"
                        }
                    }
                },
                {
                    "uuid": "b2e76d59-5dec-4e71-b7bb-ff5464046bdb",
                    "code": "LOADING_MANIFEST_RECEIVE",
                    "type": "auxiliary",
                    "name": "装机单接收",
                    "desc": "预计落地时间-5分钟",
                    "formula": {
                        "type": "binary",
                        "operator": "-",
                        "left": {
                            "type": "ref",
                            "target": "var",
                            "ref": "estimatedLanding"
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
            "uuid": "7843b7fe-6ee6-49ff-88a4-cbc25acf3d63",
            "eventId": "E009",
            "code": "LOAD_COMPLETE",
            "category": "main",
            "name": "装机完成",
            "desc": "开始装机+机型标准装机作业时长",
            "formula": {
                "type": "binary",
                "operator": "+",
                "left": {
                    "type": "ref",
                    "target": "event",
                    "time": "actual",
                    "refUUID": "42c02836-951e-4176-b95b-f8ab6b42c50c"
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
            "auxiliaries": []
        },
        {
            "uuid": "349a1528-8cca-4e06-832f-1da2823daa7b",
            "eventId": "E010",
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
                            "refUUID": "7843b7fe-6ee6-49ff-88a4-cbc25acf3d63"
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
                    "uuid": "f56931df-41f2-4471-9ff0-6a0d968ddadc",
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
                                "refUUID": "7843b7fe-6ee6-49ff-88a4-cbc25acf3d63"
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
            "uuid": "69b44c8c-49e3-462c-a069-a09029bf12ef",
            "eventId": "E011",
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
                        "refUUID": "349a1528-8cca-4e06-832f-1da2823daa7b"
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
                    "uuid": "eaefd4a7-18e2-4bf1-b3f3-52535dd574d6",
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
                    "uuid": "21f16589-3adb-4b34-ae6d-c53882f266f6",
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
                    "uuid": "f262c0e1-7dff-4c6e-a1f5-b48cba44d767",
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
                                    "refUUID": "7843b7fe-6ee6-49ff-88a4-cbc25acf3d63"
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
                    "uuid": "f2ee8c9b-bfeb-4229-94b0-cba3e88fa93b",
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
            "uuid": "0241073a-18d0-4df4-8e38-2729a661b729",
            "eventId": "E012",
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
                            "refUUID": "69b44c8c-49e3-462c-a069-a09029bf12ef"
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
                    "uuid": "91bb8c2f-fae0-4ceb-bd23-7a31a2400939",
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
                    "uuid": "560d315d-4e5a-4357-870e-fa326818c141",
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
                    "uuid": "9c39c79a-acff-4d34-b5ae-5e68a3285fc4",
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
                    "uuid": "4357fb89-eb96-4bf3-a4a8-91c675282301",
                    "code": "REMOVE_CHOCKS",
                    "type": "auxiliary",
                    "name": "撤轮档",
                    "desc": "COBT-机型标准撤轮挡时间",
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
            "uuid": "f624de97-ef00-4fe7-8608-c4755245f165",
            "eventId": "E013",
            "code": "TAXI_OUT",
            "category": "main",
            "name": "滑出",
            "desc": "推出+5分钟",
            "formula": {
                "type": "binary",
                "operator": "+",
                "left": {
                    "type": "ref",
                    "target": "event",
                    "time": "actual",
                    "refUUID": "0241073a-18d0-4df4-8e38-2729a661b729"
                },
                "right": {
                    "type": "literal",
                    "value": 5,
                    "unit": "minutes"
                }
            },
            "auxiliaries": []
        },
        {
            "uuid": "77b2ca02-c0c3-47d5-93fa-4ea68eacf46d",
            "eventId": "E014",
            "code": "TAKEOFF",
            "category": "main",
            "name": "起飞",
            "desc": "滑出+10分钟",
            "formula": {
                "type": "binary",
                "operator": "+",
                "left": {
                    "type": "ref",
                    "target": "event",
                    "time": "actual",
                    "refUUID": "f624de97-ef00-4fe7-8608-c4755245f165"
                },
                "right": {
                    "type": "literal",
                    "value": 10,
                    "unit": "minutes"
                }
            },
            "auxiliaries": [
                {
                    "uuid": "d64d4cac-02e7-4a1b-b163-19fb83b46701",
                    "code": "HANDLING_AGENT_DEPARTURE",
                    "type": "auxiliary",
                    "name": "代办离场",
                    "desc": "起飞时间+0分钟",
                    "formula": {
                        "type": "ref",
                        "target": "event",
                        "time": "actual",
                        "refUUID": "77b2ca02-c0c3-47d5-93fa-4ea68eacf46d"
                    }
                }
            ]
        }
    ]
}

export default cargoBypassFlight
