import { supabase } from '../../supabase-client';
import { Produto } from './produtoService';

// ============================================================================
// 🛒 TYPES E INTERFACES - PEDIDOS E PAGAMENTOS
// ============================================================================

export type MetodoPagamento = 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'BOLETO' | 'DINHEIRO';
export type StatusPagamento = 'PENDENTE' | 'PROCESSANDO' | 'APROVADO' | 'RECUSADO' | 'CANCELADO' | 'ESTORNADO';
export type StatusPedido = 'CRIADO' | 'PAGO' | 'PREPARANDO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
export type TipoMetodo = 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX';

// INTERFACES DE PEDIDO
export interface ItemPedido {
  id: number;
  pedido_id: number;
  produto_id: number;
  produto: Produto;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  observacoes?: string;
  created_at: string;
}

export interface Pedido {
  id: number; // SERIAL PRIMARY KEY no Supabase
  usuario_id: string; // UUID do auth.users no Supabase
  endereco_id: string; // UUID do endereco_usuario no Supabase
  endereco?: any; // Será tipado com interface de endereço
  status: StatusPedido;
  subtotal: number;
  taxa_entrega: number;
  desconto: number;
  total: number;
  observacoes?: string;
  tempo_estimado_entrega?: number; // em minutos
  codigo_pedido: string; // ZEN-001, ZEN-002, etc.
  itens: ItemPedido[];
  pagamentos: Pagamento[];
  created_at: string;
  updated_at: string;
  data_entrega_estimada?: string;
  data_entrega_real?: string;
}

// INTERFACES DE PAGAMENTO (mantidas do arquivo original)
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
  created_at: string;
  updated_at: string;
  // Campos Stripe (quando implementado)
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  stripe_customer_id?: string;
  webhook_event_id?: string;
}

export interface MetodoPagamentoUsuario {
  id: number;
  usuario_id: string; // UUID string do auth.users
  tipo: TipoMetodo;
  nome?: string; // Adicionar campo nome
  bandeira?: string;
  ultimos_digitos?: string;
  nome_titular?: string;
  validade?: string;
  cpf_titular?: string;
  principal: boolean;
  ativo: boolean;
  dados_criptografados?: string;
  created_at: string;
  updated_at?: string;
  // Campos Stripe (quando implementado)
  stripe_payment_method_id?: string;
  stripe_customer_id?: string;
}

// INTERFACES PARA CRIAÇÃO E ATUALIZAÇÃO
export interface CriarPedido {
  usuario_id: string; // UUID string do Supabase auth
  endereco_id: string; // UUID string do endereco_usuario
  itens: {
    produto_id: number;
    quantidade: number;
    preco_unitario: number;
    observacoes?: string;
  }[];
  subtotal: number;
  taxa_entrega: number;
  desconto?: number;
  total: number;
  observacoes?: string;
  tempo_estimado_entrega?: number;
}

export interface CriarPagamento {
  pedido_id: number;
  metodo_pagamento: MetodoPagamento;
  valor_pago: number;
  parcelas: number;
  taxa_juros?: number;
  dados_pagamento?: any;
  // Campos Stripe (quando implementado)
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string;
}

export interface AtualizarPedido {
  status?: StatusPedido;
  endereco_id?: string; // UUID string
  observacoes?: string;
  tempo_estimado_entrega?: number;
  data_entrega_estimada?: string;
  data_entrega_real?: string;
}

export interface AtualizarPagamento {
  status_pagamento?: StatusPagamento;
  codigo_transacao?: string;
  data_confirmacao?: string;
  dados_pagamento?: any;
  webhook_event_id?: string;
}

// INTERFACES PARA FILTROS
export interface FiltrosPedidos {
  usuario_id?: string; // UUID string
  status?: StatusPedido;
  data_inicio?: string;
  data_fim?: string;
  codigo_pedido?: string;
  endereco_id?: string; // UUID string
}

export interface FiltrosPagamentos {
  pedido_id?: number;
  usuario_id?: string; // UUID string
  metodo_pagamento?: MetodoPagamento;
  status_pagamento?: StatusPagamento;
  data_inicio?: string;
  data_fim?: string;
  codigo_transacao?: string;
}

// ================================
// IMPLEMENTAÇÃO SUPABASE (PRODUÇÃO)
// ================================

class SupabasePedidoService {
  
  async criarPedido(dados: CriarPedido): Promise<Pedido> {
    console.log('🔍 SupabasePedidoService.criarPedido chamado com:', dados);
    
    try {
      // 1. Primeiro, criar o pedido
      const pedidoData = {
        usuario_id: dados.usuario_id,
        endereco_id: dados.endereco_id,
        status: 'CRIADO' as StatusPedido,
        subtotal: dados.subtotal,
        taxa_entrega: dados.taxa_entrega,
        desconto: dados.desconto,
        total: dados.total,
        observacoes: dados.observacoes,
        tempo_estimado_entrega: dados.tempo_estimado_entrega || 30,
        codigo_pedido: `ZEN-${Date.now()}`, // Gerar código único
      };

      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([pedidoData])
        .select('*')
        .single();

      if (pedidoError) {
        console.error('❌ Erro ao criar pedido:', pedidoError);
        throw new Error('Erro ao criar pedido: ' + pedidoError.message);
      }

      console.log('✅ Pedido criado:', pedido);

      // 2. Criar itens do pedido
      const itensData = await Promise.all(dados.itens.map(async (item) => {
        // Buscar dados do produto para snapshot
        const { data: produto } = await supabase
          .from('produtos')
          .select('nome, imagem_principal, marca, fabricante')
          .eq('id', item.produto_id)
          .single();

        return {
          pedido_id: pedido.id,
          produto_id: item.produto_id,
          produto_nome: produto?.nome || 'Produto não encontrado',
          produto_imagem: produto?.imagem_principal || null,
          produto_marca: produto?.marca || null,
          produto_fabricante: produto?.fabricante || null,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          // preco_total removido - é calculado automaticamente no banco
          observacoes: item.observacoes,
        };
      }));

      const { data: itens, error: itensError } = await supabase
        .from('itens_pedido')
        .insert(itensData)
        .select('*');

      if (itensError) {
        console.error('❌ Erro ao criar itens do pedido:', itensError);
        throw new Error('Erro ao criar itens do pedido: ' + itensError.message);
      }

      console.log('✅ Itens do pedido criados:', itens);

      // 3. Retornar o pedido completo
      return {
        ...pedido,
        itens: itens || [],
        pagamentos: []
      };

    } catch (error) {
      console.error('❌ Erro no SupabasePedidoService.criarPedido:', error);
      throw error;
    }
  }

  async buscarPedidoPorId(id: number): Promise<Pedido | null> {
    console.log('🔍 SupabasePedidoService.buscarPedidoPorId chamado com:', id);
    
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          itens:itens_pedido(*, produto:produtos(*)),
          pagamentos:pagamentos(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar pedido:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Erro no SupabasePedidoService.buscarPedidoPorId:', error);
      return null;
    }
  }

  async buscarPedidos(filtros: FiltrosPedidos = {}): Promise<Pedido[]> {
    console.log('🔍 SupabasePedidoService.buscarPedidos chamado com filtros:', filtros);
    
    try {
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          itens:itens_pedido(*, produto:produtos(*)),
          pagamentos:pagamentos(*)
        `);

      // Aplicar filtros
      if (filtros.usuario_id) {
        console.log('🔍 Filtrando por usuario_id:', filtros.usuario_id);
        query = query.eq('usuario_id', filtros.usuario_id);
      }
      
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }

      // Ordenar por data de criação (mais recente primeiro)
      query = query.order('created_at', { ascending: false });

      console.log('📞 Executando query no Supabase...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar pedidos:', error);
        throw new Error('Erro ao buscar pedidos: ' + error.message);
      }

      console.log('📊 Dados retornados do Supabase:', data);
      console.log('📈 Quantidade de pedidos encontrados:', data?.length || 0);

      return data || [];
    } catch (error) {
      console.error('❌ Erro no SupabasePedidoService.buscarPedidos:', error);
      throw error;
    }
  }

  async atualizarPedido(id: number, dados: AtualizarPedido): Promise<Pedido> {
    console.log('🔍 SupabasePedidoService.atualizarPedido chamado:', { id, dados });
    
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .update(dados)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar pedido:', error);
        throw new Error('Erro ao atualizar pedido: ' + error.message);
      }

      return data;
    } catch (error) {
      console.error('❌ Erro no SupabasePedidoService.atualizarPedido:', error);
      throw error;
    }
  }

  async criarPagamento(dados: CriarPagamento): Promise<Pagamento> {
    console.log('🔍 SupabasePedidoService.criarPagamento chamado com:', dados);
    
    try {
      const pagamentoData = {
        pedido_id: dados.pedido_id,
        metodo_pagamento: dados.metodo_pagamento,
        valor_pago: dados.valor_pago, // Nome correto do campo
        parcelas: dados.parcelas,
        status_pagamento: 'PENDENTE' as StatusPagamento, // Nome correto do campo
        codigo_transacao: `TXN-${Date.now()}`, // Nome correto do campo
        gateway_pagamento: 'SIMULACAO', // Sistema de simulação para demonstração
        dados_pagamento: dados.dados_pagamento,
        data_pagamento: new Date().toISOString(),
        taxa_juros: dados.taxa_juros || 0,
      };

      const { data, error } = await supabase
        .from('pagamentos')
        .insert([pagamentoData])
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erro ao criar pagamento:', error);
        throw new Error('Erro ao criar pagamento: ' + error.message);
      }

      console.log('✅ Pagamento criado:', data);

      // Simular sequência de processamento (para MVP)
      // Etapa 1: CRIADO (Processando) - já criado
      
      // Etapa 2: Após 3 segundos -> PAGO (Pagamento Aprovado)
      setTimeout(async () => {
        try {
          await this.atualizarPagamento(data.id, { 
            status_pagamento: 'APROVADO'
          });
          
          await this.atualizarPedido(dados.pedido_id, {
            status: 'PAGO' as StatusPedido
          });
          
          console.log('✅ Etapa 2: Pagamento aprovado');
          
          // Etapa 3: Após mais 3 segundos -> ENTREGUE (Finalizado)
          setTimeout(async () => {
            try {
              await this.atualizarPedido(dados.pedido_id, {
                status: 'ENTREGUE' as StatusPedido
              });
              console.log('✅ Etapa 3: Pedido finalizado');
            } catch (err) {
              console.error('❌ Erro na etapa 3:', err);
            }
          }, 3000);
          
        } catch (err) {
          console.error('❌ Erro na etapa 2:', err);
        }
      }, 3000);

      return data;
    } catch (error) {
      console.error('❌ Erro no SupabasePedidoService.criarPagamento:', error);
      throw error;
    }
  }

  async buscarPagamentoPorId(id: number): Promise<Pagamento | null> {
    console.log('🔍 SupabasePedidoService.buscarPagamentoPorId chamado com:', id);
    
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar pagamento:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Erro no SupabasePedidoService.buscarPagamentoPorId:', error);
      return null;
    }
  }

  async buscarPagamentos(filtros: FiltrosPagamentos = {}): Promise<Pagamento[]> {
    console.log('🔍 SupabasePedidoService.buscarPagamentos chamado com filtros:', filtros);
    
    try {
      let query = supabase
        .from('pagamentos')
        .select('*');

      // Aplicar filtros
      if (filtros.pedido_id) {
        query = query.eq('pedido_id', filtros.pedido_id);
      }
      
      if (filtros.status_pagamento) { // Corrigir nome do campo
        query = query.eq('status', filtros.status_pagamento);
      }

      if (filtros.metodo_pagamento) {
        query = query.eq('metodo_pagamento', filtros.metodo_pagamento);
      }

      // Ordenar por data de criação
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar pagamentos:', error);
        throw new Error('Erro ao buscar pagamentos: ' + error.message);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro no SupabasePedidoService.buscarPagamentos:', error);
      throw error;
    }
  }

  async atualizarPagamento(id: number, dados: AtualizarPagamento): Promise<Pagamento> {
    console.log('🔍 SupabasePedidoService.atualizarPagamento chamado:', { id, dados });
    
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .update(dados)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar pagamento:', error);
        throw new Error('Erro ao atualizar pagamento: ' + error.message);
      }

      return data;
    } catch (error) {
      console.error('❌ Erro no SupabasePedidoService.atualizarPagamento:', error);
      throw error;
    }
  }

  async buscarMetodosUsuario(usuarioId: string): Promise<MetodoPagamentoUsuario[]> {
    console.log('🔍 SupabasePedidoService.buscarMetodosUsuario chamado com:', usuarioId);
    
    // Para MVP, retornar métodos mock
    // Em produção, seria integrado com gateway de pagamento
    return [
      {
        id: 1,
        usuario_id: usuarioId,
        tipo: 'CARTAO_CREDITO',
        nome: 'Cartão de Crédito',
        ultimos_digitos: '1234',
        principal: true,
        ativo: true,
        created_at: new Date().toISOString(),
      }
    ];
  }
}



const supabasePedidoService = new SupabasePedidoService();


export async function criarPedido(dados: CriarPedido): Promise<Pedido> {
  return await supabasePedidoService.criarPedido(dados);
}

export async function buscarPedidoPorId(id: number): Promise<Pedido | null> {
  return await supabasePedidoService.buscarPedidoPorId(id);
}

export async function buscarPedidos(filtros?: FiltrosPedidos): Promise<Pedido[]> {
  return await supabasePedidoService.buscarPedidos(filtros);
}

export async function atualizarPedido(id: number, dados: AtualizarPedido): Promise<Pedido> {
  return await supabasePedidoService.atualizarPedido(id, dados);
}

// PAGAMENTOS
export async function criarPagamento(dados: CriarPagamento): Promise<Pagamento> {
  return await supabasePedidoService.criarPagamento(dados);
}

export async function buscarPagamentoPorId(id: number): Promise<Pagamento | null> {
  return await supabasePedidoService.buscarPagamentoPorId(id);
}

export async function buscarPagamentos(filtros?: FiltrosPagamentos): Promise<Pagamento[]> {
  return await supabasePedidoService.buscarPagamentos(filtros);
}

export async function atualizarPagamento(id: number, dados: AtualizarPagamento): Promise<Pagamento> {
  return await supabasePedidoService.atualizarPagamento(id, dados);
}

// MÉTODOS DE PAGAMENTO
export async function buscarMetodosUsuario(usuarioId: string): Promise<MetodoPagamentoUsuario[]> {
  return await supabasePedidoService.buscarMetodosUsuario(usuarioId);
}

export function formatarCodigoPedido(id: number): string {
  return `ZEN-${String(id).padStart(3, '0')}`;
}

export function verificarMedicamentoControlado(itens: ItemPedido[]): boolean {
  return itens.some(item => item.produto.controlado || item.produto.requer_receita);
}

