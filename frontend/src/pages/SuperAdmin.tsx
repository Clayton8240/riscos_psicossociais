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
  
  const [viewTab, setViewTab] = useState<'TENANTS' | 'CONSULTANTS' | 'PAYMENTS' | 'PROFILE'>('TENANTS');
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

  // Payment Methods States
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'pix', name: 'Pix', enabled: true, gateway: 'Asaas' },
    { id: 'credit_card', name: 'Cartão de Crédito', enabled: true, gateway: 'Stripe' },
    { id: 'boleto', name: 'Boleto Bancário', enabled: false, gateway: 'Asaas' }
  ]);
  const [stripeKey, setStripeKey] = useState('');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
  const [asaasKey, setAsaasKey] = useState('');
  const [mercadoPagoKey, setMercadoPagoKey] = useState('');
  const [paypalKey, setPaypalKey] = useState('');

  // Profile States
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

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

      const resP = await fetch(`${apiUrl}/superadmin/payment-settings`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resP.ok) {
        const pData = await resP.json();
        setStripeKey(pData.stripe_key || '');
        setStripeWebhookSecret(pData.stripe_webhook_secret || '');
        setAsaasKey(pData.asaas_key || '');
        setMercadoPagoKey(pData.mercadopago_key || '');
        setPaypalKey(pData.paypal_key || '');
        if (pData.payment_methods) {
          setPaymentMethods(pData.payment_methods);
        }
      }

      const resProfile = await fetch(`${apiUrl}/settings/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resProfile.ok) {
        const pInfo = await resProfile.json();
        setProfileName(pInfo.name || '');
        setProfileEmail(pInfo.email || '');
      }
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

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(methods => {
      const newMethods = methods.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m);
      savePaymentSettings({ payment_methods: newMethods });
      return newMethods;
    });
  };

  const savePaymentSettings = async (updates: any) => {
    try {
      const res = await fetch(`${apiUrl}/superadmin/payment-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) alert('Configurações salvas!');
      else alert('Erro ao salvar configurações');
    } catch {
      alert('Erro de conexão');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: any = { name: profileName, email: profileEmail };
      if (newPassword) {
        if (!currentPassword) {
          alert('Por favor, informe a senha atual para alterar a senha.');
          return;
        }
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      
      const res = await fetch(`${apiUrl}/settings/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        alert('Perfil atualizado com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao atualizar perfil');
      }
    } catch {
      alert('Erro de conexão');
    }
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
          
          {/* Ocultar formulário de nova conta se estiver na aba de pagamentos ou perfil */}
          {viewTab !== 'PAYMENTS' && viewTab !== 'PROFILE' && (
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
          )}

        {/* Tabelas e Abas */}
        <div style={{ flex: (viewTab === 'PAYMENTS' || viewTab === 'PROFILE') ? 'none' : '2', width: (viewTab === 'PAYMENTS' || viewTab === 'PROFILE') ? '100%' : 'auto', backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
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
             <button 
                onClick={() => setViewTab('PAYMENTS')} 
                style={{ padding: '10px 0', border: 'none', background: 'transparent', fontSize: '18px', fontWeight: '700', cursor: 'pointer', color: viewTab === 'PAYMENTS' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: viewTab === 'PAYMENTS' ? '3px solid var(--primary)' : '3px solid transparent', marginBottom: '-2px' }}>
                Métodos de Pagamento
             </button>
             <button 
                onClick={() => setViewTab('PROFILE')} 
                style={{ padding: '10px 0', border: 'none', background: 'transparent', fontSize: '18px', fontWeight: '700', cursor: 'pointer', color: viewTab === 'PROFILE' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: viewTab === 'PROFILE' ? '3px solid var(--primary)' : '3px solid transparent', marginBottom: '-2px' }}>
                Meu Perfil
             </button>
          </div>
          
          {loading && viewTab !== 'PAYMENTS' && viewTab !== 'PROFILE' ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
            <div style={{ border: (viewTab === 'PAYMENTS' || viewTab === 'PROFILE') ? 'none' : '1px solid var(--bg-hover)', borderRadius: '12px', overflow: 'hidden' }}>
              
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

              {viewTab === 'PAYMENTS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '20px' }}>Integrações de Gateways</h3>
                    <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', fontSize: '15px' }}>Configure as chaves de API dos provedores de pagamento.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Stripe</div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '150px', color: 'var(--text-secondary)' }}>Secret Key:</div>
                          <input type="password" value={stripeKey} onChange={e => setStripeKey(e.target.value)} placeholder="sk_test_..." style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color-dark)' }} />
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '150px', color: 'var(--text-secondary)' }}>Webhook Secret:</div>
                          <input type="password" value={stripeWebhookSecret} onChange={e => setStripeWebhookSecret(e.target.value)} placeholder="whsec_..." style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color-dark)' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                          <button onClick={() => savePaymentSettings({ stripe_key: stripeKey, stripe_webhook_secret: stripeWebhookSecret })} style={{ padding: '8px 16px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color-dark)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Salvar Configurações Stripe</button>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ width: '120px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Asaas</div>
                        <input type="password" value={asaasKey} onChange={e => setAsaasKey(e.target.value)} placeholder="$aact_..." style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color-dark)' }} />
                        <button onClick={() => savePaymentSettings({ asaas_key: asaasKey })} style={{ padding: '8px 16px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color-dark)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Salvar</button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ width: '120px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Mercado Pago</div>
                        <input type="password" value={mercadoPagoKey} onChange={e => setMercadoPagoKey(e.target.value)} placeholder="APP_USR-..." style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color-dark)' }} />
                        <button onClick={() => savePaymentSettings({ mercadopago_key: mercadoPagoKey })} style={{ padding: '8px 16px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color-dark)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Salvar</button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ width: '120px', fontWeight: 'bold', color: 'var(--text-primary)' }}>PayPal</div>
                        <input type="password" value={paypalKey} onChange={e => setPaypalKey(e.target.value)} placeholder="Client ID / Secret..." style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color-dark)' }} />
                        <button onClick={() => savePaymentSettings({ paypal_key: paypalKey })} style={{ padding: '8px 16px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color-dark)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Salvar</button>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '20px' }}>Métodos Disponíveis no Checkout</h3>
                    <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', fontSize: '15px' }}>Ative ou desative as opções que aparecerão para os clientes.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {paymentMethods.map(method => (
                        <div key={method.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '16px' }}>{method.name}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Processado via {method.gateway}</div>
                          </div>
                          
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <div style={{ position: 'relative' }}>
                              <input 
                                type="checkbox" 
                                checked={method.enabled} 
                                onChange={() => togglePaymentMethod(method.id)}
                                style={{ opacity: 0, width: 0, height: 0 }} 
                              />
                              <div style={{ 
                                width: '44px', 
                                height: '24px', 
                                backgroundColor: method.enabled ? 'var(--success)' : 'var(--border-color-dark)', 
                                borderRadius: '12px',
                                transition: 'background-color 0.2s',
                                position: 'relative'
                              }}>
                                <div style={{
                                  position: 'absolute',
                                  top: '2px',
                                  left: method.enabled ? '22px' : '2px',
                                  width: '20px',
                                  height: '20px',
                                  backgroundColor: 'white',
                                  borderRadius: '50%',
                                  transition: 'left 0.2s',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }} />
                              </div>
                            </div>
                            <span style={{ marginLeft: '12px', fontWeight: '600', color: method.enabled ? 'var(--success-text)' : 'var(--text-muted)' }}>
                              {method.enabled ? 'Ativo' : 'Inativo'}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {viewTab === 'PROFILE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '600px' }}>
                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '20px' }}>Minha Conta Super Admin</h3>
                    <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', fontSize: '15px' }}>Atualize seus dados de acesso.</p>
                    
                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nome</label>
                        <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>E-mail</label>
                        <input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                      </div>

                      <hr style={{ borderTop: '1px solid var(--border-color)', margin: '12px 0' }} />

                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Senha Atual <span style={{fontWeight: 'normal', color: 'var(--text-muted)'}}>(apenas se for alterar a senha)</span></label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="*******" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nova Senha</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Deixe em branco para não alterar" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                      </div>

                      <button type="submit" style={{ padding: '14px', backgroundColor: 'var(--primary)', color: 'var(--bg-card)', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
                        Salvar Perfil
                      </button>
                    </form>
                  </div>
                </div>
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
