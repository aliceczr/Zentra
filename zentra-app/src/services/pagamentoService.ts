import { supabase } from '../../supabase-client';

export type MetodoPagamento = 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'BOLETO' | 'DINHEIRO';
export type StatusPagamento = 'PENDENTE' | 'PROCESSANDO' | 'APROVADO' | 'RECUSADO' | 'CANCELADO' | 'ESTORNADO';
export type TipoMetodo = 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX';

export interface Pagamento {
  id: string; 
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
  created_at: string;
  stripe_payment_method_id?: string;
  stripe_customer_id?: string;
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

export interface AtualizarPagamento {
  status?: StatusPagamento;
  status_detail?: string | null;
  codigo_transacao?: string;
  data_pagamento?: string;
  data_aprovacao?: string;
  stripe_charge_id?: string;
  webhook_event_id?: string;
}

export interface CriarPagamento {
  pedido_id: number;
  preference_id?: string | null;
  payment_id?: string | null;
  status: string;
  status_detail?: string | null;
  valor_pago?: number | null;
  data_aprovacao?: string | null;
  created_at?: string;
}


export async function criarPagamento(dados: CriarPagamento): Promise<Pagamento> {
  const now = new Date().toISOString();

  const pagamentoData: any = {
    ...dados,
   
    status: (dados as any).status ?? 'PENDENTE',
    status_detail: (dados as any).status_detail || null,
    valor_pago: dados.valor_pago ?? null,
    data_aprovacao: (dados as any).data_aprovacao ?? (((dados as any).status === 'APROVADO' || (dados as any).status === 'PAGO') ? now : null),
    created_at: now,
  };

  const { data, error } = await supabase.from('pagamentos').insert([pagamentoData]).select();
  if (error) throw error;
  const created = data[0];


  try {
   
    const pagoStatuses = ['APROVADO', 'PAGO', 'APPROVED'];
    const pagamentoStatus = (pagamentoData.status || '').toString().toUpperCase();
    if (pagoStatuses.includes(pagamentoStatus)) {
      await supabase
        .from('pedidos')
        .update({ status: 'PAGO' })
        .eq('id', dados.pedido_id);
    }
  } catch (err) {
    console.error('Erro ao marcar pedido como PAGO (simulação):', err);
  }

  return {
    ...created,
    status_pagamento: (created as any)?.status,
    metodo_pagamento: (created as any)?.status_detail,
  } as unknown as Pagamento;
}

export async function buscarPagamentoPorId(id: number): Promise<Pagamento | null> {
  const { data, error } = await supabase.from('pagamentos').select('*').eq('id', id).single();
  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    status_pagamento: (data as any).status,
    metodo_pagamento: (data as any).status_detail,
  } as unknown as Pagamento;
}

export async function buscarPagamentos(filtros: FiltrosPagamento = {}): Promise<Pagamento[]> {
  let query = supabase.from('pagamentos').select('*');
  if (filtros.usuario_id) query = query.eq('usuario_id', filtros.usuario_id);
  if (filtros.pedido_id) query = query.eq('pedido_id', filtros.pedido_id);
  if (filtros.status_pagamento) query = query.eq('status', filtros.status_pagamento);
  if (filtros.metodo_pagamento) query = query.eq('status_detail', filtros.metodo_pagamento);
  if (filtros.valor_min) query = query.gte('valor_pago', filtros.valor_min);
  if (filtros.valor_max) query = query.lte('valor_pago', filtros.valor_max);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((d: any) => ({
    ...d,
    status_pagamento: d.status,
    metodo_pagamento: d.status_detail,
  }));
}

export async function atualizarPagamento(id: number, dados: AtualizarPagamento): Promise<Pagamento> {
  // map possible legacy key
  const payload: any = { ...dados };
  if ((payload as any).status_pagamento) {
    payload.status = (payload as any).status_pagamento;
    delete payload.status_pagamento;
  }
  const { data, error } = await supabase
    .from('pagamentos')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  const updated = data as any;
  return {
    ...updated,
    status_pagamento: updated.status,
    metodo_pagamento: updated.status_detail,
  } as unknown as Pagamento;
}


export async function buscarMetodosUsuario(usuarioId: number): Promise<MetodoPagamentoUsuario[]> {
  const { data, error } = await supabase
    .from('metodos_pagamento_usuario')
    .select('*')
    .eq('usuario_id', usuarioId)
    .eq('ativo', true);
  if (error) throw error;
  return (data || []).sort((a, b) => (b.principal ? 1 : 0) - (a.principal ? 1 : 0));
}

