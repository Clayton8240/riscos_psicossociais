import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, Users, ArrowRight, CheckCircle, BarChart3, PieChart, TrendingUp, ChevronRight, AlertTriangle } from 'lucide-react';
import { Footer } from '../components/Footer';
import { ThemeToggle } from '../components/ThemeToggle';

export function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChoosePlan = (planId: string) => {
    localStorage.setItem('selectedPlan', planId);
    navigate('/register');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', overflowX: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ 
        padding: '16px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent', 
        backdropFilter: scrolled ? 'blur(12px)' : 'none', 
        position: 'fixed', 
        top: 0, 
        left: 0,
        right: 0,
        zIndex: 100, 
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo(0,0)}>
          <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '10px' }}>
            <ShieldCheck size={28} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--primary-dark)', letterSpacing: '-0.5px' }}>RPS Saúde</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ThemeToggle />
          <button onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: '15px', padding: '8px 16px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Planos</button>
          <button onClick={() => navigate('/consultores')} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '15px', padding: '8px 16px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--primary-bg)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Para Consultores</button>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: '15px', padding: '8px 16px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Entrar</button>
          <button onClick={() => navigate('/register')} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '30px', fontWeight: 600, cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 14px rgba(37,99,235,0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={e => {e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.4)';}} onMouseOut={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.3)';}}>
            Criar Conta
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ paddingTop: '160px', paddingBottom: '100px', paddingLeft: '40px', paddingRight: '40px', background: 'radial-gradient(circle at top right, var(--primary-light) 0%, var(--bg-main) 40%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '60px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Text Content */}
          <div style={{ flex: '1 1 500px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px', marginBottom: '24px' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }}></span> 
              Novo Módulo de Análise Inteligente
            </div>
            <h1 style={{ fontSize: '64px', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', color: 'var(--primary-dark)', letterSpacing: '-2px' }}>
              Proteja a <span style={{ color: 'var(--primary)' }}>Saúde Mental</span> da sua Equipe.
            </h1>
            <p style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: '1.6', maxWidth: '540px' }}>
              A plataforma definitiva para mapear, analisar e mitigar riscos psicossociais no ambiente de trabalho. Decisões baseadas em dados para um clima organizacional incrível.
            </p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={() => navigate('/register')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--primary)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '40px', fontWeight: 'bold', fontSize: '17px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.4)', transition: 'all 0.2s' }}
                onMouseOver={(e) => {e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(37,99,235,0.5)';}}
                onMouseOut={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.4)';}}>
                Começar Teste Grátis <ArrowRight size={20} />
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Não requer cartão de crédito</span>
            </div>
          </div>

          {/* Visual Mockup - Dashboard */}
          <div style={{ flex: '1 1 500px', position: 'relative', perspective: '1000px', zIndex: 10 }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: '24px', 
              boxShadow: '0 24px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)', 
              padding: '24px', 
              transform: 'rotateY(-15deg) rotateX(5deg)', 
              transformStyle: 'preserve-3d',
              transition: 'transform 0.5s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'rotateY(-5deg) rotateX(2deg) translateY(-10px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'rotateY(-15deg) rotateX(5deg)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Visão Geral - Risco Psicossocial</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--danger)' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--warning)' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)' }}></div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: 'rgba(37,99,235,0.1)', padding: '8px', borderRadius: '8px' }}><Activity size={20} color="var(--primary)" /></div>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Risco Global</span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary-dark)' }}>2.4<span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '500' }}> / 5</span></div>
                  <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '600', marginTop: '4px' }}>↓ 12% vs último mês</div>
                </div>
                <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: 'rgba(239,68,68,0.1)', padding: '8px', borderRadius: '8px' }}><AlertTriangle size={20} color="var(--danger)" /></div>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Pontos Críticos</span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--danger)' }}>3</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '4px' }}>Setores: TI, Vendas</div>
                </div>
              </div>

              {/* Mock Chart Area */}
              <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '16px' }}>
                 <h5 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Evolução do Engajamento</h5>
                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '100px' }}>
                    {[40, 55, 45, 70, 65, 85, 90].map((h, i) => (
                      <div key={i} style={{ flex: 1, background: i === 6 ? 'var(--primary)' : 'var(--primary-light)', height: `${h}%`, borderRadius: '4px 4px 0 0', opacity: i === 6 ? 1 : 0.6 }}></div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Floating Survey Element */}
            <div style={{ 
              position: 'absolute', 
              bottom: '-30px', 
              left: '-40px', 
              background: 'var(--bg-card)', 
              padding: '20px', 
              borderRadius: '16px', 
              boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              transform: 'translateZ(50px)',
              zIndex: 20,
              width: '280px',
              animation: 'float 6s ease-in-out infinite'
            }}>
               <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '8px' }}>Nova Resposta Coletada</div>
               <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '12px', lineHeight: '1.4' }}>"Sinto que a carga de trabalho está adequada."</div>
               <div style={{ display: 'flex', gap: '4px' }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{ flex: 1, height: '8px', borderRadius: '4px', background: n <= 4 ? 'var(--success)' : 'var(--bg-hover)' }}></div>
                  ))}
               </div>
            </div>
            <style>
              {`@keyframes float { 0% { transform: translateY(0px) translateZ(50px); } 50% { transform: translateY(-15px) translateZ(50px); } 100% { transform: translateY(0px) translateZ(50px); } }`}
            </style>
          </div>
        </div>
      </section>

      {/* Como Funciona Section (Survey Example) */}
      <section style={{ padding: '100px 20px', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '16px' }}>Experiência Fluida para a Equipe</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>Questionários baseados na metodologia <strong>Matriz de Risco (Probabilidade x Impacto)</strong> com uma interface que as pessoas realmente gostam de responder.</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
            <div style={{ flex: '1 1 400px' }}>
               {/* Survey Mockup */}
               <div style={{ background: 'var(--bg-main)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--bg-card)', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    Pergunta 4 de 15
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>Exigência Emocional</h3>
                  <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px' }}>O seu trabalho exige que você esconda suas emoções (por exemplo, parecer calmo quando está irritado)?</p>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>Qual a probabilidade / frequência?</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['Raramente', 'Às vezes', 'Sempre'].map((opt, i) => (
                        <div key={i} style={{ flex: 1, textAlign: 'center', padding: '12px', background: i === 1 ? 'var(--primary)' : 'var(--bg-card)', color: i === 1 ? 'white' : 'var(--text-secondary)', borderRadius: '12px', border: i === 1 ? 'none' : '1px solid var(--border-color-dark)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>Qual o impacto no seu bem-estar?</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['Baixo', 'Médio', 'Alto'].map((opt, i) => (
                        <div key={i} style={{ flex: 1, textAlign: 'center', padding: '12px', background: i === 2 ? 'var(--danger)' : 'var(--bg-card)', color: i === 2 ? 'white' : 'var(--text-secondary)', borderRadius: '12px', border: i === 2 ? 'none' : '1px solid var(--border-color-dark)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                    <button style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>Próxima Pergunta</button>
                  </div>
               </div>
            </div>
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
               <div style={{ display: 'flex', gap: '16px' }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                   <BarChart3 size={24} color="var(--primary)" />
                 </div>
                 <div>
                   <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>Cálculo Automático de Risco</h4>
                   <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Cruzamos as respostas de Probabilidade e Impacto instantaneamente para gerar um score de criticidade para cada setor.</p>
                 </div>
               </div>
               <div style={{ display: 'flex', gap: '16px' }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                   <ShieldCheck size={24} color="var(--success)" />
                 </div>
                 <div>
                   <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>Totalmente Anônimo e LGPD</h4>
                   <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>O colaborador informa apenas o Setor. Não coletamos dados pessoais sensíveis, garantindo a sinceridade e segurança jurídica.</p>
                 </div>
               </div>
               <div style={{ display: 'flex', gap: '16px' }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                   <PieChart size={24} color="var(--purple)" />
                 </div>
                 <div>
                   <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>Mapeamento Dinâmico</h4>
                   <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Identifique exatamente quais equipes precisam de intervenção imediata através dos nossos painéis em tempo real.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 20px', backgroundColor: 'var(--bg-main)', position: 'relative' }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: '800', marginBottom: '60px', color: 'var(--primary-dark)' }}>Por que as empresas amam o RPS?</h2>
        <div className="responsive-grid-3" style={{ gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { icon: <Activity size={32} color="var(--primary)" />, title: 'Diagnóstico Científico', desc: 'Metodologias validadas para mapear o clima sem achismos.' },
            { icon: <TrendingUp size={32} color="var(--success)" />, title: 'Planos de Ação', desc: 'Atribua responsáveis e prazos. Acompanhe a execução das melhorias de ponta a ponta.' },
            { icon: <Users size={32} color="var(--purple)" />, title: 'Gestão Multi-Empresa', desc: 'Perfeito para Consultorias. Gerencie diversos clientes, pesquisas e faturamentos num só lugar.' }
          ].map((feat, i) => (
            <div key={i} style={{ padding: '40px 32px', backgroundColor: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default' }}
                 onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
                 onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-primary)' }}>{feat.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '16px' }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" style={{ padding: '100px 20px', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h3 style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>Planos para Empresas</h3>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Invista na saúde mental do seu time com nossos pacotes pré-pagos (por laudo).</p>
          </div>

          <div className="responsive-grid-3" style={{ gap: '30px', alignItems: 'stretch' }}>
            {/* Pequeno Porte */}
            <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s' }}
                 onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
                 onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <h4 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Pequeno Porte</h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Até 30 colaboradores</p>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)' }}>R$ 250</span>
              </div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}><CheckCircle size={20} color="var(--primary)" /> Acesso ao sistema por 30 dias</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}><CheckCircle size={20} color="var(--primary)" /> Laudo gerado válido por 1 ano (NR-1)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}><CheckCircle size={20} color="var(--primary)" /> Dashboard em tempo real</li>
              </ul>

              <button onClick={() => handleChoosePlan('small')} style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', color: 'var(--primary)', border: '2px solid var(--primary)', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '24px', transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                      onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}>
                Começar Agora
              </button>
            </div>

            {/* Médio Porte */}
            <div style={{ backgroundColor: 'var(--primary-bg)', border: '3px solid var(--primary)', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', position: 'relative', transform: 'scale(1.05)', boxShadow: '0 24px 48px rgba(37, 99, 235, 0.15)' }}>
              <div style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary)', color: 'white', padding: '8px 24px', borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                O Mais Recomendado
              </div>
              
              <h4 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Médio Porte</h4>
              <p style={{ color: 'var(--primary)', opacity: 0.8, marginBottom: '20px', fontWeight: '500' }}>De 31 a 100 colaboradores</p>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)' }}>R$ 450</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-primary)' }}><CheckCircle size={20} color="var(--primary)" /> Acesso ao sistema por 45 dias</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-primary)' }}><CheckCircle size={20} color="var(--primary)" /> Laudo gerado válido por 1 ano (NR-1)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-primary)' }}><CheckCircle size={20} color="var(--primary)" /> Dashboard em tempo real</li>
              </ul>

              <button onClick={() => handleChoosePlan('medium')} style={{ width: '100%', padding: '16px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '24px', boxShadow: '0 8px 15px rgba(37, 99, 235, 0.3)', transition: 'all 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                Começar Agora
              </button>
            </div>

            {/* Grande Porte */}
            <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s' }}
                 onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
                 onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <h4 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Grande Porte</h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>De 101 a 300 colaboradores</p>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)' }}>R$ 750</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}><CheckCircle size={20} color="var(--primary)" /> Acesso ao sistema por 60 dias</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}><CheckCircle size={20} color="var(--primary)" /> Laudo gerado válido por 1 ano (NR-1)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}><CheckCircle size={20} color="var(--primary)" /> Dashboard em tempo real</li>
              </ul>

              <button onClick={() => handleChoosePlan('large')} style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', color: 'var(--primary)', border: '2px solid var(--primary)', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '24px', transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                      onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}>
                Começar Agora
              </button>
            </div>
          </div>

          <div style={{ marginTop: '50px', padding: '30px', backgroundColor: 'var(--bg-main)', border: '1px dashed var(--primary)', borderRadius: '16px', textAlign: 'center', maxWidth: '800px', margin: '50px auto 0' }}>
            <h5 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px' }}>Acima de 300 colaboradores?</h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '0' }}>
              <strong>Plano Personalizado:</strong> Valor base de R$ 750,00 + <strong>R$ 2,50 por vida excedente</strong>. Feito sob medida para grandes estruturas.
            </p>
          </div>

        </div>
      </section>

      {/* Social Proof / Call to action */}
      <section style={{ padding: '100px 20px', backgroundColor: 'var(--primary-dark)', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '120%', height: '200%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)', zIndex: 0 }}></div>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <h2 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '24px', letterSpacing: '-1px' }}>Pronto para transformar sua empresa?</h2>
          <p style={{ fontSize: '22px', opacity: 0.9, marginBottom: '40px', lineHeight: '1.5' }}>Pare de adivinhar como está o clima organizacional. Tenha dados reais e proteja seu time hoje mesmo.</p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginBottom: '48px' }}>
            {['14 dias grátis', 'Setup imediato', 'Cancele quando quiser'].map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 600 }}>
                <CheckCircle size={24} color="var(--success)" /> {item}
              </li>
            ))}
          </ul>
          <button onClick={() => navigate('/register')} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'white', color: 'var(--primary-dark)', border: 'none', padding: '20px 48px', borderRadius: '40px', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer', boxShadow: '0 12px 32px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            Criar Minha Conta Grátis <ChevronRight size={24} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
