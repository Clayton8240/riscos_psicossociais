import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Question {
  id: string;
  text: string;
  type: string;
}

interface Survey {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  questions: Question[];
  sectors: string[];
}

interface AnswerInput {
  questionId: string;
  probabilityScore: number;
  impactScore: number;
}

export function SurveyResponse() {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [sector, setSector] = useState('');
  const [answers, setAnswers] = useState<Record<string, { prob: number, imp: number }>>({});

  useEffect(() => {
    async function loadSurvey() {
      if (!id) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        const response = await fetch(`${apiUrl}/public/surveys/${id}`);
        if (response.ok) {
          const data = await response.json();
          setSurvey(data);
        } else {
          console.error('Pesquisa não encontrada');
        }
      } catch (err) {
        console.error('Erro de conexão:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSurvey();
  }, [id]);

  const handleAnswerChange = (qId: string, type: 'prob' | 'imp', value: number) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        [type]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !survey) return;

    // Validate if all questions are answered
    if (Object.keys(answers).length < survey.questions.length) {
      alert("Por favor, responda todas as perguntas antes de enviar.");
      return;
    }

    if (!sector) {
      alert("Por favor, selecione seu setor.");
      return;
    }

    const payloadAnswers: AnswerInput[] = Object.entries(answers).map(([qId, val]) => ({
      questionId: qId,
      probabilityScore: val.prob,
      impactScore: val.imp
    }));

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/public/surveys/${id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector, answers: payloadAnswers })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("Erro ao enviar pesquisa.");
      }
    } catch (err) {
      alert("Erro de conexão.");
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando pesquisa...</div>;
  if (!survey) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Pesquisa não encontrada ou inativa.</div>;

  if (submitted) {
    return (
      <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '600px', width: '100%', padding: '48px 32px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ color: 'var(--success-text)', fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>Obrigado pela sua participação!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.6' }}>Suas respostas foram registradas com sucesso e de forma <strong style={{ color: 'var(--primary-dark)' }}>totalmente anônima</strong>.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', color: 'var(--primary-dark)', marginBottom: '12px', fontWeight: '800' }}>{survey.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.6' }}>{survey.description}</p>
        </header>

         <div style={{ backgroundColor: 'var(--primary-bg)', padding: '16px 20px', borderRadius: '12px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: 'var(--primary-hover)', fontSize: '16px', fontWeight: '700' }}>Privacidade e Anonimato Garantidos</h4>
            <p style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '14px', lineHeight: '1.5' }}>
              Suas respostas são <strong>100% confidenciais e anônimas</strong>. O sistema não rastreia IP, e-mail, nome, dispositivo ou qualquer dado que possa identificá-lo. O departamento que você seleciona é utilizado exclusivamente para criar estatísticas agregadas globais da empresa, e não para análises individuais.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Identificação de Setor */}
          <div style={{ padding: '32px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: 'none', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Qual o seu Setor/Departamento? *
            </label>
            <select 
              required
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', fontSize: '16px', outline: 'none', appearance: 'none', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
            >
            <option value="" disabled>Selecione seu setor...</option>
            {survey.sectors && survey.sectors.length > 0 ? (
              survey.sectors.map(s => <option key={s} value={s}>{s}</option>)
            ) : (
              <>
                <option value="Administrativo">Administrativo</option>
                <option value="Operacional">Operacional</option>
                <option value="Comercial">Comercial</option>
                <option value="TI">TI</option>
                <option value="RH">RH</option>
                <option value="Geral">Geral</option>
              </>
            )}
            </select>
          </div>

          {/* Perguntas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {survey.questions.map((q, index) => (
              <div key={q.id} style={{ padding: '32px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '24px', color: 'var(--text-secondary)', fontWeight: '700', lineHeight: '1.4' }}>
                  <span style={{ color: 'var(--primary)', marginRight: '4px' }}>{index + 1}.</span> {q.text}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Escala de Probabilidade */}
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Frequência / Probabilidade:</p>
                  <div className="responsive-flex" style={{ gap: '8px' }}>
                    {[
                      { val: 1, label: "Raramente (1)" },
                      { val: 2, label: "Às vezes (2)" },
                      { val: 3, label: "Sempre (3)" }
                    ].map(({ val, label }) => (
                      <button
                        type="button"
                        key={`prob-${val}`}
                        onClick={() => handleAnswerChange(q.id, 'prob', val)}
                        style={{
                          flex: 1,
                          padding: '14px 8px',
                          border: '2px solid',
                          borderColor: answers[q.id]?.prob === val ? 'var(--primary)' : 'var(--border-color)',
                          backgroundColor: answers[q.id]?.prob === val ? 'var(--primary-bg)' : 'var(--bg-card)',
                          color: answers[q.id]?.prob === val ? 'var(--primary-hover)' : 'var(--text-muted)',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: answers[q.id]?.prob === val ? '0 2px 4px rgba(37,99,235,0.1)' : 'none'
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Escala de Impacto */}
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Impacto Emocional (O quanto te afeta):</p>
                  <div className="responsive-flex" style={{ gap: '8px' }}>
                    {[
                      { val: 1, label: "Pouco (1)" },
                      { val: 2, label: "Médio (2)" },
                      { val: 3, label: "Muito (3)" }
                    ].map(({ val, label }) => (
                      <button
                        type="button"
                        key={`imp-${val}`}
                        onClick={() => handleAnswerChange(q.id, 'imp', val)}
                        style={{
                          flex: 1,
                          padding: '14px 8px',
                          border: '2px solid',
                          borderColor: answers[q.id]?.imp === val ? 'var(--danger)' : 'var(--border-color)',
                          backgroundColor: answers[q.id]?.imp === val ? 'var(--danger-bg)' : 'var(--bg-card)',
                          color: answers[q.id]?.imp === val ? 'var(--danger-text)' : 'var(--text-muted)',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: answers[q.id]?.imp === val ? '0 2px 4px rgba(239,68,68,0.1)' : 'none'
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>

          <button 
            type="submit"
            style={{
              padding: '18px',
              backgroundColor: 'var(--primary)',
              color: 'var(--bg-card)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              marginTop: '8px',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
              transition: 'background-color 0.2s'
            }}
          >
            Enviar Respostas (Anônimo)
          </button>
        </form>
      </div>
    </div>
  );
}
