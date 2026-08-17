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
exports.SurveyController = void 0;
const prismaClient_1 = require("../prismaClient");
class SurveyController {
    // Endpoint protegido: Criar uma nova pesquisa (HR/Admin)
    createSurvey(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { title, description, questions } = req.body;
            // O tenantId vem do middleware (usuário logado)
            const tenantId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenantId;
            if (!tenantId) {
                return res.status(403).json({ error: 'TenantId não encontrado' });
            }
            try {
                const survey = yield prismaClient_1.prisma.survey.create({
                    data: {
                        title,
                        description,
                        tenantId,
                        questions: {
                            create: questions.map((q) => ({
                                text: q.text,
                                type: q.type || 'PROBABILITY_IMPACT'
                            }))
                        }
                    },
                    include: {
                        questions: true
                    }
                });
                return res.status(201).json(survey);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao criar pesquisa' });
            }
        });
    }
    // Endpoint protegido: Listar pesquisas da Empresa (Tenant)
    listSurveys(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const tenantId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenantId;
            try {
                const surveys = yield prismaClient_1.prisma.survey.findMany({
                    where: { tenantId },
                    include: {
                        _count: {
                            select: { submissions: true }
                        }
                    }
                });
                return res.json(surveys);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao listar pesquisas' });
            }
        });
    }
    // Endpoint protegido: Deletar pesquisa
    deleteSurvey(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            const tenantId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tenantId;
            try {
                // Verifica se a pesquisa existe e pertence ao tenant
                const survey = yield prismaClient_1.prisma.survey.findUnique({ where: { id } });
                if (!survey) {
                    return res.status(404).json({ error: 'Pesquisa não encontrada' });
                }
                if (survey.tenantId !== tenantId) {
                    return res.status(403).json({ error: 'Acesso negado' });
                }
                // Deletar dependências para evitar erro de Foreign Key
                // 1. Deletar respostas
                yield prismaClient_1.prisma.answer.deleteMany({
                    where: { question: { surveyId: id } }
                });
                // 2. Deletar submissões (participações)
                yield prismaClient_1.prisma.submission.deleteMany({
                    where: { surveyId: id }
                });
                // 3. Deletar perguntas
                yield prismaClient_1.prisma.question.deleteMany({
                    where: { surveyId: id }
                });
                // 4. Finalmente, deletar a pesquisa
                yield prismaClient_1.prisma.survey.delete({ where: { id } });
                return res.status(200).json({ message: 'Pesquisa deletada com sucesso' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao deletar pesquisa' });
            }
        });
    }
    // Endpoint Público: Buscar a pesquisa para o colaborador responder
    getSurvey(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            try {
                const survey = yield prismaClient_1.prisma.survey.findUnique({
                    where: { id },
                    include: {
                        questions: true,
                        tenant: {
                            select: { sectors: true }
                        }
                    }
                });
                if (!survey) {
                    return res.status(404).json({ error: 'Pesquisa não encontrada' });
                }
                if (!survey.isActive) {
                    return res.status(400).json({ error: 'Esta pesquisa foi encerrada' });
                }
                return res.json(Object.assign(Object.assign({}, survey), { sectors: JSON.parse(((_a = survey.tenant) === null || _a === void 0 ? void 0 : _a.sectors) || '[]') }));
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao buscar pesquisa' });
            }
        });
    }
    // Endpoint Público: Colaborador submete a resposta
    submitResponse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params; // surveyId
            const { sector, answers } = req.body; // Anonimato garantido, sem nome/email
            /*
              Formato esperado para answers:
              [
                { questionId: "...", probabilityScore: 3, impactScore: 4 },
                { questionId: "...", textValue: "..." }
              ]
            */
            try {
                const survey = yield prismaClient_1.prisma.survey.findUnique({ where: { id } });
                if (!survey || !survey.isActive) {
                    return res.status(400).json({ error: 'Pesquisa inválida ou inativa' });
                }
                const submission = yield prismaClient_1.prisma.submission.create({
                    data: {
                        surveyId: id,
                        sector, // Grava apenas o setor do colaborador
                        answers: {
                            create: answers.map((a) => ({
                                questionId: a.questionId,
                                probabilityScore: a.probabilityScore,
                                impactScore: a.impactScore,
                                textValue: a.textValue
                            }))
                        }
                    }
                });
                return res.status(201).json({ message: 'Resposta salva com sucesso!', submissionId: submission.id });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao salvar resposta' });
            }
        });
    }
}
exports.SurveyController = SurveyController;
