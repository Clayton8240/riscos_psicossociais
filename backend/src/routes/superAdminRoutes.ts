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
superAdminRoutes.put('/tenants/:id', superAdminController.updateTenant);
superAdminRoutes.delete('/tenants/:id', superAdminController.deleteTenant);
superAdminRoutes.post('/tenants/:id/impersonate', superAdminController.impersonateTenant);

superAdminRoutes.get('/consultants', superAdminController.listConsultants);
superAdminRoutes.post('/consultants', superAdminController.createConsultant);
superAdminRoutes.put('/consultants/:id', superAdminController.updateConsultant);
superAdminRoutes.delete('/consultants/:id', superAdminController.deleteConsultant);

export { superAdminRoutes };
