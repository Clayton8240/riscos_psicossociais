import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { CreditCard, Lock, CheckCircle, Smartphone, FileText } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  gateway: string;
}

export function Payment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  
  const selectedPlanId = localStorage.getItem('selectedPlan') || 'medium';
  
  const planDetails: Record<string, { name: string; price: string }> = {
    'small': { name: 'Pequeno Porte', price: 'R$ 250,00' },
    'medium': { name: 'Médio Porte', price: 'R$ 450,00' },
    'large': { name: 'Grande Porte', price: 'R$ 750,00' },
    'custom': { name: 'Excedente / Vida', price: 'Base R$ 750,00 + R$ 2,50/vida' },
    'consultant_start': { name: 'Start Consultor', price: 'R$ 450,00' },
    'consultant_pro': { name: 'Pro SST', price: 'R$ 750,00' },
    'consultant_enterprise': { name: 'Enterprise Escala', price: 'R$ 1.400,00' }
  };
  
  const currentPlan = planDetails[selectedPlanId] || planDetails['medium'];

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const res = await fetch(`${apiUrl}/checkout/config`);
      if (res.ok) {
        const data = await res.json();
        setMethods(data.methods);
        if (data.methods.length > 0) {
          setSelectedMethod(data.methods[0].id);
        }
      }
    } catch (e) {
      console.error('Erro ao buscar métodos de pagamento', e);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${apiUrl}/checkout/stripe-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          planId: selectedPlanId,
          paymentMethod: selectedMethod
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          setSuccess(true);
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao processar pagamento');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão ao processar pagamento');
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color-dark)', fontSize: '15px', outlineColor: 'var(--primary)', transition: 'border-color 0.2s', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600 as const, fontSize: '14px', color: 'var(--text-secondary)' };

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
          <CheckCircle size={80} color="var(--success)" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '32px', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '10px' }}>Pagamento Aprovado!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Redirecionando para o seu painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'system-ui, sans-serif', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '600px', padding: '40px', border: 'none', borderRadius: '16px', backgroundColor: 'var(--bg-card)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', justifyContent: 'center' }}>
            <Lock size={32} color="var(--primary)" />
            <h2 style={{ fontSize: '28px', margin: 0, color: 'var(--text-primary)', fontWeight: '800' }}>Checkout Seguro</h2>
          </div>

          <div style={{ backgroundColor: 'var(--bg-hover)', padding: '20px', borderRadius: '12px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '18px' }}>Plano {currentPlan.name}</p>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>Cobrança por laudo</p>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {currentPlan.price}
            </div>
          </div>

          <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Método de Pagamento</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {methods.map(m => (
                  <button 
                    type="button" 
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    style={{ 
                      flex: 1, 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: selectedMethod === m.id ? '2px solid var(--primary)' : '1px solid var(--border-color-dark)', 
                      backgroundColor: selectedMethod === m.id ? 'var(--primary-light)' : 'transparent', 
                      color: selectedMethod === m.id ? 'var(--primary-dark)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      fontWeight: 'bold'
                    }}
                  >
                    {m.id === 'credit_card' && <CreditCard size={24} />}
                    {m.id === 'pix' && <Smartphone size={24} />}
                    {m.id === 'boleto' && <FileText size={24} />}
                    {m.id === 'paypal' && <CreditCard size={24} />}
                    {m.name}
                  </button>
                ))}
                {methods.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Carregando métodos de pagamento...</p>}
              </div>
            </div>

            {selectedMethod === 'credit_card' && (
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>Você será redirecionado para o Stripe para concluir sua assinatura com Cartão de Crédito.</p>
              </div>
            )}

            {selectedMethod === 'boleto' && (
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>Você será redirecionado para o Stripe, onde poderá gerar seu Boleto ou pagar via Pix.</p>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', marginTop: '10px', justifyContent: 'center' }}>
              <Lock size={16} />
              <span>Ambiente de pagamento protegido por criptografia ponta-a-ponta.</span>
            </div>

            <button 
              type="submit" 
              disabled={loading || methods.length === 0}
              style={{ 
                padding: '16px', 
                backgroundColor: 'var(--primary)', 
                color: 'var(--bg-card)', 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                cursor: loading || methods.length === 0 ? 'not-allowed' : 'pointer', 
                fontSize: '18px', 
                marginTop: '10px',
                boxShadow: loading || methods.length === 0 ? 'none' : '0 6px 16px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {loading ? 'Processando...' : 'Assinar Agora'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
