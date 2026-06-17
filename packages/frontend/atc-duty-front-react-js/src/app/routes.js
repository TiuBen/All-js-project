// src/app/routes.js

import NightCount from "@/pages/StatisticsPage/NightCount";
import { OnDutyPage, CalendarPage, StatisticsPage, DutyRecordPage } from "../pages";

import ComingSoon from "./layout/ComingSoon";

export const ROUTES = {
    // "/": {
    //     title: "值班记录",
    //     component: DutyRecordPage,
    // },
    "/": {
        title: "值班记录",
        component: OnDutyPage,
    },

    duty: {
        title: "值班情况",
        component: OnDutyPage,
    },

    calendar: {
        title: "日历",
        component: CalendarPage,
    },

    statistics: {
        title: "统计",
        component: StatisticsPage,
    },
    "statistics/night-count": {
        title: "统计",
        component: NightCount,
    },

    positions: {
        title: "席位管理",
        component: ComingSoon,
    },
};
