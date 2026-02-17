import { Router } from 'express';
import { getAllPositions, getPositionById, createPosition, updatePosition, deletePosition } from '../controllers/position.controller';
import validate from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const createPositionSchema = z.object({
  body: z.object({
    positionName: z.string(),
    order: z.number().int().optional(),
    isDisplay: z.boolean().optional(),
    availableDutyType: z.array(z.enum(['主班', '副班'])).nullable().optional(), // Example for Json
    availableRoleType: z.array(z.enum(['教员', '见习', '管制', '领班'])), // Required array
  }),
});

const updatePositionSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  body: z.object({
    positionName: z.string().optional(),
    order: z.number().int().optional(),
    isDisplay: z.boolean().optional(),
    availableDutyType: z.array(z.enum(['主班', '副班'])).nullable().optional(),
    availableRoleType: z.array(z.enum(['教员', '见习', '管制', '领班'])).optional(),
  }),
});

router.get('/', getAllPositions);
router.get('/:id', getPositionById);
router.post('/', validate(createPositionSchema), createPosition);
router.put('/:id', validate(updatePositionSchema), updatePosition);
router.delete('/:id', deletePosition);

export default router;