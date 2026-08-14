import { Router } from 'express';
import { ActionPlanController } from '../controllers/ActionPlanController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';

const actionPlanRoutes = Router();
const actionPlanController = new ActionPlanController();

actionPlanRoutes.use(authMiddleware, tenantMiddleware);

actionPlanRoutes.post('/action-plans', actionPlanController.create);
actionPlanRoutes.get('/action-plans', actionPlanController.list);
actionPlanRoutes.patch('/action-plans/:id/status', actionPlanController.updateStatus);
actionPlanRoutes.delete('/action-plans/:id', actionPlanController.delete);

export { actionPlanRoutes };
