import type { PrismaClient  ,User,Prisma   } from "../db/generated/client";    
import {} from '../db/generated/commonInputTypes'

export const  userService={
   /** C */
   create(data:Prisma.user.) {
    return Prisma..create({
      data,
    })
  },

  /** R - list */
  list() {
    return prisma.user.findMany({
      include: {
        position: true,
      },
    })
  },

  /** R - detail */
  getById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        position: true,
        dutyRecords: true,
      },
    })
  },

  /** U */
  update(
    id: number,
    data: {
      name?: string
      email?: string
      positionId?: number | null
    }
  ) {
    return prisma.user.update({
      where: { id },
      data,
    })
  },

  /** D */
  delete(id: number) {
    return prisma.user.delete({
      where: { id },
    })
  },

}
