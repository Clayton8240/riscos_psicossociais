import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';

export function Register() {
  const [tenantName, setTenantName] = useState('');
  const [document, setDocument] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert("Você deve aceitar os Termos de Uso e Política de Privacidade para continuar.");
      return;
    }
    
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      
      // 1. Criar a conta
      const regResponse = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantName, document, userName, email, password })
      });

      if (!regResponse.ok) {
        const err = await regResponse.json();
        alert(err.error || 'Erro ao criar conta');
        setLoading(false);
        return;
      }

      // 2. Fazer Login Automaticamente
      const loginResponse = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        
        // Redireciona para escolha de planos
        navigate('/plans');
      } else {
        // Se falhar o login automático por algum motivo
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão ao tentar criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', fontSize: '15px', outlineColor: 'var(--primary)', transition: 'border-color 0.2s' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600 as const, fontSize: '14px', color: 'var(--text-secondary)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'system-ui, sans-serif', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '500px', padding: '40px', border: 'none', borderRadius: '16px', backgroundColor: 'var(--bg-card)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--primary-dark)', textAlign: 'center', fontWeight: '800' }}>Criar Conta</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px', fontSize: '15px' }}>Comece a transformar o clima da sua empresa agora.</p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="responsive-grid-2">
              <div>
                <label style={labelStyle}>Nome da Empresa</label>
                <input 
                  type="text" 
                  value={tenantName} 
                  onChange={e => setTenantName(e.target.value)} 
                  placeholder="Sua Empresa LTDA"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>CNPJ / Documento</label>
                <input 
                  type="text" 
                  value={document} 
                  onChange={e => setDocument(e.target.value)} 
                  placeholder="00.000.000/0001-00"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Seu Nome</label>
              <input 
                type="text" 
                value={userName} 
                onChange={e => setUserName(e.target.value)} 
                placeholder="João Silva"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>E-mail Corporativo</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="joao@empresa.com"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Senha</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Sua senha segura"
                required
                style={inputStyle}
              />
            </div>

            {/* Caixa de aceite */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '10px', backgroundColor: 'var(--bg-hover)', padding: '16px', borderRadius: '8px' }}>
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="terms" style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: '1.4' }}>
                Li e concordo com os <a href="/termos" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Termos de Uso</a> e a <a href="/privacidade" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Política de Privacidade</a> da RPS Saúde.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: '16px', 
                backgroundColor: 'var(--primary)', 
                color: 'var(--bg-card)', 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: '600', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                fontSize: '16px', 
                marginTop: '12px',
                boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                transition: 'background-color 0.2s'
              }}
            >
              {loading ? 'Criando conta...' : 'Criar Conta e Continuar'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
              Já tem uma conta? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/login')}>Faça Login</span>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
