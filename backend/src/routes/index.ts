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
import { consultantRoutes } from './consultantRoutes';
import { checkoutRoutes } from './checkoutRoutes';

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

// Rotas do Consultor (Assinaturas e Gerenciamento de Clientes)
routes.use('/', consultantRoutes);

// Rotas de Checkout (Pagamento)
routes.use('/checkout', checkoutRoutes);

import { prisma } from '../prismaClient';

routes.get('/me', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: {
        tenant: {
          include: {
            subscription: true,
            _count: {
              select: { surveys: true }
            }
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Conta total de submissions desse tenant
    let totalSubmissions = 0;
    if (user.tenantId) {
      totalSubmissions = await prisma.submission.count({
        where: {
          survey: {
            tenantId: user.tenantId
          }
        }
      });
    }

    return res.json({ 
      message: "Acesso autorizado!",
      user: {
        ...req.user,
        name: user.name,
        email: user.email,
        tenant: user.tenant ? {
          ...user.tenant,
          totalSubmissions,
          subscription: user.tenant.subscription
        } : null
      } 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
});

export { routes };
