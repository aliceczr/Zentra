import { supabase } from '../../supabase-client';

export interface PreferenciaRequest {
  total: number;
  pedido_id: string;
  user_id: string;
}

export interface PreferenciaResponse {
  preference_id: string;
  init_point: string;
}

export interface StatusPagamento {
  status: 'approved' | 'rejected' | 'pending' | 'in_process' | 'cancelled';
  status_detail?: string;
  transaction_amount?: number;
  date_approved?: string;
  payment_id?: string;
}

export const mercadoPagoSupabaseService = {

  async criarPreferencia(payload: PreferenciaRequest): Promise<PreferenciaResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('criar-preferencia', {
        body: {
          total: payload.total,
          pedido_id: payload.pedido_id,
          user_id: payload.user_id
        },
      });

      if (error) {
        throw new Error(`Erro ao criar preferência: ${error.message}`);
      }

      if (!data?.preference_id || !data?.init_point) {
        throw new Error('Resposta inválida da função de criação');
      }

      return {
        preference_id: data.preference_id,
        init_point: data.init_point,
      };
    } catch (error: any) {
      console.error('Erro ao criar preferência:', error);
      throw error;
    }
  },

  async consultarStatusPagamento(preferenceId: string): Promise<StatusPagamento | null> {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('preference_id', preferenceId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return null;
      }

      const payment = data[0];
      
      return {
        status: payment.status,
        status_detail: payment.status_detail,
        transaction_amount: payment.valor_pago,
        date_approved: payment.data_aprovacao,
        payment_id: payment.payment_id,
      };
    } catch (error: any) {
      console.error('Erro ao consultar status:', error);
      throw error;
    }
  },

  async buscarHistoricoPagamentos(pedidoId: string): Promise<StatusPagamento[]> {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          status,
          status_detail,
          valor_pago,
          data_aprovacao,
          payment_id,
          preference_id,
          created_at
        `)
        .eq('pedido_id', pedidoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(item => ({
        status: item.status,
        status_detail: item.status_detail,
        transaction_amount: item.valor_pago,
        date_approved: item.data_aprovacao,
        payment_id: item.payment_id,
      })) || [];
    } catch (error: any) {
      console.error('Erro ao buscar histórico:', error);
      throw error;
    }
  },

  async verificarWebhooks(preferenceId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('mp_webhooks_log')
        .select('*')
        .or(`preference_id.eq.${preferenceId},external_reference.eq.${preferenceId}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) return [];
      return data || [];
    } catch (error: any) {
      console.error('Erro ao verificar webhooks:', error);
      return [];
    }
  },

  async simularPagamento(
    preferenceId: string, 
    status: 'approved' | 'rejected' | 'pending'
  ): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'production') {
        return false;
      }

      const { error } = await supabase
        .from('pagamentos')
        .update({
          status: status,
          status_detail: status === 'approved' ? 'accredited' : 'cc_rejected_other_reason',
          data_aprovacao: status === 'approved' ? new Date().toISOString() : null,
          payment_id: status === 'approved' ? `SIM_${Date.now()}` : null,
        })
        .eq('preference_id', preferenceId);

      if (error) return false;
      return true;
    } catch (error: any) {
      console.error('Erro na simulação:', error);
      return false;
    }
  },

  async obterEstatisticas(usuarioId: string): Promise<{
    total_pagamentos: number;
    aprovados: number;
    rejeitados: number;
    pendentes: number;
    valor_total: number;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('obter_estatisticas_pagamentos', { 
          p_usuario_id: usuarioId 
        });

      if (error) throw error;

      return data || {
        total_pagamentos: 0,
        aprovados: 0,
        rejeitados: 0,
        pendentes: 0,
        valor_total: 0,
      };
    } catch (error: any) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  },
};