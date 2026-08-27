import { Router } from 'express';
import { ActionPlanController } from '../controllers/ActionPlanController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';

const actionPlanRoutes = Router();
const actionPlanController = new ActionPlanController();

actionPlanRoutes.post('/action-plans', authMiddleware, tenantMiddleware, actionPlanController.create);
actionPlanRoutes.get('/action-plans', authMiddleware, tenantMiddleware, actionPlanController.list);
actionPlanRoutes.patch('/action-plans/:id/status', authMiddleware, tenantMiddleware, actionPlanController.updateStatus);
actionPlanRoutes.delete('/action-plans/:id', authMiddleware, tenantMiddleware, actionPlanController.delete);

export { actionPlanRoutes };
