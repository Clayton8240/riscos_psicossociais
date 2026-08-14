import React from 'react';

// Tipagem dos dados retornados pela API (AnalyticsController)
export interface RiskData {
  sector: string;
  averageProbability: number;
  averageImpact: number;
  averageRiskScore: number;
  riskLevel: string;
  responseCount: number;
}

interface RiskMatrixProps {
  data: RiskData[];
}

export function RiskMatrix({ data }: RiskMatrixProps) {
  // Uma matriz de risco visual clássica (5x5)
  // No eixo X (Probabilidade de 1 a 5)
  // No eixo Y (Impacto de 1 a 5)
  // As bolinhas representam os Setores da empresa.

  const getColorByLevel = (level: string) => {
    switch (level) {
      case 'Alto (Ação imediata)': return '#ef4444'; // Red
      case 'Médio (Melhorar controles)': return '#eab308'; // Yellow
      case 'Baixo (Monitorar)': return '#22c55e'; // Green
      default: return '#9ca3af'; // Gray
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h3 style={{ marginBottom: '16px', color: '#111827' }}>Matriz de Risco Psicossocial por Setor</h3>
      
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Gráfico 3x3 Simulado */}
        <div style={{ position: 'relative', width: '300px', height: '300px', borderLeft: '2px solid #000', borderBottom: '2px solid #000' }}>
          
          {/* Fundo colorido 3x3 */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            opacity: 0.25 // Cores suaves
          }}>
            {/* Linha 3 (Impacto 3) */}
            <div style={{ backgroundColor: '#eab308', border: '1px solid #fff' }} /> {/* P1, I3 (Risco 3 = Médio) */}
            <div style={{ backgroundColor: '#ef4444', border: '1px solid #fff' }} /> {/* P2, I3 (Risco 6 = Alto) */}
            <div style={{ backgroundColor: '#ef4444', border: '1px solid #fff' }} /> {/* P3, I3 (Risco 9 = Alto) */}
            
            {/* Linha 2 (Impacto 2) */}
            <div style={{ backgroundColor: '#22c55e', border: '1px solid #fff' }} /> {/* P1, I2 (Risco 2 = Baixo) */}
            <div style={{ backgroundColor: '#eab308', border: '1px solid #fff' }} /> {/* P2, I2 (Risco 4 = Médio) */}
            <div style={{ backgroundColor: '#ef4444', border: '1px solid #fff' }} /> {/* P3, I2 (Risco 6 = Alto) */}

            {/* Linha 1 (Impacto 1) */}
            <div style={{ backgroundColor: '#22c55e', border: '1px solid #fff' }} /> {/* P1, I1 (Risco 1 = Baixo) */}
            <div style={{ backgroundColor: '#22c55e', border: '1px solid #fff' }} /> {/* P2, I1 (Risco 2 = Baixo) */}
            <div style={{ backgroundColor: '#eab308', border: '1px solid #fff' }} /> {/* P3, I1 (Risco 3 = Médio) */}
          </div>

          {/* Rótulos dos eixos */}
          <div style={{ position: 'absolute', bottom: '-25px', left: '100px', fontWeight: 'bold' }}>Probabilidade (1 a 3)</div>
          <div style={{ position: 'absolute', top: '100px', left: '-120px', fontWeight: 'bold', transform: 'rotate(-90deg)' }}>Impacto (1 a 3)</div>
          
          {data.map((item, index) => {
            // Transformar 1-3 em porcentagem para posicionamento CSS
            const left = ((item.averageProbability - 1) / 2) * 100; // Eixo X
            const bottom = ((item.averageImpact - 1) / 2) * 100;    // Eixo Y

            return (
              <div 
                key={index}
                title={`Setor: ${item.sector}\nRisco: ${item.averageRiskScore}`}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  bottom: `${bottom}%`,
                  width: '16px',
                  height: '16px',
                  backgroundColor: getColorByLevel(item.riskLevel),
                  borderRadius: '50%',
                  transform: 'translate(-50%, 50%)', // Centralizar
                  cursor: 'pointer',
                  border: '2px solid #fff',
                  boxShadow: '0 0 4px rgba(0,0,0,0.3)'
                }}
              />
            );
          })}
        </div>

        {/* Tabela de Legenda/Detalhes */}
        <div>
          <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th style={{ padding: '8px' }}>Setor</th>
                <th style={{ padding: '8px' }}>Risco Médio</th>
                <th style={{ padding: '8px' }}>Status</th>
                <th style={{ padding: '8px' }}>Respostas</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{item.sector}</td>
                  <td style={{ padding: '8px' }}>{item.averageRiskScore}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      color: '#fff', 
                      backgroundColor: getColorByLevel(item.riskLevel),
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {item.riskLevel}
                    </span>
                  </td>
                  <td style={{ padding: '8px' }}>{item.responseCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
