import { Pagamento, MetodoPagamentoUsuario } from '../../services/pagamentoService';


export const mockPagamentos: Pagamento[] = [
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

export const mockMetodosPagamento: MetodoPagamentoUsuario[] = [
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
