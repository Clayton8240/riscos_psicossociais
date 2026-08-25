import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { RiskMatrix, RiskData } from '../components/RiskMatrix';
import { exportToCSV } from '../utils/exportCSV';

interface AnalyticsPayload {
  surveyTitle: string;
  totalSubmissions: number;
  totalValidMatrixResponses: number;
  riskBySector: RiskData[];
}

export function Dashboard() {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  const handleGenerateReport = async () => {
    if (!id) return;
    setLoadingReport(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/analytics/surveys/${id}/report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const json = await response.json();
        setAiReport(json.report);
      } else {
        alert('Erro ao gerar relatório.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão ao gerar relatório.');
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    async function fetchDashboardData() {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const token = localStorage.getItem('token');
      
      try {
        if (id) {
          // Busca analytics da pesquisa
          const response = await fetch(`${apiUrl}/analytics/surveys/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const json = await response.json();
            setData(json);
          }
        } else {
          // Busca lista de pesquisas
          const response = await fetch(`${apiUrl}/surveys`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const list = await response.json();
            setSurveys(list);
          }
        }
      } catch (error) {
        console.error("Erro de conexão", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [id]);

  const handleDeleteSurvey = async (surveyId: string) => {
    if (!window.confirm("Tem certeza que deseja apagar esta pesquisa e todas as suas respostas?")) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/surveys/${surveyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Remover da lista local
        setSurveys(prev => prev.filter(s => s.id !== surveyId));
      } else {
        alert("Erro ao deletar a pesquisa.");
      }
    } catch (error) {
      console.error("Erro ao deletar", error);
      alert("Erro de conexão ao deletar a pesquisa.");
    }
  };

  const handleCopyLink = (surveyId: string) => {
    const publicUrl = `${window.location.origin}/survey/${surveyId}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      alert('Link público copiado para a área de transferência!');
    }).catch(() => {
      alert('Falha ao copiar o link. Você pode copiar manualmente: ' + publicUrl);
    });
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Carregando Dashboard...</div>;
  }

  // Visualização de Lista de Pesquisas
  if (!id) {
    return (
      <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="responsive-flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', color: 'var(--primary-dark)', margin: '0 0 8px 0', fontWeight: '800' }}>Dashboard Analítico</h1>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '16px' }}>Selecione uma pesquisa para ver os resultados.</p>
            </div>
            <button 
              onClick={() => navigate('/surveys/manager')}
              style={{ padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'var(--bg-card)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '16px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
            >
              + Nova Pesquisa
            </button>
          </div>

        {surveys.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px dashed var(--border-color-dark)' }}>
            Nenhuma pesquisa encontrada. Crie sua primeira pesquisa para começar.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {surveys.map(survey => (
              <div key={survey.id} className="responsive-flex mobile-p-16" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '24px', border: 'none', borderRadius: '12px', backgroundColor: 'var(--bg-card)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary-dark)', fontSize: '20px' }}>{survey.title}</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                    Respostas: <strong style={{ color: 'var(--text-secondary)' }}>{survey._count?.submissions || 0}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => handleCopyLink(survey.id)}
                    style={{ padding: '8px 16px', backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s' }}
                  >
                    🔗 Copiar Link
                  </button>
                  <button 
                    onClick={() => navigate(`/dashboard/${survey.id}`)}
                    style={{ padding: '8px 16px', backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Ver Resultados
                  </button>
                  <button 
                    onClick={() => handleDeleteSurvey(survey.id)}
                    style={{ padding: '8px 16px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Visualização do Analytics (se tem ID mas não achou os dados)
  if (!data) {
    return <div style={{ padding: '40px', color: 'red', fontFamily: 'sans-serif' }}>Nenhum dado encontrado para esta pesquisa.</div>;
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '24px', padding: 0, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          &larr; Voltar para as pesquisas
        </button>

        <div className="responsive-flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '32px', color: 'var(--primary-dark)', margin: 0, fontWeight: '800' }}>
            {data.surveyTitle}
          </h1>
          <button 
            onClick={() => {
              const headers = ['Setor', 'Score de Probabilidade', 'Score de Impacto', 'Fator de Risco', 'Nível de Risco', 'Total de Respostas (Setor)'];
              const csvData = data.riskBySector.map((r: any) => [
                r.sector,
                (r.averageProbability || r.avgProbability || 0).toFixed(2),
                (r.averageImpact || r.avgImpact || 0).toFixed(2),
                (r.score || r.riskFactor || 0).toFixed(2),
                r.riskLevel,
                r.count || r.totalSubmissions || 0
              ]);
              exportToCSV(`riscos_${data.surveyTitle.replace(/\\s+/g, '_')}.csv`, headers, csvData);
            }}
            style={{ padding: '10px 16px', backgroundColor: 'var(--success)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            Exportar Resultados CSV
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '16px' }}>
          Visão geral dos Riscos Psicossociais na Empresa
        </p>

        {/* Cards de Resumo */}
        <div className="responsive-grid-2" style={{ marginBottom: '48px' }}>
          <div style={{ padding: '32px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--text-muted)', margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total de Submissões</h4>
            <p style={{ fontSize: '48px', fontWeight: '900', margin: 0, color: 'var(--primary-dark)', lineHeight: '1' }}>
              {data.totalSubmissions}
            </p>
          </div>
          <div style={{ padding: '32px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--text-muted)', margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Formulários Válidos</h4>
            <p style={{ fontSize: '48px', fontWeight: '900', margin: 0, color: 'var(--primary-dark)', lineHeight: '1' }}>
              {data.totalValidMatrixResponses}
            </p>
          </div>
        </div>

      {/* Componente Visual: A Matriz de Risco (Probabilidade x Impacto) */}
      <RiskMatrix data={data.riskBySector} />

      <div style={{ marginTop: '48px', padding: '32px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div className="responsive-flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: '800' }}>
            <span style={{ fontSize: '28px' }}>🧠</span> Relatório Analítico
          </h3>
          <button 
            onClick={() => setShowMethodology(true)}
            style={{ padding: '8px 16px', backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
            title="Aprenda sobre o Alfa de Cronbach e Desvio Padrão"
          >
            ⓘ Metodologia e Cálculos
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '15px' }}>
          Gere um relatório analítico profundo sobre os dados desta pesquisa. O relatório destaca os pontos críticos e fornece insights estatísticos rigorosos baseados em psicometria.
        </p>
        
        {!aiReport && (
          <button 
            onClick={handleGenerateReport}
            disabled={loadingReport}
            style={{ 
              padding: '14px 28px', 
              backgroundColor: 'var(--primary)', 
              color: 'var(--bg-card)', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: loadingReport ? 'not-allowed' : 'pointer', 
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
            }}
          >
            {loadingReport ? 'Analisando dados...' : 'Gerar Relatório Analítico'}
          </button>
        )}

        {loadingReport && <p style={{ color: 'var(--primary)', fontWeight: '600' }}>Analisando dados...</p>}
        {aiReport && (
          <div style={{ marginTop: '24px', padding: '32px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7' }}>
            <ReactMarkdown>{aiReport}</ReactMarkdown>
          </div>
        )}
      </div>

      {showMethodology && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(17, 24, 39, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '16px', maxWidth: '650px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '24px', fontWeight: '800' }}>Metodologia Estatística 📐</h2>
              <button onClick={() => setShowMethodology(false)} style={{ border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: 'var(--text-placeholder)', display: 'flex', padding: 0 }}>✖</button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '16px', marginBottom: '32px' }}>
              Nosso motor utiliza cálculos matemáticos robustos, garantindo 100% de privacidade offline e precisão clínica para analisar a saúde psicossocial do ambiente.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '16px', fontWeight: '700' }}>1. Risco Populacional (Média μ)</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                Calculamos a média aritmética de todo o grupo cruzando Probabilidade $\\times$ Impacto de cada resposta isolada. Gera um farol direcional: Saudável, Atenção ou Crítico.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '16px', fontWeight: '700' }}>2. Polarização de Equipes (Desvio Padrão σ)</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                Medimos o quanto as respostas se distanciam da média (variância). Se um setor tem uma média "normal", mas o <strong style={{ color: 'var(--text-secondary)' }}>Desvio Padrão é alto</strong>, disparamos um alerta de <strong style={{ color: 'var(--text-secondary)' }}>Polarização</strong>: isso significa que metade do time está perfeitamente bem, e a outra metade está à beira de um burnout silencioso.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '16px', fontWeight: '700' }}>3. Confiabilidade (Alfa de Cronbach α)</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                Utilizado na psicometria, o Alfa de Cronbach mede a consistência interna das respostas (variando de 0 a 1). Se as pessoas dão respostas muito incoerentes para o mesmo fator gerador de estresse, o Alfa cai.
                <br/><br/>
                <span style={{ display: 'inline-block', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', marginRight: '8px' }}>&ge; 0.8: Excelente</span> 
                <span style={{ display: 'inline-block', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}>&lt; 0.6: Inaceitável</span>
              </p>
            </div>

            <div style={{ marginTop: '32px', padding: '16px 20px', backgroundColor: 'var(--bg-hover)', borderRadius: '8px', borderLeft: '4px solid var(--primary-dark)' }}>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Auditoria Rigorosa:</strong> Nenhuma matriz de risco é enviada para servidores de Inteligência Artificial em nuvem. Todo o processamento é interno e imutável.
              </p>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowMethodology(false)}
                style={{ padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'var(--bg-card)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}
              >
                Fechar Metodologia
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
