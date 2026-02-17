import { PrismaClient, Prisma, User } from "./generated/client.ts"
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
    url: 'file:./db.sqlite',
})

const dbClient = new PrismaClient({ adapter });

dbClient.user.findMany().then((users: User[]) => {
    console.log('Users:', users);
});



export default dbClient;