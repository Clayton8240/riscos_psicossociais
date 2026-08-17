import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export class SurveyController {
  
  // Endpoint protegido: Criar uma nova pesquisa (HR/Admin)
  async createSurvey(req: Request, res: Response) {
    const { title, description, questions } = req.body;
    
    // O tenantId vem do middleware (usuário logado)
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(403).json({ error: 'TenantId não encontrado' });
    }

    try {
      const survey = await prisma.survey.create({
        data: {
          title,
          description,
          tenantId,
          questions: {
            create: questions.map((q: any) => ({
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
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar pesquisa' });
    }
  }

  // Endpoint protegido: Listar pesquisas da Empresa (Tenant)
  async listSurveys(req: Request, res: Response) {
    const tenantId = req.user?.tenantId;

    try {
      const surveys = await prisma.survey.findMany({
        where: { tenantId },
        include: {
          _count: {
            select: { submissions: true }
          }
        }
      });

      return res.json(surveys);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar pesquisas' });
    }
  }

  // Endpoint protegido: Deletar pesquisa
  async deleteSurvey(req: Request, res: Response) {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    try {
      // Verifica se a pesquisa existe e pertence ao tenant
      const survey = await prisma.survey.findUnique({ where: { id } });

      if (!survey) {
        return res.status(404).json({ error: 'Pesquisa não encontrada' });
      }

      if (survey.tenantId !== tenantId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Deletar dependências para evitar erro de Foreign Key
      // 1. Deletar respostas
      await prisma.answer.deleteMany({
        where: { question: { surveyId: id } }
      });
      // 2. Deletar submissões (participações)
      await prisma.submission.deleteMany({
        where: { surveyId: id }
      });
      // 3. Deletar perguntas
      await prisma.question.deleteMany({
        where: { surveyId: id }
      });
      
      // 4. Finalmente, deletar a pesquisa
      await prisma.survey.delete({ where: { id } });

      return res.status(200).json({ message: 'Pesquisa deletada com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao deletar pesquisa' });
    }
  }

  // Endpoint Público: Buscar a pesquisa para o colaborador responder
  async getSurvey(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const survey = await prisma.survey.findUnique({
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

      return res.json({
        ...survey,
        sectors: JSON.parse(survey.tenant?.sectors || '[]')
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar pesquisa' });
    }
  }

  // Endpoint Público: Colaborador submete a resposta
  async submitResponse(req: Request, res: Response) {
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
      const survey = await prisma.survey.findUnique({ where: { id } });

      if (!survey || !survey.isActive) {
        return res.status(400).json({ error: 'Pesquisa inválida ou inativa' });
      }

      const submission = await prisma.submission.create({
        data: {
          surveyId: id,
          sector, // Grava apenas o setor do colaborador
          answers: {
            create: answers.map((a: any) => ({
              questionId: a.questionId,
              probabilityScore: a.probabilityScore,
              impactScore: a.impactScore,
              textValue: a.textValue
            }))
          }
        }
      });

      return res.status(201).json({ message: 'Resposta salva com sucesso!', submissionId: submission.id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao salvar resposta' });
    }
  }
}
