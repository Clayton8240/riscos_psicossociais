import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';
import { authMiddleware } from '../middlewares/authMiddleware';

const settingsRoutes = Router();
const settingsController = new SettingsController();

settingsRoutes.get('/settings/profile', authMiddleware, settingsController.getProfile);
settingsRoutes.put('/settings/profile', authMiddleware, settingsController.updateProfile);

export { settingsRoutes };
