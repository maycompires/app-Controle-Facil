 Controle Fácil - MVP de Controle de Despesas

Um aplicativo web moderno para gerenciamento de despesas pessoais, desenvolvido com Next.js, TypeScript e Supabase.

## 🚀 Funcionalidades

- 📊 Dashboard com visão geral das despesas
- 💰 Registro de despesas com categorização
- 📈 Gráficos e relatórios de gastos
- 🔍 Filtros e busca de transações
- 📱 Interface responsiva e moderna
- 🔐 Autenticação segura

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - Next.js 15
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui
  - React Query
  - React Hook Form
  - Zod

- **Backend:**
  - Supabase (PostgreSQL)
  - Prisma ORM

## 📋 Pré-requisitos

- Node.js (versão LTS recomendada)
- npm ou yarn
- Conta no Supabase

## 🔧 Configuração do Ambiente

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd mvp-despesas-app
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env.local` na raiz do projeto
   - Adicione as seguintes variáveis:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
mvp-despesas-app/
├── app/                    # Rotas e páginas da aplicação
├── components/            # Componentes React reutilizáveis
├── lib/                   # Utilitários e configurações
├── prisma/               # Schema e migrações do Prisma
├── public/               # Arquivos estáticos
└── types/                # Definições de tipos TypeScript
```

## 🔐 Segurança

- As chaves sensíveis do Supabase são gerenciadas através de variáveis de ambiente
- O arquivo `.env.local` não é versionado no repositório
- Autenticação implementada com Supabase Auth

## 🚀 Deploy

O projeto pode ser facilmente implantado em plataformas como Vercel ou Netlify. Certifique-se de configurar as variáveis de ambiente no ambiente de produção.

## 📝 Licença

Este projeto está sob a licença MIT.

## 👥 Contribuição

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de enviar um pull request.

## 📧 Contato

Para mais informações ou suporte, entre em contato através de maycom.pires@edu.univali.br.
#
