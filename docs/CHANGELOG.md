# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato baseia-se em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/).
## [1.3.0] - 2026-08-27

### Adicionado
- **Perfil de Consultor:** Implementação completa da gestão de contas para Consultorias.
- **Painel do Consultor (`/consultant`):** Nova interface permitindo ao consultor gerenciar seus clientes (Tenants), visualizar métricas de uso do plano (empresas cadastradas e pesquisas respondidas) e editar/excluir dados das empresas.
- **Limite de Respostas por Cliente:** O consultor agora pode definir um limite opcional de respostas (submissões) específico para cada cliente (Tenant), garantindo maior controle sobre o uso de seu plano global.
- **Opções Avançadas de Cliente:** Permitido ao Consultor e ao Super Admin inativar/ativar um cliente (Tenant) e alterar a senha de seu administrador diretamente de seus painéis, sem a necessidade de exclusão do registro.

### Corrigido
- **Distribuição de Limites do Consultor:** Corrigida uma falha onde um consultor conseguia distribuir para as empresas clientes uma quantidade de "Limite de Respostas" superior ao que estava disponível em seu próprio plano global. Agora o sistema faz a soma de todos os limites alocados e barra tentativas que excedam a cota disponível.
- **Impersonação de Contas:** Consultores e Super Admins agora possuem um botão "Acessar" para entrar de forma transparente na conta de um cliente (Tenant) e realizar a gestão completa (criar pesquisas, extrair relatórios) sem precisar da senha do cliente.
- **Botão "Voltar p/ Consultor":** Inclusão de um botão no menu do sistema que permite ao consultor retornar facilmente ao seu painel original após trabalhar na conta de um cliente.
- **Controle de Limites de Plano:** Inclusão de limites de criação de Tenants e quantidade máxima de respostas nas pesquisas atrelados à assinatura da empresa/consultoria.
- **Novo Manual:** Criação do arquivo `MANUAL_DO_CONSULTOR.md` voltado a treinar consultorias no uso das ferramentas de multi-gestão do sistema.
- **Rodapé Global (Footer):** Criação e implementação de um componente de Footer dinâmico contendo direitos autorais em todo o sistema (Login, Dashboards, Tela de Pesquisa).

### Modificado
- **Migração de Banco de Dados:** Substituição do banco de dados SQLite por **PostgreSQL** para ambiente de produção, incluindo script avançado de migração de dados preservando os registros existentes.
- **Painel Super Admin:** Melhoria no formulário de criação de clientes com a inclusão de um botão "Tipo de Conta", permitindo separar visualmente e gerenciar "Usuários Singulares (Empresa)" e "Consultorias".
- **Lógica de Autenticação (`Login.tsx`):** Correção do fluxo de redirecionamento, garantindo que perfis de Consultor e Super Admin sejam encaminhados para seus respectivos painéis.
- **Nginx & Cache:** Ajuste nas políticas de cache do servidor web (Nginx) para forçar o recarregamento (`no-cache`, `no-store`) do front-end nas novas atualizações do sistema, evitando que os usuários vejam páginas antigas (staleness).

### Corrigido
- **Nome da Empresa na Impersonação:** O sistema agora exibe corretamente o nome da empresa cliente no topo da tela (navbar) quando o Consultor ou Super Admin está utilizando a funcionalidade de "Acessar" (impersonação), corrigindo o fallback para "Meu SaaS".

## [1.2.0] - 2026-08-25

### Adicionado
- **Modo Escuro (Dark Mode):** Implementação completa de modo escuro utilizando uma paleta premium baseada em azul escuro (Dark Blue).
- **Toggle de Tema:** Botão na barra de navegação (`Layout.tsx`) para alternar instantaneamente entre Modo Claro e Escuro.
- Suporte à preferência de tema do usuário salva no `localStorage`, evitando flashes de luz na inicialização com a inclusão de um script no `main.tsx`.

### Modificado
- Refatoração de toda a interface do Frontend (arquivos `.tsx`) para substituir cores e estilos _hardcoded_ (inline) por **variáveis CSS dinâmicas**, tornando o design muito mais limpo, escalável e fácil de manter.
- Ajuste das permissões e sincronização do build da aplicação para o ambiente de produção.


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
- **Refatoração UI/UX Completa (Fase 5):**
  - Aplicação de nova paleta de cores corporativa: fundo Cinza Claro (#f9fafb), painéis brancos, títulos Índigo Profundo (#312e81) e ações Azul Royal (#2563eb).
  - Modernização do layout das páginas `Dashboard.tsx`, `ActionPlans.tsx` (Kanban layout), `SurveyManager.tsx`, `SurveyResponse.tsx`, `Login.tsx`, e `SuperAdmin.tsx`.
  - Melhoria significativa na formatação do **Relatório Analítico Executivo** (`AnalyticsController.ts`), utilizando tabelas Markdown e emojis para organização clara dos níveis de risco.
  - Adição de botões para voltar ao Dashboard na tela de `SurveyManager` e clarificação do fluxo para obtenção do link público de compartilhamento.

## [1.0.0] - Lançamento Inicial

### Adicionado
- Criação e estruturação base do monorepo de backend (Node.js/Express) e frontend (React/Vite).
- Fluxo central para Super Admin (cadastro de empresas) e Tenant Admin (Dashboard).
- Criação de templates de pesquisas padronizadas focadas em riscos psicossociais e segurança de trabalho.
- Matriz de Riscos Bidimensional Dinâmica.
