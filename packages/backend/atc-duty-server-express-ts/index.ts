import express, { Request, Response } from 'express';
import { PrismaClient } from "./db/generated/client.ts"
import { UserModel, PositionModel } from "./db/generated/models.ts"
import { Position } from "./db/generated/client.ts"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const app = express();
const PORT = 3600;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World with TypeScript and Express!');
});

const adapter = new PrismaLibSql({
  url: 'file:./db.sqlite',
})
const prisma = new PrismaClient({ adapter });

prisma.user.findMany().then((users: UserModel[]) => {
  console.log('Users:', users);
});



// prisma.position.createMany(
//   {
//     data: [{
//       positionName: "test0",
//       order: 0,
//       isDisplay: true,
//       availableDutyType: {},
//       availableRoleType: {},
//     },
//     {
//       positionName: "test1",
//       order: 2,
//       isDisplay: true,
//       availableDutyType: {},
//       availableRoleType: {},
//     }]
//   }
// ).then(
//   () => console.log('Created Positions:')

// )









app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
