import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Salva token
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);

        // Redirecionamento inteligente
        if (data.user.role === 'SUPERADMIN') {
          navigate('/superadmin');
        } else if (data.user.role === 'LEADER') {
          navigate('/action-plans');
        } else {
          navigate('/dashboard');
        }
      } else {
        const err = await response.json();
        alert(err.error || 'Erro de autenticação');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão ao tentar fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '40px', border: 'none', borderRadius: '16px', backgroundColor: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px', color: '#312e81', textAlign: 'center', fontWeight: '800' }}>RPS - Riscos Psicossociais</h2>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '32px', fontSize: '15px' }}>Faça login para acessar o painel de RH</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>E-mail corporativo</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="admin@empresa.com"
              required
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', outlineColor: '#2563eb', transition: 'border-color 0.2s' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Sua senha"
              required
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', outlineColor: '#2563eb', transition: 'border-color 0.2s' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '16px', 
              backgroundColor: '#2563eb', 
              color: '#ffffff', 
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
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
