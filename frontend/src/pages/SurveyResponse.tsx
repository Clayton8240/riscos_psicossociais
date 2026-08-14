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
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#22c55e' }}>Obrigado pela sua participação!</h2>
        <p style={{ color: '#4b5563', marginTop: '10px' }}>Suas respostas foram registradas com sucesso e de forma totalmente anônima.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', color: '#111827', marginBottom: '8px' }}>{survey.title}</h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>{survey.description}</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Setor (LGPD - Anônimo) */}
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
            Qual o seu Setor/Departamento? *
          </label>
          <select 
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px' }}
            required
          >
            <option value="" disabled>Selecione seu setor...</option>
            <option value="RH">Recursos Humanos (RH)</option>
            <option value="TI">Tecnologia (TI)</option>
            <option value="Vendas">Vendas / Comercial</option>
            <option value="Operacoes">Operações</option>
            <option value="Financeiro">Financeiro</option>
            <option value="Outros">Outros</option>
          </select>
          <small style={{ display: 'block', marginTop: '8px', color: '#6b7280', fontSize: '12px' }}>
            * Sua resposta é anônima. O setor é usado apenas para análises estatísticas da empresa.
          </small>
        </div>

        {/* Perguntas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {survey.questions.map((q, index) => (
            <div key={q.id} style={{ paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#1f2937' }}>
                {index + 1}. {q.text}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Escala de Probabilidade */}
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#4b5563' }}>Frequência / Probabilidade:</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
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
                          padding: '12px',
                          border: '1px solid',
                          borderColor: answers[q.id]?.prob === val ? '#2563eb' : '#d1d5db',
                          backgroundColor: answers[q.id]?.prob === val ? '#eff6ff' : '#fff',
                          color: answers[q.id]?.prob === val ? '#1d4ed8' : '#374151',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Escala de Impacto */}
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#4b5563' }}>Impacto Emocional (O quanto te afeta):</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
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
                          padding: '12px',
                          border: '1px solid',
                          borderColor: answers[q.id]?.imp === val ? '#ef4444' : '#d1d5db',
                          backgroundColor: answers[q.id]?.imp === val ? '#fef2f2' : '#fff',
                          color: answers[q.id]?.imp === val ? '#b91c1c' : '#374151',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
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
            padding: '16px',
            backgroundColor: '#111827',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Enviar Respostas (Anônimo)
        </button>
      </form>
    </div>
  );
}
