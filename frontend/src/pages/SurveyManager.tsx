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
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', border: '1px solid #22c55e', borderRadius: '8px', backgroundColor: '#f0fdf4', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#166534', marginBottom: '16px' }}>✅ Pesquisa Criada com Sucesso!</h2>
        <p style={{ color: '#15803d', marginBottom: '8px' }}>Compartilhe este link com os colaboradores da sua empresa:</p>
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <input 
            type="text" 
            readOnly 
            value={publicLink} 
            style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #bbf7d0', backgroundColor: '#fff', color: '#111827' }}
          />
          <button 
            onClick={() => { navigator.clipboard.writeText(publicLink); alert("Copiado!"); }}
            style={{ padding: '12px 20px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Copiar Link
          </button>
        </div>

        <div style={{ marginTop: '30px' }}>
          <button onClick={() => setCreatedSurveyId(null)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #16a34a', color: '#16a34a', borderRadius: '6px', cursor: 'pointer' }}>
            Criar nova pesquisa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '28px', color: '#111827', marginBottom: '8px' }}>Nova Pesquisa de Riscos</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Crie um novo formulário de avaliação psicossocial para sua empresa.</p>

      {/* Templates de Pesquisa */}
      <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Usar Template Rápido:</h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => applyTemplate('stress')} style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#2563eb' }}>
            ⚡ Sobrecarga e Estresse
          </button>
          <button type="button" onClick={() => applyTemplate('climate')} style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#16a34a' }}>
            🤝 Clima e Relações
          </button>
          <button type="button" onClick={() => applyTemplate('leadership')} style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#9333ea' }}>
            🗣️ Liderança e Comunicação
          </button>
          <button type="button" onClick={() => applyTemplate('harassment')} style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#ea580c' }}>
            🛡️ Segurança Psicológica
          </button>
          <button type="button" onClick={() => applyTemplate('clear')} style={{ padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#ef4444' }}>
            🗑️ Limpar Formulário
          </button>
        </div>
      </div>

      <form onSubmit={handleCreateSurvey} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Título da Pesquisa *</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Ex: Avaliação de Clima e Carga de Trabalho 2026"
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Descrição / Instruções</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Instruções para os colaboradores..."
            rows={3}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1f2937' }}>Perguntas (Fatores de Risco)</h3>
            <button 
              type="button" 
              onClick={handleAddQuestion}
              style={{ padding: '8px 16px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + Adicionar Pergunta
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questions.map((q, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <input 
                    type="text" 
                    value={q.text} 
                    onChange={e => handleQuestionChange(index, e.target.value)} 
                    placeholder={`Ex: Você se sente sobrecarregado(a) com prazos curtos?`}
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px' }}
                    required
                  />
                </div>
                {questions.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveQuestion(index)}
                    style={{ padding: '12px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    X
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
            backgroundColor: loading ? '#9ca3af' : '#111827',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '16px'
          }}
        >
          {loading ? 'Salvando...' : 'Salvar e Gerar Link de Pesquisa'}
        </button>
      </form>
    </div>
  );
}
