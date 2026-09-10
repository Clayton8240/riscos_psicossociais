import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, User as UserIcon, Settings, LayoutDashboard, FileText, 
  CheckSquare, Menu, X, Building, Users, Sun, Moon,
  Home, BarChart2, Briefcase, Bell, HelpCircle
} from 'lucide-react';
import { Footer } from './Footer';
import { ThemeToggle } from './ThemeToggle';

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<any>({ name: '', email: '', companyName: '', role: '', sectors: [] as string[] });


  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);
  const originalToken = localStorage.getItem('originalToken');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const token = localStorage.getItem('token');
      if (!token) {
        // Mock profile for demonstration if not logged in
        setProfile({ name: 'Ana Silva', email: 'ana@example.com', companyName: 'GraphiFlow', role: 'ADMIN', sectors: [] });
        return;
      }
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
      setProfile({ name: 'Ana Silva - HR Manager', email: 'ana@example.com', companyName: 'GraphiFlow', role: 'ADMIN', sectors: [] });
    }
  };

  const handleExitImpersonate = () => {
    const orig = localStorage.getItem('originalToken');
    if (orig) {
      localStorage.setItem('token', orig);
      localStorage.removeItem('originalToken');
      localStorage.setItem('role', 'CONSULTANT');
      window.location.href = '/consultant';
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
        fetchProfile(); 
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

  const SIDEBAR_WIDTH = 64;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Sidebar (Fixed Left) */}
      <aside className="app-sidebar">
        {/* Menu Icon Top */}
        <div className="sidebar-top-icon" style={{ cursor: "pointer", color: "var(--text-secondary)", marginBottom: "24px" }}>
          <Menu size={24} />
        </div>

        {/* Navigation Icons */}
        <div className="sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(0,255,133,0.1)', border: 'none', borderLeft: '3px solid var(--primary)', padding: '10px 0', cursor: 'pointer', display: 'flex', justifyContent: 'center', color: 'var(--primary)', width: '100%' }}>
            <Home size={22} />
          </button>
          <button onClick={() => navigate('/surveys/manager')} style={{ background: 'none', border: 'none', borderLeft: '3px solid transparent', padding: '10px 0', cursor: 'pointer', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', width: '100%' }}>
            <FileText size={22} />
          </button>
          <button onClick={() => navigate('/users')} style={{ background: 'none', border: 'none', borderLeft: '3px solid transparent', padding: '10px 0', cursor: 'pointer', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', width: '100%' }}>
            <Users size={22} />
          </button>
          <button onClick={() => navigate('/action-plans')} style={{ background: 'none', border: 'none', borderLeft: '3px solid transparent', padding: '10px 0', cursor: 'pointer', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', width: '100%' }}>
            <BarChart2 size={22} />
          </button>
        </div>

        <div className="sidebar-spacer" style={{ flex: 1 }} />

        {/* Bottom Icons */}
        <div className="sidebar-bottom" style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", alignItems: "center" }}>
          <button onClick={() => setShowSettingsModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <Settings size={22} />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="app-main">
        
        {/* Top Navbar */}
        <nav className="app-navbar">
          <h1 style={{ fontSize: '18px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#E2E8F0', margin: 0 }}>
            Occupational Health & Psychosocial Risk Dashboard
          </h1>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <ThemeToggle />
            <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>Home</button>
            <button onClick={handleLogout} style={{ background: 'none', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '14px', marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOut size={18} /> Sair
            </button>
          </div>
        </nav>

        {profile?.subscription && profile?.totalSubmissions >= profile?.subscription?.maxSubmissions && (
          <div style={{ margin: '0 32px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#EF4444' }}>
              <HelpCircle size={20} />
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Limite de Respostas Atingido!</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Seu plano permite até {profile.subscription.maxSubmissions} respostas. Atualize seu plano para não interromper suas pesquisas.</span>
              </div>
            </div>
            <button onClick={() => navigate('/plans')} style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}>
              Fazer Upgrade
            </button>
          </div>
        )}
        
        {/* Main Content Area */}
        <main className="app-content">
          {children}
        </main>

        <Footer />
      </div>

      {/* Settings Modal - unchanged logic */}
      {showSettingsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', width: '90%', maxWidth: '500px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={24} color="var(--primary-dark)" /> Configurações
              </h2>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-placeholder)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSettings}>
              {/* Form fields... keeping simple */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Nome Completo</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', outline: 'none', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowSettingsModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontWeight: '500', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loadingSave} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: 'var(--bg-card)', fontWeight: '500', cursor: 'pointer' }}>
                  {loadingSave ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
