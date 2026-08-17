import React, { useState, useEffect } from 'react';
import { exportToCSV } from '../utils/exportCSV';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ActionPlan {
  id: string;
  title: string;
  description: string | null;
  responsible: string;
  deadline: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  sector: string;
  assignedTo?: { id: string; name: string };
  resolutionNotes?: string;
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
  const [assignedToId, setAssignedToId] = useState('');

  const [users, setUsers] = useState<any[]>([]);
  const [role, setRole] = useState('LEADER');
  const [profileSectors, setProfileSectors] = useState<string[]>([]);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
  const token = localStorage.getItem('token'); 

  useEffect(() => {
    fetchProfile();
    fetchUsers();
    fetchPlans();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${apiUrl}/settings/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRole(data.role);
        setProfileSectors(data.sectors || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${apiUrl}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (e) {}
  };

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
        body: JSON.stringify({ title, description, responsible, deadline, sector, assignedToId })
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setSector('');
        setResponsible('');
        setAssignedToId('');
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
    let notes = '';
    if (newStatus === 'RESOLVED') {
      const input = window.prompt('Por favor, insira as observações/resultados da conclusão deste plano de ação:');
      if (input === null) return; // User cancelled
      if (!input.trim()) {
        alert('As observações de conclusão são obrigatórias para finalizar o plano.');
        return;
      }
      notes = input.trim();
    }

    try {
      const bodyPayload: any = { status: newStatus };
      if (notes) {
        bodyPayload.resolutionNotes = notes;
      }

      const res = await fetch(`${apiUrl}/action-plans/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
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
    <div key={plan.id} style={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', transition: 'transform 0.2s', position: 'relative' }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#312e81', fontSize: '18px', fontWeight: '700' }}>{plan.title}</h4>
      <p style={{ margin: '0 0 16px 0', color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>{plan.description}</p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        <span style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          🏢 {plan.sector}
        </span>
        <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          👤 {plan.assignedTo?.name || plan.responsible || 'Sem responsável'}
        </span>
        <span style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          ⏰ {new Date(plan.deadline).toLocaleDateString()}
        </span>
        {plan.resolutionNotes && (
          <div style={{ width: '100%', marginTop: '12px', padding: '8px', backgroundColor: '#d1fae5', borderRadius: '6px', fontSize: '13px', color: '#065f46' }}>
            <strong>Observações:</strong> {plan.resolutionNotes}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {plan.status !== 'RESOLVED' && (
          <button 
            onClick={() => updateStatus(plan.id, plan.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED')} 
            style={{ flex: 1, padding: '10px', backgroundColor: plan.status === 'OPEN' ? '#f59e0b' : '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: `0 2px 4px ${plan.status === 'OPEN' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}` }}
          >
            {plan.status === 'OPEN' ? 'Iniciar' : 'Concluir'}
          </button>
        )}
        {role !== 'LEADER' && (
          <button onClick={() => handleDelete(plan.id)} style={{ padding: '10px 14px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
            Excluir
          </button>
        )}
      </div>
    </div>
  );

  const handleExportCSV = () => {
    const headers = ['ID', 'Título', 'Descrição', 'Setor', 'Responsável (Texto)', 'Atribuído a', 'Prazo', 'Status', 'Observações'];
    const data = plans.map(p => [
      p.id,
      p.title,
      p.description || '',
      p.sector,
      p.responsible || '',
      p.assignedTo?.name || '',
      new Date(p.deadline).toLocaleDateString(),
      p.status,
      p.resolutionNotes || ''
    ]);
    exportToCSV('planos_de_acao.csv', headers, data);
  };

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981']; // OPEN, IN_PROGRESS, RESOLVED

  const getStatusChartData = () => {
    const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
    plans.forEach(p => counts[p.status]++);
    return [
      { name: 'À Fazer', value: counts.OPEN },
      { name: 'Em Andamento', value: counts.IN_PROGRESS },
      { name: 'Concluído', value: counts.RESOLVED }
    ];
  };

  const getSectorChartData = () => {
    const sectors: Record<string, number> = {};
    plans.forEach(p => {
      sectors[p.sector] = (sectors[p.sector] || 0) + 1;
    });
    return Object.entries(sectors).map(([name, count]) => ({ name, count }));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div className="responsive-flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '32px', color: '#312e81', fontWeight: '800' }}>Gestão de Planos de Ação</h1>
        <button 
          onClick={handleExportCSV}
          style={{ padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
        >
          Exportar CSV
        </button>
      </div>
      <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '16px' }}>Atue sobre os riscos identificados na sua matriz e acompanhe o progresso.</p>

      {/* DASHBOARD GRÁFICOS */}
      {plans.length > 0 && (
        <div className="responsive-grid-2" style={{ marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>Status dos Planos</h3>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={getStatusChartData()} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {getStatusChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>Planos por Setor</h3>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={getSectorChartData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="count" fill="#312e81" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de Criação (Só ADMIN vê) */}
      {(role === 'ADMIN' || role === 'SUPERADMIN') && (
        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', border: 'none', marginBottom: '48px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ margin: '0 0 24px 0', color: '#312e81', fontSize: '20px', fontWeight: '700' }}>Adicionar Novo Plano</h3>
          <form onSubmit={handleCreatePlan} className="responsive-grid-2">
            
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Título da Ação *</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Treinamento de Gestão de Tempo" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Descrição *</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'inherit', fontSize: '15px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Setor Afetado *</label>
              <select required value={sector} onChange={e => setSector(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', backgroundColor: '#fff' }}>
                <option value="" disabled>Selecione um setor...</option>
                {profileSectors.length > 0 ? (
                  profileSectors.map(s => <option key={s} value={s}>{s}</option>)
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

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Responsável (Usuário) *</label>
              <select required value={assignedToId} onChange={e => {
                setAssignedToId(e.target.value);
                const u = users.find(u => u.id === e.target.value);
                if (u) setResponsible(u.name);
              }} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }}>
                <option value="">Selecione um líder...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Prazo Limite *</label>
              <input required type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
                + Salvar Plano
              </button>
            </div>
          </form>
        </div>
        )}

        {/* Kanban Board */}
        <div className="responsive-grid-3" style={{ alignItems: 'flex-start' }}>
          
          {/* Coluna Abertos */}
          <div style={{ flex: 1, backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '16px', minHeight: '400px' }}>
            <h3 style={{ color: '#475569', margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between' }}>
              À Fazer <span style={{ backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '9999px', fontSize: '14px' }}>{openPlans.length}</span>
            </h3>
            {openPlans.map(renderCard)}
          </div>

          {/* Coluna Em Andamento */}
          <div style={{ flex: 1, backgroundColor: '#fef3c7', padding: '20px', borderRadius: '16px', minHeight: '400px' }}>
            <h3 style={{ color: '#92400e', margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between' }}>
              Em Andamento <span style={{ backgroundColor: '#fde68a', padding: '2px 8px', borderRadius: '9999px', fontSize: '14px' }}>{inProgressPlans.length}</span>
            </h3>
            {inProgressPlans.map(renderCard)}
          </div>

          {/* Coluna Concluídos */}
          <div style={{ flex: 1, backgroundColor: '#d1fae5', padding: '20px', borderRadius: '16px', minHeight: '400px' }}>
            <h3 style={{ color: '#065f46', margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between' }}>
              Concluídos <span style={{ backgroundColor: '#a7f3d0', padding: '2px 8px', borderRadius: '9999px', fontSize: '14px' }}>{resolvedPlans.length}</span>
            </h3>
            {resolvedPlans.map(renderCard)}
          </div>

        </div>
      </div>
  );
}
