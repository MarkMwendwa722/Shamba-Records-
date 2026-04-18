import { Router, Request, Response } from 'express';
import { Field, User, Update } from '../models';
import { authenticate, requireAdmin } from '../middleware/auth';
import { computeFieldStatus } from '../utils/statusLogic';
import type { FieldJSON } from '../types/models';

const router = Router();

const withStatus = (field: Field): FieldJSON & { status: ReturnType<typeof computeFieldStatus> } => {
  const plain = field.toJSON() as FieldJSON;
  return { ...plain, status: computeFieldStatus(plain) };
};

// GET /api/fields
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    let fields: Field[];
    if (req.user!.role === 'admin') {
      fields = await Field.findAll({
        include: [{ model: User, as: 'assignedAgent', attributes: ['id', 'name', 'email'] }],
        order: [['createdAt', 'DESC']],
      });
    } else {
      fields = await Field.findAll({
        where: { assignedAgentId: req.user!.id },
        include: [{ model: User, as: 'assignedAgent', attributes: ['id', 'name', 'email'] }],
        order: [['createdAt', 'DESC']],
      });
    }
    res.json(fields.map(withStatus));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

// GET /api/fields/:id
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const field = await Field.findByPk(req.params['id'], {
      include: [
        { model: User, as: 'assignedAgent', attributes: ['id', 'name', 'email'] },
        {
          model: Update,
          as: 'updates',
          include: [{ model: User, as: 'agent', attributes: ['id', 'name'] }],
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!field) {
      res.status(404).json({ message: 'Field not found' });
      return;
    }

    if (req.user!.role === 'agent' && field.assignedAgentId !== req.user!.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.json(withStatus(field));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

// POST /api/fields - Admin only
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, cropType, plantingDate, stage, location, sizeHectares, assignedAgentId } =
      req.body as {
        name?: string;
        cropType?: string;
        plantingDate?: string;
        stage?: string;
        location?: string;
        sizeHectares?: number;
        assignedAgentId?: number;
      };

    if (!name || !cropType || !plantingDate) {
      res.status(400).json({ message: 'Name, cropType, and plantingDate are required' });
      return;
    }

    const field = await Field.create({
      name,
      cropType,
      plantingDate,
      stage: (stage as Field['stage']) ?? 'Planted',
      location: location ?? null,
      sizeHectares: sizeHectares ?? null,
      assignedAgentId: assignedAgentId ?? null,
    });

    const fullField = await Field.findByPk(field.id, {
      include: [{ model: User, as: 'assignedAgent', attributes: ['id', 'name', 'email'] }],
    });

    res.status(201).json(withStatus(fullField!));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

// PUT /api/fields/:id - Admin only
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const field = await Field.findByPk(req.params['id']);
    if (!field) {
      res.status(404).json({ message: 'Field not found' });
      return;
    }

    const { name, cropType, plantingDate, stage, location, sizeHectares, assignedAgentId } =
      req.body as Partial<{
        name: string;
        cropType: string;
        plantingDate: string;
        stage: Field['stage'];
        location: string;
        sizeHectares: number;
        assignedAgentId: number | null;
      }>;

    await field.update({ name, cropType, plantingDate, stage, location, sizeHectares, assignedAgentId });

    const fullField = await Field.findByPk(field.id, {
      include: [{ model: User, as: 'assignedAgent', attributes: ['id', 'name', 'email'] }],
    });

    res.json(withStatus(fullField!));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

// DELETE /api/fields/:id - Admin only
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const field = await Field.findByPk(req.params['id']);
    if (!field) {
      res.status(404).json({ message: 'Field not found' });
      return;
    }
    await field.destroy();
    res.json({ message: 'Field deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

export default router;
