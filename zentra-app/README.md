# 🛍️ Zentra App

**E-commerce mobile moderno construído com React Native + Expo + Supabase**

Um aplicativo de comércio eletrônico completo com autenticação, catálogo de produtos, carrinho de compras, sistema de pagamento e histórico de pedidos.

---

## 📱 Funcionalidades

- 🔐 **Autenticação completa** - Login, cadastro e recuperação de senha
- 👤 **Gestão de perfil** - Dados pessoais e endereços
- 🛒 **Carrinho inteligente** - Adicionar, remover e modificar produtos
- 💳 **Sistema de pagamento** - Integração com Stripe
- 📦 **Histórico de pedidos** - Acompanhamento de compras
- 🔍 **Busca e filtros** - Encontre produtos facilmente
- 📍 **Gestão de endereços** - Múltiplos endereços de entrega

---

## 🏗️ Arquitetura

O projeto segue o padrão **Context + Hooks + Services** para uma separação clara de responsabilidades:

```
📁 ARQUITETURA
├── 🎯 Services     → Lógica de API e comunicação com Supabase
├── 🌐 Contexts     → Estado global da aplicação
├── 🔄 Hooks        → Lógica de negócio e effects customizados
└── 🧩 Components   → Componentes de UI reutilizáveis
```

### 🎯 **Services Layer**
Responsável pela comunicação com APIs externas e Supabase:
- `authService.ts` - Autenticação e sessões
- `userService.ts` - Gestão de perfis de usuário
- `produtoService.ts` - Catálogo e busca de produtos
- `carrinhoService.ts` - Operações do carrinho
- `enderecoService.ts` - Gestão de endereços
- `pagamentoService.ts` - Processamento de pagamentos
- `pedidoService.ts` - Histórico e status de pedidos

### 🌐 **Contexts Layer**
Gerencia o estado global da aplicação:
- `AuthContext.tsx` - Estado de autenticação
- `UserContext.tsx` - Dados do usuário logado
- `produtoContext.tsx` - Estado do catálogo
- `carrinhoContext.tsx` - Estado do carrinho
- `enderecoContext.tsx` - Endereços do usuário
- `pagamentoContext.tsx` - Estado de pagamentos

### 🔄 **Hooks Layer**
Lógica de negócio reutilizável:
- `useAuth.ts` - Hooks de autenticação
- `userProfile.ts` - Gestão de perfil
- `hooksProdutos.ts` - Lógica do catálogo
- `hooksCarrinho.ts` - Operações do carrinho
- `userEndereco.ts` - Gestão de endereços
- `hooksPagamento.ts` - Processamento de pagamentos
- `hooksHistorico.ts` - Histórico de pedidos

### 🧩 **Components Layer**
Componentes de UI reutilizáveis:
- `components_produto.tsx` - Cards e listas de produtos
- `EditarPerfilModal.tsx` - Modal de edição de perfil
- `EditarEnderecoModal.tsx` - Modal de endereços
- `Confetti.tsx` - Animações de sucesso
- `style.styles.ts` - Estilos globais

---

## 📂 Estrutura de Pastas

```
zentra-app/
├── 📱 src/
│   ├── 🏠 app/                    # Screens (Expo Router)
│   │   ├── (tabs)/               # Navegação principal
│   │   │   ├── home.tsx          # Tela inicial
│   │   │   ├── list_produtos.tsx # Catálogo de produtos
│   │   │   ├── carrinho.tsx      # Carrinho de compras
│   │   │   ├── historico.tsx     # Histórico de pedidos
│   │   │   ├── perfil.tsx        # Perfil do usuário
│   │   │   └── pagamento.tsx     # Checkout
│   │   ├── pedido-detalhes/      # Detalhes do pedido
│   │   ├── produto/              # Detalhes do produto
│   │   ├── cadastro.tsx          # Tela de cadastro
│   │   ├── entrar.tsx           # Tela de login
│   │   ├── endereco.tsx         # Gestão de endereços
│   │   └── completar-perfil.tsx # Completar cadastro
│   ├── 🧩 components/            # Componentes reutilizáveis
│   ├── 🌐 contexts/              # Context API
│   ├── 🔄 hooks/                 # Custom Hooks
│   ├── 🎯 services/              # Serviços de API
│   ├── ⚙️ config/                # Configurações
│   └── 🎨 assets/                # Imagens e fontes
├── 🔧 Configuration Files
│   ├── package.json              # Dependências
│   ├── app.json                  # Configuração do Expo
│   ├── tsconfig.json            # TypeScript config
│   └── supabase-client.ts       # Cliente Supabase
└── 📋 Documentation
    ├── README.md                # Este arquivo
    └── .env.example            # Template de variáveis
```

---

## ⚙️ Configuração do Ambiente

### 📋 **Pré-requisitos**

#### **Softwares Necessários:**
1. **Node.js** versão 18 ou superior
   - Download: [nodejs.org](https://nodejs.org/)
   - Verifique: `node --version`

2. **npm** (vem com Node.js) ou **yarn**
   - Verifique npm: `npm --version`
   - Ou instale yarn: `npm install -g yarn`

3. **Git** para controle de versão
   - Download: [git-scm.com](https://git-scm.com/)
   - Verifique: `git --version`

#### **Para testar no dispositivo móvel:**
- **Expo Go** app (Android/iOS) - Download na loja de apps
- **OU** Android Studio (para emulador Android)

### 🚀 **Instalação**

#### 1️⃣ **Clone o repositório**
```bash
# Via HTTPS
git clone https://github.com/aliceczr/Zentra.git

# Via SSH (se configurado)
git clone git@github.com:aliceczr/Zentra.git

# Entre na pasta do projeto
cd Zentra/zentra-app
```

#### 2️⃣ **Instale as dependências**
```bash
# Com npm (recomendado)
npm install

# OU com yarn
yarn install

# Aguarde a instalação completar (pode demorar alguns minutos)
```

#### 3️⃣ **Configure as variáveis de ambiente**

**Passo 1: Copie o arquivo de exemplo**
```bash
# No Windows (PowerShell)
copy .env.example .env

# No Mac/Linux
cp .env.example .env
```

**Passo 2: Obtenha as credenciais do Supabase**
1. 🌐 Acesse [supabase.com](https://supabase.com) e faça login
2. 📁 Selecione seu projeto (ou crie um novo)
3. ⚙️ Vá em **Settings** → **API** 
4. 📋 Copie as seguintes informações:
   - **Project URL** → exemplo: `https://abc123.supabase.co`
   - **anon public key** → exemplo: `eyJhbGc...` (chave longa)

**Passo 3: Edite o arquivo .env**
```env
# Substitua pelos seus valores reais
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_muito_longa_aqui
```

⚠️ **IMPORTANTE**: Peça as credenciais para o proprietário do projeto se você é colaborador!

#### 4️⃣ **Teste a instalação**
```bash
# Verifique se tudo está funcionando
npm start

# Se aparecer um QR Code, a instalação foi bem-sucedida!
```

---

## 🚀 Executando o Projeto

### 🎯 **Opção 1: Expo Dev Client (Recomendado)**
```bash
# Inicia o servidor de desenvolvimento
npm start

# Ou com cache limpo (se houver problemas)
npx expo start --clear
```

### 🌐 **Opção 2: Expo Go (Mais simples para iniciantes)**
```bash
# Inicia com foco no Expo Go app
npx expo start --go
```

### 🔗 **Opção 3: Tunnel (Para testes remotos)**
```bash
# Permite acesso via internet (útil para testar com amigos em outras redes)
npx expo start --tunnel
```

### 📱 **Testando no dispositivo**

#### **📱 No seu celular (Mais fácil):**
1. **Baixe o Expo Go** na App Store (iOS) ou Play Store (Android)
2. **Execute** `npm start` no terminal
3. **Escaneie o QR Code** que aparece no terminal
4. **Aguarde** o app carregar no seu celular

#### **💻 No emulador Android:**
```bash
# Primeiro, instale o Android Studio e configure um emulador
npm run android
# ou
npx expo start --android
```

⚠️ **ATENÇÃO WEB**: O app **NÃO funcionará completamente na web** devido a:
- 🚫 AsyncStorage não disponível no navegador
- 🚫 Supabase auth pode ter problemas com sessões
- 🚫 Alguns recursos nativos do React Native não funcionam
- ✅ **Use apenas para testar layout/UI básica**

**Para testar completamente, use sempre dispositivo móvel ou emulador!**
``

---


