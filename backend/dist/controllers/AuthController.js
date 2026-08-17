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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = require("../prismaClient");
class AuthController {
    authenticate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                const user = yield prismaClient_1.prisma.user.findUnique({ where: { email } });
                if (!user) {
                    return res.status(401).json({ error: 'Usuário não encontrado' });
                }
                const isValidPassword = user.password ? yield bcryptjs_1.default.compare(password, user.password) : false;
                if (!isValidPassword) {
                    return res.status(401).json({ error: 'Senha incorreta' });
                }
                const secret = process.env.JWT_SECRET || 'supersecret_key_change_in_production';
                const token = jsonwebtoken_1.default.sign({ id: user.id, tenantId: user.tenantId, role: user.role }, secret, { expiresIn: '1d' });
                // Não retornar a senha
                const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
                return res.json({
                    user: userWithoutPassword,
                    token
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
        });
    }
    // Apenas para testes/setup inicial (normalmente em outro controller)
    createTenantAndUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tenantName, document, userName, email, password } = req.body;
            try {
                const tenantExists = yield prismaClient_1.prisma.tenant.findUnique({ where: { document } });
                if (tenantExists) {
                    return res.status(400).json({ error: 'Tenant já existe' });
                }
                const userExists = yield prismaClient_1.prisma.user.findUnique({ where: { email } });
                if (userExists) {
                    return res.status(400).json({ error: 'Usuário já existe' });
                }
                const hashedPassword = yield bcryptjs_1.default.hash(password, 8);
                const tenant = yield prismaClient_1.prisma.tenant.create({
                    data: {
                        name: tenantName,
                        document,
                        users: {
                            create: {
                                name: userName,
                                email,
                                password: hashedPassword,
                                role: 'ADMIN'
                            }
                        }
                    },
                    include: {
                        users: true
                    }
                });
                return res.status(201).json(tenant);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
        });
    }
    // Endpoint para criar o primeiro SUPERADMIN do sistema (normalmente fechado após o setup)
    createSuperAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = req.body;
            try {
                const userExists = yield prismaClient_1.prisma.user.findUnique({ where: { email } });
                if (userExists) {
                    return res.status(400).json({ error: 'Usuário já existe' });
                }
                const hashedPassword = yield bcryptjs_1.default.hash(password, 8);
                const superadmin = yield prismaClient_1.prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        role: 'SUPERADMIN'
                    }
                });
                return res.status(201).json(superadmin);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao criar Super Admin' });
            }
        });
    }
    // Novo endpoint: Preparação para SSO Corporativo (Active Directory)
    loginSSO(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { ssoToken, email, name, tenantId } = req.body;
            // Em um ambiente real, receberíamos apenas um código/token do provedor de SSO (ex: SAML/OIDC)
            // e o backend faria a troca do token com o provedor para obter email, nome e grupo.
            try {
                // 1. Simular Validação do Token no Provedor SSO
                if (!ssoToken || ssoToken !== 'mock-valid-ad-token') {
                    return res.status(401).json({ error: 'Token SSO Inválido' });
                }
                // 2. Buscar o usuário pelo ssoId (aqui usaremos o email como identificador do SSO mockado)
                let user = yield prismaClient_1.prisma.user.findFirst({
                    where: { OR: [{ ssoId: email }, { email }] }
                });
                // 3. Se o usuário não existir, verificar o tenant e criar automaticamente (Auto-provisionamento JIT)
                if (!user) {
                    // Verifica se o domínio da empresa (tenantId) existe
                    const tenant = yield prismaClient_1.prisma.tenant.findUnique({ where: { id: tenantId } });
                    if (!tenant) {
                        return res.status(400).json({ error: 'Empresa não encontrada no sistema' });
                    }
                    // Criar usuário vinculado ao tenant sem senha (login via SSO)
                    user = yield prismaClient_1.prisma.user.create({
                        data: {
                            name,
                            email,
                            ssoId: email,
                            role: 'EMPLOYEE',
                            tenantId: tenant.id
                        }
                    });
                }
                else if (!user.ssoId) {
                    // Se o usuário existe mas ainda não tem ssoId linkado, vamos fazer o link agora
                    user = yield prismaClient_1.prisma.user.update({
                        where: { id: user.id },
                        data: { ssoId: email }
                    });
                }
                // 4. Gerar nosso token JWT interno
                const secret = process.env.JWT_SECRET || 'supersecret_key_change_in_production';
                const token = jsonwebtoken_1.default.sign({ id: user.id, tenantId: user.tenantId, role: user.role }, secret, { expiresIn: '1d' });
                const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
                return res.json({
                    user: userWithoutPassword,
                    token
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro no processo de Single Sign-On' });
            }
        });
    }
}
exports.AuthController = AuthController;
