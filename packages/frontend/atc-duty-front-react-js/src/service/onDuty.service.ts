import { http } from './http'
import type { DutyRecordModel } from '../util/models/generated/models.ts'

export const onDutyService = {
    /**
     * 获取所有在岗记录（outTime = null）
     */
    async listOnDuty(): Promise<DutyRecordModel[]> {
        const response = await http.get<DutyRecordModel[]>('/duties', {
            params: {
                outTime: 'null',
            },
        })
        return response.data // 提取数据部分
    },


    /**
     * 离岗（写 outTime）
     */
    leaveDuty(dutyId: string) {
        return http.post(`/duties/${dutyId}/leave`)
    },




}

