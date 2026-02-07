import express, { Request, Response } from 'express';
import {PrismaClient} from './node_modules/atc-duty-db/generated/prisma/client.ts';
import {PrismaLibSql} from "@prisma/adapter-libsql"

const app = express();
const PORT = 3600;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World with TypeScript and Express!');
});

const adapter = new PrismaLibSql({
    url: 'file:./db.sqlite',
  })
  const prisma = new PrismaClient({ adapter })
prisma.user.findMany().then((users) => {
  console.log('Users:', users);
});





















app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
