jest.mock('../../supabase-client', () => ({
  supabase: { from: jest.fn() }
}));

import { buscarPedidoPorId } from '../../src/services/pedidoService';
import { supabase } from '../../supabase-client';

describe('Integration: pedido flows', () => {
  afterEach(() => jest.resetAllMocks());

  it('buscarPedidoPorId returns normalized payments', async () => {
    const fakePedido = {
      id: 1,
      pagamentos: [{ id: 'p1', status: 'APROVADO', status_detail: 'CARTAO' }]
    };

    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({ eq: () => ({ single: () => ({ then: (cb: any) => cb({ data: fakePedido, error: null }) }) }) })
    });

    const res = await buscarPedidoPorId(1);
    expect(res).toBeDefined();
    expect(res?.pagamentos && Array.isArray(res?.pagamentos)).toBe(true);
    expect((res as any).pagamentos[0].status_pagamento).toBe('APROVADO');
  });
});
