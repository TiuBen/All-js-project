// src/app/pageRegistry.js

import { OnDutyPage, CalendarPage } from "../pages/index.js";

export const PAGE_KEYS = {
    DASHBOARD: "DASHBOARD",
    DUTY: "DUTY",
    CALENDAR: "CALENDAR",
    POSITIONS: "POSITIONS",
    POSITION_DETAIL: "POSITION_DETAIL",
};

export const pageRegistry = {
    [PAGE_KEYS.DASHBOARD]: OnDutyPage,
    [PAGE_KEYS.DUTY]: OnDutyPage,
    [PAGE_KEYS.CALENDAR]: CalendarPage,
    [PAGE_KEYS.POSITIONS]: () => <div>Positions</div>,

    // 👇 先不写，明确标记
    [PAGE_KEYS.POSITION_DETAIL]: null,
};
