import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Footer } from '../components/Footer';

export function Privacy() {
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
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '16px' }}>Política de Privacidade</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Última atualização: 10 de Setembro de 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '16px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>1. O nosso compromisso com a sua privacidade</h2>
            <p>O RPS Saúde valoriza profundamente a privacidade e o anonimato de todos os usuários. A natureza do nosso serviço (mapeamento de riscos psicossociais) exige rigoroso cumprimento da LGPD (Lei Geral de Proteção de Dados Pessoais).</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>2. Como lidamos com os dados dos Colaboradores (Respondentes)</h2>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Anonimato Total:</strong> Os questionários enviados aos colaboradores não coletam nome, e-mail, matrícula ou endereço IP.</li>
              <li><strong>Dados Coletados:</strong> Apenas respostas das matrizes (probabilidade e impacto) e o Setor do funcionário são registrados para fins analíticos.</li>
              <li>Nenhuma resposta individual é exibida ao painel do administrador da empresa. Os relatórios são gerados apenas a partir de agregações por setor/grupo.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>3. Como lidamos com os dados de Administradores e Consultores</h2>
            <p>Para o funcionamento da plataforma, precisamos coletar dados cadastrais das contas que gerenciam o sistema:</p>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <li>Nome, E-mail, Telefone e Cargo para fins de acesso e autenticação.</li>
              <li>CNPJ e Razão Social da empresa contratante para faturamento e criação de licenças.</li>
              <li>Informações de uso da plataforma (logs de acesso) para prevenção de fraudes e suporte técnico.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>4. Compartilhamento de Dados</h2>
            <p>Não vendemos ou compartilhamos os dados coletados com terceiros para fins publicitários. O compartilhamento ocorre estritamente para o funcionamento do serviço, como provedores de hospedagem cloud (AWS, Google Cloud) e processadores de pagamento (Stripe, Asaas), sob rigorosos contratos de sigilo.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>5. Segurança</h2>
            <p>Utilizamos protocolos modernos de criptografia (SSL/TLS) e senhas hasheadas (bcrypt). Embora nos esforcemos ao máximo para proteger suas informações, ressaltamos que nenhum sistema na internet é 100% infalível.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>6. Direitos do Titular</h2>
            <p>De acordo com a LGPD, o administrador da conta pode, a qualquer momento, solicitar acesso, retificação ou exclusão permanente dos dados do seu banco na plataforma RPS Saúde entrando em contato conosco via e-mail.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
