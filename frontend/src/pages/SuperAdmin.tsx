import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Tenant {
  id: string;
  name: string;
  document: string;
  createdAt: string;
  _count: {
    users: number;
    surveys: number;
  }
}

export function SuperAdmin() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (role !== 'SUPERADMIN') {
      alert("Acesso Negado. Redirecionando...");
      navigate('/');
      return;
    }
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/superadmin/tenants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTenants(data);
      }
    } catch (error) {
      console.error('Erro ao buscar empresas', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/superadmin/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, document, adminName, adminEmail, adminPassword })
      });

      if (res.ok) {
        setName('');
        setDocument('');
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
        fetchTenants(); // Recarrega lista
        alert('Empresa e Administrador criados com sucesso!');
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao criar empresa');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  };

  const handleDeleteTenant = async (id: string, name: string) => {
    if (!window.confirm(`ATENÇÃO: Você tem certeza que deseja excluir a empresa "${name}" e todos os seus dados? Esta ação é irreversível!`)) {
      return;
    }

    setLoadingAction(id);
    try {
      const res = await fetch(`${apiUrl}/superadmin/tenants/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTenants(tenants.filter(t => t.id !== id));
        alert('Empresa excluída com sucesso.');
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao excluir empresa');
      }
    } catch (error) {
      alert('Erro de conexão');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleImpersonate = async (id: string, name: string) => {
    if (!window.confirm(`Você entrará no sistema como administrador da empresa "${name}". Para retornar ao painel Super Admin, você precisará sair da conta. Continuar?`)) {
      return;
    }

    setLoadingAction(`impersonate-${id}`);
    try {
      const res = await fetch(`${apiUrl}/superadmin/tenants/${id}/impersonate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Substituir o token e a role no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        // Redireciona para o dashboard
        window.location.href = '/dashboard';
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao acessar empresa');
      }
    } catch (error) {
      alert('Erro de conexão');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (role !== 'SUPERADMIN') return null;

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: '#312e81', margin: '0 0 8px 0', fontWeight: '800' }}>Painel Super Admin</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>Gestão central de Tenants (Empresas Clientes).</p>
          </div>
          <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#374151', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            Sair
          </button>
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          {/* Formulário */}
          <div style={{ flex: '1', backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#312e81', fontSize: '20px', fontWeight: '700' }}>Cadastrar Nova Empresa</h3>
            <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Nome da Empresa</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outlineColor: '#2563eb', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>CNPJ (ou Documento)</label>
                <input required type="text" value={document} onChange={e => setDocument(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outlineColor: '#2563eb', fontSize: '15px' }} />
              </div>
              
              <hr style={{ borderTop: '1px solid #f3f4f6', margin: '12px 0' }} />
              <h4 style={{ margin: 0, color: '#4b5563', fontSize: '16px', fontWeight: '700' }}>Primeiro Acesso (Admin RH)</h4>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Nome do Administrador</label>
                <input required type="text" value={adminName} onChange={e => setAdminName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outlineColor: '#2563eb', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>E-mail</label>
                <input required type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outlineColor: '#2563eb', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Senha Provisória</label>
                <input required type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outlineColor: '#2563eb', fontSize: '15px' }} />
              </div>

              <button type="submit" style={{ padding: '14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
                + Criar Empresa
              </button>
            </form>
          </div>

        {/* Tabela */}
        <div style={{ flex: '2', backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ margin: '0 0 24px 0', color: '#312e81', fontSize: '20px', fontWeight: '700' }}>Empresas Clientes ({tenants.length})</h3>
          
          {loading ? <p style={{ color: '#6b7280' }}>Carregando...</p> : (
            <div style={{ border: '1px solid #f3f4f6', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                  <tr>
                    <th style={{ padding: '16px', color: '#4b5563', fontWeight: '600' }}>Empresa</th>
                    <th style={{ padding: '16px', color: '#4b5563', fontWeight: '600' }}>CNPJ</th>
                    <th style={{ padding: '16px', color: '#4b5563', fontWeight: '600' }}>Usuários</th>
                    <th style={{ padding: '16px', color: '#4b5563', fontWeight: '600' }}>Pesquisas</th>
                    <th style={{ padding: '16px', color: '#4b5563', fontWeight: '600' }}>Registro</th>
                    <th style={{ padding: '16px', color: '#4b5563', fontWeight: '600', textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(tenant => (
                    <tr key={tenant.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px', fontWeight: '600', color: '#1f2937' }}>{tenant.name}</td>
                      <td style={{ padding: '16px', color: '#6b7280' }}>{tenant.document}</td>
                      <td style={{ padding: '16px', color: '#4b5563' }}>{tenant._count.users}</td>
                      <td style={{ padding: '16px', color: '#4b5563' }}>{tenant._count.surveys}</td>
                      <td style={{ padding: '16px', color: '#6b7280' }}>{new Date(tenant.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => handleImpersonate(tenant.id, tenant.name)}
                            disabled={loadingAction === `impersonate-${tenant.id}`}
                            style={{ padding: '6px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                            {loadingAction === `impersonate-${tenant.id}` ? '...' : 'Acessar'}
                          </button>
                          <button 
                            onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                            disabled={loadingAction === tenant.id}
                            style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                            {loadingAction === tenant.id ? '...' : 'Excluir'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tenants.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>Nenhuma empresa cadastrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
