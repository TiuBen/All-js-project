import { create } from "zustand";

export const dialogStore = create((set) => ({
    setDialogPayload: (payload) =>
        set(() => ({
            dialogPayload: payload,
        })),

    dutyDialogOpen: false,
    dutyDialogMode: "edit",
    dutyDialogRecord: null,
    dutyDialogUser: null,

    openEditDialog: (record) =>
        set({ dutyDialogOpen: true, dutyDialogMode: "edit", dutyDialogRecord: record, dutyDialogUser: null }),

    openAddDialog: (user) =>
        set({ dutyDialogOpen: true, dutyDialogMode: "add", dutyDialogRecord: null, dutyDialogUser: user }),

    closeDutyDialog: () =>
        set({ dutyDialogOpen: false, dutyDialogMode: "edit", dutyDialogRecord: null, dutyDialogUser: null }),
}));
