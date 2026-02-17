import { Request, Response } from 'express';
import  dbClient from '../db/database.ts';

export const getAllTeams = async (_req: Request, res: Response) => {
  try {
    const teams = await dbClient.team.findMany({
      include: {
        users: {
          select: {
            id: true,
            username: true,
            teamOrder: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const team = await dbClient.team.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            teamOrder: true,
          },
        },
      },
    });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createTeam = async (req: Request, res: Response) => {
  const { name, description, order } = req.body;
  try {
    const newTeam = await dbClient.team.create({
      data: {
        name,
        description,
        order,
      },
    });
    res.status(201).json(newTeam);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, order } = req.body;
  try {
    const updatedTeam = await dbClient.team.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        order
      }
    });
    res.json(updatedTeam);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await dbClient.team.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // No Content
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};