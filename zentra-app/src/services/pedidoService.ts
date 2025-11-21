import { supabase } from '../../supabase-client';
import { Produto } from './produtoService';
import { criarPagamento as criarPagamentoService } from './pagamentoService';



export type MetodoPagamento = 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'BOLETO' | 'DINHEIRO';
export type StatusPagamento = 'PENDENTE' | 'PROCESSANDO' | 'APROVADO' | 'RECUSADO' | 'CANCELADO' | 'ESTORNADO';
export type StatusPedido = 'CRIADO' | 'PAGO' | 'PREPARANDO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
export type TipoMetodo = 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX';

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
  id: number; 
  usuario_id: string; 
  endereco_id: string; 
  endereco?: {
    id: string;
    user_id: string;
    tipo: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string | null;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
    referencia?: string | null;
    principal: boolean;
    created_at?: string;
    updated_at?: string;
  };
  status: StatusPedido;
  subtotal: number;
  taxa_entrega: number;
  desconto: number;
  total: number;
  observacoes?: string;
  tempo_estimado_entrega?: number; 
  codigo_pedido: string; 
  itens: ItemPedido[];
  pagamentos: Pagamento[];
  created_at: string;
  updated_at: string;
  data_entrega_estimada?: string;
  data_entrega_real?: string;
}


export interface Pagamento {
  id: string | number;
  pedido_id: number;
  preference_id?: string | null;
  payment_id?: string | null;
  status: string;
  status_detail?: string | null;
  valor_pago?: number | null;
  data_aprovacao?: string | null;
  created_at: string;
}

export interface MetodoPagamentoUsuario {
  id: number;
  usuario_id: string; 
  tipo: TipoMetodo;
  nome?: string;
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

  stripe_payment_method_id?: string;
  stripe_customer_id?: string;
}


export interface CriarPedido {
  usuario_id: string; 
  endereco_id: string;
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
  preference_id?: string | null;
  payment_id?: string | null;
  status?: string;
  status_detail?: string | null;
  valor_pago?: number | null;
  data_aprovacao?: string | null;
}

export interface AtualizarPedido {
  status?: StatusPedido;
  endereco_id?: string; 
  observacoes?: string;
  tempo_estimado_entrega?: number;
  data_entrega_estimada?: string;
  data_entrega_real?: string;
}

export interface AtualizarPagamento {
  status?: StatusPagamento;
  status_detail?: string | null;
  data_aprovacao?: string;
  valor_pago?: number | null;
}


export interface FiltrosPedidos {
  usuario_id?: string; 
  status?: StatusPedido;
  data_inicio?: string;
  data_fim?: string;
  codigo_pedido?: string;
  endereco_id?: string; 
}

export interface FiltrosPagamentos {
  pedido_id?: number;
  usuario_id?: string; 
  metodo_pagamento?: MetodoPagamento;
  status_pagamento?: StatusPagamento;
  data_inicio?: string;
  data_fim?: string;
  codigo_transacao?: string;
}


class SupabasePedidoService {
  
  async criarPedido(dados: CriarPedido): Promise<Pedido> {
    try {
      
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
        codigo_pedido: `ZEN-${Date.now()}`, 
      };

      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([pedidoData])
        .select('*')
        .single();

      if (pedidoError) {
        console.error('Erro ao criar pedido:', pedidoError);
        throw pedidoError;
      }

      

      const itensData = await Promise.all(dados.itens.map(async (item) => {
        
        const { data: produto } = await supabase
          .from('produtos')
          .select('nome, imagem_principal, marca, fabricante')
          .eq('id', item.produto_id)
          .single();
       
        try {
          const { data: pFull } = await supabase.from('produtos').select('estoque_atual').eq('id', item.produto_id).single();
          if (pFull && typeof (pFull as any).estoque_atual === 'number') {
            const estoque = (pFull as any).estoque_atual as number;
            if (estoque < (item.quantidade || 0)) {
              throw new Error(`Estoque insuficiente para o produto ${produto?.nome || item.produto_id}`);
            }
          }
        } catch (err) {
          
          throw err;
        }

        return {
          pedido_id: pedido.id,
          produto_id: item.produto_id,
          produto_nome: produto?.nome || 'Produto não encontrado',
          produto_imagem: produto?.imagem_principal || null,
          produto_marca: produto?.marca || null,
          produto_fabricante: produto?.fabricante || null,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
   
          observacoes: item.observacoes,
        };
      }));

      const { data: itens, error: itensError } = await supabase
        .from('itens_pedido')
        .insert(itensData)
        .select('*');

      if (itensError) {
        console.error('Erro ao criar itens do pedido:', itensError);
        throw itensError;
      }

      

      return {
        ...pedido,
        itens: itens || [],
        pagamentos: []
      };

    } catch (error) {
      console.error('Erro no SupabasePedidoService.criarPedido:', error);
      throw error;
    }
  }

  async buscarPedidoPorId(id: number): Promise<Pedido | null> {
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
        console.error('Erro ao buscar pedido:', error);
        return null;
      }


      if (data && data.pagamentos && Array.isArray(data.pagamentos)) {
        data.pagamentos = data.pagamentos.map((p: any) => ({
          ...p,
          status_pagamento: p.status,
          metodo_pagamento: p.status_detail,
        }));
      }

    return data;
    } catch (error) {
      console.error('Erro no SupabasePedidoService.buscarPedidoPorId:', error);
      return null;
    }
  }

  async buscarPedidos(filtros: FiltrosPedidos = {}): Promise<Pedido[]> {
    try {
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          itens:itens_pedido(*, produto:produtos(*)),
          pagamentos:pagamentos(*)
        `);

      if (filtros.usuario_id) {
        query = query.eq('usuario_id', filtros.usuario_id);
      }
      
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }

    
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.error('Erro ao buscar pedidos:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Erro no SupabasePedidoService.buscarPedidos:', error);
      throw error;
    }
  }

  async atualizarPedido(id: number, dados: AtualizarPedido): Promise<Pedido> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .update(dados)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao atualizar pedido:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erro no SupabasePedidoService.atualizarPedido:', error);
      throw error;
    }
  }

  async criarPagamento(dados: CriarPagamento): Promise<Pagamento> {

    return await criarPagamentoService(dados as any);
  }

  async buscarPagamentoPorId(id: number): Promise<Pagamento | null> {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        console.error('Erro ao buscar pagamento:', error);
        return null;
      }
      const normalizedPayment = {
        ...data,
        status_pagamento: (data as any)?.status,
        metodo_pagamento: (data as any)?.status_detail,
      };
      return normalizedPayment as unknown as Pagamento;
    } catch (error) {
      console.error('Erro no SupabasePedidoService.buscarPagamentoPorId:', error);
      return null;
    }
  }

  async buscarPagamentos(filtros: FiltrosPagamentos = {}): Promise<Pagamento[]> {
    try {
      let query = supabase
        .from('pagamentos')
        .select('*');
      if (filtros.pedido_id) {
        query = query.eq('pedido_id', filtros.pedido_id);
      }
      if (filtros.status_pagamento) {
        query = query.eq('status', filtros.status_pagamento);
      }
      if (filtros.metodo_pagamento) {
        query = query.eq('metodo_pagamento', filtros.metodo_pagamento);
      }
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Erro no SupabasePedidoService.buscarPagamentos:', error);
      throw error;
    }
  }

  async atualizarPagamento(id: number, dados: AtualizarPagamento): Promise<Pagamento> {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .update(dados)
        .eq('id', id)
        .select('*')
        .single();
      if (error) {
        console.error('Erro ao atualizar pagamento:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erro no SupabasePedidoService.atualizarPagamento:', error);
      throw error;
    }
  }

  async buscarMetodosUsuario(usuarioId: string): Promise<MetodoPagamentoUsuario[]> {
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


export async function buscarMetodosUsuario(usuarioId: string): Promise<MetodoPagamentoUsuario[]> {
  return await supabasePedidoService.buscarMetodosUsuario(usuarioId);
}

export function formatarCodigoPedido(id: number): string {
  return `ZEN-${String(id).padStart(3, '0')}`;
}

export function verificarMedicamentoControlado(itens: ItemPedido[]): boolean {
  return itens.some(item => item.produto.controlado || item.produto.requer_receita);
}

