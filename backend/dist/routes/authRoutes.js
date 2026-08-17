"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const authRoutes = (0, express_1.Router)();
exports.authRoutes = authRoutes;
const authController = new AuthController_1.AuthController();
authRoutes.post('/login', authController.authenticate);
authRoutes.post('/sso', authController.loginSSO); // Rota para Single Sign-On
// Rota pública para criar o primeiro tenant+user de teste
authRoutes.post('/register', authController.createTenantAndUser);
// Rota para setup inicial do dono do SaaS
authRoutes.post('/register-superadmin', authController.createSuperAdmin);
