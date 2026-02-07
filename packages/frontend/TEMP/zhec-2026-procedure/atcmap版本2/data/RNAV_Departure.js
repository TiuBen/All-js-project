export const depRNAV = [
    /* ====================== RWY 01L ====================== */
    {
        id: "RWY01L",
        label: "01L 离场",
        relatedId: "RWY01L",
        children: [
            {
                id: "RWY01L_URGEB",
                label: "URGEB",
                children: [
                    {
                        id: "RWY01L_URGEB_9",
                        label: "9",
                        relatedId: "RWY01L_URGEB_8",
                        routes: [
                            {
                                route: ["URGEB-9 dep"],
                                routePoints: ["EC500", "01L800", "XSH", "URGEB"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",
                            },
                        ],
                    },
                    {
                        id: "RWY01L_URGEB_7",
                        label: "7",
                        relatedId: "RWY01L_URGEB_6",
                        routes: [
                            {
                                route: ["URGEB-7 dep"],
                                routePoints: ["EC500", "01L800", "XGD", "DAMEG", "URGEB"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",
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
                        id: "RWY01L_P36-X",
                        label: "X",
                        relatedId: "RWY01L_P36-W",
                        routes: [
                            {
                                route: ["RWY01L_P36-X"],
                                routePoints: ["EC500", "01L800", "XSH", "P36"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

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
                        id: "RWY01L_TULMU-5",
                        label: "5",
                        relatedId: "RWY01L_TULMU-4",
                        routes: [
                            {
                                route: ["TULMU-5 DEP"],
                                routePoints: ["EC500", "01L800", "XSH", "TULMU"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01L_OLMIB",
                label: "OLMIB",
                children: [
                    {
                        id: "RWY01L_OLMIB-9",
                        label: "9",
                        relatedId: "RWY01L_OLMIB-8",
                        routes: [
                            {
                                route: ["OLMIB-9 DEP"],
                                routePoints: [
                                    "EC500",
                                    "01L800",
                                    "XGD",
                                    "EC452",
                                    "EC517",
                                    "DHP",
                                    "DCD",
                                    "IGNIK",
                                    "OLMIB",
                                ],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY01L_OLMIB-7",
                        label: "7",
                        relatedId: "RWY01L_OLMIB-6",
                        routes: [
                            {
                                route: ["OLMIB-7 DEP"],
                                routePoints: [
                                    "EC500",
                                    "01L800",
                                    "XSH",
                                    "EC451",
                                    "XSH",
                                    "AGUXI",
                                    "EC407",
                                    "VIMAK",
                                    "DCD",
                                    "IGNIK",
                                    "OLMIB",
                                ],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY01L_OLMIB-5",
                        label: "5",
                        relatedId: "RWY01L_OLMIB-4",
                        routes: [
                            {
                                route: ["OLMIB-5 DEP"],
                                routePoints: ["EC500", "01L150", "01L500", "P175", "DCD", "IGNIK", "OLMIB"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01L_GUGAM",
                label: "GUGAM",
                children: [
                    {
                        id: "RWY01L_GUGAM-9",
                        label: "9",
                        relatedId: "RWY01L_GUGAM-8",
                        routes: [
                            {
                                route: ["GUGAM-9 DEP"],
                                routePoints: ["EC500", "01L800", "XGD", "EC452", "EC517", "DHP", "DCD", "GUGAM"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY01L_GUGAM-7",
                        label: "7",
                        relatedId: "RWY01L_GUGAM-6",
                        routes: [
                            {
                                route: ["GUGAM-7 DEP"],
                                routePoints: [
                                    "EC500",
                                    "01L800",
                                    "XSH",
                                    "EC451",
                                    "XSH",
                                    "AGUXI",
                                    "EC407",
                                    "VIMAK",
                                    "DCD",
                                    "GUGAM",
                                ],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY01L_GUGAM-5",
                        label: "5",
                        relatedId: "RWY01L_GUGAM-4",
                        routes: [
                            {
                                route: ["GUGAM-5 DEP"],
                                routePoints: ["EC500", "01L150", "01L500", "P175", "DCD", "GUGAM"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01L_BENBI",
                label: "BENBI",
                children: [
                    {
                        id: "RWY01L_BENBI-9",
                        label: "9",
                        relatedId: "RWY01L_BENBI-8",
                        routes: [
                            {
                                route: ["BENBI-9 DEP"],
                                routePoints: ["EC500", "01L800", "XGD", "DAMEG", "PAVPA", "ONUDU", "BENBI"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY01L_BENBI-7",
                        label: "7",
                        relatedId: "RWY01L_BENBI-6",
                        routes: [
                            {
                                route: ["BENBI-7 DEP"],
                                routePoints: [
                                    "EC500",
                                    "01L800",
                                    "XSH",
                                    "EC451",
                                    "XSH",
                                    "SAGUD",
                                    "HG",
                                    "REPUV",
                                    "VEXAN",
                                    "BENBI",
                                ],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

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
        label: "01R 离场",
        children: [
            {
                id: "RWY01R_URGEB",
                label: "URGEB",
                relatedId: "RWY01R_URGEB",
                children: [
                    {
                        id: "RWY01R_URGEB_9",
                        label: "9",
                        relatedId: "RWY01R_URGEB_8",
                        routes: [
                            {
                                route: ["URGEB-9 dep"],
                                routePoints: ["EC510", "01R150", "01R500", "XSH", "URGEB"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",
                            },
                        ],
                    },
                    {
                        id: "RWY01R_URGEB_7",
                        label: "7",
                        relatedId: "RWY01R_URGEB_6",
                        routes: [
                            {
                                route: ["URGEB-7 dep"],
                                routePoints: ["EC510", "01R800", "XGD", "DAMEG", "URGEB"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",
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
                        id: "RWY01R_P36-x",
                        label: "x",
                        relatedId: "RWY01R_P36-W",
                        routes: [
                            {
                                route: ["P36-X DEP"],
                                routePoints: ["EC510", "01R150", "01R500", "XSH", "P36"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",
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
                        id: "RWY01R_TULMU-5",
                        label: "5",
                        relatedId: "RWY01R_TULMU-4",
                        routes: [
                            {
                                route: ["TULMU-5 DEP"],
                                routePoints: ["EC510", "01R150", "01R500", "XSH", "TULMU"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01R_OLMIB",
                label: "OLMIB",
                children: [
                    {
                        id: "RWY01R_OLMIB-9",
                        label: "9",
                        relatedId: "RWY01R_OLMIB-8",
                        routes: [
                            {
                                route: ["OLMIB-9 DEP"],
                                routePoints: [
                                    "EC510",
                                    "01R800",
                                    "XGD",
                                    "EC452",
                                    "EC517",
                                    "DHP",
                                    "DCD",
                                    "IGNIK",
                                    "OLMIB",
                                ],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY01R_OLMIB-7",
                        label: "7",
                        relatedId: "RWY01R_OLMIB-6",
                        routes: [
                            {
                                route: ["OLMIB-7 DEP"],
                                routePoints: [
                                    "EC510",
                                    "01R150",
                                    "01R500",
                                    "XSH",
                                    "EC451",
                                    "XSH",
                                    "AGUXI",
                                    "EC407",
                                    "VIMAK",
                                    "DCD",
                                    "IGNIK",
                                    "OLMIB",
                                ],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY01R_OLMIB-5",
                        label: "5",
                        relatedId: "RWY01R_OLMIB-4",
                        routes: [
                            {
                                route: ["OLMIB-5 DEP"],
                                routePoints: ["EC510", "01R800", "P175", "DCD", "IGNIK", "OLMIB"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01R_GUGAM",
                label: "GUGAM",
                children: [
                    {
                        id: "RWY01R_GUGAM-9",
                        label: "9",
                        relatedId: "RWY01R_GUGAM-8",
                        routes: [
                            {
                                route: ["GUGAM-9 DEP"],
                                routePoints: ["EC510", "01R800", "XGD", "EC452", "EC517", "DHP", "DCD", "GUGAM"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY01R_GUGAM-7",
                        label: "7",
                        relatedId: "RWY01R_GUGAM-6",
                        routes: [
                            {
                                route: ["GUGAM-7 DEP"],
                                routePoints: [
                                    "EC510",
                                    "01R150",
                                    "01R500",
                                    "XSH",
                                    "EC451",
                                    "XSH",
                                    "AGUXI",
                                    "EC407",
                                    "VIMAK",
                                    "DCD",
                                    "GUGAM",
                                ],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY01R_GUGAM-5",
                        label: "5",
                        relatedId: "RWY01R_GUGAM-4",
                        routes: [
                            {
                                route: ["GUGAM-5 DEP"],
                                routePoints: ["EC510", "01R800", "P175", "DCD", "GUGAM"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01R_BENBI",
                label: "BENBI",
                children: [
                    {
                        id: "RWY01R_BENBI-9",
                        label: "9",
                        relatedId: "RWY01R_BENBI-8",
                        routes: [
                            {
                                route: ["BENBI-9 DEP"],
                                routePoints: ["EC510", "01R800", "XGD", "DAMEG", "PAVPA", "ONUDU", "BENBI"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY01R_BENBI-7",
                        label: "7",
                        relatedId: "RWY01R_BENBI-6",
                        routes: [
                            {
                                route: ["BENBI-7 DEP"],
                                routePoints: [
                                    "EC510",
                                    "01R150",
                                    "01R500",
                                    "XSH",
                                    "EC451",
                                    "XSH",
                                    "SAGUD",
                                    "HG",
                                    "REPUV",
                                    "VEXAN",
                                    "BENBI",
                                ],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

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
        label: "19L 离场",
        children: [
            {
                id: "RWY19L_URGEB",
                label: "URGEB",
                children: [
                    {
                        id: "RWY19L_URGEB_9",
                        label: "9",
                        relatedId: "RWY19L_URGEB_8",
                        routes: [
                            {
                                route: ["URGEB-9 dep"],
                                routePoints: ["EC410", "19L650", "XSH", "URGEB"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

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
                        id: "RWY19L_P36-x",
                        label: "x",
                        relatedId: "RWY19L_P36-W",
                        routes: [
                            {
                                route: ["P36-X DEP"],
                                routePoints: ["EC410", "19L650", "XSH", "P36"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

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
                        id: "RWY19L_TULMU-5",
                        label: "5",
                        relatedId: "RWY19L_TULMU-4",
                        routes: [
                            {
                                route: ["TULMU-5 DEP"],
                                routePoints: ["EC410", "19L650", "EC565", "EC566", "TULMU"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY19L_TULMU-3",
                        label: "3",
                        relatedId: "RWY19L_TULMU-2",
                        routes: [
                            {
                                route: ["TULMU-3 DEP"],
                                routePoints: ["EC410", "19L650", "EC561", "P180", "TULMU"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19L_OLMIB",
                label: "OLMIB",
                children: [
                    {
                        id: "RWY19L_OLMIB-9",
                        label: "9",
                        relatedId: "RWY19L_OLMIB-8",
                        routes: [
                            {
                                route: ["OLMIB-9 DEP"],
                                routePoints: [
                                    "EC410",
                                    "19L950",
                                    "EC562",
                                    "KGF",
                                    "EC563",
                                    "SALUG",
                                    "EC564",
                                    "OSIRU",
                                    "OLMIB",
                                ],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY19L_OLMIB-5",
                        label: "5",
                        relatedId: "RWY19L_OLMIB-4",
                        routes: [
                            {
                                route: ["OLMIB-5 DEP"],
                                routePoints: ["EC410", "19L950", "EC562", "KGF", "OLMIB"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19L_GUGAM",
                label: "GUGAM",
                children: [
                    {
                        id: "RWY19L_GUGAM-9",
                        label: "9",
                        relatedId: "RWY19L_GUGAM-8",
                        routes: [
                            {
                                route: ["GUGAM-9 DEP"],
                                routePoints: [
                                    "EC410",
                                    "19L950",
                                    "EC562",
                                    "KGF",
                                    "EC563",
                                    "SALUG",
                                    "EC564",
                                    "UNTIN",
                                    "GUGAM",
                                ],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY19L_GUGAM-5",
                        label: "5",
                        relatedId: "RWY19L_GUGAM-4",
                        routes: [
                            {
                                route: ["GUGAM-5 DEP"],
                                routePoints: ["EC410", "19L950", "EC562", "KGF", "GUGAM"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19L_BENBI",
                label: "BENBI",
                children: [
                    {
                        id: "RWY19L_BENBI-9",
                        label: "9",
                        relatedId: "RWY19L_BENBI-8",
                        routes: [
                            {
                                route: ["BENBI-9 DEP"],
                                routePoints: [
                                    "EC410",
                                    "19L950",
                                    "EC562",
                                    "KGF",
                                    "EC563",
                                    "VADBU",
                                    "PAVPA",
                                    "ONUDU",
                                    "BENBI",
                                ],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

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
        label: "19R 离场",
        children: [
            {
                id: "RWY19R_URGEB",
                label: "URGEB",
                children: [
                    {
                        id: "RWY19R_URGEB_9",
                        label: "9",
                        relatedId: "RWY19R_URGEB_8",
                        routes: [
                            {
                                route: ["URGEB-9 dep"],
                                routePoints: ["EC400","19R950", "XSH", "URGEB"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

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
                        id: "RWY19R_P36-x",
                        label: "x",
                        relatedId: "RWY19R_P36-W",
                        routes: [
                            {
                                route: ["P36-X DEP"],
                                routePoints: ["EC400","19R950", "XSH", "P36"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

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
                        id: "RWY19R_TULMU-5",
                        label: "5",
                        relatedId: "RWY19R_TULMU-4",
                        routes: [
                            {
                                route: ["TULMU-5 DEP"],
                                routePoints: ["EC400","19R950", "EC565", "EC566", "TULMU"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY19R_TULMU-3",
                        label: "3",
                        relatedId: "RWY19R_TULMU-2",
                        routes: [
                            {
                                route: ["TULMU-3 DEP"],
                                routePoints: ["EC400","19R950", "EC561", "P180", "TULMU"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19R_OLMIB",
                label: "OLMIB",
                children: [
                    {
                        id: "RWY19R_OLMIB-9",
                        label: "9",
                        relatedId: "RWY19R_OLMIB-8",
                        routes: [
                            {
                                route: ["OLMIB-9 DEP"],
                                routePoints: [
                                    "EC400",
                                    "19R150",
                                    "19R650",
                                    "EC562",
                                    "KGF",
                                    "EC563",
                                    "SALUG",
                                    "EC564",
                                    "OSIRU",
                                    "OLMIB",
                                ],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY19R_OLMIB-5",
                        label: "5",
                        relatedId: "RWY19R_OLMIB-4",
                        routes: [
                            {
                                route: ["OLMIB-5 DEP"],
                                routePoints: ["EC400","19R150", "19R650", "EC562", "KGF", "OLMIB"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19R_GUGAM",
                label: "GUGAM",
                children: [
                    {
                        id: "RWY19R_GUGAM-9",
                        label: "9",
                        relatedId: "RWY19R_GUGAM-8",
                        routes: [
                            {
                                route: ["GUGAM-9 DEP"],
                                routePoints: [
                                    "EC400",
                                    "19R150",
                                    "19R650",
                                    "EC562",
                                    "KGF",
                                    "EC563",
                                    "SALUG",
                                    "EC564",
                                    "UNTIN",
                                    "GUGAM",
                                ],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                    {
                        id: "RWY19R_GUGAM-5",
                        label: "5",
                        relatedId: "RWY19R_GUGAM-4",
                        routes: [
                            {
                                route: ["GUGAM-5 DEP"],
                                routePoints: ["19R150", "19R650", "EC562", "KGF", "GUGAM"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19R_BENBI",
                label: "BENBI",
                children: [
                    {
                        id: "RWY19R_BENBI-9",
                        label: "9",
                        relatedId: "RWY19R_BENBI-8",
                        routes: [
                            {
                                route: ["BENBI-9 DEP"],
                                routePoints: [
                                    "EC400",
                                    "19R150",
                                    "19R650",
                                    "EC562",
                                    "KGF",
                                    "EC563",
                                    "VADBU",
                                    "PAVPA",
                                    "ONUDU",
                                    "BENBI",
                                ],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "离场程序",

                            },
                        ],
                    },
                ],
            },
        ],
    },
];