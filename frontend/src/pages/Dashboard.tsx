import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { RiskMatrix, RiskData } from '../components/RiskMatrix';

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
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: '#1f2937', margin: '0 0 8px 0' }}>Dashboard Analítico</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>Selecione uma pesquisa para ver os resultados.</p>
          </div>
          <button 
            onClick={() => navigate('/surveys/manager')}
            style={{ padding: '10px 20px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Nova Pesquisa
          </button>
        </div>

        {surveys.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
            Nenhuma pesquisa encontrada. Crie sua primeira pesquisa para começar.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {surveys.map(survey => (
              <div key={survey.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#111827' }}>{survey.title}</h3>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Respostas: {survey._count?.submissions || 0}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleCopyLink(survey.id)}
                    style={{ padding: '8px 16px', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    🔗 Copiar Link
                  </button>
                  <button 
                    onClick={() => handleDeleteSurvey(survey.id)}
                    style={{ padding: '8px 16px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Excluir
                  </button>
                  <button 
                    onClick={() => navigate(`/dashboard/${survey.id}`)}
                    style={{ padding: '8px 16px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Ver Resultados
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Visualização do Analytics (se tem ID mas não achou os dados)
  if (!data) {
    return <div style={{ padding: '40px', color: 'red', fontFamily: 'sans-serif' }}>Nenhum dado encontrado para esta pesquisa.</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px', fontFamily: 'sans-serif' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '16px', padding: 0, fontWeight: 'bold' }}
      >
        &larr; Voltar para as pesquisas
      </button>

      <h1 style={{ fontSize: '28px', color: '#1f2937', marginBottom: '8px' }}>
        Dashboard: {data.surveyTitle}
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>
        Visão geral dos Riscos Psicossociais na Empresa
      </p>

      {/* Cards de Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '24px', backgroundColor: '#f3f4f6', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h4 style={{ color: '#4b5563', margin: 0 }}>Total de Submissões</h4>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#111827' }}>
            {data.totalSubmissions}
          </p>
        </div>
        <div style={{ padding: '24px', backgroundColor: '#f3f4f6', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h4 style={{ color: '#4b5563', margin: 0 }}>Formulários Válidos para Matriz</h4>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#111827' }}>
            {data.totalValidMatrixResponses}
          </p>
        </div>
      </div>

      {/* Componente Visual: A Matriz de Risco (Probabilidade x Impacto) */}
      <RiskMatrix data={data.riskBySector} />

      <div style={{ marginTop: '40px', padding: '24px', backgroundColor: '#fdf4ff', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#86198f', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Relatório Analítico
          </h3>
          <button 
            onClick={() => setShowMethodology(true)}
            style={{ padding: '6px 12px', backgroundColor: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            title="Aprenda sobre o Alfa de Cronbach e Desvio Padrão"
          >
            ⓘ Metodologia e Cálculos
          </button>
        </div>
        <p style={{ color: '#701a75', marginBottom: '16px' }}>
          Gere um relatório analítico profundo sobre os dados desta pesquisa. O relatório destaca os pontos críticos e fornece insights estatísticos com base nas respostas dos colaboradores.
        </p>
        
        {!aiReport && (
          <button 
            onClick={handleGenerateReport}
            disabled={loadingReport}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#a21caf', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: loadingReport ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {loadingReport ? 'Analisando dados...' : 'Gerar Relatório Analítico'}
          </button>
        )}

        {loadingReport && <p style={{ color: '#86198f' }}>Analisando dados...</p>}
        {aiReport && (
          <div style={{ marginTop: '24px', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #fbcfe8', color: '#1f2937', fontSize: '15px', lineHeight: '1.6' }}>
            <ReactMarkdown>{aiReport}</ReactMarkdown>
          </div>
        )}
      </div>

      {showMethodology && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: '#111827' }}>Metodologia Estatística 📐</h2>
              <button onClick={() => setShowMethodology(false)} style={{ border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer' }}>✖</button>
            </div>
            
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
              Nosso motor utiliza cálculos matemáticos robustos, garantindo 100% de privacidade offline e precisão clínica, para analisar a saúde psicossocial do ambiente.
            </p>

            <h4 style={{ margin: '16px 0 8px 0', color: '#1f2937' }}>1. Risco Populacional (Média μ)</h4>
            <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>
              Calculamos a média aritmética de todo o grupo cruzando Probabilidade $\\times$ Impacto de cada resposta isolada. 
              Gera um farol direcional: Saudável, Atenção ou Crítico.
            </p>

            <h4 style={{ margin: '16px 0 8px 0', color: '#1f2937' }}>2. Polarização de Equipes (Desvio Padrão σ)</h4>
            <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>
              Medimos o quanto as respostas se distanciam da média (variância). Se um setor tem uma média "normal", mas o <strong>Desvio Padrão é alto</strong>, disparamos um alerta de <strong>Polarização</strong>: isso significa que metade do time está perfeitamente bem, e a outra metade está à beira de um burnout silencioso.
            </p>

            <h4 style={{ margin: '16px 0 8px 0', color: '#1f2937' }}>3. Confiabilidade (Alfa de Cronbach α)</h4>
            <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>
              Utilizado na psicometria, o Alfa de Cronbach mede a consistência interna das respostas (variando de 0 a 1).
              Se as pessoas dão respostas muito incoerentes para o mesmo fator gerador de estresse, o Alfa cai.
              <br/><strong>&ge; 0.8:</strong> Questionário Excelente. <br/><strong>&lt; 0.6:</strong> Inaceitável (As perguntas ou respostas não são precisas).
            </p>

            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                Auditoria Rigorosa: Nenhuma matriz de risco é enviada para servidores de Inteligência Artificial em nuvem. Todo o processamento é interno e imutável.
              </p>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button 
                onClick={() => setShowMethodology(false)}
                style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Fechar Metodologia
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
