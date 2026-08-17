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
exports.UserController = void 0;
const prismaClient_1 = require("../prismaClient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserController {
    // GET /users (Listar usuários do tenant, útil para popular o select de "Responsável")
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const tenantId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenantId;
            if (!tenantId)
                return res.status(403).json({ error: 'Acesso negado' });
            try {
                const users = yield prismaClient_1.prisma.user.findMany({
                    where: { tenantId },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true
                    },
                    orderBy: { name: 'asc' }
                });
                return res.json(users);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao listar usuários' });
            }
        });
    }
    // POST /users (Criar novo usuário/líder)
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { name, email, password, role } = req.body;
            const tenantId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenantId;
            const myRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
            if (!tenantId)
                return res.status(403).json({ error: 'Acesso negado' });
            if (myRole !== 'ADMIN' && myRole !== 'SUPERADMIN') {
                return res.status(403).json({ error: 'Apenas administradores podem criar usuários' });
            }
            try {
                // Verifica se e-mail já existe
                const existingUser = yield prismaClient_1.prisma.user.findUnique({ where: { email } });
                if (existingUser) {
                    return res.status(400).json({ error: 'E-mail já cadastrado' });
                }
                const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                const user = yield prismaClient_1.prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        role: role || 'LEADER',
                        tenantId
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                });
                return res.status(201).json(user);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao criar usuário' });
            }
        });
    }
}
exports.UserController = UserController;
