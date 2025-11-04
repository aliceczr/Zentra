// ============================================================================
// 💙 SERVIÇO DO MERCADO PAGO - Zentra
// ============================================================================

import { Alert } from 'react-native';

// ============================================================================
// 🔧 CONFIGURAÇÃO
// ============================================================================

export const MP_CONFIG = {
  // 🔑 SUAS CREDENCIAIS (SUBSTITUA AQUI)
  PUBLIC_KEY: 'TEST-SUA_PUBLIC_KEY_AQUI', // pk_test_...
  ACCESS_TOKEN: 'TEST-SUA_ACCESS_TOKEN_AQUI', // access_token_test_...
  
  // 🌐 URLs da API
  API_BASE_URL: 'https://api.mercadopago.com/v1',
  
  // ⚙️ CONFIGURAÇÕES
  SANDBOX: true, // true = teste, false = produção
  CURRENCY: 'BRL',
  COUNTRY: 'BR',
};

// ============================================================================
// 📱 TIPOS E INTERFACES
// ============================================================================

export interface MPPaymentRequest {
  amount: number;
  description: string;
  payer_email: string;
  payment_method_id: string; // 'pix', 'visa', 'master', etc.
  installments?: number;
  external_reference?: string; // ID do seu pedido
}

export interface MPPaymentResponse {
  id: number;
  status: string;
  status_detail: string;
  payment_method_id: string;
  payment_type_id: string;
  transaction_amount: number;
  installments: number;
  description: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
  date_created: string;
  date_approved?: string;
  external_reference?: string;
  merchant_order_id?: number;
}

export interface MPPreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

export interface MPPreferenceRequest {
  items: MPPreferenceItem[];
  payer: {
    email: string;
    name?: string;
    phone?: {
      area_code: string;
      number: string;
    };
  };
  payment_methods: {
    excluded_payment_methods: { id: string }[];
    excluded_payment_types: { id: string }[];
    installments: number;
  };
  external_reference: string;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved' | 'all';
  notification_url?: string;
}

// ============================================================================
// 💼 CLASSE PRINCIPAL DO SERVIÇO
// ============================================================================

export class MercadoPagoService {
  
  private headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${MP_CONFIG.ACCESS_TOKEN}`,
  };

  // --------------------------------------------------------------------------
  // 🏗️ CRIAR PAGAMENTO DIRETO (PIX/CARTÃO)
  // --------------------------------------------------------------------------
  
  async createPayment(paymentData: MPPaymentRequest): Promise<MPPaymentResponse> {
    try {
      console.log('🔍 Criando pagamento MP:', paymentData);
      
      const response = await fetch(`${MP_CONFIG.API_BASE_URL}/payments`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          transaction_amount: paymentData.amount,
          description: paymentData.description,
          payment_method_id: paymentData.payment_method_id,
          installments: paymentData.installments || 1,
          payer: {
            email: paymentData.payer_email,
          },
          external_reference: paymentData.external_reference,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro MP:', errorData);
        throw new Error(`Erro MP: ${errorData.message || 'Falha na comunicação'}`);
      }

      const data = await response.json();
      console.log('✅ Pagamento MP criado:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar pagamento MP:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // 🎯 CRIAR PREFERÊNCIA (CHECKOUT PRO)
  // --------------------------------------------------------------------------
  
  async createPreference(preferenceData: MPPreferenceRequest): Promise<any> {
    try {
      console.log('🔍 Criando preferência MP:', preferenceData);
      
      const response = await fetch(`${MP_CONFIG.API_BASE_URL}/checkout/preferences`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(preferenceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro MP Preference:', errorData);
        throw new Error(`Erro MP: ${errorData.message || 'Falha na comunicação'}`);
      }

      const data = await response.json();
      console.log('✅ Preferência MP criada:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar preferência MP:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // 📱 CRIAR PAGAMENTO PIX SIMPLES
  // --------------------------------------------------------------------------
  
  async createPixPayment(amount: number, email: string, pedidoId: string): Promise<MPPaymentResponse> {
    return this.createPayment({
      amount,
      description: `Zentra Farmácia - Pedido #${pedidoId}`,
      payer_email: email,
      payment_method_id: 'pix',
      external_reference: pedidoId,
    });
  }

  // --------------------------------------------------------------------------
  // 💳 CRIAR PAGAMENTO CARTÃO SIMPLES
  // --------------------------------------------------------------------------
  
  async createCardPayment(
    amount: number, 
    email: string, 
    pedidoId: string,
    installments: number = 1
  ): Promise<MPPaymentResponse> {
    return this.createPayment({
      amount,
      description: `Zentra Farmácia - Pedido #${pedidoId}`,
      payer_email: email,
      payment_method_id: 'visa', // Será escolhido pelo usuário na interface
      installments,
      external_reference: pedidoId,
    });
  }

  // --------------------------------------------------------------------------
  // 🎫 CRIAR BOLETO
  // --------------------------------------------------------------------------
  
  async createBoletoPayment(amount: number, email: string, pedidoId: string): Promise<MPPaymentResponse> {
    return this.createPayment({
      amount,
      description: `Zentra Farmácia - Pedido #${pedidoId}`,
      payer_email: email,
      payment_method_id: 'bolbradesco', // Ou outro banco
      external_reference: pedidoId,
    });
  }

  // --------------------------------------------------------------------------
  // 🔍 CONSULTAR PAGAMENTO
  // --------------------------------------------------------------------------
  
  async getPayment(paymentId: number): Promise<MPPaymentResponse> {
    try {
      const response = await fetch(`${MP_CONFIG.API_BASE_URL}/payments/${paymentId}`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error('Erro ao consultar pagamento');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao consultar pagamento MP:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // 🏪 CRIAR CHECKOUT COMPLETO PARA ZENTRA
  // --------------------------------------------------------------------------
  
  async createZentraCheckout(
    itens: Array<{nome: string, quantidade: number, preco: number}>,
    total: number,
    email: string,
    pedidoId: string
  ) {
    try {
      const preference: MPPreferenceRequest = {
        items: itens.map((item, index) => ({
          id: `zentra-item-${index}`,
          title: item.nome,
          quantity: item.quantidade,
          unit_price: item.preco,
          currency_id: 'BRL',
        })),
        payer: {
          email,
        },
        payment_methods: {
          excluded_payment_methods: [], // Permitir todos
          excluded_payment_types: [], // Permitir todos
          installments: 12, // Até 12x
        },
        external_reference: pedidoId,
        back_urls: {
          success: 'zentra://payment/success',
          failure: 'zentra://payment/failure', 
          pending: 'zentra://payment/pending',
        },
        auto_return: 'approved',
      };

      return this.createPreference(preference);
    } catch (error) {
      console.error('❌ Erro no checkout Zentra:', error);
      throw error;
    }
  }
}

// ============================================================================
// 🎯 INSTÂNCIA ÚNICA
// ============================================================================

export const mercadoPagoService = new MercadoPagoService();

// ============================================================================
// 🛠️ FUNÇÕES AUXILIARES
// ============================================================================

export const formatMPStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Aguardando pagamento',
    approved: 'Pagamento aprovado',
    authorized: 'Pagamento autorizado',
    in_process: 'Processando pagamento',
    in_mediation: 'Em mediação',
    rejected: 'Pagamento rejeitado',
    cancelled: 'Pagamento cancelado',
    refunded: 'Estornado',
    charged_back: 'Chargeback',
  };
  
  return statusMap[status] || status;
};

export const getMPPaymentMethodName = (method: string): string => {
  const methods: Record<string, string> = {
    pix: 'PIX',
    visa: 'Visa',
    master: 'Mastercard',
    amex: 'American Express',
    elo: 'Elo',
    hipercard: 'Hipercard',
    bolbradesco: 'Boleto Bradesco',
    'account_money': 'Saldo Mercado Pago',
  };
  
  return methods[method] || method;
};

export const isTestMode = (): boolean => MP_CONFIG.SANDBOX;

// ============================================================================
// ⚠️ VALIDAÇÃO DE CONFIGURAÇÃO
// ============================================================================

export const validateMPConfig = (): boolean => {
  if (!MP_CONFIG.PUBLIC_KEY.includes('TEST-') && !MP_CONFIG.PUBLIC_KEY.includes('APP_USR-')) {
    console.warn('⚠️ Chave pública do MP não configurada');
    return false;
  }
  
  if (!MP_CONFIG.ACCESS_TOKEN.includes('TEST-') && !MP_CONFIG.ACCESS_TOKEN.includes('APP_USR-')) {
    console.warn('⚠️ Access token do MP não configurado');
    return false;
  }
  
  return true;
};