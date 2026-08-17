import { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, UserPlus, Building, Trash2 } from 'lucide-react';

export function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('LEADER'); // ADMIN or LEADER
  const [submitting, setSubmitting] = useState(false);

  // sectors
  const [sectorsText, setSectorsText] = useState('');
  const [sectorsLoading, setSectorsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchProfile();
  }, []);

  const fetchUsers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const res = await fetch(`${apiUrl}/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const res = await fetch(`${apiUrl}/settings/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.sectors) {
          setSectorsText(data.sectors.join(', '));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSectors = async (e: React.FormEvent) => {
    e.preventDefault();
    setSectorsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const parsedSectors = sectorsText.split(',').map(s => s.trim()).filter(s => s !== '');
      const res = await fetch(`${apiUrl}/settings/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sectors: parsedSectors })
      });
      if (res.ok) {
        alert('Setores atualizados com sucesso!');
      } else {
        alert('Erro ao atualizar setores');
      }
    } catch (e) {
      alert('Erro de conexão');
    } finally {
      setSectorsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const res = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, email, password, role })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert('Usuário criado com sucesso!');
        setShowModal(false);
        setName(''); setEmail(''); setPassword(''); setRole('LEADER');
        fetchUsers();
      } else {
        alert(data.error || 'Erro ao criar usuário');
      }
    } catch (error) {
      alert('Erro de conexão');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="responsive-flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UsersIcon color="#312e81" /> Gestão de Usuários
        </h1>
        <button 
          onClick={() => setShowModal(true)}
          style={{ padding: '10px 16px', backgroundColor: '#312e81', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UserPlus size={18} /> Novo Usuário
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>Setores da Empresa</h2>
        <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '16px' }}>
          Defina os departamentos que poderão ser selecionados nas pesquisas e nos planos de ação. Separe-os por vírgula.
        </p>
        <form onSubmit={handleUpdateSectors} className="responsive-flex" style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              value={sectorsText} 
              onChange={(e) => setSectorsText(e.target.value)} 
              placeholder="Ex: RH, Comercial, TI, Operacional, Recepção" 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={sectorsLoading}
            style={{ padding: '12px 24px', backgroundColor: '#312e81', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: sectorsLoading ? 'not-allowed' : 'pointer', opacity: sectorsLoading ? 0.7 : 1 }}
          >
            {sectorsLoading ? 'Salvando...' : 'Salvar Setores'}
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
        {loading ? (
          <p>Carregando usuários...</p>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6', textAlign: 'left' }}>
                <th style={{ padding: '12px', color: '#6b7280', fontWeight: '600' }}>Nome</th>
                <th style={{ padding: '12px', color: '#6b7280', fontWeight: '600' }}>E-mail</th>
                <th style={{ padding: '12px', color: '#6b7280', fontWeight: '600' }}>Função</th>
                <th style={{ padding: '12px', color: '#6b7280', fontWeight: '600' }}>Data Criação</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: '500', color: '#111827' }}>{u.name}</td>
                  <td style={{ padding: '12px', color: '#4b5563' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: u.role === 'ADMIN' ? '#dbeafe' : '#fef3c7',
                      color: u.role === 'ADMIN' ? '#1e40af' : '#b45309'
                    }}>
                      {u.role === 'ADMIN' ? 'Admin (RH)' : 'Líder / Gestor'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#4b5563' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '90%', maxWidth: '500px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '20px', color: '#111827' }}>Novo Usuário</h2>
            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Nome Completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>E-mail corporativo</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Senha de Acesso</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Função</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}>
                  <option value="LEADER">Líder / Gestor</option>
                  <option value="ADMIN">Administrador (RH)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'transparent', color: '#374151', fontWeight: '500', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#312e81', color: '#ffffff', fontWeight: '500', cursor: 'pointer' }}>
                  {submitting ? 'Criando...' : 'Salvar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
