import { useState, useEffect, useCallback } from 'react';
import {
  Pedido,
  FiltrosPedidos,
  StatusPedido,
  buscarPedidos as buscarPedidosService,
  buscarPedidoPorId as buscarPedidoPorIdService,
} from '../services/pedidoService';
import { useAuth } from '../contexts/AuthContext';

// ============================================================================
// HOOK SIMPLES PARA HISTÓRICO DE PEDIDOS (SEM FILTROS)
// - Mantemos o código simples e compatível com Supabase (calls isoladas ao service)
// ============================================================================

export function useHistoricoPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const carregarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se usuário está logado
      if (!user?.id) {
        console.log('ℹ️ Usuário não logado, não carregando pedidos');
        setPedidos([]);
        return;
      }

      console.log('🔍 Carregando pedidos para usuário:', user.id);
      
      // Usar o ID do usuário logado (UUID string direto)
      const filtros: FiltrosPedidos = { usuario_id: user.id };
      const resultado = await buscarPedidosService(filtros);

      console.log('📊 Pedidos carregados:', resultado);

      // Garantir ordenação por data (mais recente primeiro)
      resultado.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPedidos(resultado);
    } catch (err) {
      console.error('❌ useHistoricoPedidos - erro ao buscar pedidos:', err);
      setError('Erro ao carregar histórico');
      setPedidos([]); // Limpar pedidos em caso de erro
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  const recarregar = useCallback(() => carregarPedidos(), [carregarPedidos]);

  const estatisticas = {
    totalPedidos: pedidos.length,
    valorTotal: pedidos.reduce((acc, p) => acc + (p.total || 0), 0),
    pedidosEntregues: pedidos.filter(p => p.status === 'ENTREGUE').length,
  };

  return { pedidos, loading, error, estatisticas, recarregar };
}

// ============================================================================
// HOOK PARA DETALHES DE UM PEDIDO
// ============================================================================

export function usePedidoDetalhes(pedidoId: number | null) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const carregarPedido = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      // Preferir buscar por ID direto (compatível com Supabase)
      if (buscarPedidoPorIdService) {
        const p = await buscarPedidoPorIdService(id);
        setPedido(p);
        if (!p) setError('Pedido não encontrado');
      } else {
        // Fallback para buscarPedidos - usar UUID mock
        const todos = await buscarPedidosService({ usuario_id: "11111111-1111-1111-1111-111111111111" });
        const found = todos.find(x => x.id === id) || null;
        setPedido(found);
        if (!found) setError('Pedido não encontrado');
      }
    } catch (err) {
      console.error('usePedidoDetalhes - erro:', err);
      setError('Erro ao carregar detalhes do pedido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pedidoId != null) carregarPedido(pedidoId);
  }, [pedidoId, carregarPedido]);

  const recarregar = useCallback(() => {
    if (pedidoId != null) carregarPedido(pedidoId);
  }, [pedidoId, carregarPedido]);

  return { pedido, loading, error, recarregar };
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

export function formatarStatusPedido(status: StatusPedido): { texto: string; cor: string; icone: string } {
  const statusMap: Record<string, { texto: string; cor: string; icone: string }> = {
    CRIADO: { texto: 'Processando', cor: '#f39c12', icone: 'sync-outline' },
    PAGO: { texto: 'Pagamento Aprovado', cor: '#3498db', icone: 'card-outline' },
    PREPARANDO: { texto: 'Processando', cor: '#f39c12', icone: 'sync-outline' },
    ENVIADO: { texto: 'Processando', cor: '#f39c12', icone: 'sync-outline' },
    ENTREGUE: { texto: 'Finalizado', cor: '#27ae60', icone: 'checkmark-circle-outline' },
    CANCELADO: { texto: 'Cancelado', cor: '#e74c3c', icone: 'close-circle-outline' },
  };

  return statusMap[status] || statusMap['CRIADO'];
}

export function formatarTempoEntrega(minutos: number): string {
  if (!Number.isFinite(minutos)) return '-';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  return minutosRestantes === 0 ? `${horas}h` : `${horas}h${minutosRestantes}min`;
}

export function calcularTempoDecorrido(dataInicio: string, dataFim?: string): string {
  const inicio = new Date(dataInicio).getTime();
  const fim = dataFim ? new Date(dataFim).getTime() : Date.now();
  const diffMin = Math.floor((fim - inicio) / (1000 * 60));
  return formatarTempoEntrega(diffMin);
}

export function formatarDataPedido(data: string): string {
  try {
    const dataPedido = new Date(data);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    if (dataPedido.toDateString() === hoje.toDateString()) {
      return `Hoje às ${dataPedido.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (dataPedido.toDateString() === ontem.toDateString()) {
      return `Ontem às ${dataPedido.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return dataPedido.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  } catch (err) {
    return data;
  }
}