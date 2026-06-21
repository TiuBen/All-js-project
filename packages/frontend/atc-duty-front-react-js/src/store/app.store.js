import { create } from "zustand";
import { positionService } from "../service/position.service";

export const useAppStore = create((set, get) => ({
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

    async createPosition(positionData) {
        try {
            const data = await positionService.create(positionData);
            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    },

    async updatePosition(id, positionData) {
        try {
            const data = await positionService.update(id, positionData);
            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    },

    detailUsers: [],
}));
