import { http } from './http'
import type { PositionModel as Position } from '../util/models/generated/models.ts'
import { P } from 'node_modules/tailwindcss/dist/resolve-config-QUZ9b-Gn.mjs'

export const positionService = {
    async list():Promise<Position[]> {
        const response= await http.get<Position[]>('/positions')
        return response.data
    },

  
   
    update(id: string, data: Partial<Position>) {
      return http.put(`/positions/${id}`, data)
    },
  }  
