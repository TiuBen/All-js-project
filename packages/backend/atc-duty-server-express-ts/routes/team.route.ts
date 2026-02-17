import { Router } from 'express';
import { getAllTeams, getTeamById, createTeam, updateTeam, deleteTeam } from '../controllers/team.controller';
import validate from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const createTeamSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string().optional(),
    order: z.number().int(),
  }),
});

const updateTeamSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }), // Ensure id is numeric string
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    order: z.number().int().optional(),
  }),
});

router.get('/', getAllTeams);
router.get('/:id', getTeamById);
router.post('/', validate(createTeamSchema), createTeam);
router.put('/:id', validate(updateTeamSchema), updateTeam);
router.delete('/:id', deleteTeam);

export default router;