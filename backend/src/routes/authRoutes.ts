import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/login', authController.authenticate);
authRoutes.post('/sso', authController.loginSSO); // Rota para Single Sign-On
// Rota pública para criar o primeiro tenant+user de teste
authRoutes.post('/register', authController.createTenantAndUser);
// Rota para setup inicial do dono do SaaS
authRoutes.post('/register-superadmin', authController.createSuperAdmin);

export { authRoutes };
