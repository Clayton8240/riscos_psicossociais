import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export class ActionPlanController {
  
  // POST /action-plans
  async create(req: Request, res: Response) {
    const { title, description, responsible, deadline, sector } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) return res.status(403).json({ error: 'Acesso negado' });

    try {
      const actionPlan = await prisma.actionPlan.create({
        data: {
          title,
          description,
          responsible,
          deadline: new Date(deadline),
          sector,
          tenantId
        }
      });
      return res.status(201).json(actionPlan);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar o plano de ação' });
    }
  }

  // GET /action-plans
  async list(req: Request, res: Response) {
    const tenantId = req.user?.tenantId;

    if (!tenantId) return res.status(403).json({ error: 'Acesso negado' });

    try {
      const actionPlans = await prisma.actionPlan.findMany({
        where: { tenantId },
        orderBy: { deadline: 'asc' }
      });
      return res.json(actionPlans);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar os planos de ação' });
    }
  }

  // PATCH /action-plans/:id/status
  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body; // OPEN, IN_PROGRESS, RESOLVED
    const tenantId = req.user?.tenantId;

    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    try {
      // Garante que só pode alterar se pertencer ao mesmo Tenant
      const existingPlan = await prisma.actionPlan.findFirst({ where: { id, tenantId } });
      if (!existingPlan) return res.status(404).json({ error: 'Plano não encontrado' });

      const updatedPlan = await prisma.actionPlan.update({
        where: { id },
        data: { status }
      });
      return res.json(updatedPlan);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar o plano de ação' });
    }
  }

  // DELETE /action-plans/:id
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    try {
      const existingPlan = await prisma.actionPlan.findFirst({ where: { id, tenantId } });
      if (!existingPlan) return res.status(404).json({ error: 'Plano não encontrado' });

      await prisma.actionPlan.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao remover o plano de ação' });
    }
  }
}
