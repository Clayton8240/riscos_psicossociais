import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Footer } from '../components/Footer';

export function Terms() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', backgroundColor: 'white', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: '600', marginRight: '40px' }}>
          <ArrowLeft size={20} /> Voltar
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '10px' }}>
            <ShieldCheck size={28} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--primary-dark)', letterSpacing: '-0.5px' }}>RPS Saúde</h1>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: '60px 20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '16px' }}>Termos de Uso</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Última atualização: 10 de Setembro de 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '16px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>1. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar a plataforma RPS Saúde, você concorda em cumprir e ser regido por estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>2. Descrição do Serviço</h2>
            <p>O RPS Saúde é uma plataforma B2B desenvolvida para auxiliar empresas no mapeamento, análise e mitigação de riscos psicossociais no ambiente de trabalho. Os serviços incluem, mas não se limitam a: disparo de questionários anônimos, tabulação de dados e criação de planos de ação.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>3. Responsabilidades do Usuário (Empresa/Consultor)</h2>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Garantir que todos os dados fornecidos no momento do cadastro sejam precisos e atuais.</li>
              <li>Manter a confidencialidade das credenciais de acesso à conta administrativa.</li>
              <li>Não utilizar o sistema para propósitos ilegais ou que violem os direitos de terceiros, incluindo o uso dos dados das pesquisas de clima para fins punitivos contra funcionários.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>4. Propriedade Intelectual</h2>
            <p>Todo o conteúdo, layout, logotipos, código-fonte e metodologias exclusivas disponibilizadas na plataforma RPS Saúde são de propriedade exclusiva da nossa empresa. A reprodução não autorizada é terminantemente proibida.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>5. Planos e Pagamentos</h2>
            <p>Os serviços são fornecidos sob diferentes modalidades de planos de assinatura. O cancelamento pode ser feito a qualquer momento através do painel de controle, sem reembolso de valores já faturados no ciclo atual.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>6. Limitação de Responsabilidade</h2>
            <p>Os relatórios e dashboards gerados pela plataforma RPS Saúde têm caráter puramente analítico e consultivo. O RPS Saúde não substitui a atuação de médicos do trabalho ou psicólogos organizacionais no diagnóstico clínico de colaboradores.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
