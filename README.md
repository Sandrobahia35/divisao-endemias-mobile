<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Sivep-Endemias

Sistema de Vigilância Epidemiológica para registro e análise de atividades de controle de endemias.

## 📋 Sobre o Projeto

O **Sivep-Endemias** é uma aplicação web/mobile para gerenciamento de atividades de controle vetorial, permitindo:

- 📝 Registro de atividades por semana epidemiológica e localidade
- 📊 Análise de dados com filtros avançados
- 📥 Exportação de relatórios em múltiplos formatos
- 👥 Gestão de usuários e permissões

## 🚀 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React | 18.x | Framework frontend |
| TypeScript | 5.x | Tipagem estática |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Estilização |
| Supabase | - | Backend (futuro) |

## 🏗️ Estrutura do Projeto

```
divisao-endemias-mobile/
├── components/           # Componentes reutilizáveis
│   ├── BottomNavigation.tsx
│   ├── SidebarNavigation.tsx
│   ├── AdvancedFilters.tsx (planejado)
│   ├── AnalyticsDashboard.tsx (planejado)
│   └── ExportModal.tsx (planejado)
├── pages/                # Páginas da aplicação
│   ├── HomePage.tsx
│   ├── ReportsPage.tsx
│   ├── AdminPage.tsx
│   └── UsersPage.tsx
├── services/             # Lógica de negócio
│   ├── reportService.ts
│   ├── userService.ts
│   └── exportService.ts (planejado)
├── steps/                # Steps do formulário
├── types/                # Definições TypeScript
│   ├── reportTypes.ts
│   └── userTypes.ts
└── App.tsx               # Componente principal
```

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd divisao-endemias-mobile

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# Execute em modo desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📱 Funcionalidades

### Implementadas ✅

| Funcionalidade | Descrição |
|---------------|-----------|
| **Registro de Atividades** | Formulário multi-step para cadastro |
| **Gestão de Relatórios** | Listagem por semana epidemiológica |
| **Painel Administrativo** | Gestão de usuários e configurações |
| **Layout Responsivo** | Sidebar para desktop, bottom nav para mobile |
| **Modo Escuro** | Suporte a dark mode |

### Planejadas 🔜

| Funcionalidade | Descrição | Status |
|---------------|-----------|--------|
| **Filtros Avançados** | Multi-select por localidade, ciclo, semana | Planejado |
| **Dashboard Analytics** | Gráficos e métricas por localidade/ciclo | Planejado |
| **Exportação Multi-formato** | PDF, Excel, CSV, JSON | Planejado |
| **Backend Supabase** | Persistência em nuvem | Planejado |
| **Autenticação** | Login com Google/Email | Planejado |

## 📊 Estrutura de Dados

### Report (Relatório)

```typescript
interface Report {
  id: string;                    // UUID único
  createdAt: string;             // Data de criação
  updatedAt: string;             // Data de atualização
  semanaEpidemiologica: string;  // Ex: "SE 42"
  localidade: string;            // Nome da localidade
  categoriaLocalidade: string;   // "1" (BRR) ou "2" (POV)
  ciclo: number;                 // Ciclo de trabalho
  ano: number;                   // Ano
  concluido: boolean;            // Status
  data: FormData;                // Dados completos
}
```

### User (Usuário)

```typescript
interface User {
  id: string;
  nome: string;
  usuario: string;
  funcao: 'gestor' | 'supervisor_geral' | 'supervisor_area';
  ativo: boolean;
  criadoEm: string;
}
```

## 🗄️ Backend API (Planejado)

### Tabelas Supabase

```sql
-- Relatórios
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  semana_epidemiologica VARCHAR(10),
  localidade VARCHAR(100),
  ciclo INTEGER,
  ano INTEGER,
  data JSONB,
  user_id UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_reports_semana ON reports(semana_epidemiologica);
CREATE INDEX idx_reports_localidade ON reports(localidade);
CREATE INDEX idx_reports_ciclo ON reports(ciclo);
```

### Views Analytics

```sql
-- Analytics por localidade
CREATE VIEW vw_analytics_localidade AS
SELECT 
  localidade,
  COUNT(*) as total_reports,
  array_agg(DISTINCT ciclo) as ciclos
FROM reports
GROUP BY localidade;

-- Analytics por ciclo
CREATE VIEW vw_analytics_ciclo AS
SELECT 
  ciclo,
  COUNT(*) as total_reports,
  COUNT(DISTINCT localidade) as total_localidades
FROM reports
GROUP BY ciclo;
```

## 📥 Exportação de Dados

### Formatos Suportados (Planejado)

| Formato | Extensão | Descrição |
|---------|----------|-----------|
| PDF | .pdf | Relatório formatado com gráficos |
| Excel | .xlsx | Planilha com múltiplas abas |
| CSV | .csv | Dados tabulares simples |
| JSON | .json | Dados estruturados |

### Tipos de Agrupamento

- **Por Localidade**: Relatórios agrupados por local
- **Por Ciclo**: Relatórios agrupados por ciclo de trabalho
- **Por Semana**: Relatórios agrupados por SE
- **Detalhado**: Todos os campos de cada relatório

## 🔐 Permissões de Usuário

| Função | Visualizar | Criar | Editar | Excluir | Admin |
|--------|------------|-------|--------|---------|-------|
| Gestor | ✅ | ✅ | ✅ | ✅ | ✅ |
| Supervisor Geral | ✅ | ✅ | ✅ | ❌ | ❌ |
| Supervisor Área | ✅ | ✅ | ❌ | ❌ | ❌ |

## 🧪 Testes

```bash
# Executar testes (quando implementados)
npm run test

# Executar com coverage
npm run test:coverage
```

## 📝 Changelog

### v1.1.0 (Planejado)
- [ ] Filtros avançados multi-select
- [ ] Dashboard de analytics
- [ ] Exportação multi-formato
- [ ] Integração Supabase

### v1.0.0 (Atual)
- [x] Formulário de registro de atividades
- [x] Listagem de relatórios por semana
- [x] Painel administrativo
- [x] Gestão de usuários
- [x] Layout responsivo (desktop/mobile)
- [x] Modo escuro

## 👥 Equipe

Desenvolvido pela **Divisão de Endemias**

## 📄 Licença

Este projeto é de uso interno da Divisão de Endemias.
