import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
  
  // Endpoint protegido: Obter o dashboard de uma pesquisa específica
  async getSurveyAnalytics(req: Request, res: Response) {
    const { id } = req.params; // surveyId
    const tenantId = req.user?.tenantId;

    try {
      // Garantir que a pesquisa pertence ao tenant logado
      const survey = await prisma.survey.findFirst({
        where: { id, tenantId },
        include: {
          questions: true,
          submissions: {
            include: {
              answers: true
            }
          }
        }
      });

      if (!survey) {
        return res.status(404).json({ error: 'Pesquisa não encontrada ou acesso negado' });
      }

      // === CÁLCULO DE RISCO POR SETOR ===
      const sectorStats: Record<string, { totalRisk: number, totalProb: number, totalImp: number, answerCount: number, submissionCount: number }> = {};
      let totalResponses = 0;

      survey.submissions.forEach(submission => {
        const sector = submission.sector || 'Não Informado';
        
        if (!sectorStats[sector]) {
          sectorStats[sector] = { totalRisk: 0, totalProb: 0, totalImp: 0, answerCount: 0, submissionCount: 0 };
        }

        // Filtra as respostas que possuem probabilidade e impacto para calcular o risco daquela submissão
        const matrixAnswers = submission.answers.filter(a => a.probabilityScore && a.impactScore);
        
        if (matrixAnswers.length > 0) {
          totalResponses++;
          sectorStats[sector].submissionCount++;

          matrixAnswers.forEach(a => {
            const p = a.probabilityScore!;
            const i = a.impactScore!;
            const risk = p * i;

            sectorStats[sector].totalProb += p;
            sectorStats[sector].totalImp += i;
            sectorStats[sector].totalRisk += risk;
            sectorStats[sector].answerCount++;
          });
        }
      });

      // Formatar os dados para o Frontend
      const riskBySector = Object.keys(sectorStats).map(sector => {
        const stats = sectorStats[sector];
        const avgRisk = stats.answerCount > 0 ? stats.totalRisk / stats.answerCount : 0;
        const avgProb = stats.answerCount > 0 ? stats.totalProb / stats.answerCount : 0;
        const avgImp = stats.answerCount > 0 ? stats.totalImp / stats.answerCount : 0;

        let riskLevel = 'Baixo (Monitorar)';
        if (avgRisk >= 6) riskLevel = 'Alto (Ação imediata)';
        else if (avgRisk >= 3) riskLevel = 'Médio (Melhorar controles)';

        return {
          sector,
          averageProbability: parseFloat(avgProb.toFixed(2)),
          averageImpact: parseFloat(avgImp.toFixed(2)),
          averageRiskScore: parseFloat(avgRisk.toFixed(2)),
          riskLevel,
          responseCount: stats.submissionCount
        };
      });

      return res.json({
        surveyTitle: survey.title,
        totalSubmissions: survey.submissions.length,
        totalValidMatrixResponses: totalResponses,
        riskBySector
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao gerar analytics' });
    }
  // Endpoint protegido: Gerar Relatório Matemático/Determinístico
  async generateAIReport(req: Request, res: Response) {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    try {
      const survey = await prisma.survey.findFirst({
        where: { id, tenantId },
        include: {
          questions: true,
          submissions: {
            include: { answers: true }
          }
        }
      });

      if (!survey) {
        return res.status(404).json({ error: 'Pesquisa não encontrada ou acesso negado' });
      }

      // --- ESTATÍSTICAS POR SETOR ---
      const sectorStats: Record<string, { totalRisk: number, answerCount: number }> = {};
      
      // --- ESTATÍSTICAS POR PERGUNTA ---
      const questionStats: Record<string, { totalRisk: number, answerCount: number, text: string }> = {};

      survey.questions.forEach(q => {
        questionStats[q.id] = { totalRisk: 0, answerCount: 0, text: q.text };
      });

      let totalGlobalRisk = 0;
      let totalGlobalAnswers = 0;

      survey.submissions.forEach(sub => {
        const sector = sub.sector || 'Geral';
        if (!sectorStats[sector]) sectorStats[sector] = { totalRisk: 0, answerCount: 0 };
        
        sub.answers.forEach(a => {
          if (a.probabilityScore && a.impactScore) {
            const risk = a.probabilityScore * a.impactScore;
            
            // Setor
            sectorStats[sector].totalRisk += risk;
            sectorStats[sector].answerCount++;
            
            // Pergunta
            if (questionStats[a.questionId]) {
              questionStats[a.questionId].totalRisk += risk;
              questionStats[a.questionId].answerCount++;
            }

            // Global
            totalGlobalRisk += risk;
            totalGlobalAnswers++;
          }
        });
      });

      // Cálculos Finais
      const globalAvgRisk = totalGlobalAnswers > 0 ? (totalGlobalRisk / totalGlobalAnswers) : 0;

      const sectorsComputed = Object.entries(sectorStats).map(([sector, stats]) => ({
        sector,
        avg: stats.answerCount > 0 ? (stats.totalRisk / stats.answerCount) : 0
      })).sort((a, b) => b.avg - a.avg);

      const criticalSectors = sectorsComputed.filter(s => s.avg >= 6);
      const mediumSectors = sectorsComputed.filter(s => s.avg >= 3 && s.avg < 6);
      const lowSectors = sectorsComputed.filter(s => s.avg < 3);

      const questionsComputed = Object.values(questionStats).map(q => ({
        text: q.text,
        avg: q.answerCount > 0 ? (q.totalRisk / q.answerCount) : 0
      })).sort((a, b) => b.avg - a.avg);

      const topCriticalQuestions = questionsComputed.filter(q => q.avg >= 4).slice(0, 3);

      // --- CONSTRUÇÃO DO RELATÓRIO MATEMÁTICO ---
      let report = `## Relatório Analítico Executivo\n\n`;
      report += `Este relatório foi gerado automaticamente a partir de modelos matemáticos e estatísticos aplicados aos dados da pesquisa **"${survey.title}"**.\n\n`;

      // 1. Visão Geral
      report += `### 1. Visão Global da Empresa\n`;
      report += `A média de risco psicossocial global da empresa atual é de **${globalAvgRisk.toFixed(2)}/9**. `;
      
      if (globalAvgRisk >= 6) {
        report += `Este é um indicador **Crítico**, sugerindo que o ambiente de trabalho geral está gerando forte desgaste emocional ou sobrecarga.\n\n`;
      } else if (globalAvgRisk >= 3) {
        report += `Este é um indicador de nível **Atenção**, sugerindo que há pontos de atrito no dia a dia que podem escalar se não forem acompanhados.\n\n`;
      } else if (globalAvgRisk > 0) {
        report += `Este é um indicador **Saudável**, demonstrando que, de forma geral, o ambiente apresenta riscos controlados.\n\n`;
      } else {
        report += `*(Ainda não há dados suficientes para uma média geral consistente).* \n\n`;
      }

      // 2. Análise por Setores
      report += `### 2. Análise por Setores\n`;
      
      if (criticalSectors.length > 0) {
        report += `**🚨 Setores em Alerta Vermelho (Risco > 6):**\nOs setores abaixo relataram uma forte combinação de alta probabilidade de ocorrência e alto impacto emocional.\n`;
        criticalSectors.forEach(s => report += `- **${s.sector}** (Média: ${s.avg.toFixed(2)})\n`);
        report += `\n*Recomendação:* Intervenção e escuta ativa imediata nestas equipes.\n\n`;
      } else {
        report += `**Nenhum setor encontra-se em risco crítico** neste levantamento.\n\n`;
      }

      if (mediumSectors.length > 0) {
        report += `**⚠️ Setores em Atenção (Risco entre 3 e 6):**\n`;
        mediumSectors.forEach(s => report += `- **${s.sector}** (Média: ${s.avg.toFixed(2)})\n`);
        report += `\n`;
      }

      if (lowSectors.length > 0) {
        report += `**✅ Setores Estáveis (Risco < 3):**\n`;
        lowSectors.forEach(s => report += `- **${s.sector}** (Média: ${s.avg.toFixed(2)})\n`);
        report += `\n`;
      }

      // 3. Fatores Críticos
      report += `### 3. Fatores Geradores de Risco (Raiz do Problema)\n`;
      if (topCriticalQuestions.length > 0) {
        report += `As perguntas que obtiveram os piores índices (maior risco percebido) foram:\n\n`;
        topCriticalQuestions.forEach((q, i) => {
          report += `${i + 1}. *"${q.text}"* (Score médio: **${q.avg.toFixed(2)}**)\n`;
        });
        report += `\n*Plano de Ação Sugerido:* A empresa deve focar os próximos passos diretamente em resolver ou mitigar os problemas levantados por estas perguntas específicas.\n`;
      } else {
        report += `Nenhuma pergunta isolada obteve um score crítico nesta pesquisa.\n`;
      }

      report += `\n---\n*Gerado matematicamente com base em ${totalGlobalAnswers} respostas da matriz (Probabilidade x Impacto).*`;

      return res.json({ report });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao gerar relatório determinístico' });
    }
  }
}
