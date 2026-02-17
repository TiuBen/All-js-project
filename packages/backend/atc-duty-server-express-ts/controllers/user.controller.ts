import { Request, Response } from 'express';
import prisma from '../db/database';

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        team: true, // Include associated team info
      },
      orderBy: [
        { team: { order: 'asc' } }, // Order by team's order
        { teamOrder: 'asc' },       // Then by user's order within team
        { username: 'asc' },        // Finally by username
      ],
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        team: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { username, password, availablePositionAndRoleType, teamId, teamOrder } = req.body;
  try {
    // Example validation for Json fields - you might want more robust validation with Zod
    let parsedAvailablePositionAndRoleType: any = null;
    if (availablePositionAndRoleType) {
      parsedAvailablePositionAndRoleType = typeof availablePositionAndRoleType === 'string' 
        ? JSON.parse(availablePositionAndRoleType) 
        : availablePositionAndRoleType;
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        password,
        availablePositionAndRoleType: parsedAvailablePositionAndRoleType,
        team: teamId ? { connect: { id: parseInt(teamId) } } : undefined,
        teamOrder,
      },
      include: {
        team: true,
      },
    });
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, password, availablePositionAndRoleType, teamId, teamOrder } = req.body;
  try {
    let parsedAvailablePositionAndRoleType: any = undefined;
    if (availablePositionAndRoleType !== undefined) {
        parsedAvailablePositionAndRoleType = typeof availablePositionAndRoleType === 'string' 
            ? JSON.parse(availablePositionAndRoleType) 
            : availablePositionAndRoleType;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        username: username !== undefined ? username : undefined,
        password: password !== undefined ? password : undefined,
        availablePositionAndRoleType: parsedAvailablePositionAndRoleType,
        team: teamId !== undefined ? { connect: { id: parseInt(teamId) } } : { disconnect: true },
        teamOrder: teamOrder !== undefined ? teamOrder : undefined,
      },
      include: {
        team: true,
      },
    });
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // No Content
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};