import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';

const userRoutes = Router();
const userController = new UserController();

userRoutes.get('/users', authMiddleware, tenantMiddleware, userController.list);
userRoutes.post('/users', authMiddleware, tenantMiddleware, userController.create);

export { userRoutes };
