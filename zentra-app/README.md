# Zentra App

## 🚀 Configuração do Ambiente

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd zentra-app
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash

cp .env.example .env

```

No arquivo `.env`, preencha:
```
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Execute o projeto
```bash
npm start
```

## 🔑 Obtendo as chaves do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto
4. Vá em Settings → API
5. Copie:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 🛡️ Segurança

⚠️ **NUNCA** commite o arquivo `.env` no Git!
✅ As chaves estão protegidas no `.gitignore`