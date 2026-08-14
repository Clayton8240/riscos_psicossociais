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
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '32px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#fff', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#111827', textAlign: 'center' }}>SaaS Riscos Psicossociais</h2>
      <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '32px' }}>Faça login para acessar o painel</p>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>E-mail</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="admin@empresa.com"
            required
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Senha</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Sua senha"
            required
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', marginTop: '8px' }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
