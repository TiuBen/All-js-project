import { PrismaClient } from "./node_modules/generated/client.ts";
import {PrismaLibSql} from "@prisma/adapter-libsql"


export function add(a: number, b: number): number {
  return a + b;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
}


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