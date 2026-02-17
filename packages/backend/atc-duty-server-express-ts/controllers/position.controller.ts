import { Request, Response } from 'express';
import prisma from '../db/database';
import { DutyType, RoleType } from '../db/generated/enums';

export const getAllPositions = async (_req: Request, res: Response) => {
  try {
    const positions = await prisma.position.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(positions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPositionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const position = await prisma.position.findUnique({
      where: { id: parseInt(id) },
    });
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    res.json(position);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPosition = async (req: Request, res: Response) => {
  const { positionName, order, isDisplay, availableDutyType, availableRoleType } = req.body;
  try {
    let parsedAvailableDutyType: any = null;
    if (availableDutyType) {
      parsedAvailableDutyType = typeof availableDutyType === 'string' 
        ? JSON.parse(availableDutyType) 
        : availableDutyType;
    }

    let parsedAvailableRoleType: RoleType[];
    if (typeof availableRoleType === 'string') {
        parsedAvailableRoleType = JSON.parse(availableRoleType);
    } else if (Array.isArray(availableRoleType)) {
        parsedAvailableRoleType = availableRoleType;
    } else {
        throw new Error("availableRoleType must be a JSON array string or an array.");
    }

    const newPosition = await prisma.position.create({
      data: {
        positionName,
        order,
        isDisplay,
        availableDutyType: parsedAvailableDutyType,
        availableRoleType: parsedAvailableRoleType,
      },
    });
    res.status(201).json(newPosition);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePosition = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { positionName, order, isDisplay, availableDutyType, availableRoleType } = req.body;
  try {
    let parsedAvailableDutyType: any = undefined;
    if (availableDutyType !== undefined) {
        parsedAvailableDutyType = typeof availableDutyType === 'string' 
            ? JSON.parse(availableDutyType) 
            : availableDutyType;
    }

    let parsedAvailableRoleType: RoleType[] | undefined = undefined;
    if (availableRoleType !== undefined) {
        if (typeof availableRoleType === 'string') {
            parsedAvailableRoleType = JSON.parse(availableRoleType);
        } else if (Array.isArray(availableRoleType)) {
            parsedAvailableRoleType = availableRoleType;
        } else {
            throw new Error("availableRoleType must be a JSON array string or an array.");
        }
    }

    const updatedPosition = await prisma.position.update({
      where: { id: parseInt(id) },
      data: {
        positionName: positionName !== undefined ? positionName : undefined,
        order: order !== undefined ? order : undefined,
        isDisplay: isDisplay !== undefined ? isDisplay : undefined,
        availableDutyType: parsedAvailableDutyType,
        availableRoleType: parsedAvailableRoleType,
      },
    });
    res.json(updatedPosition);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePosition = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.position.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // No Content
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};