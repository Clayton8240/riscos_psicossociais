import React, { useState, useEffect } from 'react';

interface ActionPlan {
  id: string;
  title: string;
  description: string | null;
  responsible: string;
  deadline: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  sector: string;
}

export function ActionPlans() {
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [responsible, setResponsible] = useState('');
  const [deadline, setDeadline] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
  const token = localStorage.getItem('token'); // Presumindo token do RH

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/action-plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Erro ao buscar planos de ação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/action-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, responsible, deadline, sector })
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setSector('');
        setResponsible('');
        setDeadline('');
        fetchPlans(); // Recarrega a lista
      } else {
        alert('Erro ao criar plano de ação');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${apiUrl}/action-plans/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchPlans();
      }
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este plano?')) return;
    try {
      const res = await fetch(`${apiUrl}/action-plans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchPlans();
      }
    } catch (error) {
      alert('Erro ao deletar plano');
    }
  };

  // Separação em colunas Kanban
  const openPlans = plans.filter(p => p.status === 'OPEN');
  const inProgressPlans = plans.filter(p => p.status === 'IN_PROGRESS');
  const resolvedPlans = plans.filter(p => p.status === 'RESOLVED');

  const renderCard = (plan: ActionPlan) => (
    <div key={plan.id} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '16px' }}>{plan.title}</h4>
      <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '14px' }}>{plan.description}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#4b5563', marginBottom: '16px' }}>
        <span><strong>Setor:</strong> {plan.sector}</span>
        <span><strong>Responsável:</strong> {plan.responsible}</span>
        <span><strong>Prazo:</strong> {new Date(plan.deadline).toLocaleDateString()}</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {plan.status === 'OPEN' && (
          <button onClick={() => updateStatus(plan.id, 'IN_PROGRESS')} style={{ flex: 1, padding: '8px', backgroundColor: '#eab308', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
            Mover para Andamento
          </button>
        )}
        {plan.status === 'IN_PROGRESS' && (
          <button onClick={() => updateStatus(plan.id, 'RESOLVED')} style={{ flex: 1, padding: '8px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
            Concluir Plano
          </button>
        )}
        <button onClick={() => handleDelete(plan.id)} style={{ padding: '8px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
          Excluir
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '28px', color: '#111827', marginBottom: '8px' }}>Gestão de Planos de Ação</h1>
      <p style={{ color: '#6b7280', marginBottom: '40px' }}>Atue sobre os riscos identificados na sua matriz.</p>

      {/* Formulário de Criação */}
      <div style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '40px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Adicionar Novo Plano</h3>
        <form onSubmit={handleCreatePlan} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Título da Ação *</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Treinamento de Gestão de Tempo" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Descrição *</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Setor Afetado *</label>
            <input required type="text" value={sector} onChange={e => setSector(e.target.value)} placeholder="Ex: Operações" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Responsável *</label>
            <input required type="text" value={responsible} onChange={e => setResponsible(e.target.value)} placeholder="Nome do Líder/RH" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Prazo Limite *</label>
            <input required type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Salvar Plano
            </button>
          </div>
        </form>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'flex', gap: '24px' }}>
        
        {/* Coluna Abertos */}
        <div style={{ flex: 1, backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ color: '#374151', margin: '0 0 16px 0', borderBottom: '2px solid #9ca3af', paddingBottom: '8px' }}>
            À Fazer ({openPlans.length})
          </h3>
          {openPlans.map(renderCard)}
        </div>

        {/* Coluna Em Andamento */}
        <div style={{ flex: 1, backgroundColor: '#fefce8', padding: '16px', borderRadius: '12px', border: '1px solid #fef08a' }}>
          <h3 style={{ color: '#854d0e', margin: '0 0 16px 0', borderBottom: '2px solid #facc15', paddingBottom: '8px' }}>
            Em Andamento ({inProgressPlans.length})
          </h3>
          {inProgressPlans.map(renderCard)}
        </div>

        {/* Coluna Concluídos */}
        <div style={{ flex: 1, backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
          <h3 style={{ color: '#166534', margin: '0 0 16px 0', borderBottom: '2px solid #4ade80', paddingBottom: '8px' }}>
            Concluídos ({resolvedPlans.length})
          </h3>
          {resolvedPlans.map(renderCard)}
        </div>

      </div>
    </div>
  );
}
