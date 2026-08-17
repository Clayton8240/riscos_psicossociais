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
                        }
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
    // Cria um novo Tenant e já provisiona um primeiro usuário ADMIN para aquela empresa
    createTenant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, document, adminName, adminEmail, adminPassword } = req.body;
            try {
                const tenantExists = yield prismaClient_1.prisma.tenant.findUnique({ where: { document } });
                if (tenantExists) {
                    return res.status(400).json({ error: 'Empresa (Tenant) já existe' });
                }
                const userExists = yield prismaClient_1.prisma.user.findUnique({ where: { email: adminEmail } });
                if (userExists) {
                    return res.status(400).json({ error: 'E-mail de administrador já em uso' });
                }
                const hashedPassword = yield bcryptjs_1.default.hash(adminPassword, 8);
                const tenant = yield prismaClient_1.prisma.tenant.create({
                    data: {
                        name,
                        document,
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
                return res.status(500).json({ error: 'Erro ao criar empresa' });
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
                    const surveyIds = surveys.map(s => s.id);
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
}
exports.SuperAdminController = SuperAdminController;
