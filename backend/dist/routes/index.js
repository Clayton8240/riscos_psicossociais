"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const consultantRoutes_1 = require("./consultantRoutes");
const checkoutRoutes_1 = require("./checkoutRoutes");
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
// Rotas do Consultor (Assinaturas e Gerenciamento de Clientes)
routes.use('/', consultantRoutes_1.consultantRoutes);
// Rotas de Checkout (Pagamento)
routes.use('/checkout', checkoutRoutes_1.checkoutRoutes);
const prismaClient_1 = require("../prismaClient");
routes.get('/me', authMiddleware_1.authMiddleware, tenantMiddleware_1.tenantMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield prismaClient_1.prisma.user.findUnique({
            where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
            include: {
                tenant: {
                    include: {
                        subscription: true,
                        _count: {
                            select: { surveys: true }
                        }
                    }
                }
            }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        // Conta total de submissions desse tenant
        let totalSubmissions = 0;
        if (user.tenantId) {
            totalSubmissions = yield prismaClient_1.prisma.submission.count({
                where: {
                    survey: {
                        tenantId: user.tenantId
                    }
                }
            });
        }
        return res.json({
            message: "Acesso autorizado!",
            user: Object.assign(Object.assign({}, req.user), { name: user.name, email: user.email, tenant: user.tenant ? Object.assign(Object.assign({}, user.tenant), { totalSubmissions, subscription: user.tenant.subscription }) : null })
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
}));
