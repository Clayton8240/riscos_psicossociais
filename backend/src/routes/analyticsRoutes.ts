import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';

const analyticsRoutes = Router();
const analyticsController = new AnalyticsController();

// Apenas o HR/Admin do Tenant pode ver o Analytics
analyticsRoutes.get('/analytics/surveys/:id', authMiddleware, tenantMiddleware, analyticsController.getSurveyAnalytics);
analyticsRoutes.get('/analytics/surveys/:id/report', authMiddleware, tenantMiddleware, analyticsController.generateAIReport);

export { analyticsRoutes };
