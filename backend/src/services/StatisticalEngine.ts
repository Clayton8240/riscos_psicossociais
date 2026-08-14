// src/services/StatisticalEngine.ts

export interface RiskDataPoint {
  probability: number;
  impact: number;
}

export interface StatisticalResult {
  mean: number;
  median: number;
  variance: number;
  standardDeviation: number;
  min: number;
  max: number;
  isPolarized: boolean;
}

export class StatisticalEngine {
  
  /**
   * Função auxiliar para calcular a variância populacional de um array numérico.
   */
  private static calculateVariance(values: number[]): number {
    const n = values.length;
    if (n <= 1) return 0; 
    const mean = values.reduce((acc, val) => acc + val, 0) / n;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((acc, val) => acc + val, 0) / n; 
  }

  /**
   * Processa um array de respostas e retorna a análise estatística completa.
   */
  public static analyzeRiskDistribution(dataPoints: RiskDataPoint[]): StatisticalResult {
    if (dataPoints.length === 0) {
      return { mean: 0, median: 0, variance: 0, standardDeviation: 0, min: 0, max: 0, isPolarized: false };
    }

    // Passo 1: Calcular o Risco Individual (P x I) de cada resposta
    const riskScores = dataPoints.map(dp => dp.probability * dp.impact);
    const n = riskScores.length;

    // Passo 2: Média
    const sum = riskScores.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    // Passo 3: Mediana (útil para ignorar outliers)
    const sortedScores = [...riskScores].sort((a, b) => a - b);
    const mid = Math.floor(n / 2);
    const median = n % 2 !== 0 ? sortedScores[mid] : (sortedScores[mid - 1] + sortedScores[mid]) / 2;

    // Passo 4: Variância e Desvio Padrão
    const squaredDifferences = riskScores.map(score => Math.pow(score - mean, 2));
    const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / n;
    const standardDeviation = Math.sqrt(variance);

    // Passo 5: Mínimo e Máximo
    const min = sortedScores[0];
    const max = sortedScores[n - 1];

    // Regra de Negócio: Se o desvio padrão for maior que 2.5 numa escala de 1 a 9, a equipe está polarizada.
    const isPolarized = standardDeviation > 2.5;

    return {
      mean: Number(mean.toFixed(2)),
      median: Number(median.toFixed(2)),
      variance: Number(variance.toFixed(2)),
      standardDeviation: Number(standardDeviation.toFixed(2)),
      min,
      max,
      isPolarized
    };
  }

  /**
   * Calcula o Alfa de Cronbach para medir a consistência interna do questionário.
   * @param submissions Uma matriz onde cada linha é um colaborador (submission) 
   *                    e cada coluna é o Risco (P x I) de uma pergunta específica.
   */
  public static calculateCronbachAlpha(submissions: number[][]): number {
    // É necessário ter pelo menos 2 respondentes para calcular a variância
    if (!submissions || submissions.length < 2) return 0;

    const k = submissions[0].length; // Número de itens (perguntas)
    
    // O Alfa de Cronbach requer pelo menos 2 itens para medir consistência interna
    if (k < 2) return 0;

    // Passo 1: Calcular a variância das notas de cada pergunta individualmente e somá-las
    let sumOfItemVariances = 0;
    for (let i = 0; i < k; i++) {
      // Extrai todas as respostas dadas para a pergunta 'i'
      const itemScores = submissions.map(sub => sub[i] || 0);
      sumOfItemVariances += this.calculateVariance(itemScores);
    }

    // Passo 2: Calcular o escore total de cada respondente e, em seguida, a variância desses totais
    const totalScores = submissions.map(sub => sub.reduce((acc, val) => acc + (val || 0), 0));
    const varianceOfTotalScores = this.calculateVariance(totalScores);

    // Evita divisão por zero caso todos os respondentes tenham dado exatamente as mesmas notas
    if (varianceOfTotalScores === 0) return 0;

    // Passo 3: Aplicar a fórmula do Alfa de Cronbach
    const alpha = (k / (k - 1)) * (1 - (sumOfItemVariances / varianceOfTotalScores));

    return Number(alpha.toFixed(3));
  }
}
