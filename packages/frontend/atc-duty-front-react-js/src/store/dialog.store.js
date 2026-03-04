import { create } from "zustand";
export const dialogStore = create((set, get) => ({
    setDialogPayload: (payload) =>
        set(() => ({
            dialogPayload: payload,
        })),
}));
