# 🚨 Relatório de Conflitos Potenciais com Supabase

## ⚠️ **CONFLITOS CRÍTICOS IDENTIFICADOS**

### 1. **Inconsistência de Nomes de Colunas - FK de Usuário**

#### Problema:
- **`userService.ts`** usa `auth_id` (referencia `auth.users.id`)
- **`enderecoService.ts`** usa `user_id` (referencia mesma coisa)
- **SQL antigo** usa `user_id` na tabela `users`

#### Impacto:
```typescript
// userService.ts - CORRETO para Supabase Auth
auth_id: string; // FK para auth.users.id

// enderecoService.ts - INCORRETO
user_id: string; // Deveria ser auth_id ou uuid
```

#### Solução Necessária:
- Padronizar para `auth_id` em todas as tabelas
- Ou criar tabela de mapeamento `users` própria

---

### 2. **Estrutura de Tabelas Inexistente**

#### Tabelas Referenciadas no Código mas NÃO no SQL:
- ❌ `endereco_usuario` (enderecoService.ts)
- ❌ `perfil_usuario` (userService.ts) 
- ❌ `pagamentos` (pagamentoService.ts)
- ❌ `metodos_pagamento_usuario` (pagamentoService.ts)

#### SQL Atual vs Código:
```sql
-- SQL ATUAL: Tabela genérica users
CREATE TABLE users (user_id INT PRIMARY KEY, ...)

-- CÓDIGO ESPERA: Tabelas específicas Supabase
CREATE TABLE perfil_usuario (auth_id UUID REFERENCES auth.users(id), ...)
CREATE TABLE endereco_usuario (auth_id UUID REFERENCES auth.users(id), ...)
```

---

### 3. **Tipos de Dados Incompatíveis**

#### IDs String vs Integer:
```typescript
// Código atual - INCONSISTENTE
export interface Produto {
  id: number; // ← Inteiro
}

export interface EnderecoData {
  user_id: string; // ← String (UUID)
}

export interface Pagamento {
  id: number;           // ← Inteiro  
  pedido_id: number;    // ← Inteiro
}
```

#### Supabase Recomenda:
```typescript
// RECOMENDADO para Supabase
id: string;        // UUID
auth_id: string;   // UUID referenciando auth.users
created_at: string; // ISO timestamp
```

---

### 4. **Campos de Data/Hora Divergentes**

#### Inconsistência:
```typescript
// pagamentoService.ts
criado_em: string;     // Snake_case
atualizado_em: string; // Snake_case

// Algumas interfaces
created_at?: string;   // Camel_case
updated_at?: string;   // Camel_case
```

---

### 5. **Enums vs Constraints**

#### Problema:
```sql
-- SQL atual usa ENUM MySQL
status ENUM('ativo', 'inativo', 'bloqueado')

-- Supabase PostgreSQL precisa:
CREATE TYPE status_type AS ENUM ('ativo', 'inativo', 'bloqueado');
ALTER TABLE users ADD COLUMN status status_type DEFAULT 'ativo';
```

---

## 🔧 **AÇÕES NECESSÁRIAS PARA CORRIGIR**

### 1. **Criar Script SQL Completo para Supabase**
```sql
-- Tabelas necessárias
CREATE TABLE perfil_usuario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  telefone VARCHAR(15),
  data_nascimento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE endereco_usuario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL,
  cep VARCHAR(8) NOT NULL,
  logradouro TEXT NOT NULL,
  numero VARCHAR(10) NOT NULL,
  complemento TEXT,
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  pais VARCHAR(50) DEFAULT 'Brasil',
  referencia TEXT,
  principal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID NOT NULL,
  metodo_pagamento VARCHAR(20) NOT NULL,
  status_pagamento VARCHAR(20) DEFAULT 'PENDENTE',
  valor_pago DECIMAL(10,2) NOT NULL,
  parcelas INTEGER DEFAULT 1,
  valor_parcela DECIMAL(10,2),
  taxa_juros DECIMAL(5,2) DEFAULT 0,
  codigo_transacao VARCHAR(100),
  gateway_pagamento VARCHAR(50),
  dados_pagamento JSONB,
  data_pagamento TIMESTAMP WITH TIME ZONE,
  data_confirmacao TIMESTAMP WITH TIME ZONE,
  stripe_payment_intent_id VARCHAR(100),
  stripe_charge_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  webhook_event_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. **Padronizar Interfaces TypeScript**
```typescript
// Padrão UUID para todos os IDs
export interface Produto {
  id: string;           // UUID
  categoria_id: string; // UUID
  // ...
}

export interface EnderecoData {
  auth_id: string;      // UUID padronizado
  // ...
}

export interface Pagamento {
  id: string;           // UUID
  pedido_id: string;    // UUID
  // ...
}
```

### 3. **Atualizar Services para UUID**
```typescript
// enderecoService.ts - CORRIGIR
export interface EnderecoData {
  auth_id: string; // Mudar de user_id para auth_id
  // ...
}

// Todas as funções buscar por UUID
async buscarEnderecosPorUsuario(authId: string) {
  // ...
  .eq('auth_id', authId) // Corrigir campo
}
```

### 4. **RLS (Row Level Security) Policies**
```sql
-- Habilitar RLS
ALTER TABLE perfil_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE endereco_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Policies de segurança
CREATE POLICY "Usuários podem ver apenas seus dados" ON perfil_usuario
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Usuários podem inserir apenas seus dados" ON perfil_usuario
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Repetir para outras tabelas...
```

---

## 🚦 **PRIORIDADE DE CORREÇÃO**

### 🔴 **ALTA PRIORIDADE (Quebra o Sistema)**
1. Criar tabelas SQL no Supabase
2. Padronizar `user_id` → `auth_id`
3. Converter IDs para UUID
4. Implementar RLS policies

### 🟡 **MÉDIA PRIORIDADE (Funcionalidade)**
1. Padronizar nomes de campos de data
2. Implementar tratamento de erros Supabase
3. Adicionar validações de constraint

### 🟢 **BAIXA PRIORIDADE (Melhoria)**
1. Otimizar queries
2. Adicionar índices
3. Implementar cache

---

## ⚡ **IMPACTO ESTIMADO**

- **Endereços**: Não funcionarão (tabela inexistente)
- **Pagamentos**: Usarão mock (Supabase não implementado)
- **Perfil**: Pode funcionar parcialmente
- **Produtos**: Funcionam (mock ativo)
- **Auth**: Funciona (usa Supabase Auth nativo)

## 🎯 **RECOMENDAÇÃO**

1. **Imediato**: Criar script SQL completo
2. **Curto prazo**: Atualizar interfaces para UUID
3. **Médio prazo**: Implementar serviços Supabase reais
4. **Longo prazo**: Otimizar e adicionar recursos avançados