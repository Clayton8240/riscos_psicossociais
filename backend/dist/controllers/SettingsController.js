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
exports.SettingsController = void 0;
const prismaClient_1 = require("../prismaClient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class SettingsController {
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const user = yield prismaClient_1.prisma.user.findUnique({
                    where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
                    include: { tenant: true }
                });
                if (!user)
                    return res.status(404).json({ error: 'Usuário não encontrado' });
                return res.json({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    companyName: ((_b = user.tenant) === null || _b === void 0 ? void 0 : _b.name) || '',
                    sectors: JSON.parse(((_c = user.tenant) === null || _c === void 0 ? void 0 : _c.sectors) || '[]')
                });
            }
            catch (error) {
                return res.status(500).json({ error: 'Erro ao buscar perfil' });
            }
        });
    }
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { name, email, currentPassword, newPassword, companyName, sectors } = req.body;
                const user = yield prismaClient_1.prisma.user.findUnique({ where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id } });
                if (!user)
                    return res.status(404).json({ error: 'Usuário não encontrado' });
                // Se for atualizar email, checar se já existe
                if (email && email !== user.email) {
                    const emailExists = yield prismaClient_1.prisma.user.findUnique({ where: { email } });
                    if (emailExists)
                        return res.status(400).json({ error: 'E-mail já está em uso' });
                }
                // Se quiser mudar a senha, deve informar a atual
                let updatedPassword = user.password;
                if (newPassword) {
                    if (!currentPassword) {
                        return res.status(400).json({ error: 'Senha atual é obrigatória para mudar a senha' });
                    }
                    if (!user.password) {
                        return res.status(400).json({ error: 'Usuário não possui senha configurada (SSO)' });
                    }
                    const passwordMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
                    if (!passwordMatch) {
                        return res.status(401).json({ error: 'Senha atual incorreta' });
                    }
                    updatedPassword = yield bcryptjs_1.default.hash(newPassword, 8);
                }
                const updatedUser = yield prismaClient_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        name: name || user.name,
                        email: email || user.email,
                        password: updatedPassword
                    }
                });
                if (user.tenantId) {
                    const tenantUpdateData = {};
                    if (companyName)
                        tenantUpdateData.name = companyName;
                    // Apenas ADMIN ou SUPERADMIN podem atualizar os setores
                    if (sectors && Array.isArray(sectors) && (user.role === 'ADMIN' || user.role === 'SUPERADMIN')) {
                        tenantUpdateData.sectors = JSON.stringify(sectors);
                    }
                    if (Object.keys(tenantUpdateData).length > 0) {
                        yield prismaClient_1.prisma.tenant.update({
                            where: { id: user.tenantId },
                            data: tenantUpdateData
                        });
                    }
                }
                return res.json({ message: 'Perfil atualizado com sucesso' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao atualizar perfil' });
            }
        });
    }
}
exports.SettingsController = SettingsController;
