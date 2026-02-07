export const arrRNAV = [
    /* ====================== RWY 01L ====================== */
    {
        id: "RWY01L",
        label: "01L 进场",
        children: [
            {
                id: "RWY01L_OTBUG",
                label: "OTBUG",
                children: [
                    {
                        id: "RWY01L_OTBUG_9",
                        label: "9",
                        relatedId: "RWY01L_OTBUG_8",
                        routes: [
                            {
                                route: ["OTBUG-9 ARR"],
                                routePoints: ["OTBUG", "EC417", "XSH", "EC423"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01L_P36",
                label: "P36",
                children: [
                    {
                        id: "RWY01L_P36-Z",
                        label: "Z",
                        relatedId: "RWY01L_P36_Y",
                        routes: [
                            {
                                route: ["RWY01L_P36-Z"],
                                routePoints: ["P36", "EC418", "XSH", "EC423"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01L_TULMU",
                label: "TULMU",
                children: [
                    {
                        id: "RWY01L_TULMU-9",
                        label: "9",
                        relatedId: "RWY01L_TULMU-8",
                        routes: [
                            {
                                route: ["TULMU-9 ARR"],
                                routePoints: ["TULMU", "EC514", "XSH", "EC423"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                    {
                        id: "RWY01L_TULMU-7",
                        label: "7",
                        relatedId: "RWY01L_TULMU-6",
                        routes: [
                            {
                                route: ["TULMU-5 ARR"],
                                routePoints: ["TULMU", "EC416", "EC422"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01L_UPMAT",
                label: "UPMAT",
                children: [
                    {
                        id: "RWY01L_UPMAT-9",
                        label: "9",
                        relatedId: "RWY01L_UPMAT-8",
                        routes: [
                            {
                                route: ["UPMAT-9 ARR"],
                                routePoints: ["UPMAT", "DHB", "EC407", "AGUXI", "EC404"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                    {
                        id: "RWY01L_UPMAT-7",
                        label: "7",
                        relatedId: "RWY01L_UPMAT-6",
                        routes: [
                            {
                                route: ["UPMAT-7 ARR"],
                                routePoints: ["UPMAT", "KGF"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01L_WTM",
                label: "WTM",
                children: [
                    {
                        id: "RWY01L_WTM-9",
                        label: "9",
                        relatedId: "RWY01L_WTM-8",
                        routes: [
                            {
                                route: ["WTM-9 ARR"],
                                routePoints: ["WTM", "DHB", "EC407", "AGUXI", "EC404"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01L_OVLAR",
                label: "OVLAR",
                children: [
                    {
                        id: "RWY01L_OVLAR-9",
                        label: "9",
                        relatedId: "RWY01L_OVLAR-8",
                        routes: [
                            {
                                route: ["OVLAR-9 ARR"],
                                routePoints: ["OVLAR", "P393", "HOK", "DHP", "MOU", "AGUXI", "EC404"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01L_ENLAB",
                label: "ENLAB",
                children: [
                    {
                        id: "RWY01L_ENLAB-9",
                        label: "9",
                        relatedId: "RWY01L_ENLAB-8",
                        routes: [
                            {
                                route: ["ENLAB-9 ARR"],
                                routePoints: ["ENLAB", "AVLEN", "DHP", "MOU", "AGUXI", "EC404"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
        ],
    },

    /* ====================== RWY 01R ====================== */
    {
        id: "RWY01R",
        label: "01R 进场",
        children: [
            {
                id: "RWY01R_OTBUG",
                label: "OTBUG",
                children: [
                    {
                        id: "RWY01R_OTBUG_9",
                        label: "9",
                        relatedId: "RWY01R_OTBUG_8",
                        routes: [
                            {
                                route: ["OTBUG-9 ARR"],
                                routePoints: ["OTBUG", "EC417", "XSH", "EC423"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01R_P36",
                label: "P36",
                children: [
                    {
                        id: "RWY01R_P36-Z",
                        label: "Z",
                        relatedId: "RWY01R_P36-Y",
                        routes: [
                            {
                                route: ["P36-Z ARR"],
                                routePoints: ["P36", "EC418", "XSH", "EC423"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01R_TULMU",
                label: "TULMU",
                children: [
                    {
                        id: "RWY01R_TULMU-9",
                        label: "9",
                        relatedId: "RWY01R_TULMU-8",
                        routes: [
                            {
                                route: ["TULMU-9 ARR"],
                                routePoints: ["TULMU", "EC514", "XSH", "EC423"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                    {
                        id: "RWY01R_TULMU-7",
                        label: "7",
                        relatedId: "RWY01R_TULMU-6",
                        routes: [
                            {
                                route: ["TULMU-7 ARR"],
                                routePoints: ["TULMU", "EC416", "EC422"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01R_UPMAT",
                label: "UPMAT",
                children: [
                    {
                        id: "RWY01R_UPMAT-9",
                        label: "9",
                        relatedId: "RWY01R_UPMAT-8",
                        routes: [
                            {
                                route: ["UPMAT-9 ARR"],
                                routePoints: ["UPMAT", "DHB", "EC407", "AGUXI", "EC404"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                    {
                        id: "RWY01R_UPMAT-7",
                        label: "7",
                        relatedId: "RWY01R_UPMAT-6",
                        routes: [
                            {
                                route: ["UPMAT-7 ARR"],
                                routePoints: ["UPMAT", "KGF"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01R_WTM",
                label: "WTM",
                children: [
                    {
                        id: "RWY01R_WTM-9",
                        label: "9",
                        relatedId: "RWY01R_WTM-8",
                        routes: [
                            {
                                route: ["WTM-9 ARR"],
                                routePoints: ["WTM", "DHB", "EC407", "AGUXI", "EC404"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01R_OVLAR",
                label: "OVLAR",
                children: [
                    {
                        id: "RWY01R_OVLAR-9",
                        label: "9",
                        relatedId: "RWY01R_OVLAR-8",
                        routes: [
                            {
                                route: ["OVLAR-9 ARR"],
                                routePoints: ["OVLAR", "P393", "HOK", "DHP", "MOU", "AGUXI", "EC404"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01R_ENLAB",
                label: "ENLAB",
                children: [
                    {
                        id: "RWY01R_ENLAB-9",
                        label: "9",
                        relatedId: "RWY01R_ENLAB-8",
                        routes: [
                            {
                                route: ["ENLAB-9 ARR"],
                                routePoints: ["ENLAB", "AVLEN", "DHP", "MOU", "AGUXI", "EC404"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
        ],
    },

    /* ====================== RWY 19L ====================== */
    {
        id: "RWY19L",
        label: "19L 进场",
        children: [
            {
                id: "RWY19L_OTBUG",
                label: "OTBUG",
                children: [
                    {
                        id: "RWY19L_OTBUG_9",
                        label: "9",
                        relatedId: "RWY19L_OTBUG_8",
                        routes: [
                            {
                                route: ["OTBUG-9 ARR"],
                                routePoints: ["OTBUG", "EC522", "XGD"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19L_P36",
                label: "P36",
                children: [
                    {
                        id: "RWY19L_P36-Z",
                        label: "Z",
                        relatedId: "RWY19L_P36-Y",
                        routes: [
                            {
                                route: ["P36-Z ARR"],
                                routePoints: ["P36", "EC418", "XSH", "EC513"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19L_TULMU",
                label: "TULMU",
                children: [
                    {
                        id: "RWY19L_TULMU-9",
                        label: "9",
                        relatedId: "RWY19L_TULMU-8",
                        routes: [
                            {
                                route: ["TULMU-9 ARR"],
                                routePoints: ["TULMU", "EC514", "XSH", "EC513"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19L_UPMAT",
                label: "UPMAT",
                children: [
                    {
                        id: "RWY19L_UPMAT-9",
                        label: "9",
                        relatedId: "RWY19L_UPMAT-8",
                        routes: [
                            {
                                route: ["UPMAT-9 ARR"],
                                routePoints: ["UPMAT", "DHB", "WHA", "SAGUD", "EC517", "DAMEG", "EC516", "XGD"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                    {
                        id: "RWY19L_UPMAT-7",
                        label: "7",
                        relatedId: "RWY19L_UPMAT-6",
                        routes: [
                            {
                                route: ["UPMAT-7 ARR"],
                                routePoints: ["UPMAT", "DHB", "MOU"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                    {
                        id: "RWY19L_UPMAT-5",
                        label: "5",
                        relatedId: "RWY19L_UPMAT-4",
                        routes: [
                            {
                                route: ["UPMAT-5 ARR"],
                                routePoints: ["UPMAT", "KGF", "EC505", "EC504", "EC503", "MOU"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19L_WTM",
                label: "WTM",
                children: [
                    {
                        id: "RWY19L_WTM-9",
                        label: "9",
                        relatedId: "RWY19L_WTM-8",
                        routes: [
                            {
                                route: ["WTM-9 ARR"],
                                routePoints: ["WTM", "DHB", "WHA", "SAGUD", "EC517", "DAMEG", "EC516", "XGD"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                    {
                        id: "RWY19L_WTM-7",
                        label: "7",
                        relatedId: "RWY19L_WTM-6",
                        routes: [
                            {
                                route: ["WTM-7 ARR"],
                                routePoints: ["WTM", "DHB", "MOU"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19L_OVLAR",
                label: "OVLAR",
                children: [
                    {
                        id: "RWY19L_OVLAR-9",
                        label: "9",
                        relatedId: "RWY19L_OVLAR-8",
                        routes: [
                            {
                                route: ["OVLAR-9 ARR"],
                                routePoints: ["OVLAR", "P393", "HOK", "DAMEG", "EC516", "XGD"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19L_ENLAB",
                label: "ENLAB",
                children: [
                    {
                        id: "RWY19L_ENLAB-9",
                        label: "9",
                        relatedId: "RWY19L_ENLAB-8",
                        routes: [
                            {
                                route: ["ENLAB-9 ARR"],
                                routePoints: ["ENLAB", "NODIM", "DAMEG", "EC516", "XGD"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
        ],
    },

    /* ====================== RWY 19R ====================== */
    {
        id: "RWY19R",
        label: "19R 进场",
        children: [
            {
                id: "RWY19R_OTBUG",
                label: "OTBUG",
                children: [
                    {
                        id: "RWY19R_OTBUG_9",
                        label: "9",
                        relatedId: "RWY19R_OTBUG_8",
                        routes: [
                            {
                                route: ["OTBUG-9 ARR"],
                                routePoints: ["OTBUG", "EC522", "XGD"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19R_P36",
                label: "P36",
                children: [
                    {
                        id: "RWY19R_P36-Z",
                        label: "Z",
                        relatedId: "RWY19R_P36-Y",
                        routes: [
                            {
                                route: ["P36-Z ARR"],
                                routePoints: ["P36", "EC418", "XSH", "EC513"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19R_TULMU",
                label: "TULMU",
                children: [
                    {
                        id: "RWY19R_TULMU-9",
                        label: "9",
                        relatedId: "RWY19R_TULMU-8",
                        routes: [
                            {
                                route: ["TULMU-9 ARR"],
                                routePoints: ["TULMU", "EC514", "XSH", "EC513"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19R_UPMAT",
                label: "UPMAT",
                children: [
                    {
                        id: "RWY19R_UPMAT-9",
                        label: "9",
                        relatedId: "RWY19R_UPMAT-8",
                        routes: [
                            {
                                route: ["UPMAT-9 ARR"],
                                routePoints: ["UPMAT", "DHB", "WHA", "SAGUD", "EC517", "DAMEG", "EC516", "XGD"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                    {
                        id: "RWY19R_UPMAT-7",
                        label: "7",
                        relatedId: "RWY19R_UPMAT-6",
                        routes: [
                            {
                                route: ["UPMAT-9 ARR"],
                                routePoints: ["UPMAT", "DHB", "MOU"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                    {
                        id: "RWY19R_UPMAT-5",
                        label: "5",
                        relatedId:"RWY19R_UPMAT-4",
                        routes: [
                            {
                                route: ["UPMAT-5 ARR"],
                                routePoints: ["UPMAT", "KGF", "EC505", "EC504", "EC503", "MOU"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19R_WTM",
                label: "WTM",
                children: [
                    {
                        id: "RWY19R_WTM-9",
                        label: "9",
                        relatedId: "RWY19R_WTM-8",
                        routes: [
                            {
                                route: ["WTM-9 ARR"],
                                routePoints: ["WTM", "DHB", "WHA", "SAGUD", "EC517", "DAMEG", "EC516", "XGD"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                    {
                        id: "RWY19R_WTM-7",
                        label: "7",
                        relatedId: "RWY19R_WTM-6",
                        routes: [
                            {
                                route: ["WTM-5 ARR"],
                                routePoints: ["WTM", "DHB", "MOU"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19R_OVLAR",
                label: "OVLAR",
                children: [
                    {
                        id: "RWY19R_OVLAR-9",
                        label: "9",
                        relatedId: "RWY19R_OVLAR-8",
                        routes: [
                            {
                                route: ["OVLAR-9 ARR"],
                                routePoints: ["OVLAR", "P393", "HOK", "DAMEG", "EC516", "XGD"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19R_ENLAB",
                label: "ENLAB",
                children: [
                    {
                        id: "RWY19R_ENLAB-9",
                        label: "9",
                        relatedId: "RWY19R_ENLAB-8",
                        routes: [
                            {
                                route: ["ENLAB-9 ARR"],
                                routePoints: ["ENLAB", "NODIM", "DAMEG", "EC516", "XGD"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进场程序",
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
