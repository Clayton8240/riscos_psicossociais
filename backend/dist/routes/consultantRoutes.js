"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultantRoutes = void 0;
const express_1 = require("express");
const ConsultantController_1 = require("../controllers/ConsultantController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const consultantRoutes = (0, express_1.Router)();
exports.consultantRoutes = consultantRoutes;
const consultantController = new ConsultantController_1.ConsultantController();
// Todas as rotas de consultor exigem autenticação
consultantRoutes.use(authMiddleware_1.authMiddleware);
// Endpoint para se inscrever ou mudar de plano
consultantRoutes.post('/consultant/subscribe', consultantController.subscribe);
// Endpoint para listar os tenants (empresas clientes) geridos pelo consultor
consultantRoutes.get('/consultant/clients', consultantController.listClientTenants);
// Endpoint para o consultor criar um novo tenant
consultantRoutes.post('/consultant/clients', consultantController.createClientTenant);
// Rotas adicionais para gerenciamento
consultantRoutes.put('/consultant/clients/:id', consultantController.updateClientTenant);
consultantRoutes.delete('/consultant/clients/:id', consultantController.deleteClientTenant);
consultantRoutes.post('/consultant/clients/:id/impersonate', consultantController.impersonateClientTenant);
