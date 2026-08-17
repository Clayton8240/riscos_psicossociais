import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon, Settings, LayoutDashboard, FileText, CheckSquare, Menu, X, Building, Users } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', companyName: '', role: '', sectors: [] as string[] });

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${apiUrl}/settings/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormName(data.name);
        setFormEmail(data.email);
        setFormCompany(data.companyName || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSave(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const token = localStorage.getItem('token');
      const body: any = { 
        name: formName, 
        email: formEmail, 
        companyName: formCompany 
      };
      
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch(`${apiUrl}/settings/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Perfil atualizado com sucesso!');
        setShowSettingsModal(false);
        fetchProfile(); // Refresh
        setCurrentPassword('');
        setNewPassword('');
      } else {
        alert(data.error || 'Erro ao atualizar perfil');
      }
    } catch (e) {
      alert('Erro de conexão');
    } finally {
      setLoadingSave(false);
    }
  };

  const navItems: any[] = [];

  if (profile.role === 'ADMIN' || profile.role === 'SUPERADMIN') {
    navItems.push({ label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> });
    navItems.push({ label: 'Pesquisas', path: '/surveys/manager', icon: <FileText size={20} /> });
  }

  navItems.push({ label: 'Planos de Ação', path: '/action-plans', icon: <CheckSquare size={20} /> });

  if (profile.role === 'ADMIN' || profile.role === 'SUPERADMIN') {
    navItems.push({ label: 'Gestores', path: '/users', icon: <Users size={20} /> });
  }

  const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Top Navbar */}
      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '64px' }}>
            
            {/* Logo & Desktop Nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '40px', height: '32px', borderRadius: '8px', backgroundColor: '#312e81', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                  RPS
                </div>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                  {profile.companyName || 'Meu SaaS'}
                </span>
              </div>

              <div style={{ gap: '32px', display: 'flex' }} className="desktop-nav desktop-only">
                {navItems.map(item => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      style={{
                        background: 'none', border: 'none', padding: '0', margin: 0, height: '64px',
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        color: isActive ? '#312e81' : '#6b7280',
                        fontWeight: isActive ? '600' : '500',
                        borderBottom: isActive ? '2px solid #312e81' : '2px solid transparent',
                        transition: 'color 0.2s'
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile Menu & Mobile Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '24px' }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#312e81', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                    {getInitial(profile.name)}
                  </div>
                  <div style={{ textAlign: 'left' }} className="desktop-only">
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{profile.name || 'Meu Perfil'}</div>
                  </div>
                </button>

                {showProfileMenu && (
                  <div style={{ position: 'absolute', right: 0, top: '48px', width: '220px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{profile.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.email}</div>
                    </div>
                    <div style={{ padding: '8px' }}>
                      <button 
                        onClick={() => { setShowSettingsModal(true); setShowProfileMenu(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', color: '#374151', fontSize: '14px', textAlign: 'left' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <UserIcon size={16} /> Meu Perfil
                      </button>
                      <button 
                        onClick={handleLogout}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', color: '#ef4444', fontSize: '14px', textAlign: 'left' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <LogOut size={16} /> Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: '4px' }}
                className="mobile-toggle"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Sidebar Navigation */}
        {mobileMenuOpen && (
          <div className="layout-sidebar open" style={{ backgroundColor: '#ffffff', zIndex: 50, borderRight: '1px solid #e5e7eb', boxShadow: '4px 0 10px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navItems.map(item => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                      background: isActive ? '#f3f4f6' : 'transparent', border: 'none', borderRadius: '8px',
                      color: isActive ? '#312e81' : '#4b5563', fontWeight: isActive ? '600' : '500',
                      textAlign: 'left', cursor: 'pointer', marginBottom: '4px'
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </main>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '90%', maxWidth: '500px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={24} color="#312e81" /> Configurações
              </h2>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSettings}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Nome Completo</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>E-mail</label>
                <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  <Building size={16} /> Nome da Empresa (Display)
                </label>
                <input type="text" value={formCompany} onChange={e => setFormCompany(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#6b7280' }}>Isso atualizará o nome exibido no topo da tela.</p>
              </div>

              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#111827' }}>Trocar Senha (Opcional)</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Senha Atual</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Deixe em branco para não alterar" />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Nova Senha</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Sua nova senha segura" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowSettingsModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'transparent', color: '#374151', fontWeight: '500', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loadingSave} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {loadingSave ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Basic media queries injected inline via style block for desktop classes */}
      <style>{`
        @media (min-width: 768px) {
          .mobile-toggle { display: none !important; }
          .mobile-menu { display: none !important; }
          .desktop-nav { display: flex !important; }
          .desktop-profile { display: block !important; }
        }
      `}</style>
    </div>
  );
}
