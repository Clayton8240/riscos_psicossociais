import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, LogOut, CheckCircle, PlusCircle, LayoutDashboard, Key, ExternalLink } from 'lucide-react';
import { Footer } from '../components/Footer';

interface Tenant {
  id: string;
  name: string;
  document: string;
  createdAt: string;
  totalSurveys: number;
  totalUsers: number;
  totalSubmissions: number;
}

export function ConsultantPanel() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>({});
  
  // Form para Tenants
  const [tenantName, setTenantName] = useState('');
  const [tenantDocument, setTenantDocument] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  // Edição
  const [editingId, setEditingId] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const res = await fetch(`${apiUrl}/consultant/clients`, { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (res.ok) {
        const data = await res.json();
        setTenants(data.tenants);
        setSubscriptionInfo(data.subscription);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleEditTenant = (t: Tenant) => {
    setEditingId(t.id);
    setTenantName(t.name);
    setTenantDocument(t.document);
  };

  const resetForm = () => {
    setEditingId(null);
    setTenantName('');
    setTenantDocument('');
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
  };

  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSave(true);
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
    
    const body = editingId 
      ? { name: tenantName, document: tenantDocument }
      : { name: tenantName, document: tenantDocument, adminName, adminEmail, adminPassword };
      
    const endpoint = editingId ? `/consultant/clients/${editingId}` : '/consultant/clients';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        alert(editingId ? 'Empresa atualizada!' : 'Empresa criada com sucesso!');
        resetForm();
        fetchTenants();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao processar');
      }
    } catch (err) {
      alert('Erro de rede');
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o cliente ${name}?`)) {
      setLoadingAction(id);
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      try {
        const res = await fetch(`${apiUrl}/consultant/clients/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) fetchTenants();
        else alert('Erro ao excluir.');
      } catch (e) {
        alert('Erro de conexão');
      }
      setLoadingAction(null);
    }
  };

  const handleImpersonate = async (tenantId: string) => {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
    
    try {
      setLoadingAction(`impersonate-${tenantId}`);
      const response = await fetch(`${apiUrl}/consultant/clients/${tenantId}/impersonate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Guardamos o token do consultor para ele poder voltar depois
        localStorage.setItem('originalToken', token || '');
        
        // E usamos o token novo que diz que somos ADMIN
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'ADMIN');
        
        // Redireciona via window.location.href para forçar recarregamento total do state
        window.location.href = '/dashboard';
      } else {
        alert('Erro ao acessar a conta do cliente');
      }
    } catch (error) {
      alert('Erro de conexão');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-main)', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '420px', backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '32px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={28} />
            Painel do Consultor
          </h2>
          <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>Gerencie seus clientes e planos</p>
        </div>
        
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          
          {/* Métricas de Uso do Plano */}
          <div style={{ backgroundColor: 'var(--bg-hover)', borderRadius: '12px', padding: '16px', marginBottom: '32px' }}>
            <h4 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: '15px' }}>Meu Plano: <strong>{subscriptionInfo.planType}</strong></h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Empresas Clientes:</span>
              <span style={{ fontWeight: 600 }}>{subscriptionInfo.currentTenants || 0} / {subscriptionInfo.maxTenants}</span>
            </div>
            <div style={{ width: '100%', backgroundColor: 'var(--border-color)', height: '6px', borderRadius: '3px', marginBottom: '16px' }}>
              <div style={{ width: `${Math.min(((subscriptionInfo.currentTenants || 0)/subscriptionInfo.maxTenants)*100, 100)}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '3px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Respostas Globais:</span>
              <span style={{ fontWeight: 600 }}>{subscriptionInfo.currentSubmissions || 0} / {subscriptionInfo.maxSubmissions}</span>
            </div>
            <div style={{ width: '100%', backgroundColor: 'var(--border-color)', height: '6px', borderRadius: '3px' }}>
              <div style={{ width: `${Math.min(((subscriptionInfo.currentSubmissions || 0)/subscriptionInfo.maxSubmissions)*100, 100)}%`, height: '100%', backgroundColor: 'var(--success)', borderRadius: '3px' }} />
            </div>
          </div>

          <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editingId ? 'Editar Empresa Cliente' : 'Adicionar Empresa Cliente'}
          </h3>
          
          <form onSubmit={handleSaveTenant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Nome da Empresa</label>
              <input type="text" value={tenantName} onChange={e => setTenantName(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="Ex: Acme Corp" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>CNPJ / Documento</label>
              <input type="text" value={tenantDocument} onChange={e => setTenantDocument(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="00.000.000/0001-00" />
            </div>

            {!editingId && (
              <>
                <h4 style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '15px' }}>Administrador da Conta (Cliente)</h4>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Nome do Administrador</label>
                  <input type="text" value={adminName} onChange={e => setAdminName(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="Nome" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>E-mail de Acesso (Cliente)</label>
                  <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="admin@acme.com" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Senha Inicial (Cliente)</label>
                  <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="*****" />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              {editingId && (
                <button type="button" onClick={resetForm} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: '600' }}>
                  Cancelar
                </button>
              )}
              <button type="submit" disabled={loadingSave} style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: 'var(--bg-card)', cursor: loadingSave ? 'not-allowed' : 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle size={18} /> {loadingSave ? 'Salvando...' : editingId ? 'Atualizar Empresa' : 'Criar Empresa'}
              </button>
            </div>
          </form>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogOut size={18} /> Sair do Sistema
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '24px', margin: '0 0 24px', color: 'var(--text-primary)' }}>Meus Clientes Cadastrados ({tenants.length})</h2>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg-hover)' }}>
              <tr>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Empresa</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pesquisas</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Respostas Totais</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => (
                <tr key={tenant.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{tenant.name}</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{tenant.totalSurveys} criadas</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{tenant.totalSubmissions} envios</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleImpersonate(tenant.id)} 
                        disabled={loadingAction === `impersonate-${tenant.id}`}
                        style={{ padding: '6px 12px', backgroundColor: 'var(--primary-dark)', color: 'var(--bg-card)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ExternalLink size={14} /> Acessar
                      </button>
                      <button onClick={() => handleEditTenant(tenant)} style={{ padding: '6px 12px', backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(tenant.id, tenant.name)} disabled={loadingAction === tenant.id} style={{ padding: '6px 12px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                        {loadingAction === tenant.id ? '...' : 'Excluir'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhuma empresa cliente encontrada. Crie sua primeira empresa ao lado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
