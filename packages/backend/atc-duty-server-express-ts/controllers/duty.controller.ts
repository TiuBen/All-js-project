import { Request, Response } from 'express';
import prisma from '../db/database';
import { DutyType, RoleType } from '../db/generated/enums';

export const getAllDutyRecords = async (req: Request, res: Response) => {
  const { userId, positionId, date } = req.query; // Example for filtering
  try {
    const filters: any = {};
    if (userId) filters.userId = parseInt(userId as string);
    if (positionId) filters.positionId = parseInt(positionId as string);
    if (date) {
        const startOfDay = new Date(date as string);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date as string);
        endOfDay.setHours(23, 59, 59, 999);
        filters.OR = [
            { inTime: { gte: startOfDay, lte: endOfDay } },
            { outTime: { gte: startOfDay, lte: endOfDay } },
        ];
    }

    const records = await prisma.dutyRecord.findMany({
      where: filters,
      include: {
        user: { select: { id: true, username: true } },
        position: { select: { id: true, positionName: true } },
      },
      orderBy: { inTime: 'desc' },
    });
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDutyRecordById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const record = await prisma.dutyRecord.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, username: true } },
        position: { select: { id: true, positionName: true } },
      },
    });
    if (!record) {
      return res.status(404).json({ error: 'Duty Record not found' });
    }
    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createDutyRecord = async (req: Request, res: Response) => {
  const { userId, positionId, dutyType, roleType, inTime } = req.body;
  try {
    // Validate enums if needed, though Prisma handles this at DB level
    const validDutyType = dutyType ? DutyType[dutyType as keyof typeof DutyType] : null;
    if (dutyType && !validDutyType) {
        return res.status(400).json({ error: `Invalid dutyType: ${dutyType}` });
    }
    const validRoleType = RoleType[roleType as keyof typeof RoleType];
    if (!validRoleType) {
        return res.status(400).json({ error: `Invalid roleType: ${roleType}` });
    }

    const newRecord = await prisma.dutyRecord.create({
      data: {
        userId: parseInt(userId),
        positionId: parseInt(positionId),
        dutyType: validDutyType,
        roleType: validRoleType,
        inTime: new Date(inTime), // Ensure it's a Date object
      },
      include: {
        user: { select: { id: true, username: true } },
        position: { select: { id: true, positionName: true } },
      },
    });
    res.status(201).json(newRecord);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDutyRecord = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { outTime } = req.body; // Only allow updating outTime after clocking in
  try {
    const updatedRecord = await prisma.dutyRecord.update({
      where: { id: parseInt(id) },
      data: {
        outTime: outTime ? new Date(outTime) : null, // Allow setting to null if clocking out
      },
      include: {
        user: { select: { id: true, username: true } },
        position: { select: { id: true, positionName: true } },
      },
    });
    res.json(updatedRecord);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDutyRecord = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.dutyRecord.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // No Content
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};