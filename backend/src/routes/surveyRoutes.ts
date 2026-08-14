import { Router } from 'express';
import { SurveyController } from '../controllers/SurveyController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';

const surveyRoutes = Router();
const surveyController = new SurveyController();

// === Rotas Privadas (Acesso para HR/Admin do Tenant) ===
surveyRoutes.post('/surveys', authMiddleware, tenantMiddleware, surveyController.createSurvey);
surveyRoutes.get('/surveys', authMiddleware, tenantMiddleware, surveyController.listSurveys);
surveyRoutes.delete('/surveys/:id', authMiddleware, tenantMiddleware, surveyController.deleteSurvey);

// === Rotas Públicas (Acesso para Colaboradores) ===
// Não precisam de authMiddleware nem tenantMiddleware
surveyRoutes.get('/public/surveys/:id', surveyController.getSurvey);
surveyRoutes.post('/public/surveys/:id/responses', surveyController.submitResponse);

export { surveyRoutes };
