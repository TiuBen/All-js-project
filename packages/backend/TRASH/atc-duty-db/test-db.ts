import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from './generated/prisma/client.ts'

const adapter = new PrismaLibSql({
  url: 'file:./db.sqlite',
})

const prisma = new PrismaClient({ adapter })

const user = await prisma.user.create({
  data: {
    username: "dddd",
    availablePositionAndRoleType: {},
  },
}); 

console.log(user);


const allUser=await prisma.user.findMany()
console.log(allUser);
