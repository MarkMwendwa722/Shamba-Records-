import { Router, Request, Response } from 'express';
import { Update, Field, User } from '../models';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/updates
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { fieldId, newStage, notes } = req.body as {
      fieldId?: number;
      newStage?: string;
      notes?: string;
    };

    if (!fieldId || !newStage) {
      res.status(400).json({ message: 'fieldId and newStage are required' });
      return;
    }

    const field = await Field.findByPk(fieldId);
    if (!field) {
      res.status(404).json({ message: 'Field not found' });
      return;
    }

    if (req.user!.role === 'agent' && field.assignedAgentId !== req.user!.id) {
      res.status(403).json({ message: 'You are not assigned to this field' });
      return;
    }

    const previousStage = field.stage;
    const update = await Update.create({
      fieldId,
      agentId: req.user!.id,
      previousStage,
      newStage: newStage as Update['newStage'],
      notes: notes ?? null,
    });

    await field.update({ stage: newStage as Field['stage'], lastObservationDate: new Date() });

    const fullUpdate = await Update.findByPk(update.id, {
      include: [{ model: User, as: 'agent', attributes: ['id', 'name'] }],
    });

    res.status(201).json(fullUpdate);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

// GET /api/updates
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    let updates: Update[];

    if (req.user!.role === 'admin') {
      updates = await Update.findAll({
        include: [
          { model: User, as: 'agent', attributes: ['id', 'name'] },
          { model: Field, as: 'field', attributes: ['id', 'name', 'cropType'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: 100,
      });
    } else {
      const agentFields = await Field.findAll({
        where: { assignedAgentId: req.user!.id },
        attributes: ['id'],
      });
      const fieldIds = agentFields.map((f) => f.id);
      updates = await Update.findAll({
        where: { fieldId: fieldIds },
        include: [
          { model: User, as: 'agent', attributes: ['id', 'name'] },
          { model: Field, as: 'field', attributes: ['id', 'name', 'cropType'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: 100,
      });
    }

    res.json(updates);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

export default router;
