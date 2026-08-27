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
      <div>
        Desenvolvido por <a href="https://graphiflow.com.br" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>GraphiFlow</a>.
      </div>
    </footer>
  );
}
