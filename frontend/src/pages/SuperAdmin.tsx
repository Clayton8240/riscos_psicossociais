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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (role !== 'SUPERADMIN') return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#111827', margin: '0 0 8px 0' }}>Painel Super Admin</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Gestão central de Tenants (Empresas Clientes).</p>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>
          Sair
        </button>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Formulário */}
        <div style={{ flex: '1', backgroundColor: '#f9fafb', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Cadastrar Nova Empresa</h3>
          <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Nome da Empresa</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>CNPJ (ou Documento)</label>
              <input required type="text" value={document} onChange={e => setDocument(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
            
            <hr style={{ borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />
            <h4 style={{ margin: 0, color: '#4b5563' }}>Primeiro Acesso (Admin RH)</h4>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Nome do Administrador</label>
              <input required type="text" value={adminName} onChange={e => setAdminName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>E-mail</label>
              <input required type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Senha Provisória</label>
              <input required type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>

            <button type="submit" style={{ padding: '12px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
              Criar Empresa
            </button>
          </form>
        </div>

        {/* Tabela */}
        <div style={{ flex: '2' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Empresas Clientes ({tenants.length})</h3>
          
          {loading ? <p>Carregando...</p> : (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', color: '#4b5563' }}>Empresa</th>
                    <th style={{ padding: '12px 16px', color: '#4b5563' }}>CNPJ</th>
                    <th style={{ padding: '12px 16px', color: '#4b5563' }}>Usuários</th>
                    <th style={{ padding: '12px 16px', color: '#4b5563' }}>Pesquisas</th>
                    <th style={{ padding: '12px 16px', color: '#4b5563' }}>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(tenant => (
                    <tr key={tenant.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{tenant.name}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{tenant.document}</td>
                      <td style={{ padding: '12px 16px' }}>{tenant._count.users}</td>
                      <td style={{ padding: '12px 16px' }}>{tenant._count.surveys}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{new Date(tenant.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {tenants.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Nenhuma empresa cadastrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
