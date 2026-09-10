import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Check } from 'lucide-react';

export function Plans() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedPlan) {
      localStorage.setItem('selectedPlan', selectedPlan);
      navigate('/payment');
    } else {
      alert('Selecione um plano para continuar.');
    }
  };

  const plans = [
    {
      id: 'small',
      name: 'Pequeno Porte',
      price: 'R$ 250',
      period: ' / laudo',
      features: ['Até 30 colaboradores', 'Acesso ao sistema: 30 dias', 'Laudo válido por 1 ano (NR-1)', 'Relatórios básicos'],
      color: 'var(--text-secondary)'
    },
    {
      id: 'medium',
      name: 'Médio Porte',
      price: 'R$ 450',
      period: ' / laudo',
      features: ['De 31 a 100 colaboradores', 'Acesso ao sistema: 45 dias', 'Laudo válido por 1 ano (NR-1)', 'Relatórios avançados'],
      color: 'var(--primary)',
      recommended: true
    },
    {
      id: 'large',
      name: 'Grande Porte',
      price: 'R$ 750',
      period: ' / laudo',
      features: ['De 101 a 300 colaboradores', 'Acesso ao sistema: 60 dias', 'Laudo válido por 1 ano (NR-1)', 'Suporte prioritário'],
      color: 'var(--purple)'
    },
    {
      id: 'custom',
      name: 'Excedente / Vida',
      price: 'R$ 2,50',
      period: ' / vida adicional',
      features: ['Acima de 300 colaboradores', 'Acesso ao sistema: 90 dias', 'Laudo válido por 1 ano (NR-1)', 'Consultoria dedicada'],
      color: 'var(--warning)'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <div style={{ flex: 1, padding: '60px 20px', fontFamily: 'system-ui, sans-serif' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '16px', color: 'var(--text-primary)', textAlign: 'center', fontWeight: '800' }}>Escolha o plano ideal</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '60px', fontSize: '18px' }}>Selecione o plano que melhor se adapta às necessidades da sua empresa.</p>

        <div className="responsive-grid-4" style={{ maxWidth: '1200px', margin: '0 auto', gap: '20px' }}>
          {plans.map(plan => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                padding: '40px 30px',
                border: selectedPlan === plan.id ? `3px solid ${plan.color}` : '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                boxShadow: selectedPlan === plan.id ? '0 10px 25px rgba(0,0,0,0.1)' : 'none',
                transform: selectedPlan === plan.id ? 'scale(1.02)' : 'scale(1)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {plan.recommended && (
                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: plan.color, color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Mais Escolhido
                </div>
              )}
              
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>{plan.name}</h3>
              <div style={{ marginBottom: '30px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)' }}>{plan.price}</span>
                <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                {plan.features.map((feat, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                    <Check size={20} color={plan.color} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button 
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  marginTop: '30px',
                  backgroundColor: selectedPlan === plan.id ? plan.color : 'transparent', 
                  color: selectedPlan === plan.id ? 'white' : plan.color, 
                  border: `2px solid ${plan.color}`, 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  fontSize: '16px',
                  transition: 'all 0.2s'
                }}
              >
                {selectedPlan === plan.id ? 'Selecionado' : 'Escolher Plano'}
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <button 
            onClick={handleContinue}
            disabled={!selectedPlan}
            style={{ 
              padding: '16px 48px', 
              backgroundColor: 'var(--primary)', 
              color: 'var(--bg-card)', 
              border: 'none', 
              borderRadius: '40px', 
              fontWeight: 'bold', 
              cursor: !selectedPlan ? 'not-allowed' : 'pointer', 
              fontSize: '18px', 
              opacity: !selectedPlan ? 0.5 : 1,
              boxShadow: !selectedPlan ? 'none' : '0 8px 20px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            Continuar para Pagamento
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
