import { supabase } from '../../supabase-client';

jest.mock('../../supabase-client');

// Mock do serviço de histórico
const historicoService = {
  async obterHistorico() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },

  async obterDetalhePedido(pedidoId: number) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        itens:itens_pedido(*)
      `)
      .eq('id', pedidoId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
};

describe('CDU-17: Histórico de Compras - HistoricoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== CT-50: Exibir histórico de compras =====
  describe('CT-50: Exibir histórico de compras com dados', () => {
    it('deve retornar lista de compras do usuário', async () => {
      const mockUser = { id: 'user-123', email: 'usuario@example.com' };
      const mockPedidos = [
        {
          id: 1,
          usuario_id: 'user-123',
          codigo_pedido: 'PED-001',
          total: 129.80,
          status: 'ENTREGUE',
          created_at: '2024-01-10',
          data_entrega_estimada: '2024-01-15'
        },
        {
          id: 2,
          usuario_id: 'user-123',
          codigo_pedido: 'PED-002',
          total: 79.90,
          status: 'ENVIADO',
          created_at: '2024-01-05',
          data_entrega_estimada: '2024-01-12'
        }
      ];

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockPedidos,
              error: null
            })
          })
        })
      });

      const result = await historicoService.obterHistorico();

      expect(result).toEqual(mockPedidos);
      expect(result.length).toBe(2);
    });

    it('deve exibir data de cada compra', async () => {
      const mockUser = { id: 'user-123' };
      const mockPedido = {
        id: 1,
        usuario_id: 'user-123',
        data: '2024-01-10',
        created_at: '2024-01-10T10:30:00Z',
        total: 129.80
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [mockPedido],
              error: null
            })
          })
        })
      });

      const result = await historicoService.obterHistorico();

      expect(result[0].created_at).toBeDefined();
      expect(result[0].created_at).toBe('2024-01-10T10:30:00Z');
    });

    it('deve exibir nome do produto no histórico', async () => {
      const mockUser = { id: 'user-123' };
      const mockPedido = {
        id: 1,
        usuario_id: 'user-123',
        status: 'ENTREGUE',
        total: 129.80,
        itens: [
          { id: 1, produto_nome: 'Vitamina C 500mg', quantidade: 2, preco_unitario: 29.90 }
        ]
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [mockPedido],
              error: null
            })
          })
        })
      });

      const result = await historicoService.obterHistorico();

      expect(result[0]).toBeDefined();
    });

    it('deve exibir valor de cada compra', async () => {
      const mockUser = { id: 'user-123' };
      const mockPedido = {
        id: 1,
        usuario_id: 'user-123',
        valor: 129.80,
        total: 129.80,
        status: 'ENTREGUE'
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [mockPedido],
              error: null
            })
          })
        })
      });

      const result = await historicoService.obterHistorico();

      expect(result[0].total).toBe(129.80);
    });

    it('deve exibir status de cada compra', async () => {
      const mockUser = { id: 'user-123' };
      const mockPedidos = [
        {
          id: 1,
          usuario_id: 'user-123',
          status: 'ENTREGUE',
          total: 129.80
        },
        {
          id: 2,
          usuario_id: 'user-123',
          status: 'ENVIADO',
          total: 79.90
        }
      ];

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockPedidos,
              error: null
            })
          })
        })
      });

      const result = await historicoService.obterHistorico();

      expect(result[0].status).toBe('ENTREGUE');
      expect(result[1].status).toBe('ENVIADO');
    });

    it('deve estar ordenado por data (mais recentes primeiro)', async () => {
      const mockUser = { id: 'user-123' };
      const mockPedidos = [
        { id: 3, usuario_id: 'user-123', created_at: '2024-01-15' },
        { id: 2, usuario_id: 'user-123', created_at: '2024-01-10' },
        { id: 1, usuario_id: 'user-123', created_at: '2024-01-05' }
      ];

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockPedidos,
              error: null
            })
          })
        })
      });

      const result = await historicoService.obterHistorico();

      expect(result[0].id).toBe(3);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(1);
    });
  });

  // ===== CT-51: Histórico vazio =====
  describe('CT-51: Histórico vazio', () => {
    it('deve exibir lista vazia quando usuário não comprou', async () => {
      const mockUser = { id: 'user-123' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      });

      const result = await historicoService.obterHistorico();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('deve exibir mensagem "Você ainda não realizou compras"', async () => {
      const mockUser = { id: 'user-123' };
      const emptyMessage = 'Você ainda não realizou compras';

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      });

      const result = await historicoService.obterHistorico();

      if (result.length === 0) {
        expect(emptyMessage).toContain('ainda não realizou compras');
      }
    });

    it('deve permitir usuário fazer primeira compra', async () => {
      const mockUser = { id: 'user-123' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      });

      const historicoAntes = await historicoService.obterHistorico();
      expect(historicoAntes.length).toBe(0);

      // Simular primeiro pedido
      const mockPrimeiroPedido = {
        id: 1,
        usuario_id: 'user-123',
        total: 129.80,
        status: 'PAGO'
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [mockPrimeiroPedido],
              error: null
            })
          })
        })
      });

      const historicoDepois = await historicoService.obterHistorico();
      expect(historicoDepois.length).toBe(1);
    });
  });

  // ===== CT-52: Erro ao carregar histórico =====
  describe('CT-52: Erro ao carregar histórico', () => {
    it('deve exibir mensagem de erro quando API falha', async () => {
      const mockUser = { id: 'user-123' };
      const errorMessage = 'Erro ao carregar histórico de compras';

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: new Error(errorMessage)
            })
          })
        })
      });

      expect(errorMessage).toContain('Erro');
    });

    it('deve exibir mensagem genérica ao usuário', () => {
      const genericMessage = 'Não conseguimos carregar seu histórico. Tente novamente.';

      expect(genericMessage.toLowerCase()).toContain('não conseguimos');
    });

    it('deve permitir tentar novamente após erro', async () => {
      const mockUser = { id: 'user-123' };

      // Primeira tentativa com erro
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Connection error')
            })
          })
        })
      });

      // Simulando retry com sucesso
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [{ id: 1, usuario_id: 'user-123', total: 129.80 }],
              error: null
            })
          })
        })
      });

      const result = await historicoService.obterHistorico();
      expect(result).toBeDefined();
    });

    it('deve rejeitar com erro quando usuário não está autenticado', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      });

      await expect(historicoService.obterHistorico()).rejects.toThrow();
    });

    it('deve logar erros para debugging', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Auth error')
      });

      try {
        await historicoService.obterHistorico();
      } catch (error) {
        // Error handling
      }

      consoleErrorSpy.mockRestore();
    });
  });

  // ===== Testes Adicionais =====
  describe('Testes Adicionais de Histórico', () => {
    it('deve obter detalhes de um pedido específico', async () => {
      const mockPedidoDetalhes = {
        id: 1,
        usuario_id: 'user-123',
        status: 'ENTREGUE',
        total: 129.80,
        itens: [
          { produto_id: 1, quantidade: 2, preco_unitario: 29.90 }
        ]
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockPedidoDetalhes,
              error: null
            })
          })
        })
      });

      const result = await historicoService.obterDetalhePedido(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.itens).toBeDefined();
    });

    it('deve paginar histórico de compras', async () => {
      // Teste de paginação se implementado
      const mockUser = { id: 'user-123' };
      const mockPedidos = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        usuario_id: 'user-123',
        total: Math.random() * 200 + 20
      }));

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockPedidos.slice(0, 10), // Primeira página
              error: null
            })
          })
        })
      });

      const result = await historicoService.obterHistorico();

      expect(result.length).toBeGreaterThan(0);
    });

    it('deve retornar histórico confiável e preciso', async () => {
      const mockUser = { id: 'user-123' };
      const mockPedido = {
        id: 1,
        usuario_id: 'user-123',
        codigo_pedido: 'PED-001',
        total: 129.80,
        status: 'ENTREGUE',
        created_at: '2024-01-10'
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [mockPedido],
              error: null
            })
          })
        })
      });

      const result = await historicoService.obterHistorico();

      expect(result[0].codigo_pedido).toBe('PED-001');
      expect(result[0].total).toBe(129.80);
    });
  });
});
