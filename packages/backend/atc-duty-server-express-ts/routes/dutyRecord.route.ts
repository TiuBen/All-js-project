import { Router } from 'express';
import { getAllDutyRecords, getDutyRecordById, createDutyRecord, updateDutyRecord, deleteDutyRecord } from '../controllers/duty.Controller';
import validate from '../middleware/validation';
import { z } from 'zod';
import { DutyType, RoleType } from '../db/generated/enums';

const router = Router();

const createDutyRecordSchema = z.object({
  body: z.object({
    userId: z.number().int(),
    positionId: z.number().int(),
    dutyType: z.nativeEnum(DutyType).nullable(), // Can be null
    roleType: z.nativeEnum(RoleType),
    inTime: z.string().datetime(), // ISO string
  }),
});

const updateDutyRecordSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  body: z.object({
    outTime: z.string().datetime().nullable(), // Can be null or ISO string
  }),
});

router.get('/', getAllDutyRecords);
router.get('/:id', getDutyRecordById);
router.post('/', validate(createDutyRecordSchema), createDutyRecord);
router.put('/:id', validate(updateDutyRecordSchema), updateDutyRecord);
router.delete('/:id', deleteDutyRecord);

export default router;