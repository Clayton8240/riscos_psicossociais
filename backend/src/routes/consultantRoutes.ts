import { Router } from 'express';
import { ConsultantController } from '../controllers/ConsultantController';
import { authMiddleware } from '../middlewares/authMiddleware';

const consultantRoutes = Router();
const consultantController = new ConsultantController();

// Todas as rotas de consultor exigem autenticação
consultantRoutes.use(authMiddleware);

// Endpoint para se inscrever ou mudar de plano
consultantRoutes.post('/consultant/subscribe', consultantController.subscribe);

// Endpoint para listar os tenants (empresas clientes) geridos pelo consultor
consultantRoutes.get('/consultant/clients', consultantController.listClientTenants);

// Endpoint para o consultor criar um novo tenant
consultantRoutes.post('/consultant/clients', consultantController.createClientTenant);


// Rotas adicionais para gerenciamento
consultantRoutes.put('/consultant/clients/:id', consultantController.updateClientTenant);
consultantRoutes.delete('/consultant/clients/:id', consultantController.deleteClientTenant);
consultantRoutes.post('/consultant/clients/:id/impersonate', consultantController.impersonateClientTenant);

export { consultantRoutes };
