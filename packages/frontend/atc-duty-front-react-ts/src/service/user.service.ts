import { http } from './http'
import type { UserModel as User } from '../util/models/generated/models.ts'

export const userService = {
    list(params?: { page?: number }) {
      return http.get<User[]>('/users', { params })
    },
  
    get(id: string) {
      return http.get<User>(`/users/${id}`)
    },
  
    update(id: string, data: Partial<User>) {
      return http.put(`/users/${id}`, data)
    },
  }  
