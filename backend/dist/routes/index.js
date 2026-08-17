"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const authRoutes_1 = require("./authRoutes");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const tenantMiddleware_1 = require("../middlewares/tenantMiddleware");
const surveyRoutes_1 = require("./surveyRoutes");
const analyticsRoutes_1 = require("./analyticsRoutes");
const actionPlanRoutes_1 = require("./actionPlanRoutes");
const superAdminRoutes_1 = require("./superAdminRoutes");
const settingsRoutes_1 = require("./settingsRoutes");
const userRoutes_1 = require("./userRoutes");
const routes = (0, express_1.Router)();
exports.routes = routes;
// Rotas Públicas e de Autenticação
routes.use('/auth', authRoutes_1.authRoutes);
routes.use('/public', surveyRoutes_1.surveyRoutes); // Endpoint público para responder
// Rotas exclusivas do SuperAdmin
routes.use('/superadmin', superAdminRoutes_1.superAdminRoutes);
// Rotas de Pesquisas (privadas e públicas já estão configuradas no próprio arquivo de rotas de pesquisa)
routes.use('/', surveyRoutes_1.surveyRoutes);
// Rotas de Analytics
routes.use('/', analyticsRoutes_1.analyticsRoutes);
// Rotas de Planos de Ação
routes.use('/', actionPlanRoutes_1.actionPlanRoutes);
// Rotas de Usuários
routes.use('/', userRoutes_1.userRoutes);
// Rotas de Configurações
routes.use('/', settingsRoutes_1.settingsRoutes);
routes.get('/me', authMiddleware_1.authMiddleware, tenantMiddleware_1.tenantMiddleware, (req, res) => {
    return res.json({
        message: "Acesso autorizado!",
        user: req.user
    });
});
