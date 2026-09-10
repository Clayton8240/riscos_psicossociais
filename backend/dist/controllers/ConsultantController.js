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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultantController = void 0;
const prismaClient_1 = require("../prismaClient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class ConsultantController {
    // Endpoint para um usuário se inscrever ou alterar seu plano como Consultor
    subscribe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { planType } = req.body; // START, PRO, ENTERPRISE
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            let maxTenants = 3;
            let maxSubmissions = 150;
            if (planType === 'PRO') {
                maxTenants = 10;
                maxSubmissions = 600;
            }
            else if (planType === 'ENTERPRISE') {
                maxTenants = 25;
                maxSubmissions = 2000;
            }
            try {
                const subscription = yield prismaClient_1.prisma.subscription.upsert({
                    where: { ownerId: userId },
                    update: {
                        planType,
                        maxTenants,
                        maxSubmissions
                    },
                    create: {
                        ownerId: userId,
                        planType,
                        maxTenants,
                        maxSubmissions
                    }
                });
                return res.json({ message: 'Plano atualizado com sucesso', subscription });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao processar assinatura' });
            }
        });
    }
    // Consultor lista as empresas clientes que ele gerencia
    listClientTenants(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            try {
                const subscription = yield prismaClient_1.prisma.subscription.findUnique({
                    where: { ownerId: userId },
                    include: {
                        tenants: {
                            include: {
                                _count: { select: { surveys: true, users: true } },
                                surveys: {
                                    include: { _count: { select: { submissions: true } } }
                                }
                            }
                        }
                    }
                });
                if (!subscription) {
                    return res.status(404).json({ error: 'Assinatura de consultor não encontrada' });
                }
                // Format response to show submission usage
                let totalSubmissions = 0;
                const tenants = subscription.tenants.map((tenant) => {
                    let tenantSubmissions = 0;
                    tenant.surveys.forEach((survey) => {
                        tenantSubmissions += survey._count.submissions;
                    });
                    totalSubmissions += tenantSubmissions;
                    return {
                        id: tenant.id,
                        name: tenant.name,
                        document: tenant.document,
                        isActive: tenant.isActive,
                        maxSubmissions: tenant.maxSubmissions, // Retornar maxSubmissions do Tenant
                        createdAt: tenant.createdAt,
                        totalSurveys: tenant._count.surveys,
                        totalUsers: tenant._count.users,
                        totalSubmissions: tenantSubmissions
                    };
                });
                return res.json({
                    subscription: {
                        planType: subscription.planType,
                        maxTenants: subscription.maxTenants,
                        maxSubmissions: subscription.maxSubmissions,
                        currentTenants: tenants.length,
                        currentSubmissions: totalSubmissions
                    },
                    tenants
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao listar empresas clientes' });
            }
        });
    }
    // Consultor cria uma empresa cliente diretamente (sem depender do SuperAdmin)
    createClientTenant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { name, document, adminName, adminEmail, adminPassword, maxSubmissions } = req.body;
            try {
                // 1. Validar assinatura e limites
                const subscription = yield prismaClient_1.prisma.subscription.findUnique({
                    where: { ownerId: userId },
                    include: { _count: { select: { tenants: true } } }
                });
                if (!subscription) {
                    return res.status(403).json({ error: 'Você não possui uma assinatura de consultor ativa.' });
                }
                if (subscription._count.tenants >= subscription.maxTenants) {
                    return res.status(403).json({ error: 'Limite de empresas atingido para o seu plano. Faça upgrade para adicionar mais clientes.' });
                }
                if (maxSubmissions) {
                    const parsedMax = parseInt(maxSubmissions);
                    // Calcula a soma dos limites já distribuídos
                    const allTenants = yield prismaClient_1.prisma.tenant.findMany({
                        where: { subscriptionId: subscription.id },
                        select: { maxSubmissions: true }
                    });
                    const currentAllocated = allTenants.reduce((sum, t) => sum + (t.maxSubmissions || 0), 0);
                    if (currentAllocated + parsedMax > subscription.maxSubmissions) {
                        return res.status(400).json({ error: `O limite distribuído ultrapassa o seu plano. Você tem ${subscription.maxSubmissions - currentAllocated} respostas disponíveis para alocar.` });
                    }
                }
                const tenantExists = yield prismaClient_1.prisma.tenant.findUnique({ where: { document } });
                if (tenantExists) {
                    return res.status(400).json({ error: 'Empresa (documento) já cadastrada.' });
                }
                const userExists = yield prismaClient_1.prisma.user.findUnique({ where: { email: adminEmail } });
                if (userExists) {
                    return res.status(400).json({ error: 'E-mail do administrador da empresa cliente já está em uso.' });
                }
                const hashedPassword = yield bcryptjs_1.default.hash(adminPassword, 8);
                // 2. Criar Tenant vinculado à assinatura do Consultor
                const tenant = yield prismaClient_1.prisma.tenant.create({
                    data: {
                        name,
                        document,
                        subscriptionId: subscription.id, // Vínculo com a assinatura
                        maxSubmissions: maxSubmissions ? parseInt(maxSubmissions) : null,
                        users: {
                            create: {
                                name: adminName,
                                email: adminEmail,
                                password: hashedPassword,
                                role: 'ADMIN'
                            }
                        }
                    },
                    include: {
                        users: {
                            select: { id: true, name: true, email: true, role: true }
                        }
                    }
                });
                return res.status(201).json(tenant);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao criar empresa cliente' });
            }
        });
    }
    // Editar um Tenant
    updateClientTenant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { id } = req.params;
            const { name, document, adminPassword, isActive, maxSubmissions } = req.body;
            try {
                const subscription = yield prismaClient_1.prisma.subscription.findUnique({ where: { ownerId: userId } });
                if (!subscription)
                    return res.status(403).json({ error: 'Acesso negado' });
                const tenant = yield prismaClient_1.prisma.tenant.findFirst({ where: { id, subscriptionId: subscription.id } });
                if (!tenant)
                    return res.status(404).json({ error: 'Tenant não encontrado ou não pertence a você' });
                const updatedData = {};
                if (name)
                    updatedData.name = name;
                if (document)
                    updatedData.document = document;
                if (isActive !== undefined)
                    updatedData.isActive = isActive;
                if (maxSubmissions !== undefined) {
                    const parsedMax = maxSubmissions === '' || maxSubmissions === null ? null : parseInt(maxSubmissions);
                    if (parsedMax !== null) {
                        // Calcula a soma dos limites já distribuídos (ignorando o tenant atual)
                        const otherTenants = yield prismaClient_1.prisma.tenant.findMany({
                            where: { subscriptionId: subscription.id, id: { not: id } },
                            select: { maxSubmissions: true }
                        });
                        const currentAllocated = otherTenants.reduce((sum, t) => sum + (t.maxSubmissions || 0), 0);
                        if (currentAllocated + parsedMax > subscription.maxSubmissions) {
                            return res.status(400).json({ error: `O limite distribuído ultrapassa o seu plano. Você tem ${subscription.maxSubmissions - currentAllocated} respostas disponíveis para alocar.` });
                        }
                    }
                    updatedData.maxSubmissions = parsedMax;
                }
                const updated = yield prismaClient_1.prisma.tenant.update({
                    where: { id },
                    data: updatedData
                });
                if (adminPassword) {
                    const hashedPassword = yield bcryptjs_1.default.hash(adminPassword, 8);
                    yield prismaClient_1.prisma.user.updateMany({
                        where: { tenantId: id, role: 'ADMIN' },
                        data: { password: hashedPassword }
                    });
                }
                return res.json(updated);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao atualizar tenant' });
            }
        });
    }
    // Excluir um Tenant
    deleteClientTenant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { id } = req.params;
            try {
                const subscription = yield prismaClient_1.prisma.subscription.findUnique({ where: { ownerId: userId } });
                if (!subscription)
                    return res.status(403).json({ error: 'Acesso negado' });
                const tenant = yield prismaClient_1.prisma.tenant.findFirst({ where: { id, subscriptionId: subscription.id } });
                if (!tenant)
                    return res.status(404).json({ error: 'Tenant não encontrado ou não pertence a você' });
                yield prismaClient_1.prisma.tenant.delete({ where: { id } });
                return res.json({ message: 'Tenant excluído com sucesso' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao excluir tenant' });
            }
        });
    }
    // Impersonate (Acessar a conta do cliente)
    impersonateClientTenant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { id } = req.params; // ID do tenant a ser acessado
            try {
                const subscription = yield prismaClient_1.prisma.subscription.findUnique({ where: { ownerId: userId } });
                if (!subscription)
                    return res.status(403).json({ error: 'Acesso negado' });
                const tenant = yield prismaClient_1.prisma.tenant.findFirst({ where: { id, subscriptionId: subscription.id } });
                if (!tenant)
                    return res.status(404).json({ error: 'Tenant não encontrado ou não pertence a você' });
                // Gera um token efêmero para o Consultor, mas dizendo que ele é ADMIN e tem o tenantId da empresa
                const secret = process.env.JWT_SECRET || 'supersecret_key_change_in_production';
                const jwt = require('jsonwebtoken');
                const impersonateToken = jwt.sign({ id: userId, tenantId: tenant.id, role: 'ADMIN' }, secret, { expiresIn: '12h' } // Token expira em 12h
                );
                return res.json({ token: impersonateToken, tenantName: tenant.name });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao acessar conta do cliente' });
            }
        });
    }
}
exports.ConsultantController = ConsultantController;
