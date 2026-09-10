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
exports.SuperAdminController = void 0;
const prismaClient_1 = require("../prismaClient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class SuperAdminController {
    // Lista todos os Tenants (Empresas) cadastrados
    listTenants(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tenants = yield prismaClient_1.prisma.tenant.findMany({
                    include: {
                        _count: {
                            select: { users: true, surveys: true }
                        },
                        subscription: true
                    },
                    orderBy: { createdAt: 'desc' }
                });
                return res.json(tenants);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao listar empresas' });
            }
        });
    }
    // Edita um Tenant existente
    updateTenant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, document, maxSubmissions, isActive, adminPassword } = req.body;
            try {
                const updateData = { name, document };
                if (typeof isActive !== 'undefined') {
                    updateData.isActive = isActive;
                }
                let tenant = yield prismaClient_1.prisma.tenant.update({
                    where: { id },
                    data: updateData
                });
                if (adminPassword) {
                    const adminUser = yield prismaClient_1.prisma.user.findFirst({
                        where: { tenantId: id, role: 'ADMIN' }
                    });
                    if (adminUser) {
                        const hashedPassword = yield bcryptjs_1.default.hash(adminPassword, 8);
                        yield prismaClient_1.prisma.user.update({
                            where: { id: adminUser.id },
                            data: { password: hashedPassword }
                        });
                    }
                }
                // Atualiza o maxSubmissions da Subscription se for um Tenant Single
                if (tenant.subscriptionId && maxSubmissions) {
                    yield prismaClient_1.prisma.subscription.update({
                        where: { id: tenant.subscriptionId },
                        data: { maxSubmissions: parseInt(maxSubmissions) }
                    });
                }
                return res.json(tenant);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao editar empresa' });
            }
        });
    }
    // Cria um novo Tenant e já provisiona um primeiro usuário ADMIN para aquela empresa
    createTenant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, document, adminName, adminEmail, adminPassword, subscriptionId, maxSubmissions } = req.body;
            try {
                const tenantExists = yield prismaClient_1.prisma.tenant.findUnique({ where: { document } });
                if (tenantExists) {
                    return res.status(400).json({ error: 'Empresa (Tenant) já existe' });
                }
                const userExists = yield prismaClient_1.prisma.user.findUnique({ where: { email: adminEmail } });
                if (userExists) {
                    return res.status(400).json({ error: 'E-mail de administrador já em uso' });
                }
                if (subscriptionId) {
                    const subscription = yield prismaClient_1.prisma.subscription.findUnique({
                        where: { id: subscriptionId },
                        include: { _count: { select: { tenants: true } } }
                    });
                    if (!subscription) {
                        return res.status(404).json({ error: 'Assinatura não encontrada' });
                    }
                    if (!['DEMAND', 'LICENSE'].includes(subscription.planType) && subscription._count.tenants >= subscription.maxTenants) {
                        return res.status(403).json({ error: 'Limite de empresas atingido para este plano. Faça upgrade para adicionar mais empresas.' });
                    }
                }
                const hashedPassword = yield bcryptjs_1.default.hash(adminPassword, 8);
                // Passo 1: Cria a empresa sem usuários
                let tenant = yield prismaClient_1.prisma.tenant.create({
                    data: { name, document }
                });
                // Passo 2: Cria o administrador atrelado à empresa
                const user = yield prismaClient_1.prisma.user.create({
                    data: {
                        name: adminName,
                        email: adminEmail,
                        password: hashedPassword,
                        role: 'ADMIN',
                        tenantId: tenant.id
                    }
                });
                // Passo 3: Cria ou vincula a Assinatura (Subscription)
                if (subscriptionId) {
                    tenant = yield prismaClient_1.prisma.tenant.update({
                        where: { id: tenant.id },
                        data: { subscriptionId }
                    });
                }
                else {
                    // Se não foi passado subscriptionId, é uma "Empresa Única" (SINGLE) criada pelo SuperAdmin
                    const sub = yield prismaClient_1.prisma.subscription.create({
                        data: {
                            planType: 'SINGLE',
                            maxTenants: 1,
                            maxSubmissions: maxSubmissions ? parseInt(maxSubmissions) : 50,
                            ownerId: user.id
                        }
                    });
                    tenant = yield prismaClient_1.prisma.tenant.update({
                        where: { id: tenant.id },
                        data: { subscriptionId: sub.id }
                    });
                }
                return res.status(201).json(tenant);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao criar empresa' });
            }
        });
    }
    // Cria um Consultor e sua respectiva Assinatura (Plano)
    createConsultant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { adminName, adminEmail, adminPassword, plan, maxTenants, maxSubmissions } = req.body;
            try {
                const userExists = yield prismaClient_1.prisma.user.findUnique({ where: { email: adminEmail } });
                if (userExists) {
                    return res.status(400).json({ error: 'E-mail de consultor já em uso' });
                }
                const hashedPassword = yield bcryptjs_1.default.hash(adminPassword, 8);
                const user = yield prismaClient_1.prisma.user.create({
                    data: {
                        name: adminName,
                        email: adminEmail,
                        password: hashedPassword,
                        role: 'CONSULTANT'
                    }
                });
                const subscription = yield prismaClient_1.prisma.subscription.create({
                    data: {
                        planType: plan || 'BRONZE',
                        maxTenants: maxTenants ? parseInt(maxTenants) : 5,
                        maxSubmissions: maxSubmissions ? parseInt(maxSubmissions) : 100,
                        ownerId: user.id
                    }
                });
                return res.status(201).json({ user, subscription });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao criar consultor' });
            }
        });
    }
    // Lista todos os Consultores
    listConsultants(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const consultants = yield prismaClient_1.prisma.user.findMany({
                    where: { role: 'CONSULTANT' },
                    include: {
                        subscription: true // o ownerId da subscription
                    },
                    orderBy: { createdAt: 'desc' }
                });
                return res.json(consultants);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao listar consultores' });
            }
        });
    }
    // Edita um Consultor
    updateConsultant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { adminName, plan, maxTenants, maxSubmissions, isActive, adminPassword } = req.body;
            try {
                const updateData = { name: adminName };
                if (typeof isActive !== 'undefined') {
                    updateData.isActive = isActive;
                }
                if (adminPassword) {
                    updateData.password = yield bcryptjs_1.default.hash(adminPassword, 8);
                }
                const user = yield prismaClient_1.prisma.user.update({
                    where: { id },
                    data: updateData
                });
                // O Consultor tem uma subscription que ele é dono (owner)
                const sub = yield prismaClient_1.prisma.subscription.findFirst({ where: { ownerId: id } });
                if (sub) {
                    yield prismaClient_1.prisma.subscription.update({
                        where: { id: sub.id },
                        data: {
                            planType: plan || sub.planType,
                            maxTenants: maxTenants ? parseInt(maxTenants) : sub.maxTenants,
                            maxSubmissions: maxSubmissions ? parseInt(maxSubmissions) : sub.maxSubmissions
                        }
                    });
                }
                return res.json(user);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao editar consultor' });
            }
        });
    }
    // Exclui um Consultor e seus Tenants (se quiser ser drástico) ou apenas o consultor
    deleteConsultant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield prismaClient_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // Encontra a subscription do consultor
                    const sub = yield tx.subscription.findFirst({ where: { ownerId: id } });
                    if (sub) {
                        // Encontrar tenants da subscription e apagar todos (opcional, mas necessário se formos limpar tudo)
                        const tenants = yield tx.tenant.findMany({ where: { subscriptionId: sub.id } });
                        for (const t of tenants) {
                            const surveys = yield tx.survey.findMany({ where: { tenantId: t.id } });
                            const surveyIds = surveys.map((s) => s.id);
                            if (surveyIds.length > 0) {
                                yield tx.answer.deleteMany({
                                    where: { OR: [{ submission: { surveyId: { in: surveyIds } } }, { question: { surveyId: { in: surveyIds } } }] }
                                });
                                yield tx.submission.deleteMany({ where: { surveyId: { in: surveyIds } } });
                                yield tx.question.deleteMany({ where: { surveyId: { in: surveyIds } } });
                                yield tx.survey.deleteMany({ where: { tenantId: t.id } });
                            }
                            yield tx.actionPlan.deleteMany({ where: { tenantId: t.id } });
                            yield tx.user.deleteMany({ where: { tenantId: t.id } });
                            yield tx.tenant.delete({ where: { id: t.id } });
                        }
                        yield tx.subscription.delete({ where: { id: sub.id } });
                    }
                    yield tx.user.delete({ where: { id } });
                }));
                return res.status(200).json({ message: 'Consultor excluído com sucesso' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao excluir consultor' });
            }
        });
    }
    // Exclui um Tenant e todos os seus dados vinculados
    deleteTenant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                // Usar transaction para garantir que se algo falhar, faz rollback
                yield prismaClient_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // Encontrar as pesquisas deste tenant
                    const surveys = yield tx.survey.findMany({ where: { tenantId: id } });
                    const surveyIds = surveys.map((s) => s.id);
                    if (surveyIds.length > 0) {
                        // Deletar respostas (Answers) vinculadas às Submissions das Surveys ou Questions das Surveys
                        yield tx.answer.deleteMany({
                            where: {
                                OR: [
                                    { submission: { surveyId: { in: surveyIds } } },
                                    { question: { surveyId: { in: surveyIds } } }
                                ]
                            }
                        });
                        // Deletar Submissions e Questions
                        yield tx.submission.deleteMany({ where: { surveyId: { in: surveyIds } } });
                        yield tx.question.deleteMany({ where: { surveyId: { in: surveyIds } } });
                        // Deletar as Surveys
                        yield tx.survey.deleteMany({ where: { tenantId: id } });
                    }
                    // Deletar Action Plans
                    yield tx.actionPlan.deleteMany({ where: { tenantId: id } });
                    // Deletar Users
                    yield tx.user.deleteMany({ where: { tenantId: id } });
                    // Por fim, deletar o Tenant
                    yield tx.tenant.delete({ where: { id } });
                }));
                return res.status(200).json({ message: 'Empresa excluída com sucesso' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao excluir empresa' });
            }
        });
    }
    // Gera um token para o SuperAdmin assumir o controle como ADMIN de uma empresa específica
    impersonateTenant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            try {
                const tenant = yield prismaClient_1.prisma.tenant.findUnique({ where: { id } });
                if (!tenant) {
                    return res.status(404).json({ error: 'Empresa não encontrada' });
                }
                // Procura o primeiro admin daquela empresa para usar como base (ou gera um token solto)
                const admin = yield prismaClient_1.prisma.user.findFirst({
                    where: { tenantId: id, role: 'ADMIN' }
                });
                const userId = admin ? admin.id : (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Se não tiver admin, usa o id do superadmin
                const token = jsonwebtoken_1.default.sign({ id: userId, role: 'ADMIN', tenantId: id }, process.env.JWT_SECRET || 'supersecret_key_change_in_production', { expiresIn: '1d' });
                return res.json({ token, role: 'ADMIN', tenantId: id });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao gerar acesso para a empresa' });
            }
        });
    }
    // Retorna configurações globais (ex: pagamentos)
    getPaymentSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const configs = yield prismaClient_1.prisma.systemConfig.findMany();
                const settings = {};
                // Converte array de chave/valor para um objeto
                configs.forEach((c) => {
                    try {
                        settings[c.key] = JSON.parse(c.value);
                    }
                    catch (_a) {
                        settings[c.key] = c.value;
                    }
                });
                return res.json(settings);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao buscar configurações de pagamento' });
            }
        });
    }
    // Atualiza configurações globais
    updatePaymentSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updates = req.body; // { stripe_key: "...", payment_method_pix_enabled: true }
                const transactions = Object.entries(updates).map(([key, value]) => {
                    const stringValue = typeof value === 'object' || typeof value === 'boolean'
                        ? JSON.stringify(value)
                        : String(value);
                    return prismaClient_1.prisma.systemConfig.upsert({
                        where: { key },
                        update: { value: stringValue },
                        create: { key, value: stringValue }
                    });
                });
                yield prismaClient_1.prisma.$transaction(transactions);
                return res.json({ message: 'Configurações de pagamento salvas com sucesso' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao salvar configurações de pagamento' });
            }
        });
    }
}
exports.SuperAdminController = SuperAdminController;
