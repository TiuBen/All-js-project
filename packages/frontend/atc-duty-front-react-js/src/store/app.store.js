import { create } from "zustand";
import { Pages } from "../app/router/routes";
import { positionService } from "../service/position.service";

function setUrl(page) {
    const url = new URL(window.location.href);
    url.searchParams.set("page", page);
    window.history.pushState({}, "", url);
}

export const useAppStore = create((set) => ({
    page: Pages.DASHBOARD,
    setPage: (page) => {
        set({ page });
        setUrl(page);
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
