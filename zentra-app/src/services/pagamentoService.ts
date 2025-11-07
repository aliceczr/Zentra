import { supabase } from '../../supabase-client';

export type MetodoPagamento = 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'BOLETO' | 'DINHEIRO';
export type StatusPagamento = 'PENDENTE' | 'PROCESSANDO' | 'APROVADO' | 'RECUSADO' | 'CANCELADO' | 'ESTORNADO';
export type TipoMetodo = 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX';

export interface Pagamento {
  id: number;
  pedido_id: number;
  metodo_pagamento: MetodoPagamento;
  status_pagamento: StatusPagamento;
  valor_pago: number;
  parcelas: number;
  valor_parcela?: number;
  taxa_juros: number;
  codigo_transacao?: string;
  gateway_pagamento?: string;
  dados_pagamento?: any;
  data_pagamento?: string;
  data_confirmacao?: string;
  criado_em: string;
  atualizado_em: string;
  // Campos Stripe (quando implementado)
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  stripe_customer_id?: string;
  webhook_event_id?: string;
}

export interface MetodoPagamentoUsuario {
  id: number;
  usuario_id: number;
  tipo: TipoMetodo;
  bandeira?: string;
  ultimos_digitos?: string;
  nome_titular?: string;
  validade?: string;
  cpf_titular?: string;
  principal: boolean;
  ativo: boolean;
  dados_criptografados?: string;
  criado_em: string;
  atualizado_em: string;
  // Campos Stripe (quando implementado)
  stripe_payment_method_id?: string;
  stripe_customer_id?: string;
}

// ================================
// DADOS MOCK PARA TESTES
// ================================

const mockPagamentos: Pagamento[] = [
  {
    id: 1,
    pedido_id: 1,
    metodo_pagamento: 'CARTAO_CREDITO',
    status_pagamento: 'APROVADO',
    valor_pago: 89.90,
    parcelas: 2,
    valor_parcela: 44.95,
    taxa_juros: 0,
    codigo_transacao: 'TXN001ABC123',
    gateway_pagamento: 'STRIPE',
    dados_pagamento: {
      cartao_bandeira: 'Visa',
      cartao_final: '4242'
    },
    data_pagamento: '2024-01-15T10:30:00Z',
    data_confirmacao: '2024-01-15T10:32:00Z',
    criado_em: '2024-01-15T10:30:00Z',
    atualizado_em: '2024-01-15T10:32:00Z',
    stripe_payment_intent_id: 'pi_mock_123456789'
  },
  {
    id: 2,
    pedido_id: 2,
    metodo_pagamento: 'PIX',
    status_pagamento: 'APROVADO',
    valor_pago: 45.50,
    parcelas: 1,
    valor_parcela: 45.50,
    taxa_juros: 0,
    codigo_transacao: 'PIX002XYZ789',
    gateway_pagamento: 'STRIPE',
    data_pagamento: '2024-01-16T14:15:00Z',
    data_confirmacao: '2024-01-16T14:15:30Z',
    criado_em: '2024-01-16T14:15:00Z',
    atualizado_em: '2024-01-16T14:15:30Z',
  },
  {
    id: 3,
    pedido_id: 3,
    metodo_pagamento: 'CARTAO_DEBITO',
    status_pagamento: 'PENDENTE',
    valor_pago: 125.80,
    parcelas: 1,
    valor_parcela: 125.80,
    taxa_juros: 0,
    codigo_transacao: 'TXN003DEF456',
    gateway_pagamento: 'STRIPE',
    data_pagamento: '2024-01-17T09:45:00Z',
    criado_em: '2024-01-17T09:45:00Z',
    atualizado_em: '2024-01-17T09:45:00Z',
  }
];

const mockMetodosPagamento: MetodoPagamentoUsuario[] = [
  {
    id: 1,
    usuario_id: 1,
    tipo: 'CARTAO_CREDITO',
    bandeira: 'Visa',
    ultimos_digitos: '4242',
    nome_titular: 'João Silva',
    validade: '12/2028',
    cpf_titular: '123.456.789-00',
    principal: true,
    ativo: true,
    criado_em: '2024-01-10T10:00:00Z',
    atualizado_em: '2024-01-10T10:00:00Z',
    stripe_payment_method_id: 'pm_mock_visa4242'
  },
  {
    id: 2,
    usuario_id: 1,
    tipo: 'PIX',
    principal: false,
    ativo: true,
    criado_em: '2024-01-10T10:05:00Z',
    atualizado_em: '2024-01-10T10:05:00Z',
  }
];

export interface CriarPagamento {
  pedido_id: number;
  metodo_pagamento: MetodoPagamento;
  valor_pago: number;
  parcelas?: number;
  codigo_transacao?: string;
  gateway_pagamento?: string;
  dados_pagamento?: any;
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string;
}

export interface AtualizarPagamento {
  status_pagamento?: StatusPagamento;
  codigo_transacao?: string;
  data_pagamento?: string;
  data_confirmacao?: string;
  stripe_charge_id?: string;
  webhook_event_id?: string;
  dados_pagamento?: any;
}

export interface FiltrosPagamento {
  usuario_id?: number;
  pedido_id?: number;
  status_pagamento?: StatusPagamento;
  metodo_pagamento?: MetodoPagamento;
  data_inicio?: string;
  data_fim?: string;
  valor_min?: number;
  valor_max?: number;
}


class MockPagamentoService {
  private pagamentos: Pagamento[] = [...mockPagamentos];
  private metodosPagamento: MetodoPagamentoUsuario[] = [...mockMetodosPagamento];
  private nextId = 4;

  // CRUD BÁSICO - PAGAMENTOS
  async criar(dados: CriarPagamento): Promise<Pagamento> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const novoPagamento: Pagamento = {
      id: this.nextId++,
      ...dados,
      parcelas: dados.parcelas || 1,
      status_pagamento: 'PENDENTE',
      taxa_juros: 0.00,
      valor_parcela: dados.parcelas && dados.parcelas > 1 
        ? dados.valor_pago / dados.parcelas 
        : dados.valor_pago,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    this.pagamentos.push(novoPagamento);
    return novoPagamento;
  }

  async buscarPorId(id: number): Promise<Pagamento | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.pagamentos.find(p => p.id === id) || null;
  }

  async buscar(filtros: FiltrosPagamento = {}): Promise<Pagamento[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let resultado = [...this.pagamentos];

    if (filtros.usuario_id) {
      // Para mock, assumimos que pedido_id 1,2,3 = usuario_id 1
      const pedidosUsuario = filtros.usuario_id === 1 ? [1, 2, 3] : [];
      resultado = resultado.filter(p => pedidosUsuario.includes(p.pedido_id));
    }

    if (filtros.pedido_id) {
      resultado = resultado.filter(p => p.pedido_id === filtros.pedido_id);
    }

    if (filtros.status_pagamento) {
      resultado = resultado.filter(p => p.status_pagamento === filtros.status_pagamento);
    }

    if (filtros.metodo_pagamento) {
      resultado = resultado.filter(p => p.metodo_pagamento === filtros.metodo_pagamento);
    }

    if (filtros.valor_min) {
      resultado = resultado.filter(p => p.valor_pago >= filtros.valor_min!);
    }

    if (filtros.valor_max) {
      resultado = resultado.filter(p => p.valor_pago <= filtros.valor_max!);
    }

    return resultado.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
  }

  async atualizar(id: number, dados: AtualizarPagamento): Promise<Pagamento> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.pagamentos.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Pagamento não encontrado');
    }

    this.pagamentos[index] = {
      ...this.pagamentos[index],
      ...dados,
      atualizado_em: new Date().toISOString(),
    };

    return this.pagamentos[index];
  }

  // CRUD BÁSICO - MÉTODOS DE PAGAMENTO
  async buscarMetodosUsuario(usuarioId: number): Promise<MetodoPagamentoUsuario[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.metodosPagamento
      .filter(m => m.usuario_id === usuarioId && m.ativo)
      .sort((a, b) => (b.principal ? 1 : 0) - (a.principal ? 1 : 0));
  }
}

// ================================
// IMPLEMENTAÇÃO SUPABASE (PRODUÇÃO)
// ================================

class SupabasePagamentoService {
  // Implementação real com Supabase será feita posteriormente
  
  async criar(dados: CriarPagamento): Promise<Pagamento> {
    throw new Error('Implementação Supabase ainda não disponível. Use modo mock para testes.');
  }

  async buscarPorId(id: number): Promise<Pagamento | null> {
    throw new Error('Implementação Supabase ainda não disponível. Use modo mock para testes.');
  }

  async buscar(filtros: FiltrosPagamento = {}): Promise<Pagamento[]> {
    throw new Error('Implementação Supabase ainda não disponível. Use modo mock para testes.');
  }

  async atualizar(id: number, dados: AtualizarPagamento): Promise<Pagamento> {
    throw new Error('Implementação Supabase ainda não disponível. Use modo mock para testes.');
  }

  async buscarMetodosUsuario(usuarioId: number): Promise<MetodoPagamentoUsuario[]> {
    throw new Error('Implementação Supabase ainda não disponível. Use modo mock para testes.');
  }
}

// ================================
// SELEÇÃO DE IMPLEMENTAÇÃO
// ================================

const USE_MOCK = true; // Altere para false quando quiser usar Supabase

const implementacao = USE_MOCK ? new MockPagamentoService() : new SupabasePagamentoService();

// ================================
// FUNÇÕES PÚBLICAS DO SERVICE (APENAS CRUD)
// ================================

// PAGAMENTOS
export async function criarPagamento(dados: CriarPagamento): Promise<Pagamento> {
  return await implementacao.criar(dados);
}

export async function buscarPagamentoPorId(id: number): Promise<Pagamento | null> {
  return await implementacao.buscarPorId(id);
}

export async function buscarPagamentos(filtros?: FiltrosPagamento): Promise<Pagamento[]> {
  return await implementacao.buscar(filtros);
}

export async function atualizarPagamento(id: number, dados: AtualizarPagamento): Promise<Pagamento> {
  return await implementacao.atualizar(id, dados);
}

// MÉTODOS DE PAGAMENTO
export async function buscarMetodosUsuario(usuarioId: number): Promise<MetodoPagamentoUsuario[]> {
  return await implementacao.buscarMetodosUsuario(usuarioId);
}
