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
exports.ActionPlanController = void 0;
const prismaClient_1 = require("../prismaClient");
class ActionPlanController {
    // POST /action-plans
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { title, description, responsible, deadline, sector, assignedToId } = req.body;
            const tenantId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenantId;
            if (!tenantId)
                return res.status(403).json({ error: 'Acesso negado' });
            try {
                const actionPlan = yield prismaClient_1.prisma.actionPlan.create({
                    data: {
                        title,
                        description,
                        responsible,
                        deadline: new Date(deadline),
                        sector,
                        assignedToId,
                        tenantId
                    }
                });
                return res.status(201).json(actionPlan);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao criar o plano de ação' });
            }
        });
    }
    // GET /action-plans
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const tenantId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenantId;
            const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
            const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
            if (!tenantId)
                return res.status(403).json({ error: 'Acesso negado' });
            try {
                const whereClause = { tenantId };
                // Se for líder, só vê os planos atribuídos a ele
                if (role === 'LEADER') {
                    whereClause.assignedToId = userId;
                }
                const actionPlans = yield prismaClient_1.prisma.actionPlan.findMany({
                    where: whereClause,
                    orderBy: { deadline: 'asc' },
                    include: {
                        assignedTo: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                });
                return res.json(actionPlans);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao listar os planos de ação' });
            }
        });
    }
    // PATCH /action-plans/:id/status
    updateStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            const { status, resolutionNotes } = req.body; // OPEN, IN_PROGRESS, RESOLVED
            const tenantId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenantId;
            if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
                return res.status(400).json({ error: 'Status inválido' });
            }
            try {
                // Garante que só pode alterar se pertencer ao mesmo Tenant
                const existingPlan = yield prismaClient_1.prisma.actionPlan.findFirst({ where: { id, tenantId } });
                if (!existingPlan)
                    return res.status(404).json({ error: 'Plano não encontrado' });
                const dataToUpdate = { status };
                if (resolutionNotes !== undefined) {
                    dataToUpdate.resolutionNotes = resolutionNotes;
                }
                const updatedPlan = yield prismaClient_1.prisma.actionPlan.update({
                    where: { id },
                    data: dataToUpdate
                });
                return res.json(updatedPlan);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao atualizar o plano de ação' });
            }
        });
    }
    // DELETE /action-plans/:id
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            const tenantId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenantId;
            try {
                const existingPlan = yield prismaClient_1.prisma.actionPlan.findFirst({ where: { id, tenantId } });
                if (!existingPlan)
                    return res.status(404).json({ error: 'Plano não encontrado' });
                yield prismaClient_1.prisma.actionPlan.delete({ where: { id } });
                return res.status(204).send();
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao remover o plano de ação' });
            }
        });
    }
}
exports.ActionPlanController = ActionPlanController;
