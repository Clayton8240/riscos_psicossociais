import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Radar, RadarChart, PolarGrid,
  PolarAngleAxis, ResponsiveContainer
} from 'recharts';
import { Calendar, Flag, XCircle, FileText, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Card = ({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) => (
  <div style={{
    backgroundColor: '#1E2638',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    ...style
  }}>
    {children}
  </div>
);

const CardTitle = ({ title, extra }: { title: string, extra?: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
    {extra || <div style={{ color: 'var(--text-muted)' }}>⋮</div>}
  </div>
);

export function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data for list view
  const [surveys, setSurveys] = useState<any[]>([]);

  // Data for single survey view
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [report, setReport] = useState<string>('');

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (!id) {
      // Fetch surveys list
      fetch(`${apiUrl}/surveys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setSurveys(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    } else {
      // Fetch analytics for specific survey
      const fetchAnalytics = fetch(`${apiUrl}/analytics/surveys/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      const fetchReport = fetch(`${apiUrl}/analytics/surveys/${id}/report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      Promise.all([fetchAnalytics, fetchReport])
        .then(([analyticsRes, reportRes]) => {
          setAnalyticsData(analyticsRes);
          if (reportRes && reportRes.report) {
            setReport(reportRes.report);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, navigate]);

  if (loading) {
    return <div style={{ color: 'var(--text-primary)' }}>Carregando dados do dashboard...</div>;
  }

  if (!id) {
    // List view
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
        <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '600', color: '#E2E8F0' }}>Meus Dashboards</h2>
        <p style={{ color: 'var(--text-muted)' }}>Selecione uma pesquisa abaixo para visualizar a análise completa e 100% anônima.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {surveys.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>Nenhuma pesquisa encontrada.</div>
          ) : (
            surveys.map((survey: any) => (
              <Card key={survey.id} style={{ cursor: 'pointer', transition: 'all 0.2s' }} >
                <div onClick={() => navigate(`/dashboard/${survey.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(0,255,133,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <FileText size={20} />
                    </div>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '16px' }}>{survey.title}</h3>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Criado em: {new Date(survey.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  // Dashboard View (Single Survey)
  
  if (!analyticsData || analyticsData.error) {
    return (
      <div style={{ color: 'var(--text-primary)' }}>
        {analyticsData?.error || 'Erro ao carregar dados do dashboard.'}
        <br/><br/>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', background: 'var(--primary)', color: 'var(--bg-card)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Voltar</button>
      </div>
    );
  }

  const hasData = analyticsData.totalValidMatrixResponses > 0;

  // Radar data mapped from riskBySector (sectors as axes)
  const radarData = hasData ? analyticsData.riskBySector?.map((r: any) => ({
    subject: r.sector.substring(0, 15), // Trucate long sector names
    A: r.averageRiskScore, // Real risk score
    fullMark: 9 // Maximum risk score
  })) : [
    { subject: 'TI', A: 0, fullMark: 9 },
    { subject: 'RH', A: 0, fullMark: 9 },
    { subject: 'Comercial', A: 0, fullMark: 9 },
    { subject: 'Operacional', A: 0, fullMark: 9 },
    { subject: 'Admin', A: 0, fullMark: 9 },
  ];

  // Critical alerts
  const criticalSectors = hasData ? analyticsData.riskBySector?.filter((r: any) => r.averageRiskScore >= 6) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, paddingBottom: '40px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>← Voltar aos Dashboards</button>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '600', color: '#E2E8F0' }}>{analyticsData.surveyTitle || 'Overview'}</h2>
        </div>
        <button style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          backgroundColor: 'rgba(0,255,133,0.15)', color: 'var(--primary)', 
          border: '1px solid rgba(0,255,133,0.3)', padding: '8px 16px', borderRadius: '6px', fontWeight: '500' 
        }}>
          <Calendar size={16} />
          Análise de Risco
        </button>
      </div>

      {/* Top Cards: Participation & Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* Survey Participation */}
        <Card style={{ justifyContent: 'center' }}>
          <CardTitle title="PARTICIPAÇÃO NA PESQUISA" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '6px solid', borderColor: hasData ? 'var(--primary)' : 'var(--text-muted)', borderRightColor: 'rgba(255,255,255,0.1)' }}>
            </div>
            <div>
              <div style={{ fontSize: '42px', fontWeight: '800', color: 'white', lineHeight: '1' }}>{analyticsData.totalSubmissions}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Respostas Totais (100% Anônimas)</div>
            </div>
          </div>
        </Card>

        {/* Key Alerts & Action Items */}
        <Card>
           <CardTitle title="ALERTAS CRÍTICOS & SETORES DE RISCO" />
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '8px', maxHeight: '120px' }}>
              {!hasData ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Aguardando coleta de dados para emitir alertas.</div>
              ) : criticalSectors.length === 0 ? (
                <div style={{ color: 'var(--primary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}/> Nenhum setor em estado de alerta vermelho.
                </div>
              ) : (
                criticalSectors.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #EF4444' }}>
                    <div style={{ color: '#EF4444', marginTop: '2px' }}><Flag size={18} fill={'#EF4444'} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444', marginBottom: '2px' }}>Atenção Imediata: Setor {item.sector}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Média de Risco Elevada: {item.averageRiskScore} / 9</div>
                    </div>
                  </div>
                ))
              )}
           </div>
        </Card>

      </div>

      {/* Main Analysis Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* Radar Chart: Risk by Sector */}
        <Card>
          <CardTitle title="MAPEAMENTO DE RISCO POR SETOR" />
          <div style={{ flex: 1, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }} />
                <Radar name="Nível de Risco" dataKey="A" stroke="var(--primary)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '3px', backgroundColor: 'var(--primary)' }}/> Risco Atual</span>
          </div>
        </Card>

        {/* AI Deterministic Report */}
        <Card style={{ overflow: 'hidden' }}>
          <CardTitle 
            title="RELATÓRIO ANALÍTICO EXECUTIVO" 
            extra={<div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '13px', fontWeight: '500', backgroundColor: 'rgba(0,255,133,0.1)', padding: '4px 10px', borderRadius: '12px' }}><BrainCircuit size={16} /> Análise Computacional</div>} 
          />
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '12px', maxHeight: '500px' }} className="markdown-report">
            {report ? (
              <ReactMarkdown>{report}</ReactMarkdown>
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>O relatório será gerado automaticamente quando houverem dados suficientes.</div>
            )}
          </div>
        </Card>

      </div>
      
      {/* Styles for markdown content */}
      <style>{`
        .markdown-report {
          color: var(--text-secondary);
          font-size: 14.5px;
          line-height: 1.6;
        }
        .markdown-report h1, .markdown-report h2, .markdown-report h3 {
          color: #E2E8F0;
          margin-top: 24px;
          margin-bottom: 12px;
          font-weight: 600;
        }
        .markdown-report h1 { font-size: 20px; }
        .markdown-report h2 { font-size: 18px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }
        .markdown-report p { margin-bottom: 16px; }
        .markdown-report ul { margin-bottom: 16px; padding-left: 20px; }
        .markdown-report li { margin-bottom: 8px; }
        .markdown-report blockquote {
          border-left: 4px solid var(--primary);
          background: rgba(0,255,133,0.05);
          padding: 12px 16px;
          margin: 0 0 16px 0;
          border-radius: 0 8px 8px 0;
          color: var(--text-primary);
        }
        .markdown-report code {
          background: rgba(255,255,255,0.1);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--primary);
          font-family: monospace;
          font-weight: bold;
        }
        .markdown-report hr {
          border: 0;
          height: 1px;
          background: rgba(255,255,255,0.1);
          margin: 24px 0;
        }
      `}</style>
    </div>
  );
}
