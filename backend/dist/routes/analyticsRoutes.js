"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRoutes = void 0;
const express_1 = require("express");
const AnalyticsController_1 = require("../controllers/AnalyticsController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const tenantMiddleware_1 = require("../middlewares/tenantMiddleware");
const analyticsRoutes = (0, express_1.Router)();
exports.analyticsRoutes = analyticsRoutes;
const analyticsController = new AnalyticsController_1.AnalyticsController();
// Apenas o HR/Admin do Tenant pode ver o Analytics
analyticsRoutes.get('/analytics/surveys/:id', authMiddleware_1.authMiddleware, tenantMiddleware_1.tenantMiddleware, analyticsController.getSurveyAnalytics);
analyticsRoutes.get('/analytics/surveys/:id/report', authMiddleware_1.authMiddleware, tenantMiddleware_1.tenantMiddleware, analyticsController.generateAIReport);
