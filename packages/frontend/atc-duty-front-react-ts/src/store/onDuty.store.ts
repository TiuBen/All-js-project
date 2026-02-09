// /store/onDutyStore.ts

import { create } from 'zustand'
import { onDutyService } from '../service/onDuty.service'
import type { DutyRecordModel } from '../util/models/generated/models.ts'



interface OnDutyState {
    list: DutyRecordModel[]
    loading: boolean
    error?: string

    fetch: () => Promise<void>
    leaveDuty: (dutyId: string) => Promise<void>
}



export const useOnDutyStore = create<OnDutyState>((set, get) => ({
    list: [],
    loading: false,

    async fetch() {
        set({ loading: true, error: undefined })
        try {
            const response = await onDutyService.listOnDuty()
            set({ list: response, loading: false })
        } catch (err: any) {
            set({ loading: false, error: err?.message })
        }
    },

    async leaveDuty(dutyId) {
        set({ loading: true })
        try {
            await onDutyService.leaveDuty(dutyId)

            // ✅ 本地直接移除，体验更好
            const next = get().list.filter((d) => d.id !== dutyId)
            set({ list: next, loading: false })
        } catch (err: any) {
            set({
                loading: false,
                error: err?.message ?? '离岗失败',
            })
        }
    },
})) 