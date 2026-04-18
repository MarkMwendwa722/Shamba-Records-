import { Router, Request, Response } from 'express';
import { Field, User, Update } from '../models';
import { authenticate } from '../middleware/auth';
import { computeFieldStatus } from '../utils/statusLogic';
import type { FieldJSON, AgentSummary } from '../types/models';

const router = Router();

// GET /api/dashboard
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    let fields: Field[];
    if (req.user!.role === 'admin') {
      fields = await Field.findAll({
        include: [{ model: User, as: 'assignedAgent', attributes: ['id', 'name'] }],
      });
    } else {
      fields = await Field.findAll({
        where: { assignedAgentId: req.user!.id },
        include: [{ model: User, as: 'assignedAgent', attributes: ['id', 'name'] }],
      });
    }

    const fieldsWithStatus = fields.map((f) => {
      const plain = f.toJSON() as FieldJSON;
      return { ...plain, status: computeFieldStatus(plain) };
    });

    const totalFields = fieldsWithStatus.length;

    const statusBreakdown = fieldsWithStatus.reduce<Record<string, number>>(
      (acc, f) => {
        const s = f.status ?? 'Active';
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
      },
      { Active: 0, 'At Risk': 0, Completed: 0 }
    );

    const stageBreakdown = fieldsWithStatus.reduce<Record<string, number>>((acc, f) => {
      acc[f.stage] = (acc[f.stage] ?? 0) + 1;
      return acc;
    }, {});

    let recentUpdates: Update[];
    if (req.user!.role === 'admin') {
      recentUpdates = await Update.findAll({
        include: [
          { model: User, as: 'agent', attributes: ['id', 'name'] },
          { model: Field, as: 'field', attributes: ['id', 'name'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: 5,
      });
    } else {
      const fieldIds = fields.map((f) => f.id);
      recentUpdates = await Update.findAll({
        where: { fieldId: fieldIds },
        include: [
          { model: User, as: 'agent', attributes: ['id', 'name'] },
          { model: Field, as: 'field', attributes: ['id', 'name'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: 5,
      });
    }

    let agentSummary: AgentSummary[] | null = null;
    if (req.user!.role === 'admin') {
      const agents = await User.findAll({
        where: { role: 'agent' },
        attributes: ['id', 'name'],
      });
      agentSummary = agents.map((agent) => {
        const agentFields = fieldsWithStatus.filter((f) => f.assignedAgentId === agent.id);
        return {
          agentId: agent.id,
          agentName: agent.name,
          totalFields: agentFields.length,
          atRisk: agentFields.filter((f) => f.status === 'At Risk').length,
        };
      });
    }

    res.json({
      totalFields,
      statusBreakdown,
      stageBreakdown,
      atRiskFields: fieldsWithStatus.filter((f) => f.status === 'At Risk'),
      recentUpdates,
      agentSummary,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

export default router;
