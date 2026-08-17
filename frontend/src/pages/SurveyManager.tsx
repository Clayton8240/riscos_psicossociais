import React, { useState } from 'react';

export function SurveyManager() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{ text: '' }]);
  
  const applyTemplate = (templateId: string) => {
    if (templateId === 'stress') {
      setTitle('Avaliação de Sobrecarga e Estresse');
      setDescription('Responda com sinceridade. O questionário é 100% anônimo.');
      setQuestions([
        { text: 'Você sente que o volume de trabalho exigido é maior do que o tempo disponível?' },
        { text: 'A cobrança por metas irreais tem afetado seu sono ou sua saúde?' },
        { text: 'Você se sente incapaz de desligar dos problemas do trabalho quando está em casa?' },
        { text: 'As ferramentas/sistemas da empresa dificultam o seu trabalho em vez de ajudar?' },
        { text: 'Você se sente inseguro(a) em relação à estabilidade do seu emprego atual?' }
      ]);
    } else if (templateId === 'climate') {
      setTitle('Pesquisa de Clima e Relações Interpessoais');
      setDescription('Pesquisa focada no ambiente de trabalho e nas interações diárias.');
      setQuestions([
        { text: 'Você se sente confortável para expressar suas opiniões sem medo de retaliação?' },
        { text: 'Ocorrem situações de fofocas ou isolamento intencional no seu setor?' },
        { text: 'Seu gestor direto oferece apoio ou feedback construtivo quando você precisa?' },
        { text: 'Você já presenciou ou sofreu comentários desrespeitosos sobre sua vida pessoal?' },
        { text: 'Você sente que existe favoritismo nas promoções ou distribuição de tarefas?' }
      ]);
    } else if (templateId === 'leadership') {
      setTitle('Avaliação de Liderança e Comunicação');
      setDescription('Nos ajude a entender como está a liderança e a clareza na comunicação da empresa.');
      setQuestions([
        { text: 'A comunicação sobre mudanças e decisões importantes da empresa é clara e transparente?' },
        { text: 'Seu gestor direto está acessível quando você precisa discutir problemas do dia a dia?' },
        { text: 'Você recebe feedbacks regulares que ajudam no seu desenvolvimento profissional?' },
        { text: 'Você sente que suas ideias e sugestões são ouvidas e valorizadas pela liderança?' },
        { text: 'As expectativas sobre o seu trabalho e suas metas são comunicadas de forma clara?' },
        { text: 'A liderança da empresa age de forma ética e alinhada com os valores da organização?' }
      ]);
    } else if (templateId === 'harassment') {
      setTitle('Pesquisa de Segurança Psicológica e Assédio');
      setDescription('Pesquisa confidencial para identificar possíveis casos de assédio moral, sexual ou falta de segurança psicológica.');
      setQuestions([
        { text: 'Você já sofreu ou presenciou gritos, humilhações ou xingamentos no ambiente de trabalho?' },
        { text: 'Você se sente seguro(a) para reportar comportamentos inadequados sem sofrer represálias?' },
        { text: 'Piadas ou comentários de cunho preconceituoso (gênero, raça, orientação sexual) são tolerados no seu setor?' },
        { text: 'Ocorrem situações de assédio sexual ou investidas inapropriadas no ambiente de trabalho?' },
        { text: 'Você sente que precisa esconder quem você realmente é para ser aceito(a) na empresa?' },
        { text: 'Os líderes da empresa intervêm quando percebem atitudes de desrespeito entre a equipe?' },
        { text: 'A empresa leva a sério e pune atitudes que configuram assédio moral ou discriminação?' }
      ]);
    } else if (templateId === 'clear') {
      setTitle('');
      setDescription('');
      setQuestions([{ text: '' }]);
    }
  };

  const [loading, setLoading] = useState(false);
  const [createdSurveyId, setCreatedSurveyId] = useState<string | null>(null);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '' }]);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQs = [...questions];
    newQs[index].text = value;
    setQuestions(newQs);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQs = questions.filter((_, i) => i !== index);
    setQuestions(newQs);
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Título é obrigatório.");
    if (questions.some(q => !q.text.trim())) return alert("Todas as perguntas devem ter texto.");

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const token = localStorage.getItem('token'); // Presumindo token do RH logado

      const response = await fetch(`${apiUrl}/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          questions: questions.map(q => ({ text: q.text, type: 'PROBABILITY_IMPACT' }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedSurveyId(data.id);
      } else {
        const err = await response.json();
        alert(err.error || "Erro ao criar pesquisa");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  if (createdSurveyId) {
    const publicLink = `${window.location.origin}/survey/${createdSurveyId}`;
    return (
      <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', border: 'none', borderRadius: '16px', backgroundColor: '#ffffff', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.1), 0 4px 6px -2px rgba(16, 185, 129, 0.05)' }}>
          <h2 style={{ color: '#065f46', marginBottom: '16px', fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '28px' }}>✅</span> Pesquisa Criada com Sucesso!
          </h2>
          <p style={{ color: '#047857', marginBottom: '8px', fontSize: '16px' }}>Compartilhe este link com os colaboradores da sua empresa:</p>
          
          <div className="responsive-flex" style={{ marginTop: '24px' }}>
            <input 
              type="text" 
              readOnly 
              value={publicLink} 
              style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #a7f3d0', backgroundColor: '#f0fdf4', color: '#065f46', fontSize: '15px', fontWeight: '500' }}
            />
            <button 
              onClick={() => { navigator.clipboard.writeText(publicLink); alert("Copiado!"); }}
              style={{ padding: '14px 24px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}
            >
              Copiar Link
            </button>
          </div>

          <div className="responsive-flex" style={{ marginTop: '40px', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                setCreatedSurveyId(null);
                setTitle('');
                setDescription('');
                setQuestions([{ text: '' }]);
              }} 
              style={{ padding: '12px 24px', background: 'transparent', border: '2px solid #10b981', color: '#10b981', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}
            >
              + Criar nova pesquisa
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              style={{ padding: '12px 24px', background: '#312e81', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}
            >
              Ir para o Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '24px', padding: 0, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '15px' }}
        >
          &larr; Voltar para o Dashboard
        </button>

        <h1 style={{ fontSize: '32px', color: '#312e81', marginBottom: '8px', fontWeight: '800' }}>Nova Pesquisa de Riscos</h1>
        <p style={{ color: '#6b7280', marginBottom: '40px', fontSize: '16px' }}>Crie um novo formulário de avaliação psicossocial para sua empresa.</p>

        {/* Templates de Pesquisa */}
        <div style={{ marginBottom: '40px', padding: '24px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#312e81', fontSize: '16px', fontWeight: '700' }}>Usar Template Rápido:</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => applyTemplate('stress')} style={{ padding: '10px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#1d4ed8', fontSize: '14px' }}>
              ⚡ Sobrecarga e Estresse
            </button>
            <button type="button" onClick={() => applyTemplate('climate')} style={{ padding: '10px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#047857', fontSize: '14px' }}>
              🤝 Clima e Relações
            </button>
            <button type="button" onClick={() => applyTemplate('leadership')} style={{ padding: '10px 16px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#7e22ce', fontSize: '14px' }}>
              🗣️ Liderança e Comunicação
            </button>
            <button type="button" onClick={() => applyTemplate('harassment')} style={{ padding: '10px 16px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#c2410c', fontSize: '14px' }}>
              🛡️ Segurança Psicológica
            </button>
            <button type="button" onClick={() => applyTemplate('clear')} style={{ padding: '10px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#b91c1c', fontSize: '14px' }}>
              🗑️ Limpar Formulário
            </button>
          </div>
        </div>

        <form onSubmit={handleCreateSurvey} style={{ display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151', fontSize: '15px' }}>Título da Pesquisa *</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Ex: Avaliação de Clima e Carga de Trabalho 2026"
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', outlineColor: '#2563eb' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151', fontSize: '15px' }}>Descrição / Instruções</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Instruções para os colaboradores..."
              rows={3}
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', fontFamily: 'inherit', outlineColor: '#2563eb' }}
            />
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '32px', marginTop: '8px' }}>
            <div className="responsive-flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: '#312e81', fontSize: '18px', fontWeight: '700' }}>Perguntas (Fatores de Risco)</h3>
              <button 
                type="button" 
                onClick={handleAddQuestion}
                style={{ padding: '10px 16px', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                + Adicionar Pergunta
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questions.map((q, index) => (
                <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '14px', left: '16px', color: '#9ca3af', fontWeight: '600', fontSize: '14px' }}>
                      {index + 1}.
                    </div>
                    <input 
                      type="text" 
                      value={q.text} 
                      onChange={e => handleQuestionChange(index, e.target.value)} 
                      placeholder={`Ex: Você se sente sobrecarregado(a) com prazos curtos?`}
                      style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', outlineColor: '#2563eb' }}
                      required
                    />
                  </div>
                  {questions.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveQuestion(index)}
                      style={{ padding: '14px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Remover pergunta"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '16px',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '24px',
              boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
            }}
          >
            {loading ? 'Salvando...' : 'Salvar e Gerar Link de Pesquisa'}
          </button>
        </form>
      </div>
    </div>
  );
}
