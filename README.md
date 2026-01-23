<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Sivep-Endemias

Sistema de Vigilância Epidemiológica para registro e análise de atividades de controle de endemias.

## 📋 Sobre o Projeto

O **Sivep-Endemias** é uma aplicação web/mobile para gerenciamento de atividades de controle vetorial, permitindo:

- 📝 Registro de atividades por semana epidemiológica e localidade
- 📊 Análise de dados com filtros avançados e dashboard analítico
- 📥 Exportação de relatórios em múltiplos formatos (PDF, Excel, CSV)
- 👥 Gestão de usuários e permissões
- 🔐 Autenticação segura com Google

## 🚀 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React | 18.x | Framework frontend |
| TypeScript | 5.x | Tipagem estática |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Estilização |
| Supabase | - | Backend e autenticação |

## 🏗️ Estrutura do Projeto

```
divisao-endemias-mobile/
├── components/           # Componentes reutilizáveis
│   ├── BottomNavigation.tsx
│   ├── SidebarNavigation.tsx
│   ├── TopAppBar.tsx
│   ├── FilterBar.tsx
│   ├── WeekEvolutionChart.tsx
│   ├── ListaDashboard.tsx
│   ├── SemanaSelector.tsx
│   └── ExportModal.tsx
├── contexts/             # Contextos React
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── pages/                # Páginas da aplicação
│   ├── HomePage.tsx
│   ├── ReportsPage.tsx
│   ├── AdminPage.tsx
│   ├── UsersPage.tsx
│   └── LoginPage.tsx
├── services/             # Lógica de negócio
│   ├── reportService.ts
│   ├── hierarchyService.ts
│   ├── userService.ts
│   ├── profileService.ts
│   ├── exportService.ts
│   └── supabaseClient.ts
├── steps/                # Steps do formulário
│   ├── IdentificationStep.tsx
│   ├── PeriodStep.tsx
│   ├── SummaryStep.tsx
│   ├── DepositsStep.tsx
│   ├── ChemicalsStep.tsx
│   ├── HumanResourcesStep.tsx
│   └── ReviewStep.tsx
├── types/                # Definições TypeScript
│   └── index.ts
├── constants.ts          # Constantes da aplicação
└── App.tsx               # Componente principal
```

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd divisao-endemias-mobile

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações do Supabase
```

### Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure a autenticação com Google OAuth
3. Copie as credenciais para o arquivo `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Execução

```bash
# Execute em modo desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📱 Funcionalidades

### Implementadas ✅

| Funcionalidade | Descrição |
|---------------|-----------|
| **Autenticação Google** | Login seguro com conta Google |
| **Registro de Atividades** | Formulário multi-step para cadastro |
| **Gestão de Relatórios** | Listagem por semana epidemiológica |
| **Filtros Avançados** | Filtro por localidade, ciclo, semana |
| **Dashboard Analytics** | Gráficos e métricas visuais |
| **Exportação Multi-formato** | PDF, Excel, CSV |
| **Painel Administrativo** | Gestão de usuários e configurações |
| **Layout Responsivo** | Sidebar para desktop, bottom nav para mobile |
| **Modo Escuro** | Suporte completo a dark mode |
| **Perfil de Usuário** | Avatar, informações e configurações |

## 📊 Estrutura de Dados

### Report (Relatório)

```typescript
interface Report {
  id: string;                    // UUID único
  created_at: string;            // Data de criação
  user_id: string;               // ID do usuário
  semana_epidemiologica: string; // Ex: "SE 42"
  localidade: string;            // Nome da localidade
  categoria_localidade: string;  // "1" (BRR) ou "2" (POV)
  ciclo: number;                 // Ciclo de trabalho
  ano: number;                   // Ano
  concluido: boolean;            // Status
  data: FormData;                // Dados completos (JSONB)
}
```

### Profile (Perfil de Usuário)

```typescript
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'gestor' | 'supervisor';
  created_at: string;
  updated_at: string;
}
```

## 🔐 Autenticação

O sistema utiliza **Supabase Auth** com suporte a:

- **Google OAuth**: Login com conta Google
- **Row Level Security (RLS)**: Proteção de dados por usuário
- **Gerenciamento de Sessão**: Token automático e refresh

### Configuração do Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto ou selecione um existente
3. Ative a API Google+ 
4. Configure as credenciais OAuth 2.0
5. Adicione a URL de callback do Supabase

## 🔐 Permissões e Hierarquia

O sistema implementa controle de acesso baseado em **hierarquia organizacional**:

### Estrutura Hierárquica

```
Admin / Gestor
    └── Supervisor Geral
            └── Supervisor de Área
                    └── Localidades Atribuídas
```

### Permissões por Função

| Função | Visualizar Relatórios | Criar | Editar | Excluir | Admin |
|--------|----------------------|-------|--------|---------|-------|
| **Admin** | ✅ Todos | ✅ | ✅ | ✅ | ✅ |
| **Gestor** | ✅ Todos | ✅ | ✅ | ✅ | ❌ |
| **Supervisor Geral** | ✅ Das localidades dos seus supervisores de área | ✅ | ✅ | ❌ | ❌ |
| **Supervisor de Área** | ✅ Das suas localidades atribuídas | ✅ | ✅ | ❌ | ❌ |

### Serviços de Hierarquia

O sistema utiliza políticas **Row Level Security (RLS)** no Supabase para garantir que:

- Supervisores de área só vejam dados das localidades atribuídas a eles
- Supervisores gerais vejam dados de todas as localidades dos seus subordinados
- Admin e gestores tenham acesso completo

### Tabelas de Hierarquia

| Tabela | Descrição |
|--------|-----------|
| `supervisores_gerais` | Registro de supervisores gerais e vínculo com profile |
| `supervisores_area` | Registro de supervisores de área e vínculo com supervisor geral |
| `localidades_supervisor` | Localidades atribuídas a cada supervisor de área |

## 📥 Exportação de Dados

### Formatos Suportados

| Formato | Extensão | Descrição |
|---------|----------|-----------|
| PDF | .pdf | Relatório formatado |
| Excel | .xlsx | Planilha completa |
| CSV | .csv | Dados tabulares |

### Tipos de Agrupamento

- **Por Localidade**: Relatórios agrupados por local
- **Por Ciclo**: Relatórios agrupados por ciclo de trabalho
- **Por Semana**: Relatórios agrupados por SE
- **Detalhado**: Todos os campos de cada relatório

## 🧪 Testes

```bash
# Executar testes
npm run test

# Executar com coverage
npm run test:coverage
```

## 📝 Changelog

### v1.1.0 (Janeiro 2026)
- [x] Sistema de hierarquia organizacional (Supervisor Geral → Supervisor de Área → Localidades)
- [x] Controle de acesso baseado em hierarquia nos relatórios
- [x] Ranking de localidades por menor índice de pendência
- [x] Políticas RLS para supervisores acessarem suas localidades

### v1.0.0 (Janeiro 2026)
- [x] Formulário de registro de atividades (7 etapas)
- [x] Listagem de relatórios por semana epidemiológica
- [x] Autenticação com Google OAuth
- [x] Painel administrativo completo
- [x] Gestão de usuários (admin, gestor, supervisor)
- [x] Dashboard com gráficos de evolução
- [x] Exportação em PDF, Excel e CSV
- [x] Filtros avançados por localidade, ciclo e semana
- [x] Layout responsivo (desktop/mobile)
- [x] Modo escuro completo
- [x] Perfil de usuário com upload de avatar

## 👨‍💻 Desenvolvedor

**Elissandro Oliveira**

## 🏢 Organização

**Divisão de Endemias - Itabuna**

## 📄 Licença

© 2026 Divisão de Endemias - Itabuna. Todos os direitos reservados.

Este projeto é de uso interno da Divisão de Endemias.
