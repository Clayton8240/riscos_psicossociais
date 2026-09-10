export function Footer() {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '24px 20px',
      fontSize: '13px',
      color: 'var(--text-muted)',
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'transparent',
      marginTop: 'auto'
    }}>
      <div style={{ marginBottom: '4px' }}>
        &copy; 2026 RPS Graphiflow. Todos os direitos reservados.
      </div>
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <a href="/termos" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Termos de Uso</a>
        <a href="/privacidade" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Política de Privacidade</a>
      </div>
      <div>
        Desenvolvido por <a href="https://graphiflow.com.br" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>GraphiFlow</a>.
      </div>
    </footer>
  );
}
