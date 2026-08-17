"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.surveyRoutes = void 0;
const express_1 = require("express");
const SurveyController_1 = require("../controllers/SurveyController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const tenantMiddleware_1 = require("../middlewares/tenantMiddleware");
const surveyRoutes = (0, express_1.Router)();
exports.surveyRoutes = surveyRoutes;
const surveyController = new SurveyController_1.SurveyController();
// === Rotas Privadas (Acesso para HR/Admin do Tenant) ===
surveyRoutes.post('/surveys', authMiddleware_1.authMiddleware, tenantMiddleware_1.tenantMiddleware, surveyController.createSurvey);
surveyRoutes.get('/surveys', authMiddleware_1.authMiddleware, tenantMiddleware_1.tenantMiddleware, surveyController.listSurveys);
surveyRoutes.delete('/surveys/:id', authMiddleware_1.authMiddleware, tenantMiddleware_1.tenantMiddleware, surveyController.deleteSurvey);
// === Rotas Públicas (Acesso para Colaboradores) ===
// Não precisam de authMiddleware nem tenantMiddleware
surveyRoutes.get('/public/surveys/:id', surveyController.getSurvey);
surveyRoutes.post('/public/surveys/:id/responses', surveyController.submitResponse);
