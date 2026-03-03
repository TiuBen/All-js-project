import { create } from "zustand";
import { positionService } from "../service/position.service";

import { PAGE_KEYS, pageRegistry } from "../app/pageRegistry";

function getInitialPage() {
    const page = new URLSearchParams(window.location.search).get("page");

    if (page && pageRegistry[page]) {
        return page;
    }

    return PAGE_KEYS.DASHBOARD;
}

export const useAppStore = create((set) => ({
    page: getInitialPage(),
    setPage: (page) => {
        set({ page });
        const url = new URL(window.location.href);
        window.history.pushState({}, "", String(page).toLowerCase());
    },

    isLeftBarOpen: true,
    toggleLeftBar: () =>
        set((state) => ({
            isLeftBarOpen: !state.isLeftBarOpen,
        })),

    positions: [],
    positionsLoading: true,
    async fetchPositions() {
        set({ positionsLoading: true });
        try {
            const data = await positionService.list();
            console.log("positions", data);
            set({ positions: data, positionsLoading: false });
        } catch {
            set({ positionsLoading: false });
        }
    },
}));
