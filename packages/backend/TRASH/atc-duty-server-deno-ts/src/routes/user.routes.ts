import { Hono } from 'hono';
import prisma from '../prisma/database.ts';

const user = new Hono();

const users = await prisma.user.findMany();
console.log(users );


user.get('/', async (c) => {
  const users = await prisma.user.findMany();
  return c.json(users);
});

export default user;