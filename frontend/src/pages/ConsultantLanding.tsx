import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Check, Users, Briefcase, TrendingUp, ShieldCheck, ArrowRight, BarChart3, ChevronRight, Activity, Building, Settings } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export function ConsultantLanding() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChoosePlan = (planId: string) => {
    localStorage.setItem('selectedPlan', planId);
    navigate('/register?role=consultant');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)', fontFamily: 'system-ui, sans-serif', overflowX: 'hidden' }}>
      
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '10px' }}>
            <ShieldCheck size={28} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--primary-dark)', letterSpacing: '-0.5px' }}>RPS Saúde</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ThemeToggle />
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: '15px', padding: '8px 16px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Para Empresas</button>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: '15px', padding: '8px 16px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Entrar</button>
          <button onClick={() => navigate('/register?role=consultant')} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '30px', fontWeight: 600, cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 14px rgba(37,99,235,0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={e => {e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.4)';}} onMouseOut={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.3)';}}>
            Criar Conta
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ paddingTop: '160px', paddingBottom: '100px', paddingLeft: '40px', paddingRight: '40px', background: 'radial-gradient(circle at top right, rgba(126, 34, 206, 0.15) 0%, var(--bg-main) 50%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '60px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Text Content */}
          <div style={{ flex: '1 1 500px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(126, 34, 206, 0.1)', color: 'var(--purple)', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px', marginBottom: '24px' }}>
              <Briefcase size={16} /> Exclusivo para Profissionais SST & Consultorias
            </div>
            <h1 style={{ fontSize: '64px', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', color: 'var(--text-primary)', letterSpacing: '-2px' }}>
              Escale suas consultorias com <span style={{ color: 'var(--purple)' }}>lucro e escala</span>.
            </h1>
            <p style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: '1.6', maxWidth: '540px' }}>
              Gerencie múltiplos clientes em um único painel. Reduza o tempo de coleta, entregue relatórios premium e multiplique seu faturamento.
            </p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--purple)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '40px', fontWeight: 'bold', fontSize: '17px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(126,34,206,0.3)', transition: 'all 0.2s' }}
                onMouseOver={(e) => {e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(126,34,206,0.4)';}}
                onMouseOut={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(126,34,206,0.3)';}}>
                Ver Planos <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* 3D Visual Mockup */}
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
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Dashboard Consolidado (Consultor)</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--danger)' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--warning)' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)' }}></div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { name: 'Indústria Metalúrgica SA', risk: '3.8', status: 'Crítico', color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
                  { name: 'Tech Solutions Ltda', risk: '2.1', status: 'Controlado', color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
                  { name: 'Construtora Horizonte', risk: '2.9', status: 'Atenção', color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
                ].map((empresa, i) => (
                  <div key={i} style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: empresa.bg, padding: '10px', borderRadius: '10px' }}>
                        <Building size={20} color={empresa.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{empresa.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status: {empresa.status}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: empresa.color }}>
                      {empresa.risk} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Risco</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Element */}
            <div style={{ 
              position: 'absolute', 
              bottom: '-30px', 
              right: '-20px', 
              background: 'var(--bg-card)', 
              padding: '20px', 
              borderRadius: '16px', 
              boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              transform: 'translateZ(60px)',
              zIndex: 20,
              width: '260px',
              animation: 'floatConsultant 6s ease-in-out infinite'
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div style={{ background: 'rgba(126,34,206,0.1)', padding: '12px', borderRadius: '50%' }}>
                   <TrendingUp size={24} color="var(--purple)" />
                 </div>
                 <div>
                   <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Margem de Lucro Estimada</div>
                   <div style={{ fontSize: '24px', color: 'var(--text-primary)', fontWeight: '800' }}>+450%</div>
                 </div>
               </div>
            </div>
            <style>
              {`@keyframes floatConsultant { 0% { transform: translateY(0px) translateZ(60px); } 50% { transform: translateY(-15px) translateZ(60px); } 100% { transform: translateY(0px) translateZ(60px); } }`}
            </style>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '100px 20px', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>Vantagens Competitivas</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>Construído do zero para atender as dores de quem gerencia avaliações de terceiros.</p>
          </div>
          
          <div className="responsive-grid-3" style={{ gap: '30px' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)', transition: 'transform 0.3s, box-shadow 0.3s' }}
                 onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
                 onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <TrendingUp size={32} />
              </div>
              <h4 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>Alta Margem de Lucro</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '16px' }}>O custo por empresa chega a ser menos de R$ 60 no nosso plano maior. Cobre do seu cliente o valor da sua expertise e maximize a lucratividade.</p>
            </div>
            
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)', transition: 'transform 0.3s, box-shadow 0.3s' }}
                 onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
                 onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Users size={32} />
              </div>
              <h4 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>Gestão Centralizada</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '16px' }}>Deixe o Excel de lado. Separe cada cliente, acompanhe o andamento das coletas em tempo real e emita laudos organizados com apenas um clique.</p>
            </div>
            
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)', transition: 'transform 0.3s, box-shadow 0.3s' }}
                 onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
                 onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--purple-bg)', color: 'var(--purple)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <ShieldCheck size={32} />
              </div>
              <h4 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>Totalmente LGPD</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '16px' }}>As pesquisas são anônimas e o sistema blinda a identidade dos colaboradores. Entregue um projeto que passa por auditorias de compliance facilmente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" style={{ padding: '100px 20px', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h3 style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>Planos para Consultorias</h3>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Previsibilidade e escalabilidade para multiplicar seus laudos.</p>
          </div>

          <div className="responsive-grid-3" style={{ gap: '30px', alignItems: 'stretch' }}>
            {/* Start Consultor */}
            <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Start Consultor</h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Para quem está começando a escalar.</p>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)' }}>R$ 450</span>
                <span style={{ color: 'var(--text-muted)' }}>/mês</span>
              </div>
              
              <div style={{ padding: '16px', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>
                Custo Médio: R$ 150 / Empresa
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}><Check size={20} color="var(--purple)" /> <strong>Até 3 empresas</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}><Check size={20} color="var(--purple)" /> Até 150 avaliações/mês</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}><Check size={20} color="var(--purple)" /> Dashboard unificado</li>
              </ul>

              <button onClick={() => handleChoosePlan('consultant_start')} style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', color: 'var(--purple)', border: '2px solid var(--purple)', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '24px', transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--purple)'; e.currentTarget.style.color = 'white'; }}
                      onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--purple)'; }}>
                Assinar Start
              </button>
            </div>

            {/* Pro SST */}
            <div style={{ backgroundColor: 'var(--purple-bg)', border: '3px solid var(--purple)', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', position: 'relative', transform: 'scale(1.05)', boxShadow: '0 24px 48px rgba(126, 34, 206, 0.15)' }}>
              <div style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--purple)', color: 'white', padding: '8px 24px', borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                O Mais Escolhido
              </div>
              
              <h4 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Pro SST</h4>
              <p style={{ color: 'var(--purple)', opacity: 0.8, marginBottom: '20px', fontWeight: '500' }}>Escalabilidade para portfólios maduros.</p>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)' }}>R$ 750</span>
                <span style={{ color: 'var(--text-muted)' }}>/mês</span>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>
                Custo Médio: R$ 75 / Empresa
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-primary)' }}><Check size={20} color="var(--purple)" /> <strong>Até 10 empresas</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-primary)' }}><Check size={20} color="var(--purple)" /> Até 600 avaliações/mês</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-primary)' }}><Check size={20} color="var(--purple)" /> Relatórios avançados com sua logo</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-primary)' }}><Check size={20} color="var(--purple)" /> Suporte prioritário</li>
              </ul>

              <button onClick={() => handleChoosePlan('consultant_pro')} style={{ width: '100%', padding: '16px', backgroundColor: 'var(--purple)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '24px', boxShadow: '0 8px 15px rgba(126, 34, 206, 0.3)', transition: 'all 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                Assinar Pro SST
              </button>
            </div>

            {/* Enterprise Escala */}
            <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Enterprise Escala</h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Para operações de alto volume.</p>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)' }}>R$ 1.400</span>
                <span style={{ color: 'var(--text-muted)' }}>/mês</span>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>
                Custo Médio: R$ 56 / Empresa
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}><Check size={20} color="var(--purple)" /> <strong>Até 25 empresas</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}><Check size={20} color="var(--purple)" /> Até 2.000 avaliações/mês</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}><Check size={20} color="var(--purple)" /> Consultoria de engenharia dedicada</li>
              </ul>

              <button onClick={() => handleChoosePlan('consultant_enterprise')} style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', color: 'var(--purple)', border: '2px solid var(--purple)', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '24px', transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--purple)'; e.currentTarget.style.color = 'white'; }}
                      onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--purple)'; }}>
                Assinar Enterprise
              </button>
            </div>
          </div>

          <div style={{ marginTop: '50px', padding: '30px', backgroundColor: 'var(--bg-main)', border: '1px dashed var(--purple)', borderRadius: '16px', textAlign: 'center', maxWidth: '800px', margin: '50px auto 0' }}>
            <h5 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px' }}>Precisa de uma estrutura maior?</h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '0' }}>
              <strong>Empresas Extras:</strong> Adicione empresas adicionais e blocos de +100 avaliações por apenas <strong>R$ 60,00 mensais</strong>. Adaptamos nosso servidor ao tamanho do seu negócio.
            </p>
          </div>

        </div>
      </section>

      {/* CTA Final */}
      <section style={{ padding: '100px 20px', backgroundColor: 'var(--text-primary)', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '120%', height: '200%', background: 'radial-gradient(circle, rgba(126,34,206,0.3) 0%, transparent 60%)', zIndex: 0 }}></div>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <h2 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '24px', letterSpacing: '-1px' }}>Leve sua Consultoria ao próximo nível</h2>
          <p style={{ fontSize: '22px', opacity: 0.9, marginBottom: '40px', lineHeight: '1.5' }}>Gere valor instantâneo, impressione seus clientes com relatórios interativos e veja sua margem de lucro crescer exponencialmente.</p>
          <button onClick={() => navigate('/register?role=consultant')} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'var(--purple)', color: 'white', border: 'none', padding: '20px 48px', borderRadius: '40px', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer', boxShadow: '0 12px 32px rgba(126,34,206,0.4)', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            Começar Agora Mesmo <ChevronRight size={24} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
