import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import validate from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Note: Json field validation with Zod can be complex. Here's a simplified version.
const createUserSchema = z.object({
  body: z.object({
    username: z.string(),
    password: z.string().optional(),
    availablePositionAndRoleType: z.any(), // Simplified, consider more specific validation
    teamId: z.number().int().optional(),
    teamOrder: z.number().int().optional(),
  }),
});

const updateUserSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  body: z.object({
    username: z.string().optional(),
    password: z.string().optional(),
    availablePositionAndRoleType: z.any().optional(),
    teamId: z.number().int().nullable().optional(), // Can be set to null
    teamOrder: z.number().int().nullable().optional(),
  }),
});

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;