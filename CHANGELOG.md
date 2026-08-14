# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato baseia-se em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-08-14

### Adicionado
- **Motor Estatístico Offline:** Implementação do motor matemático no backend (Média, Variância, Desvio Padrão e Alfa de Cronbach).
- **Relatório Analítico Executivo:** Geração automática de relatórios psicométricos determinísticos para gestores sem dependência de APIs externas de inteligência artificial.
- **Detecção de Polarização:** Algoritmo que alerta se o desvio padrão de respostas dentro de um setor é muito alto, identificando times com divergências severas de bem-estar.
- **UI Progressiva (Progressive Disclosure):** Novo botão de "Metodologia e Cálculos" no frontend para detalhar as fórmulas e a proteção offline de dados de forma didática aos clientes e auditores.
- **Exportação de Link:** Botão facilitado "Copiar Link" na tela inicial do dashboard, para divulgação rápida de pesquisas ativas.
- **Interpretação Humanizada:** Inclusão de mensagens amigáveis ("O que isso significa?") orientando ações do RH de acordo com a nota da confiabilidade do Alfa de Cronbach, evitando pânico diante de classificações "inaceitáveis".
- Suporte para Markdown Nativo no Frontend usando a biblioteca `react-markdown` para exibição estruturada e profissional do relatório analítico.

### Modificado
- Fluxo de exclusão de pesquisas (`Cascade Delete` via código) para remover todas as respostas, submissões e perguntas conectadas a uma pesquisa antes de removê-la, corrigindo a trava impeditiva de banco de dados por segurança estrutural (Foreign Key Constraint).

## [1.0.0] - Lançamento Inicial

### Adicionado
- Criação e estruturação base do monorepo de backend (Node.js/Express) e frontend (React/Vite).
- Fluxo central para Super Admin (cadastro de empresas) e Tenant Admin (Dashboard).
- Criação de templates de pesquisas padronizadas focadas em riscos psicossociais e segurança de trabalho.
- Matriz de Riscos Bidimensional Dinâmica.
