import { openBrowserAsync } from 'expo-web-browser';
import { mercadoPagoSupabaseService } from './mercadoPagoSupabaseService';

export interface ItemMercadoPago {
  id: string;
  title: string;
  description?: string;
  picture_url?: string;
  category_id?: string;
  quantity: number;
  currency_id: string;
  unit_price: number;
}

export interface DadosComprador {
  user_id: string; 
  email: string;
  name?: string;
  surname?: string;
  phone?: string;
  area_code?: string;
}

export interface ResultadoCheckout {
  preferenceId: string;
  checkoutUrl: string;
  success: boolean;
}

export interface StatusPagamento {
  status: 'approved' | 'rejected' | 'pending' | 'in_process' | 'cancelled';
  status_detail?: string;
  transaction_amount?: number;
  date_approved?: string;
  payment_id?: string;
}



export const mercadoPagoService = {


  async criarPreferencia(
    items: ItemMercadoPago[],
    comprador: DadosComprador,
    pedidoId: string
  ): Promise<ResultadoCheckout> {
    try {
      console.log('🛒 Criando preferência MP via Supabase para pedido:', pedidoId);
      console.log('📦 Items:', items.length);
      
     
      const total = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      
      const resultado = await mercadoPagoSupabaseService.criarPreferencia({
        total: total,
        pedido_id: pedidoId,
        user_id: comprador.user_id, 
      });
      
      return {
        preferenceId: resultado.preference_id,
        checkoutUrl: resultado.init_point,
        success: true,
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar preferência:', error);
      throw new Error(`Falha ao criar preferência: ${error?.message || 'Erro desconhecido'}`);
    }
  },

  async abrirCheckout(checkoutUrl: string): Promise<{ type: string; url?: string }> {
    try {
      console.log('🌐 Abrindo checkout:', checkoutUrl);
      
      const result = await openBrowserAsync(checkoutUrl, {
        controlsColor: '#009EE3',
        toolbarColor: '#FFFFFF',
        showTitle: true,
        enableBarCollapsing: true,
      });

      console.log('📱 Resultado do browser:', result);
      
      return result;

    } catch (error) {
      console.error('❌ Erro ao abrir checkout:', error);
      throw new Error('Falha ao abrir checkout');
    }
  },

 
  async consultarPreferencia(preferenceId: string): Promise<any> {
    try {
      console.log('🔍 Consultando preferência:', preferenceId);
      
      // Por enquanto, usar consulta de status
      const status = await mercadoPagoSupabaseService.consultarStatusPagamento(preferenceId);
      
      if (status) {
        return {
          payments: [{
            status: status.status,
            status_detail: status.status_detail,
            transaction_amount: status.transaction_amount,
            date_approved: status.date_approved
          }]
        };
      }
      
      return { payments: [] };

    } catch (error) {
      console.error('❌ Erro ao consultar preferência:', error);
      return { payments: [] };
    }
  },


  async processarPagamento(
    items: ItemMercadoPago[],
    comprador: DadosComprador,
    pedidoId: string
  ): Promise<{ preferenceId: string; checkoutResult: any }> {
    try {
      // 1. Criar preferência
      const { preferenceId, checkoutUrl } = await this.criarPreferencia(items, comprador, pedidoId);
      
      // 2. Abrir checkout
      const checkoutResult = await this.abrirCheckout(checkoutUrl);
      
      return {
        preferenceId,
        checkoutResult
      };

    } catch (error) {
      console.error('❌ Erro no fluxo de pagamento:', error);
      throw error;
    }
  }
};