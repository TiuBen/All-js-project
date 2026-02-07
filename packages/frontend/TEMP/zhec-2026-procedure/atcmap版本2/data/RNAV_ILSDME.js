export const ilsRNAV = [
    {
        id: "RWY01L",
        label: "01L 进近",
        children: [
            {
                id: "RWY01L_RNAV_ILS_DME",
                label: "RNAV ILS/DME",
                children: [
                    {
                        id: "RWY01L_RNAV_ILS_DME_Z",
                        label: "z",
                        comment: "IAF1200M，900M截获盲降，进近程序",
                        relatedId: ["RWY01L_ILS_DME_Y"],
                        routes: [
                            {
                                route: ["RWY01L_RNAV_ILS_DME_Z_part1"],
                                routePoints: ["KGF", "EC403", "EC402", "EC401", "EC400"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01L_RNAV_ILS_DME_Z_part2"],
                                routePoints: ["EC404", "EC403", "EC402", "EC401", "EC400"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01L_RNAV_ILS_DME_Z_part3"],
                                routePoints: ["EC423", "EC414", "EC402", "EC401", "EC400"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01L_RNAV_ILS_DME_Z_part4"],
                                routePoints: ["EC422", "P180", "EC414", "EC402", "EC401", "EC400"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                        ],
                    },
                    {
                        id: "RWY01L_RNAV_ILS_DME_X",
                        label: "x",
                        comment: "IAF1200M，1200M截获盲降，进近程序",
                        relatedId: "RWY01L_ILS_DME_W",

                        routes: [
                            {
                                route: ["RWY01L_RNAV_ILS_DME_X_part1"],
                                routePoints: ["KGF", "EC426", "EC419", "EC401", "EC400"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01L_RNAV_ILS_DME_X_part2"],
                                routePoints: ["EC404", "EC426", "EC419", "EC401", "EC400"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01L_RNAV_ILS_DME_X_part3"],
                                routePoints: ["EC423", "EC421", "EC419", "EC401", "EC400"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01L_RNAV_ILS_DME_X_part4"],
                                routePoints: ["EC422", "EC421", "EC419", "EC401", "EC400"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01L_RNP",
                label: "RNP",
                children: [
                    {
                        id: "RWY01L_RNP",
                        label: "RNP",
                        comment: "IAF1200M，900M截获盲降，非精密进近程序",
                        relatedId: "RWY01L_RNAV_ILS_DME_Z",
                        routes: [
                            {
                                route: ["RWY01L_RNAV_ILS_DME_Z_part1"],
                                routePoints: ["KGF", "EC403", "EC402", "EC401", "EC400"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01L_RNAV_ILS_DME_Z_part2"],
                                routePoints: ["EC404", "EC403", "EC402", "EC401", "EC400"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01L_RNAV_ILS_DME_Z_part3"],
                                routePoints: ["EC423", "EC414", "EC402", "EC401", "EC400"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01L_RNAV_ILS_DME_Z_part4"],
                                routePoints: ["EC422", "P180", "EC414", "EC402", "EC401", "EC400"],
                                routeStyle: { stroke: "#ff4d4f", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "RWY01R",
        label: "01R 进近",
        children: [
            {
                id: "RWY01R_RNAV_ILS_DME",
                label: "RNAV ILS/DME",
                children: [
                    {
                        id: "RWY01R_RNAV_ILS_DME_Z",
                        label: "z ",
                        comment: "IAF1200M，900M截获盲降，进近程序",
                        relatedId: "RWY01R_RNP",
                        routes: [
                            {
                                route: ["RWY01R_RNAV_ILS_DME_Z_part1"],
                                routePoints: ["KGF", "EC403", "EC413", "EC411", "EC410"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01R_RNAV_ILS_DME_Z_part2"],
                                routePoints: ["EC404", "EC403", "EC413", "EC411", "EC410"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01R_RNAV_ILS_DME_Z_part3"],
                                routePoints: ["EC423", "EC414", "EC413", "EC411", "EC410"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01R_RNAV_ILS_DME_Z_part4"],
                                routePoints: ["EC422", "P180", "EC414", "EC413", "EC411", "EC410"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                        ],
                    },
                    {
                        id: "RWY01R_RNAV_ILS_DME_X",
                        label: "x",
                        comment: "IAF1200M，1200M截获盲降，进近程序",
                        relatedId: "RWY01R_ILS_DME_W",

                        routes: [
                            {
                                route: ["RWY01R_RNAV_ILS_DME_X_part1"],
                                routePoints: ["KGF", "EC426", "EC420", "EC411", "EC410"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01R_RNAV_ILS_DME_X_part2"],
                                routePoints: ["EC404", "EC426", "EC420", "EC411", "EC410"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01R_RNAV_ILS_DME_X_part3"],
                                routePoints: ["EC423", "EC421", "EC420", "EC411", "EC410"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01R_RNAV_ILS_DME_X_part4"],
                                routePoints: ["EC422", "EC421", "EC420", "EC411", "EC410"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY01R_RNP",
                label: "RNP",
                children: [
                    {
                        id: "RWY01R_RNP",
                        label: "RNP",
                        comment: "IAF1200M，900M截获盲降，非精密进近程序",
                        relatedId: "RWY01R_RNAV_ILS_DME_Z",
                        routes: [
                            {
                                route: ["RWY01R_RNAV_ILS_DME_Z_part1"],
                                routePoints: ["KGF", "EC403", "EC413", "EC411", "EC410"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01R_RNAV_ILS_DME_Z_part2"],
                                routePoints: ["EC404", "EC403", "EC413", "EC411", "EC410"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01R_RNAV_ILS_DME_Z_part3"],
                                routePoints: ["EC423", "EC414", "EC413", "EC411", "EC410"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY01R_RNAV_ILS_DME_Z_part4"],
                                routePoints: ["EC422", "P180", "EC414", "EC413", "EC411", "EC410"],
                                routeStyle: { stroke: "#1890ff", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "RWY19L",
        label: "19L 进近",
        children: [
            {
                id: "RWY19L_RNAV_CAT1_2_ILS_DME",
                label: "RNAV ILS/DME",

                children: [
                    {
                        id: "RWY19L_RNAV_ILS_DME_Z",
                        label: "z(1/2)",
                        comment: "IAF900M/1200M，900M截获盲降，CAT 1/2进近程序",
                        relatedId: "RWY19L_RNAV_ILS_DME_Y",
                        routes: [
                            {
                                route: ["RWY19L_RNAV_ILS_DME_Z_part1"],
                                routePoints: ["MOU", "EC512", "EC511", "EC424","EC510"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY19L_RNAV_ILS_DME_Z_part2"],
                                routePoints: ["XGD", "EC512", "EC511", "EC510"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY19L_RNAV_ILS_DME_Z_part3"],
                                routePoints: ["EC513", "EC512", "EC511", "EC510"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19L_RNP",
                label: "RNP",
                children: [
                    {
                        id: "RWY19L_RNP",
                        label: "RNP",
                        comment: "IAF900M/1200M，900M截获盲降，非精密进近程序",
                        relatedId: "RWY19L_RNAV_ILS_DME_Z",
                        routes: [
                            {
                                route: ["RWY19L_RNAV_ILS_DME_Z_part1"],
                                routePoints: ["MOU", "EC512", "EC511", "EC424","EC510"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY19L_RNAV_ILS_DME_Z_part2"],
                                routePoints: ["XGD", "EC512", "EC511", "EC424","EC510"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY19L_RNAV_ILS_DME_Z_part3"],
                                routePoints: ["EC513", "EC512", "EC511",  "EC424","EC510"],
                                routeStyle: { stroke: "#52c41a", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "RWY19R",
        label: "19R 进近",
        children: [
            {
                id: "RWY19R_RNAV_CAT1_2_ILS_DME",
                label: "RNAV ILS/DME",
                children: [
                    {
                        id: "RWY19R_RNAV_ILS_DME_Z",
                        label: "z(1/2)",
                        relatedId: "RWY19R_RNAV_ILS_DME_Y",
                        comment: "IAF900M/1200M，600M截获盲降，CAT 1/2进近程序",
                        routes: [
                            {
                                route: ["RWY19R_RNAV_ILS_DME_Z_part1"],
                                routePoints: ["MOU", "EC502", "EC501", "EC500"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY19R_RNAV_ILS_DME_Z_part2"],
                                routePoints: ["XGD", "EC502", "EC501", "EC500"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY19R_RNAV_ILS_DME_Z_part3"],
                                routePoints: ["EC513", "EC502", "EC501", "EC500"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                        ],
                    },
                ],
            },
            {
                id: "RWY19R_RNP",
                label: "RNP",
                children: [
                    {
                        id: "RWY19R_RNP",
                        label: "RNP",
                        comment: "IAF900M/1200M，600M截获盲降，非精密进近程序",
                        relatedId: "RWY19R_RNAV_ILS_DME_Z",
                        routes: [
                            {
                                route: ["RWY19R_RNAV_ILS_DME_Z_part1"],
                                routePoints: ["MOU", "EC502", "EC501", "EC500"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY19R_RNAV_ILS_DME_Z_part2"],
                                routePoints: ["XGD", "EC502", "EC501", "EC500"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                            {
                                route: ["RWY19R_RNAV_ILS_DME_Z_part3"],
                                routePoints: ["EC513", "EC502", "EC501", "EC500"],
                                routeStyle: { stroke: "#faad14", lineStyle: "solid" },
                                comment: "进近程序",
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
