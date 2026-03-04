import { http } from './http'


export const onDutyService = {
    /**
     * 获取所有在岗记录（outTime = null）
     */
    async listOnDuty() {
        // const data = await http.get('/duty')
        const data = await http.get('/duty', {
            params: {
                outTime: 'null',
            },
        })
        return data // 提取数据部分
    },


    /**
     * 离岗（写 outTime）
     */
    leaveDuty(dutyId: string) {
        return http.post(`/duty/${dutyId}/leave`)
    },




}

