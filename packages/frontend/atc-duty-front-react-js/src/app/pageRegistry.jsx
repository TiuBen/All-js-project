// src/app/pageRegistry.js

import { OnDutyPage, CalendarPage, StatisticsPage, DutyRecordPage } from "../pages/index.js";

export const PAGE_KEYS = {
    DASHBOARD: "DASHBOARD",
    DUTY: "DUTY",
    CALENDAR: "CALENDAR",
    Statistics: "Statistics",
    POSITIONS: "POSITIONS",
    POSITION_DETAIL: "POSITION_DETAIL",
    DUTY_RECORD: "DUTY_RECORD",
};

export const pageRegistry = {
    // [PAGE_KEYS.DASHBOARD]: OnDutyPage,
    [PAGE_KEYS.DASHBOARD]: <div>OnDutyPage</div>,
    [PAGE_KEYS.DUTY]: OnDutyPage,
    [PAGE_KEYS.CALENDAR]: CalendarPage,
    [PAGE_KEYS.Statistics]: StatisticsPage,
    [PAGE_KEYS.POSITIONS]: <div>Positions</div>,
    [PAGE_KEYS.DUTY_RECORD]: DutyRecordPage,

    // 👇 先不写，明确标记
    [PAGE_KEYS.POSITION_DETAIL]: null,
};
