import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { authMiddleware } from '../middlewares/authMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';
import { surveyRoutes } from './surveyRoutes';
import { analyticsRoutes } from './analyticsRoutes';
import { actionPlanRoutes } from './actionPlanRoutes';
import { superAdminRoutes } from './superAdminRoutes';
import { settingsRoutes } from './settingsRoutes';
import { userRoutes } from './userRoutes';

const routes = Router();

// Rotas Públicas e de Autenticação
routes.use('/auth', authRoutes);
routes.use('/public', surveyRoutes); // Endpoint público para responder

// Rotas exclusivas do SuperAdmin
routes.use('/superadmin', superAdminRoutes);

// Rotas de Pesquisas (privadas e públicas já estão configuradas no próprio arquivo de rotas de pesquisa)
routes.use('/', surveyRoutes);

// Rotas de Analytics
routes.use('/', analyticsRoutes);

// Rotas de Planos de Ação
routes.use('/', actionPlanRoutes);

// Rotas de Usuários
routes.use('/', userRoutes);

// Rotas de Configurações
routes.use('/', settingsRoutes);

routes.get('/me', authMiddleware, tenantMiddleware, (req, res) => {
  return res.json({ 
    message: "Acesso autorizado!",
    user: req.user 
  });
});

export { routes };
