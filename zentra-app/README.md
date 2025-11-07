# 🛍️ Zentra App

**E-commerce mobile moderno construído com React Native + Expo + Supabase**

Um aplicativo de comércio eletrônico completo com autenticação, catálogo de produtos, carrinho de compras, sistema de pagamento integrado com Mercado Pago e histórico de pedidos.

---

## � Índice

- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Configuração](#-configuração)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)

---

## �📱 Funcionalidades

- 🔐 **Autenticação completa** - Login, cadastro e gerenciamento de sessões
- 👤 **Gestão de perfil** - Edição de dados pessoais e avatar
- 🛒 **Carrinho inteligente** - Adicionar, remover e modificar quantidades
- 💳 **Sistema de pagamento** - Integração com Mercado Pago
- 📦 **Histórico de pedidos** - Acompanhamento detalhado de compras
- 🏠 **Gestão de endereços** - Cadastro e edição de endereços de entrega
- 🎯 **Catálogo de produtos** - Navegação e busca de produtos

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas com separação de responsabilidades, utilizando o padrão **Context + Hooks + Services**:

```
┌─────────────────────────────────────────────┐
│            UI Layer (Screens)               │
│        app/, components/                    │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│         Business Logic (Hooks)              │
│        Lógica de negócio e effects          │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│        State Management (Contexts)          │
│        Estado global da aplicação           │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│          Data Layer (Services)              │
│      APIs, Supabase, Storage Local          │
└─────────────────────────────────────────────┘
```

### **Camadas da Aplicação**

#### 🎯 **Services** (`src/services/`)
Responsável pela comunicação com APIs externas, Supabase e armazenamento local:
- `authService.ts` - Autenticação, login e cadastro
- `userService.ts` - Gestão de perfis de usuário
- `produtoService.ts` - Catálogo e busca de produtos
- `carrinhoService.ts` - Operações do carrinho de compras
- `enderecoService.ts` - CRUD de endereços
- `pagamentoService.ts` - Processamento de pagamentos
- `pedidoService.ts` - Gestão de pedidos
- `mercadoPagoService.ts` - Integração com Mercado Pago
- `storageService.ts` - Persistência local de dados

#### 🌐 **Contexts** (`src/contexts/`)
Gerencia o estado global compartilhado entre componentes:
- `AuthContext.tsx` - Estado de autenticação e sessão
- `UserContext.tsx` - Dados do usuário logado
- `produtoContext.tsx` - Estado do catálogo de produtos
- `carrinhoContext.tsx` - Estado do carrinho de compras
- `enderecoContext.tsx` - Endereços do usuário
- `pagamentoContext.tsx` - Estado de pagamentos

#### 🔄 **Hooks** (`src/hooks/`)
Encapsula lógica de negócio reutilizável:
- `useAuth.ts` - Lógica de autenticação
- `userProfile.ts` - Gestão de perfil do usuário
- `hooksProdutos.ts` - Lógica de produtos
- `hooksCarrinho.ts` - Lógica do carrinho
- `userEndereco.ts` - Gestão de endereços
- `hooksPagamento.ts` - Lógica de pagamento
- `hooksHistorico.ts` - Histórico de pedidos
- `useMercadoPago.ts` - Integração com Mercado Pago

#### 🧩 **Components** (`src/components/`)
Componentes de UI reutilizáveis:
- `components_produto.tsx` - Cards e listagens de produtos
- `EditarPerfilModal.tsx` - Modal de edição de perfil
- `EditarEnderecoModal.tsx` - Modal de edição de endereço
- `MercadoPagoButton.tsx` - Botão de pagamento Mercado Pago
- `Confetti.tsx` - Animação de celebração
- `style.styles.ts` - Estilos compartilhados

#### 📱 **Screens** (`src/app/`)
Telas da aplicação organizadas com Expo Router:
- **Auth**: `entrar.tsx`, `cadastro.tsx`, `completar-perfil.tsx`
- **Tabs**: `home.tsx`, `list_produtos.tsx`, `carrinho.tsx`, `perfil.tsx`, `historico.tsx`
- **Checkout**: `endereco.tsx`, `pagamento.tsx`, `aguardando-pagamento.tsx`, `compra-sucesso.tsx`
- **Details**: `produto/[id].tsx`, `pedido-detalhes/[id].tsx`

---

## 📁 Estrutura de Pastas

```
zentra-app/
├── src/
│   ├── app/                      # Telas da aplicação (Expo Router)
│   │   ├── (tabs)/              # Navegação por abas
│   │   │   ├── home.tsx         # Tela inicial
│   │   │   ├── list_produtos.tsx # Lista de produtos
│   │   │   ├── carrinho.tsx     # Carrinho de compras
│   │   │   ├── perfil.tsx       # Perfil do usuário
│   │   │   └── historico.tsx    # Histórico de pedidos
│   │   ├── produto/
│   │   │   └── [id].tsx         # Detalhes do produto (rota dinâmica)
│   │   ├── pedido-detalhes/
│   │   │   └── [id].tsx         # Detalhes do pedido (rota dinâmica)
│   │   ├── entrar.tsx           # Tela de login
│   │   ├── cadastro.tsx         # Tela de cadastro
│   │   ├── completar-perfil.tsx # Completar cadastro
│   │   ├── endereco.tsx         # Seleção/cadastro de endereço
│   │   ├── pagamento.tsx        # Tela de pagamento
│   │   ├── aguardando-pagamento.tsx # Aguardando confirmação
│   │   ├── compra-sucesso.tsx   # Confirmação de compra
│   │   └── _layout.tsx          # Layout raiz
│   ├── components/              # Componentes reutilizáveis
│   ├── contexts/                # Contextos do React (estado global)
│   ├── hooks/                   # Hooks customizados
│   ├── services/                # Serviços de API e lógica de dados
│   ├── config/                  # Configurações
│   ├── utils/                   # Funções utilitárias
│   ├── assets/                  # Recursos estáticos (imagens, fontes)
│   └── index.ts                 # Ponto de entrada
├── supabase-client.ts           # Configuração do cliente Supabase
├── app.json                     # Configuração do Expo
├── package.json                 # Dependências do projeto
├── tsconfig.json                # Configuração do TypeScript
└── README.md                    # Este arquivo
```

---

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **yarn** (incluído com Node.js)
- **Expo Go** no seu smartphone
  - [Android (Google Play)](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [iOS (App Store)](https://apps.apple.com/br/app/expo-go/id982107779)

### 📱 Preparação do Dispositivo Móvel

1. Instale o aplicativo **Expo Go** no seu celular
2. Conecte o celular na **mesma rede Wi-Fi** que seu computador
3. Mantenha o Expo Go aberto durante o desenvolvimento

---

## 🚀 Instalação e Execução

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/aliceczr/Zentra.git
cd zentra-app
```

### 2️⃣ Instale as Dependências

```bash
npm install
```

### 3️⃣ Configure as Variáveis de Ambiente

⚠️ **IMPORTANTE**: O projeto requer credenciais do Supabase para funcionar.

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
EXPO_PUBLIC_SUPABASE_URL=sua-url-do-supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

> **Nota**: Entre em contato com o administrador do projeto para obter as credenciais necessárias.

### 4️⃣ Inicie o Servidor de Desenvolvimento

Escolha uma das opções abaixo dependendo da sua configuração de rede:

#### Opção A: Modo Tunnel (Recomendado para redes com restrições)
```bash
npx expo start --tunnel
```
- ✅ Funciona em qualquer rede
- ✅ Não requer mesma Wi-Fi
- ⚠️ Pode ser um pouco mais lento

#### Opção B: Modo LAN (Mais rápido, mesma rede)
```bash
npx expo start --lan
```
- ✅ Mais rápido
- ⚠️ Requer que celular e computador estejam na mesma rede Wi-Fi

#### Opção C: Modo padrão
```bash
npx expo start
```

### 5️⃣ Abra o App no Celular

Após iniciar o servidor, você verá um **QR Code** no terminal:

1. Abra o aplicativo **Expo Go** no seu celular
2. **Android**: Toque em "Scan QR Code" e escaneie o código
3. **iOS**: Abra a câmera nativa e escaneie o código (será direcionado para o Expo Go)

O aplicativo será carregado automaticamente no seu dispositivo! 🎉

---

## 🔧 Configuração

## 🛠️ Tecnologias Utilizadas

### Core
- **React Native** 0.81 - Framework mobile
- **Expo** 54 - Plataforma de desenvolvimento
- **TypeScript** 5.9 - Tipagem estática
- **Expo Router** 6.0 - Navegação baseada em arquivos

### Backend & Estado
- **Supabase** 2.76 - Backend as a Service (BaaS)
- **React Context API** - Gerenciamento de estado global
- **AsyncStorage** 2.2 - Persistência local

### Pagamento
- **Mercado Pago** 2.10 - Gateway de pagamento
- **Stripe** 19.2 - Processamento de pagamentos alternativo

---

## 📝 Scripts Disponíveis

```bash
npm start          # Inicia o servidor de desenvolvimento
npm run android    # Abre no emulador Android
npm run ios        # Abre no simulador iOS
npm run web        # Abre versão web
npm test           # Executa testes
```

---

## ⚠️ Avisos Importantes

### 🔑 Credenciais Necessárias

- **Supabase**: URL e Anon Key são obrigatórias

### 🌐 Conectividade

- Certifique-se de estar na **mesma rede Wi-Fi** (modo LAN)
- Use modo **tunnel** se tiver problemas de conexão

### 📱 Dispositivo Físico Recomendado

- O app foi desenvolvido para dispositivos móveis reais
- Emuladores podem funcionar, mas o teste em dispositivo real é recomendado
- Funcionalidades como notificações funcionam melhor em dispositivos reais

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

2. **npm** (vem com Node.js) 
   - Verifique npm: `npm --version`

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


