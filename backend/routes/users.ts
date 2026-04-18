import { Router, Request, Response } from 'express';
import { User } from '../models';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/users - Admin: list all users
router.get('/', authenticate, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

// GET /api/users/agents - list only agents
router.get('/agents', authenticate, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const agents = await User.findAll({
      where: { role: 'agent' },
      attributes: ['id', 'name', 'email', 'createdAt'],
    });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

// DELETE /api/users/:id - Admin: delete a user
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    // Prevent deleting yourself
    if (user.id === req.user?.id) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

export default router;
