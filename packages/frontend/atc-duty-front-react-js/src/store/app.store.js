import { create } from "zustand";
import { positionService } from "../service/position.service";

// function getInitialPage() {
//     const path = window.location.pathname.replace("/", "").toUpperCase();

//     if (pageRegistry[path] !== undefined) {
//         return path;
//     }

//     return PAGE_KEYS.DUTY_RECORD;
// }

export const useAppStore = create((set, get) => ({
    // page: getInitialPage(),
    // setPage: (page) => {
    //     set({ page });
    //     // const url = new URL(window.location.href);
    //     window.history.pushState({}, "", "/" + page.toLowerCase());
    // },

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
            set({ positions: data, positionsLoading: false });
        } catch {
            set({ positionsLoading: false });
        }
    },

    detailUsers: [],
}));
