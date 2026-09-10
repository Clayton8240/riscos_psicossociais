import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Building2, Users, CreditCard, UserCircle, LogOut, Plus, X, Edit, Trash2, ExternalLink } from 'lucide-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    setIsModalOpen(true);
  };

  const handleEditConsultant = (c: Consultant) => {
    setEditingId(c.id);
    setAccountType('CONSULTANT');
    setAdminName(c.name);
    setIsActive(c.isActive !== false);
    setAdminPassword('');
    setIsModalOpen(true);
    
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
    setIsModalOpen(false);
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
    <div className="superadmin-container">
      
      {/* Sidebar */}
      <div className="superadmin-sidebar">
        <div style={{ padding: '32px 24px' }}>
          <h1 style={{ fontSize: '24px', color: 'var(--primary-dark)', margin: '0', fontWeight: '800' }}>Super Admin</h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '14px' }}>Gestão de Contas e Assinaturas</p>
        </div>
        
        <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => setViewTab('TENANTS')} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '10px', border: 'none', background: viewTab === 'TENANTS' ? 'var(--primary-bg)' : 'transparent', color: viewTab === 'TENANTS' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '15px', textAlign: 'left', transition: 'all 0.2s' }}>
            <Building2 size={20} />
            Empresas Clientes
          </button>
          
          <button 
            onClick={() => setViewTab('CONSULTANTS')} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '10px', border: 'none', background: viewTab === 'CONSULTANTS' ? 'var(--primary-bg)' : 'transparent', color: viewTab === 'CONSULTANTS' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '15px', textAlign: 'left', transition: 'all 0.2s' }}>
            <Users size={20} />
            Consultores
          </button>

          <button 
            onClick={() => setViewTab('PAYMENTS')} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '10px', border: 'none', background: viewTab === 'PAYMENTS' ? 'var(--primary-bg)' : 'transparent', color: viewTab === 'PAYMENTS' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '15px', textAlign: 'left', transition: 'all 0.2s' }}>
            <CreditCard size={20} />
            Métodos de Pagamento
          </button>

          <button 
            onClick={() => setViewTab('PROFILE')} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '10px', border: 'none', background: viewTab === 'PROFILE' ? 'var(--primary-bg)' : 'transparent', color: viewTab === 'PROFILE' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '15px', textAlign: 'left', transition: 'all 0.2s' }}>
            <UserCircle size={20} />
            Meu Perfil
          </button>
        </nav>
        
        <div style={{ padding: '24px' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '10px', border: 'none', background: 'var(--bg-hover)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '15px', width: '100%', transition: 'all 0.2s' }}>
            <LogOut size={20} />
            Sair do Painel
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="superadmin-content">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Header Actions based on Tab */}
          <div className="superadmin-header">
            <div>
              <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', margin: '0 0 8px 0', fontWeight: '700' }}>
                {viewTab === 'TENANTS' && 'Empresas Clientes'}
                {viewTab === 'CONSULTANTS' && 'Consultores'}
                {viewTab === 'PAYMENTS' && 'Integrações de Pagamento'}
                {viewTab === 'PROFILE' && 'Meu Perfil'}
              </h2>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '16px' }}>
                {viewTab === 'TENANTS' && `Gerenciamento de ${tenants.length} empresas cadastradas.`}
                {viewTab === 'CONSULTANTS' && `Gerenciamento de ${consultants.length} consultores.`}
                {viewTab === 'PAYMENTS' && 'Configure as chaves de API dos provedores de pagamento.'}
                {viewTab === 'PROFILE' && 'Atualize seus dados de acesso como super administrador.'}
              </p>
            </div>
            
            {viewTab === 'TENANTS' && (
              <button 
                onClick={() => { handleCancelEdit(); setAccountType('SINGLE'); setIsModalOpen(true); }} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              >
                <Plus size={20} /> Nova Empresa
              </button>
            )}
            
            {viewTab === 'CONSULTANTS' && (
              <button 
                onClick={() => { handleCancelEdit(); setAccountType('CONSULTANT'); setIsModalOpen(true); }} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              >
                <Plus size={20} /> Novo Consultor
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Carregando dados...</div>
          ) : (
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              
              {viewTab === 'TENANTS' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
                    <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                      <tr>
                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600' }}>Empresa</th>
                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600' }}>CNPJ</th>
                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600' }}>Usuários</th>
                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map(tenant => (
                        <tr key={tenant.id} style={{ borderBottom: '1px solid var(--bg-hover)' }}>
                          <td style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {tenant.name}
                              {tenant.isActive === false && (
                                <span style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                  Inativo
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{tenant.document}</td>
                          <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{tenant._count.users}</td>
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button onClick={() => handleEditTenant(tenant)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}><Edit size={14}/> Editar</button>
                              <button 
                                onClick={() => handleImpersonate(tenant.id, tenant.name)}
                                disabled={loadingAction === `impersonate-${tenant.id}`}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: 'var(--primary-bg)', color: 'var(--primary-dark)', border: '1px solid var(--primary-light)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
                                <ExternalLink size={14}/> Acessar
                              </button>
                              <button 
                                onClick={() => handleDelete(tenant.id, tenant.name, 'TENANT')}
                                disabled={loadingAction === `del-${tenant.id}`}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
                                <Trash2 size={14}/> Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {tenants.length === 0 && (
                        <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-placeholder)' }}>Nenhuma empresa cadastrada.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {viewTab === 'CONSULTANTS' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
                    <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                      <tr>
                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600' }}>Consultor</th>
                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600' }}>E-mail</th>
                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600' }}>Plano</th>
                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultants.map(consultant => (
                        <tr key={consultant.id} style={{ borderBottom: '1px solid var(--bg-hover)' }}>
                          <td style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {consultant.name}
                              {consultant.isActive === false && (
                                <span style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                  Inativo
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{consultant.email}</td>
                          <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>
                            {consultant.subscription ? consultant.subscription.planType : 'N/A'}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button onClick={() => handleEditConsultant(consultant)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}><Edit size={14}/> Editar</button>
                              <button 
                                onClick={() => handleDelete(consultant.id, consultant.name, 'CONSULTANT')}
                                disabled={loadingAction === `del-${consultant.id}`}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
                                <Trash2 size={14}/> Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {consultants.length === 0 && (
                        <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-placeholder)' }}>Nenhum consultor cadastrado.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {viewTab === 'PAYMENTS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '32px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '20px' }}>Integrações de Gateways</h3>
                    <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', fontSize: '15px' }}>Configure as chaves de API dos provedores de pagamento.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CreditCard size={20} color="var(--primary)" />
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '18px' }}>Stripe</div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '150px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px' }}>Secret Key:</div>
                          <input type="password" value={stripeKey} onChange={e => setStripeKey(e.target.value)} placeholder="sk_test_..." style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)' }} />
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '150px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px' }}>Webhook Secret:</div>
                          <input type="password" value={stripeWebhookSecret} onChange={e => setStripeWebhookSecret(e.target.value)} placeholder="whsec_..." style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                          <button onClick={() => savePaymentSettings({ stripe_key: stripeKey, stripe_webhook_secret: stripeWebhookSecret })} style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Salvar Configurações Stripe</button>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ width: '150px', fontWeight: '700', color: 'var(--text-primary)', fontSize: '16px' }}>Asaas</div>
                        <input type="password" value={asaasKey} onChange={e => setAsaasKey(e.target.value)} placeholder="$aact_..." style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)' }} />
                        <button onClick={() => savePaymentSettings({ asaas_key: asaasKey })} style={{ padding: '10px 20px', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-color-dark)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Salvar</button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ width: '150px', fontWeight: '700', color: 'var(--text-primary)', fontSize: '16px' }}>Mercado Pago</div>
                        <input type="password" value={mercadoPagoKey} onChange={e => setMercadoPagoKey(e.target.value)} placeholder="APP_USR-..." style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)' }} />
                        <button onClick={() => savePaymentSettings({ mercadopago_key: mercadoPagoKey })} style={{ padding: '10px 20px', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-color-dark)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Salvar</button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ width: '150px', fontWeight: '700', color: 'var(--text-primary)', fontSize: '16px' }}>PayPal</div>
                        <input type="password" value={paypalKey} onChange={e => setPaypalKey(e.target.value)} placeholder="Client ID / Secret..." style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)' }} />
                        <button onClick={() => savePaymentSettings({ paypal_key: paypalKey })} style={{ padding: '10px 20px', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-color-dark)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Salvar</button>
                      </div>
                    </div>
                  </div>

                  <hr style={{ borderTop: '1px solid var(--border-color)' }} />

                  <div>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '20px' }}>Métodos Disponíveis no Checkout</h3>
                    <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', fontSize: '15px' }}>Ative ou desative as opções que aparecerão para os clientes.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                      {paymentMethods.map(method => (
                        <div key={method.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '16px' }}>{method.name}</div>
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
                            <span style={{ marginLeft: '12px', fontWeight: '600', color: method.enabled ? 'var(--success-text)' : 'var(--text-muted)', fontSize: '14px' }}>
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
                <div style={{ padding: '32px', maxWidth: '600px' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '20px' }}>Minha Conta Super Admin</h3>
                  <p style={{ margin: '0 0 32px 0', color: 'var(--text-secondary)', fontSize: '15px' }}>Atualize seus dados de acesso.</p>
                  
                  <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nome</label>
                      <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>E-mail</label>
                      <input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                    </div>

                    <div style={{ margin: '16px 0', borderTop: '1px solid var(--border-color)' }}></div>

                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Senha Atual <span style={{fontWeight: 'normal', color: 'var(--text-muted)'}}>(apenas se for alterar a senha)</span></label>
                      <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="*******" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nova Senha</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Deixe em branco para não alterar" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                    </div>

                    <button type="submit" style={{ padding: '14px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '16px', fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
                      Salvar Perfil
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Modal for Forms */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '20px', fontWeight: '700' }}>
                {editingId ? 'Editar Conta' : (accountType === 'SINGLE' ? 'Cadastrar Nova Empresa' : 'Cadastrar Novo Consultor')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {!editingId && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Tipo de Conta</label>
                  <select value={accountType} onChange={e => setAccountType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px', backgroundColor: 'white' }}>
                    <option value="SINGLE">Empresa Única</option>
                    <option value="CONSULTANT">Consultor</option>
                  </select>
                </div>
              )}

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
                  <div style={{ display: 'flex', gap: '16px' }}>
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

              <hr style={{ borderTop: '1px solid var(--bg-hover)', margin: '8px 0' }} />
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px', fontWeight: '700' }}>Dados de Acesso {accountType === 'CONSULTANT' ? '(Consultor)' : '(Administrador da Empresa)'}</h4>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nome Completo</label>
                <input required type="text" value={adminName} onChange={e => setAdminName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
              </div>
              
              {!editingId && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>E-mail de Login</label>
                    <input required type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Senha Inicial</label>
                    <input required type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} />
                  </div>
                </>
              )}

              {/* Opções Avançadas */}
              {editingId && (
                <>
                  <hr style={{ borderTop: '1px solid var(--bg-hover)', margin: '8px 0' }} />
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px', fontWeight: '700' }}>Opções Avançadas</h4>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Status da Conta</label>
                    <select 
                      value={isActive ? 'true' : 'false'} 
                      onChange={e => setIsActive(e.target.value === 'true')}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px', backgroundColor: 'white' }}
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Redefinir Senha do Administrador</label>
                    <input 
                      type="password" 
                      placeholder="Deixe em branco para manter a atual" 
                      value={adminPassword} 
                      onChange={e => setAdminPassword(e.target.value)} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outlineColor: 'var(--primary)', fontSize: '15px' }} 
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', backgroundColor: 'white', color: 'var(--text-secondary)', border: '1px solid var(--border-color-dark)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ flex: 2, padding: '14px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
                  {editingId ? 'Salvar Alterações' : 'Criar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
