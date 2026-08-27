import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';

interface Tenant {
  id: string;
  name: string;
  document: string;
  createdAt: string;
  subscriptionId?: string;
  subscription?: { maxSubmissions: number };
  isActive: boolean;
  _count: {
    users: number;
    surveys: number;
  }
}

interface Consultant {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isActive: boolean;
  subscription?: { 
    id: string;
    planType: string;
    maxTenants: number; 
    maxSubmissions: number;
  };
}

export function SuperAdmin() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const [viewTab, setViewTab] = useState<'TENANTS' | 'CONSULTANTS'>('TENANTS');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [accountType, setAccountType] = useState('SINGLE');
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [plan, setPlan] = useState('BRONZE');
  const [maxTenants, setMaxTenants] = useState('5');
  const [maxSubmissions, setMaxSubmissions] = useState('50');
  const [isActive, setIsActive] = useState<boolean>(true);

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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resT = await fetch(`${apiUrl}/superadmin/tenants`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resT.ok) setTenants(await resT.json());

      const resC = await fetch(`${apiUrl}/superadmin/consultants`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resC.ok) setConsultants(await resC.json());
    } catch (error) {
      console.error('Erro ao buscar dados', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTenant = (t: Tenant) => {
    setEditingId(t.id);
    setAccountType('SINGLE');
    setName(t.name);
    setDocument(t.document);
    setMaxSubmissions(t.subscription?.maxSubmissions ? t.subscription.maxSubmissions.toString() : '50');
    setIsActive(t.isActive !== false);
    setAdminPassword('');
    // Não precisa de adminName, etc na edição do tenant simples
  };

  const handleEditConsultant = (c: Consultant) => {
    setEditingId(c.id);
    setAccountType('CONSULTANT');
    setAdminName(c.name);
    setIsActive(c.isActive !== false);
    setAdminPassword('');
    
    if (c.subscription) {
      const sub = c.subscription;
      setPlan(sub.planType);
      setMaxTenants(sub.maxTenants.toString());
      setMaxSubmissions(sub.maxSubmissions.toString());
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDocument('');
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
    setMaxSubmissions('50');
    setMaxTenants('5');
    setIsActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isSingle = accountType === 'SINGLE';
      let endpoint = '';
      let method = 'POST';
      let body: any = {};

      if (editingId) {
         method = 'PUT';
         endpoint = isSingle ? `/superadmin/tenants/${editingId}` : `/superadmin/consultants/${editingId}`;
         body = isSingle 
          ? { name, document, maxSubmissions, isActive, adminPassword } 
          : { adminName, plan, maxTenants, maxSubmissions, isActive, adminPassword };
      } else {
         endpoint = isSingle ? '/superadmin/tenants' : '/superadmin/consultants';
         body = isSingle 
          ? { name, document, adminName, adminEmail, adminPassword, maxSubmissions }
          : { adminName, adminEmail, adminPassword, plan, maxTenants, maxSubmissions };
      }

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        handleCancelEdit();
        fetchData();
        alert(editingId ? 'Conta atualizada com sucesso!' : 'Conta criada com sucesso!');
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao processar requisição');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  };

  const handleDelete = async (id: string, name: string, type: 'TENANT' | 'CONSULTANT') => {
    if (!window.confirm(`ATENÇÃO: Você tem certeza que deseja excluir "${name}" e todos os seus dados? Esta ação é irreversível!`)) {
      return;
    }

    setLoadingAction(`del-${id}`);
    try {
      const endpoint = type === 'TENANT' ? `/superadmin/tenants/${id}` : `/superadmin/consultants/${id}`;
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        alert('Excluído com sucesso.');
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao excluir');
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
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <div style={{ flex: 1, padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: 'var(--primary-dark)', margin: '0 0 8px 0', fontWeight: '800' }}>Painel Super Admin</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '16px' }}>Gestão central de Contas e Assinaturas.</p>
          </div>
          <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color-dark)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Sair
          </button>
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          {/* Formulário */}
          <div style={{ flex: '1', backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '20px', fontWeight: '700' }}>
                {editingId ? 'Editar Conta' : 'Cadastrar Nova Conta'}
              </h3>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Cancelar</button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Tipo de Conta</label>
                <select disabled={!!editingId} value={accountType} onChange={e => setAccountType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px', backgroundColor: editingId ? 'var(--bg-main)' : 'white' }}>
                  <option value="SINGLE">Empresa Única</option>
                  <option value="CONSULTANT">Consultor</option>
                </select>
              </div>

              {accountType === 'SINGLE' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nome da Empresa</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>CNPJ (ou Documento)</label>
                    <input required type="text" value={document} onChange={e => setDocument(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Limite de Colaboradores (Envios)</label>
                    <input required type="number" min="1" value={maxSubmissions} onChange={e => setMaxSubmissions(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                  </div>
                </>
              )}

              {accountType === 'CONSULTANT' && (
                <>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Plano</label>
                      <select value={plan} onChange={e => setPlan(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }}>
                        <option value="BRONZE">Bronze</option>
                        <option value="SILVER">Prata</option>
                        <option value="GOLD">Ouro</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Qtd de Clientes</label>
                      <input required type="number" min="1" value={maxTenants} onChange={e => setMaxTenants(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Limite Global de Envios</label>
                    <input required type="number" min="1" value={maxSubmissions} onChange={e => setMaxSubmissions(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                  </div>
                </>
              )}

              <hr style={{ borderTop: '1px solid var(--bg-hover)', margin: '12px 0' }} />
              <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '16px', fontWeight: '700' }}>Dados do Administrador {accountType === 'CONSULTANT' && '(Consultor)'}</h4>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nome</label>
                <input required type="text" value={adminName} onChange={e => setAdminName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
              </div>
              {!editingId && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>E-mail de Login</label>
                    <input required type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Senha Provisória</label>
                    <input required type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                  </div>
                </>
              )}

              {/* Opções Avançadas para Tenant e Consultant */}
              {editingId && (
                <>
                  <hr style={{ borderTop: '1px solid var(--bg-hover)', margin: '12px 0' }} />
                  <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '16px', fontWeight: '700' }}>Opções Avançadas</h4>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Status da Conta</label>
                    <select 
                      value={isActive ? 'true' : 'false'} 
                      onChange={e => setIsActive(e.target.value === 'true')}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }}
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Alterar Senha do Administrador</label>
                    <input 
                      type="password" 
                      placeholder="Deixe em branco para não alterar" 
                      value={adminPassword} 
                      onChange={e => setAdminPassword(e.target.value)} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} 
                    />
                  </div>
                </>
              )}

              <button type="submit" style={{ padding: '14px', backgroundColor: 'var(--primary)', color: 'var(--bg-card)', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
                {editingId ? 'Atualizar Conta' : '+ Criar Conta'}
              </button>
            </form>
          </div>

        {/* Tabelas e Abas */}
        <div style={{ flex: '2', backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '2px solid var(--bg-hover)' }}>
             <button 
                onClick={() => setViewTab('TENANTS')} 
                style={{ padding: '10px 0', border: 'none', background: 'transparent', fontSize: '18px', fontWeight: '700', cursor: 'pointer', color: viewTab === 'TENANTS' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: viewTab === 'TENANTS' ? '3px solid var(--primary)' : '3px solid transparent', marginBottom: '-2px' }}>
                Empresas Clientes ({tenants.length})
             </button>
             <button 
                onClick={() => setViewTab('CONSULTANTS')} 
                style={{ padding: '10px 0', border: 'none', background: 'transparent', fontSize: '18px', fontWeight: '700', cursor: 'pointer', color: viewTab === 'CONSULTANTS' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: viewTab === 'CONSULTANTS' ? '3px solid var(--primary)' : '3px solid transparent', marginBottom: '-2px' }}>
                Consultores Cadastrados ({consultants.length})
             </button>
          </div>
          
          {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
            <div style={{ border: '1px solid var(--bg-hover)', borderRadius: '12px', overflow: 'hidden' }}>
              
              {viewTab === 'TENANTS' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
                  <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--bg-hover)' }}>
                    <tr>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '600' }}>Empresa</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '600' }}>CNPJ</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '600' }}>Usuários</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '600' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map(tenant => (
                      <tr key={tenant.id} style={{ borderBottom: '1px solid var(--bg-hover)' }}>
                        <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {tenant.name}
                            {tenant.isActive === false && (
                              <span style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                Inativo
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{tenant.document}</td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{tenant._count.users}</td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => handleEditTenant(tenant)} style={{ padding: '6px 12px', backgroundColor: 'var(--primary)', color: 'var(--bg-card)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Editar</button>
                            <button 
                              onClick={() => handleImpersonate(tenant.id, tenant.name)}
                              disabled={loadingAction === `impersonate-${tenant.id}`}
                              style={{ padding: '6px 12px', backgroundColor: 'var(--success)', color: 'var(--bg-card)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                              Acessar
                            </button>
                            <button 
                              onClick={() => handleDelete(tenant.id, tenant.name, 'TENANT')}
                              disabled={loadingAction === `del-${tenant.id}`}
                              style={{ padding: '6px 12px', backgroundColor: 'var(--danger)', color: 'var(--bg-card)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {tenants.length === 0 && (
                      <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-placeholder)' }}>Nenhuma empresa cadastrada.</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {viewTab === 'CONSULTANTS' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
                  <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--bg-hover)' }}>
                    <tr>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '600' }}>Consultor</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '600' }}>E-mail</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '600' }}>Plano</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '600' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultants.map(consultant => (
                      <tr key={consultant.id} style={{ borderBottom: '1px solid var(--bg-hover)' }}>
                        <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {consultant.name}
                            {consultant.isActive === false && (
                              <span style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                Inativo
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{consultant.email}</td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                          {consultant.subscription ? consultant.subscription.planType : 'N/A'}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => handleEditConsultant(consultant)} style={{ padding: '6px 12px', backgroundColor: 'var(--primary)', color: 'var(--bg-card)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Editar</button>
                            <button 
                              onClick={() => handleDelete(consultant.id, consultant.name, 'CONSULTANT')}
                              disabled={loadingAction === `del-${consultant.id}`}
                              style={{ padding: '6px 12px', backgroundColor: 'var(--danger)', color: 'var(--bg-card)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {consultants.length === 0 && (
                      <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-placeholder)' }}>Nenhum consultor cadastrado.</td></tr>
                    )}
                  </tbody>
                </table>
              )}

            </div>
          )}
        </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
