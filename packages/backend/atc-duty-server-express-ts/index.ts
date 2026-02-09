import express, { Request, Response } from 'express';
import { PrismaClient } from "./db/generated/client.ts"
import { UserModel } from "./db/generated/models.ts"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const app = express();
const PORT = 3600;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World with TypeScript and Express!');
});

const adapter = new PrismaLibSql({
  url: 'file:../dbn/db.sqlite',
})
const prisma = new PrismaClient({ adapter });

prisma.user.findMany().then((users:UserModel[]) => {
  console.log('Users:', users);
});





















app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
