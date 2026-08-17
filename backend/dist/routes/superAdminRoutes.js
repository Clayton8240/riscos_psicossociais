"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminRoutes = void 0;
const express_1 = require("express");
const SuperAdminController_1 = require("../controllers/SuperAdminController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const superAdminMiddleware_1 = require("../middlewares/superAdminMiddleware");
const superAdminRoutes = (0, express_1.Router)();
exports.superAdminRoutes = superAdminRoutes;
const superAdminController = new SuperAdminController_1.SuperAdminController();
// Protege todas as rotas com autenticação e validação de Super Admin
superAdminRoutes.use(authMiddleware_1.authMiddleware, superAdminMiddleware_1.superAdminMiddleware);
superAdminRoutes.get('/tenants', superAdminController.listTenants);
superAdminRoutes.post('/tenants', superAdminController.createTenant);
superAdminRoutes.delete('/tenants/:id', superAdminController.deleteTenant);
superAdminRoutes.post('/tenants/:id/impersonate', superAdminController.impersonateTenant);
