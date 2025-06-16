📊 BigCorp- Sistema de Consulta de Dados | Grupo FedCorp

**BigCorp** é uma plataforma interna desenvolvida para facilitar a consulta de informações de pessoas físicas, jurídicas e endereços em uma interface moderna, rápida e intuitiva. O sistema é voltado para uso corporativo com foco em seguradoras, empresas de serviços e outras instituições que necessitam de validação e análise de dados cadastrais.

🧩 Visão Geral

O BigCorp foi pensado para agilizar o acesso a informações de clientes por pessoas físicas, empresas e endereços, com foco na integração em plataformas internas da corporação.
Capacita consultores e administradores a buscar dados específicos ou em massa (por eventual importação de planilhas), com segurança, performance e usabilidade.

🎯 Funcionalidades Principais

📄 Consulta de dados pessoais 
- Retorna dados básicos como nome completo, data de nascimento, situação do CPF, entre outros.

📊 Consulta de Pessoa Jurídica (CNPJ)
  - Permite verificar informações cadastrais da empresa, como razão social, nome fantasia, situação, CNAE, natureza jurídica e endereço oficial.
    
 🔎 Consulta de Endereço
  - Busca de endereços a partir de CEPs com retorno de logradouro, bairro, cidade e estado.

🧑‍💻 **Gerenciamento de Usuários**
  - Cadastro de novos usuários com função (ex: administrador).
  - Edição e exclusão de contas existentes com modal de confirmação.
  - Sistema de autenticação/login de acesso (não documentado aqui, mas presente na interface).

📁 Interface Responsiva
  - Navegação por abas com sidebar fixa.
  - Uso de ícones para tornar a experiência mais amigável.
  - Modais de ação (exclusão, confirmação) estilizados manualmente sem dependências externas como Bootstrap.

❌ Exclusão com confirmação (modal de alerta).

✅ Feedbacks visuais de sucesso ou erro.

🔗 Navegação com Sidebar/Dropdown — incluindo páginas de cadastro, login, esqueci senha, etc.

🔐 Login e esqueci senha estruturados, prontos para integração com API de autenticação.

📦 Front-end puro com React e CSS customizado, sem Bootstrap.

## 📂 Funcionalidades Futuras

- **Consulta em Massa via Planilha**
  - Upload de arquivos `.csv` ou `.xlsx` com múltiplos CPFs/CNPJs para processamento em lote.
  - Geração de relatório consolidado com os dados retornados.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React.js
- **Axios**: para chamadas HTTP
- **React Router DOM**: para navegação interna
- **Roteamento**: React Router
- **Estilização**: CSS modularizado em arquivos próprios, utilizando classes customizadas
- **Ícones**: Bootstrap Icons (via CDN ou local)

## 🔧 Estrutura de Pastas (Simplificada)

├── public/
  ├── imagens
├── src/
│ ├── components/ # Componentes reutilizáveis
│ ├── consultas/ # Páginas principais (ConsultaPF, ConsultaPJ, ConsultaEnd)
│ ├── Dropdown/ (menu de escolha)
│   ├── Dropdown.jsx
│   ├── DropdownItens/ (itens do menu)
│    ├── Config.jsx
│    ├── Cadastro.jsx
│    ├── Conta.jsx
│ ├── home/ # Página Home
│ ├── Login/ (Página de login e página de redefinição de senha)
│   ├── Login.jsx
│  ├── EsqueciSenha/ 
│    ├── EsqueciSenha.jsx/ 
│ ├── Navbar/ (componente reutilizável)
│ ├── styles/ # Arquivos CSS separados
│ ├── App.jsx # Roteamento principal
│ └── main.jsz
├──  index.html


Pré-requisitos
Node.js (>= 16.x)

npm ou yarn

Instalação
1 - Clone este repositório:
git clone

2 - Instale as dependências:
npm install
# ou
yarn install

Uso
Inicie o ambiente de desenvolvimento:
npm run dev
# ou
yarn dev

Em seguida, abra http://localhost:3000 no navegador.

Acesse a tela de Login — insira e-mail e senha (fluxo mock já implementado).

Na tela Esqueci senha, solicita suporte por cartão informativo.

Burger/Sidebar acessa as páginas de Consulta de dados, Cadastro de usuários e Configurações.

Dentro de Cadastro de usuário, já existe layout com exemplos e envio para API simulada.

Em Configurações, sua tabela permite exibir e excluir usuários com modal de confirmação, botões estilizados e alertas de sucesso.

Planejamento futuro
📤 Upload de XLS/CSV para consultas em massa

🔐 Integração com backend real, com autenticação JWT

🔎 Filtros e paginação avançada na tabela de dados

🛠️ Perfis diferenciados: administrador, consultor, etc. com permissões específicas

🧩 Documentação completa (Storybook, Design System)

## 🚧 Em Desenvolvimento

O sistema está em constante evolução. A próxima etapa planejada é o desenvolvimento da **consulta em massa**, que permitirá a importação de planilhas para busca automatizada de múltiplos dados.

🧑‍💻 Desenvolvido por:

Ingrid Aylana | Desenvolvedora Front-End | Linkedin: www.linkedin.com/in/ingryd-aylana-silva-dos-santos-4a2701158

Michel Policeno | Desenvolvedor Back-end | Linkedin: https://www.linkedin.com/in/michel-policeno-85a866212 | GitHub: https://github.com/Michel-Policeno
