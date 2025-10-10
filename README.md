# Frontend Aché: Sistema de Cronogramas Modulares e Chatbot

## Introdução

Este projeto apresenta o frontend desenvolvido para para otimizar a gestão de projetos e a organização de cronogramas. Criada para o **Challenge FIAP 2025, em colaboração com a Aché**. 

Esses são os arquivos utilizados para o desenvolvimento do Frontend do projeto de gerenciamento de Cronogramas Modulares. O projeto conta com integração com planilhas Excel, um chatbot inteligente chamada Melora, suporte a múltiplos idiomas e modo escuro.

## Funcionalidades Principais

### Processamento de Planilhas
- **Importação Excel**: Suporte para arquivos `.xlsx` e `.xls`
- **Conversão Automática**: Converte cada linha da planilha em uma nova tarefa
- **Gerenciamento**: Gerencia os status do andamento das tarefas:
  - 100% → "Concluído"
  - 0% → "Não Iniciado"
  - Outros → "Em Andamento"
- **Extração de Dados**: Nomes das tarefas e durações extraídos automaticamente

### Chatbot Melora
- **Nome**: "Melora sua assistente virtual"
- **Respostas Inteligentes**: Sistema de respostas locais + integração com API externa
- **Assistência**: Auxilia na criação e resolução de tarefas

### Modo Escuro
- **Tema Adaptativo**: Alternância automática entre claro e escuro
- **Cores Consistentes**: `gray-800` para áreas principais, `gray-700` para elementos secundários
- **Preview de Temas**: Visualização dos temas Rosa e Branco vs Rosa e Cinza Escuro

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
`bash`
```
# Clonar o repositório
git clone https://github.com/iurycar/frontend-ache
cd frontend-ache
```
```
# Instalar dependências
npm install
```
```
# Executar em modo de desenvolvimento
npm run dev
```
```
# Construir para produção
npm run build
```

### CONFIGURAÇÄO DO BACKEND
Esse é um passo essencial para o funcionamento do projeto. A Melora possui uma repositório dedicado em [iurycar/Melora](https://github.com/iurycar/Melora-chatbot).
Para configurar o backend e a Melora:
1. Acesse e clone o repositório [Backend Aché](https://github.com/iurycar/backend-ache)
2. Siga o passo a passo descrito no repositório para configurar

## Como Usar

### Importando Planilhas
1. Clique na página **Planilhas** na barra lateral
2. Clique em **Importar Excel**
3. Selecione arquivo .xlsx ou .xls
4. Os dados são processados automaticamente pelo backend
5. Os arquivos importados são mostrados na parte de baixo da página

### Usando o Chatbot
1. Clique no **botão flutuante** no canto inferior direito
2. Digite sua pergunta
3. Melora responderá com informações locais ou da API externa
4. Configure API Key para respostas mais inteligentes

## Personalização

### Modo Escuro
- **Automático**: Baseado nas preferências do sistema
- **Manual**: Toggle em **Configurações** > **Aparência**
- **Preview**: Visualize os temas antes de aplicar

## Estrutura do Projeto

```
src/
├── contexts/                     # Contextos React
│   ├── LocaleContext.tsx           # Idioma e fuso horário
│   ├── NotificationContext.tsx     # Sistema de notificações
│   ├── SpreadsheetContext.tsx      # Processamento de planilhas
│   ├── AuthContext.tsx             # Lida com a autenticação
│   ├── ThemeContext.tsx            # Lida com modo claro e escuro
│   └── ChatbotContext.tsx          # Lida com o chatbot
├── components/                   # Componentes reutilizáveis
│   ├── Header.tsx                  # Cabeçalho com notificações
│   ├── Sidebar.tsx                 # Navegação lateral
│   ├── ChatbotWidget.tsx           # Interface do chatbot
│   ├── ScheduleTable.tsx           # Tabela de tarefas
│   ├── EventModal.tsx              # 
│   ├── FilterPainel.tsx            # Painel com filtros
│   ├── Layout.tsx                  # Lida com o cabeçalho e barra
│   ├── ProtectedRoute.tsx          # Verifica se está logado
│   ├── SpreadsheetImporter.tsx     # Lida com importação
│   ├── SpreadsheetViewer.tsx       # Visualização das planilhas
│   ├── SpreadsheetDetailViwer.tsx  # Mostra detalhes da planilha
│   └── TeamMemberModal.tsx         # Interface da equipe
└── pages/                        # Páginas da aplicação
    ├── Dashboard.tsx               # Página principal
    ├── Configuration.tsx           # Configurações
    ├── Calendar.tsx                # Calendário
    ├── Login.tsx                   # Página de login
    ├── PackangingAnalysis.tsx      # Controle de planilhas
    ├── Team.tsx                    # Página da equipe
    └── Reports.tsx                 # Relatórios
```
  
**Desenvolvido por**: Equipe Liora