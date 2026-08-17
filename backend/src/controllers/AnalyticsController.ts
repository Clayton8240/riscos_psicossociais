import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { StatisticalEngine, RiskDataPoint } from '../services/StatisticalEngine';

export class AnalyticsController {
  
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

      // --- ESTATÍSTICAS POR SETOR E ALPHA ---
      const sectorDataPoints: Record<string, RiskDataPoint[]> = {};
      
      // --- ESTATÍSTICAS POR PERGUNTA ---
      const questionStats: Record<string, { totalRisk: number, answerCount: number, text: string }> = {};

      const questionIndexMap: Record<string, number> = {};
      survey.questions.forEach((q, idx) => {
        questionStats[q.id] = { totalRisk: 0, answerCount: 0, text: q.text };
        questionIndexMap[q.id] = idx;
      });

      const submissionsMatrix: number[][] = [];

      survey.submissions.forEach(sub => {
        const sector = sub.sector || 'Geral';
        if (!sectorDataPoints[sector]) sectorDataPoints[sector] = [];
        
        const subScores: number[] = new Array(survey.questions.length).fill(0);

        sub.answers.forEach(a => {
          if (a.probabilityScore && a.impactScore) {
            const risk = a.probabilityScore * a.impactScore;
            
            // Setor
            sectorDataPoints[sector].push({ probability: a.probabilityScore, impact: a.impactScore });
            
            // Pergunta
            if (questionStats[a.questionId]) {
              questionStats[a.questionId].totalRisk += risk;
              questionStats[a.questionId].answerCount++;
            }

            // Alpha de Cronbach
            subScores[questionIndexMap[a.questionId]] = risk;
          }
        });

        submissionsMatrix.push(subScores);
      });

      // Cálculos Finais Globais e de Cronbach
      const cronbachAlpha = StatisticalEngine.calculateCronbachAlpha(submissionsMatrix);
      
      let alphaInterpretation = '';
      let alphaExplanation = '';
      
      if (cronbachAlpha >= 0.9) {
        alphaInterpretation = '**Excelente** (Altamente confiável)';
        alphaExplanation = 'As perguntas foram perfeitamente compreendidas e as pessoas responderam de forma extremamente coerente (ex: quem relatou alta carga de trabalho, de fato, relatou alto estresse). O questionário é sólido.';
      } else if (cronbachAlpha >= 0.8) {
        alphaInterpretation = '**Bom** (Consistência sólida)';
        alphaExplanation = 'Indica uma consistência forte nas respostas. O gestor pode confiar integralmente nos dados.';
      } else if (cronbachAlpha >= 0.7) {
        alphaInterpretation = '**Aceitável** (Válido)';
        alphaExplanation = 'As respostas possuem uma consistência matemática aceitável para iniciar os planos de ação.';
      } else if (cronbachAlpha >= 0.6) {
        alphaInterpretation = '**Questionável** (Pode haver confusão)';
        alphaExplanation = 'O grupo apresentou respostas um pouco conflitantes. Algumas perguntas podem ter gerado dupla interpretação no momento da leitura.';
      } else {
        alphaInterpretation = '**Inaceitável** (Dados pouco confiáveis)';
        alphaExplanation = 'As respostas não possuem um padrão matemático lógico. *Causas comuns:* (1) Pouquíssimas pessoas responderam com opiniões extremas e opostas; (2) As perguntas do formulário estão muito confusas; ou (3) As pessoas marcaram alternativas de forma aleatória. **Recomendação:** Não tome decisões severas (demissões/reestruturações) baseadas nesta pesquisa. Aguarde uma amostragem maior.';
      }

      const allDataPoints = Object.values(sectorDataPoints).flat();
      const globalStats = StatisticalEngine.analyzeRiskDistribution(allDataPoints);

      const sectorsComputed = Object.entries(sectorDataPoints).map(([sector, dataPoints]) => {
        const stats = StatisticalEngine.analyzeRiskDistribution(dataPoints);
        return { sector, stats };
      }).sort((a, b) => b.stats.mean - a.stats.mean);

      const criticalSectors = sectorsComputed.filter(s => s.stats.mean >= 6);
      const mediumSectors = sectorsComputed.filter(s => s.stats.mean >= 3 && s.stats.mean < 6);
      const lowSectors = sectorsComputed.filter(s => s.stats.mean < 3);

      const questionsComputed = Object.values(questionStats).map(q => ({
        text: q.text,
        avg: q.answerCount > 0 ? (q.totalRisk / q.answerCount) : 0
      })).sort((a, b) => b.avg - a.avg);

      const topCriticalQuestions = questionsComputed.filter(q => q.avg >= 4).slice(0, 3);

      // --- CONSTRUÇÃO DO RELATÓRIO MATEMÁTICO ---
      let report = `# 📊 Relatório Analítico Executivo\n\n`;
      report += `> *Este relatório baseia-se num **Motor Estatístico Determinístico** e não partilha dados com IAs externas.*\n\n---\n\n`;

      // 1. Confiabilidade da Pesquisa (Alfa de Cronbach)
      report += `## 1. Confiabilidade dos Dados (Alfa de Cronbach)\n\n`;
      report += `O Alfa de Cronbach (α) calcula a **consistência interna** das respostas. Um questionário confiável garante que os problemas relatados são consistentes.\n\n`;
      if (submissionsMatrix.length >= 2 && survey.questions.length >= 2) {
        report += `- **Índice Alfa (α):** \`${cronbachAlpha.toFixed(3)}\`\n`;
        report += `- **Classificação:** ${alphaInterpretation}\n\n`;
        report += `> 💡 **O que isso significa?** ${alphaExplanation}\n\n`;
      } else {
        report += `> *(Amostra insuficiente para calcular o Alfa de Cronbach. São necessárias no mínimo 2 respostas completas).* \n\n`;
      }

      // 2. Visão Geral
      report += `---\n\n## 2. Visão Global da Empresa\n\n`;
      report += `A média de risco psicossocial global é de **${globalStats.mean.toFixed(2)}/9**. `;
      
      if (globalStats.mean >= 6) {
        report += `🔴 **Status Crítico:** Sugere que o ambiente de trabalho geral está a gerar forte desgaste emocional ou sobrecarga.\n\n`;
      } else if (globalStats.mean >= 3) {
        report += `🟡 **Status de Atenção:** Sugere que há pontos de atrito no dia a dia que podem escalar se não forem acompanhados.\n\n`;
      } else if (globalStats.mean > 0) {
        report += `🟢 **Status Saudável:** Demonstra que, de forma geral, o ambiente apresenta riscos controlados.\n\n`;
      } else {
        report += `*(Ainda não há dados suficientes para uma média geral consistente).* \n\n`;
      }

      // Alerta de Polarização Global
      if (globalStats.isPolarized) {
        report += `> ⚠️ **Aviso de Polarização Global:** O Desvio Padrão é alto (\`${globalStats.standardDeviation.toFixed(2)}\`). Isso significa que a média geral esconde uma realidade onde há colaboradores em condições excelentes, enquanto outros estão em situação de risco extremo no mesmo ambiente.\n\n`;
      }

      // 3. Análise por Setores
      report += `---\n\n## 3. Análise por Setores\n\n`;
      
      if (criticalSectors.length > 0) {
        report += `**🚨 Setores em Alerta Vermelho (Risco > 6):**\n`;
        criticalSectors.forEach(s => {
          report += `- **${s.sector}** (Média: \`${s.stats.mean.toFixed(2)}\``;
          if (s.stats.isPolarized) report += ` | ⚠️ Polarizado: Desvio Padrão \`${s.stats.standardDeviation.toFixed(2)}\``;
          report += `)\n`;
        });
        report += `\n> 🚨 **Recomendação Imediata:** Intervenção e escuta ativa prioritária nestas equipas.\n\n`;
      } else {
        report += `**✅ Nenhum setor encontra-se em risco crítico** neste levantamento.\n\n`;
      }

      if (mediumSectors.length > 0) {
        report += `**🟡 Setores em Atenção (Risco entre 3 e 6):**\n`;
        mediumSectors.forEach(s => {
          report += `- **${s.sector}** (Média: \`${s.stats.mean.toFixed(2)}\``;
          if (s.stats.isPolarized) report += ` | ⚠️ Polarizado`;
          report += `)\n`;
        });
        report += `\n`;
      }

      if (lowSectors.length > 0) {
        report += `**🟢 Setores Saudáveis (Risco < 3):**\n`;
        lowSectors.forEach(s => {
          report += `- **${s.sector}** (Média: \`${s.stats.mean.toFixed(2)}\`)\n`;
        });
        report += `\n`;
      }

      if (sectorsComputed.length === 0) {
        report += `*(Não há dados suficientes divididos por setor).* \n\n`;
      }

      // 4. Fatores Críticos
      report += `---\n\n## 4. Fatores Geradores de Risco (Causa Raiz)\n\n`;
      if (topCriticalQuestions.length > 0) {
        report += `As questões que obtiveram os **piores índices** (maior risco percebido) na pesquisa global foram:\n\n`;
        topCriticalQuestions.forEach((q, i) => {
          report += `**${i + 1}.** *"${q.text}"*\n`;
          report += `└─ Score médio de Risco: \`${q.avg.toFixed(2)}\`\n\n`;
        });
        report += `> 🎯 **Plano de Ação:** Foque a mitigação inicial e a gestão de mudanças nos pontos levantados por estas questões específicas.\n`;
      } else {
        report += `> ✅ Nenhuma questão obteve um score crítico isoladamente nesta pesquisa.\n`;
      }

      report += `\n---\n<small>Gerado em microssegundos com base em **${allDataPoints.length}** dados válidos de **${survey.submissions.length}** formulários analisados via Matemática Nativa.</small>`;

      return res.json({ report });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao gerar relatório determinístico' });
    }
  }
}
