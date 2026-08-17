import { Router } from 'express';
import { SuperAdminController } from '../controllers/SuperAdminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { superAdminMiddleware } from '../middlewares/superAdminMiddleware';

const superAdminRoutes = Router();
const superAdminController = new SuperAdminController();

// Protege todas as rotas com autenticação e validação de Super Admin
superAdminRoutes.use(authMiddleware, superAdminMiddleware);

superAdminRoutes.get('/tenants', superAdminController.listTenants);
superAdminRoutes.post('/tenants', superAdminController.createTenant);
superAdminRoutes.delete('/tenants/:id', superAdminController.deleteTenant);
superAdminRoutes.post('/tenants/:id/impersonate', superAdminController.impersonateTenant);

export { superAdminRoutes };
