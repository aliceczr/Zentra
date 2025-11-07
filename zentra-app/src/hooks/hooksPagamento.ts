import { useState, useCallback } from 'react';
import { usePagamentoContext } from '../contexts/pagamentoContext';
import { 
  Pagamento, 
  MetodoPagamentoUsuario, 
  CriarPagamento,
  MetodoPagamento,
  StatusPagamento
} from '../services/pedidoService';

// ================================
// HOOK PRINCIPAL DO PAGAMENTO
// ================================

/**
 * Hook principal para gerenciar pagamentos
 * Use em telas de checkout, histórico, etc.
 */
export function usePagamento() {
  const {
    pagamentos,
    pagamentoAtual,
    loading,
    error,
    filtros,
    criarNovoPagamento,
    buscarPagamento,
    listarPagamentos,
    atualizarStatusPagamento,
    atualizarFiltros,
    limparFiltros,
    limparErro,
    recarregarDados
  } = usePagamentoContext();

  return {
    // Estado
    pagamentos,
    pagamentoAtual,
    loading,
    error,
    filtros,
    
    // Ações
    criarPagamento: criarNovoPagamento,
    buscarPorId: buscarPagamento,
    listar: listarPagamentos,
    atualizarStatus: atualizarStatusPagamento,
    atualizarFiltros,
    limparFiltros,
    limparErro,
    recarregar: recarregarDados,
    
    // Propriedades derivadas
    temPagamentos: pagamentos.length > 0,
    quantidadePagamentos: pagamentos.length,
  };
}

// ================================
// HOOK PARA CRIAR PAGAMENTO
// ================================

/**
 * Hook especializado para criar pagamentos
 * Use em telas de checkout, finalização de compra
 */
export function useCriarPagamento() {
  const { criarNovoPagamento, loading, error } = usePagamentoContext();
  const [processando, setProcessando] = useState(false);

  const processar = useCallback(async (dados: CriarPagamento) => {
    try {
      setProcessando(true);
      const pagamento = await criarNovoPagamento(dados);
      
      return {
        sucesso: true,
        pagamento,
        mensagem: 'Pagamento criado com sucesso'
      };
    } catch (error) {
      return {
        sucesso: false,
        pagamento: null,
        mensagem: error instanceof Error ? error.message : 'Erro ao processar pagamento'
      };
    } finally {
      setProcessando(false);
    }
  }, [criarNovoPagamento]);

  return {
    processar,
    loading: loading || processando,
    error,
  };
}

// ================================
// HOOK PARA MÉTODOS DE PAGAMENTO
// ================================

/**
 * Hook para gerenciar métodos de pagamento do usuário
 * Use em telas de configuração, checkout
 */
export function useMetodosPagamento() {
  const {
    metodosUsuario,
    metodoPrincipal,
    loading,
    error,
    carregarMetodosUsuario,
    definirMetodoPrincipal
  } = usePagamentoContext();

  return {
    // Estado
    metodos: metodosUsuario,
    principal: metodoPrincipal,
    loading,
    error,
    
    // Ações
    carregar: carregarMetodosUsuario,
    definirPrincipal: definirMetodoPrincipal,
    
    // Propriedades derivadas
    temMetodos: metodosUsuario.length > 0,
    quantidadeMetodos: metodosUsuario.length,
    metodosCartao: metodosUsuario.filter(m => m.tipo === 'CARTAO_CREDITO' || m.tipo === 'CARTAO_DEBITO'),
    temPix: metodosUsuario.some(m => m.tipo === 'PIX'),
  };
}

// ================================
// HOOK PARA HISTÓRICO DE PAGAMENTOS
// ================================

/**
 * Hook para visualizar histórico de pagamentos
 * Use em telas de histórico, relatórios
 */
export function useHistoricoPagamento(usuarioId?: string) {
  const { listarPagamentos, pagamentos, loading, error } = usePagamentoContext();

  const carregarHistorico = useCallback(async (filtros?: {
    periodo?: { inicio: string; fim: string };
    status?: StatusPagamento;
    metodo?: MetodoPagamento;
  }) => {
    const filtrosBusca = {
      usuario_id: usuarioId,
      data_inicio: filtros?.periodo?.inicio,
      data_fim: filtros?.periodo?.fim,
      status_pagamento: filtros?.status,
      metodo_pagamento: filtros?.metodo,
    };

    await listarPagamentos(filtrosBusca);
  }, [listarPagamentos, usuarioId]);

  return {
    // Estado
    historico: pagamentos,
    loading,
    error,
    
    // Ações
    carregar: carregarHistorico,
    
    // Propriedades derivadas
    temHistorico: pagamentos.length > 0,
    totalPago: pagamentos
      .filter(p => p.status_pagamento === 'APROVADO')
      .reduce((total, p) => total + p.valor_pago, 0),
    quantidadePagamentos: pagamentos.length,
    
    // Estatísticas
    pagamentosAprovados: pagamentos.filter(p => p.status_pagamento === 'APROVADO'),
    pagamentosPendentes: pagamentos.filter(p => p.status_pagamento === 'PENDENTE'),
    pagamentosRecusados: pagamentos.filter(p => p.status_pagamento === 'RECUSADO'),
  };
}

// ================================
// HOOK PARA STATUS DE PAGAMENTO
// ================================

/**
 * Hook para acompanhar status de um pagamento específico
 * Use em telas de acompanhamento, confirmação
 */
export function useStatusPagamento(pagamentoId?: number) {
  const { buscarPagamento, atualizarStatusPagamento, pagamentoAtual, loading, error } = usePagamentoContext();
  const [atualizando, setAtualizando] = useState(false);

  const acompanhar = useCallback(async () => {
    if (pagamentoId) {
      await buscarPagamento(pagamentoId);
    }
  }, [buscarPagamento, pagamentoId]);

  const atualizarStatus = useCallback(async (novoStatus: StatusPagamento, dadosAdicionais?: any) => {
    if (!pagamentoId) return false;

    try {
      setAtualizando(true);
      await atualizarStatusPagamento(pagamentoId, {
        status_pagamento: novoStatus,
        dados_pagamento: dadosAdicionais,
        data_confirmacao: novoStatus === 'APROVADO' ? new Date().toISOString() : undefined,
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return false;
    } finally {
      setAtualizando(false);
    }
  }, [atualizarStatusPagamento, pagamentoId]);

  return {
    // Estado
    pagamento: pagamentoAtual,
    status: pagamentoAtual?.status_pagamento,
    loading: loading || atualizando,
    error,
    
    // Ações
    acompanhar,
    aprovar: () => atualizarStatus('APROVADO'),
    recusar: (motivo?: string) => atualizarStatus('RECUSADO', { motivo_recusa: motivo }),
    cancelar: (motivo?: string) => atualizarStatus('CANCELADO', { motivo_cancelamento: motivo }),
    
    // Propriedades derivadas
    isPendente: pagamentoAtual?.status_pagamento === 'PENDENTE',
    isProcessando: pagamentoAtual?.status_pagamento === 'PROCESSANDO',
    isAprovado: pagamentoAtual?.status_pagamento === 'APROVADO',
    isRecusado: pagamentoAtual?.status_pagamento === 'RECUSADO',
    isCancelado: pagamentoAtual?.status_pagamento === 'CANCELADO',
  };
}


export function useCheckoutPagamento() {
  const { criarNovoPagamento, metodosUsuario, metodoPrincipal } = usePagamentoContext();
  const [etapaAtual, setEtapaAtual] = useState<'metodo' | 'dados' | 'confirmacao' | 'processando' | 'concluido'>('metodo');
  const [metodoSelecionado, setMetodoSelecionado] = useState<MetodoPagamentoUsuario | null>(metodoPrincipal);
  const [dadosPagamento, setDadosPagamento] = useState<any>(null);

  const selecionarMetodo = (metodo: MetodoPagamentoUsuario) => {
    setMetodoSelecionado(metodo);
    setEtapaAtual('dados');
  };

  const definirDados = (dados: any) => {
    setDadosPagamento(dados);
    setEtapaAtual('confirmacao');
  };

  const confirmarPagamento = async (dadosCheckout: CriarPagamento) => {
    try {
      setEtapaAtual('processando');
      const pagamento = await criarNovoPagamento(dadosCheckout);
      setEtapaAtual('concluido');
      return pagamento;
    } catch (error) {
      setEtapaAtual('confirmacao');
      throw error;
    }
  };

  const reiniciar = () => {
    setEtapaAtual('metodo');
    setMetodoSelecionado(metodoPrincipal);
    setDadosPagamento(null);
  };

  return {
    // Estado do checkout
    etapaAtual,
    metodoSelecionado,
    dadosPagamento,
    metodosDisponiveis: metodosUsuario,
    
    // Ações
    selecionarMetodo,
    definirDados,
    confirmar: confirmarPagamento,
    reiniciar,
    voltarEtapa: () => {
      if (etapaAtual === 'dados') setEtapaAtual('metodo');
      else if (etapaAtual === 'confirmacao') setEtapaAtual('dados');
    },
    
    // Propriedades derivadas
    podeConfirmar: metodoSelecionado && dadosPagamento,
    isProcessando: etapaAtual === 'processando',
    isConcluido: etapaAtual === 'concluido',
  };
}


export function formatarValor(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Calcular parcelas
 */
export function calcularParcelas(valor: number, parcelas: number, taxaJuros: number = 0): number {
  if (parcelas <= 1) return valor;
  
  const valorComJuros = valor * (1 + taxaJuros / 100);
  return valorComJuros / parcelas;
}

/**
 * Obter texto do status
 */
export function obterTextoStatus(status: StatusPagamento): string {
  const statusMap: Record<StatusPagamento, string> = {
    'PENDENTE': 'Pendente',
    'PROCESSANDO': 'Processando',
    'APROVADO': 'Aprovado',
    'RECUSADO': 'Recusado',
    'CANCELADO': 'Cancelado',
    'ESTORNADO': 'Estornado'
  };
  
  return statusMap[status] || status;
}

/**
 * Obter cor do status
 */
export function obterCorStatus(status: StatusPagamento): string {
  const corMap: Record<StatusPagamento, string> = {
    'PENDENTE': '#FFA500',     // Laranja
    'PROCESSANDO': '#2196F3',  // Azul
    'APROVADO': '#4CAF50',     // Verde
    'RECUSADO': '#F44336',     // Vermelho
    'CANCELADO': '#9E9E9E',    // Cinza
    'ESTORNADO': '#FF9800'     // Laranja escuro
  };
  
  return corMap[status] || '#9E9E9E';
}

/**
 * Obter texto do método de pagamento
 */
export function obterTextoMetodo(metodo: MetodoPagamento): string {
  const metodoMap: Record<MetodoPagamento, string> = {
    'CARTAO_CREDITO': 'Cartão de Crédito',
    'CARTAO_DEBITO': 'Cartão de Débito',
    'PIX': 'PIX',
    'BOLETO': 'Boleto',
    'DINHEIRO': 'Dinheiro'
  };
  
  return metodoMap[metodo] || metodo;
}

/**
 * Verificar se método suporta parcelamento
 */
export function suportaParcelamento(metodo: MetodoPagamento): boolean {
  return metodo === 'CARTAO_CREDITO';
}

/**
 * Validar dados de pagamento
 */
export function validarDadosPagamento(dados: CriarPagamento): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  if (!dados.pedido_id || dados.pedido_id <= 0) {
    erros.push('ID do pedido é obrigatório');
  }

  if (!dados.valor_pago || dados.valor_pago <= 0) {
    erros.push('Valor deve ser maior que zero');
  }

  if (dados.parcelas && (dados.parcelas < 1 || dados.parcelas > 12)) {
    erros.push('Número de parcelas deve estar entre 1 e 12');
  }

  const metodosValidos: MetodoPagamento[] = [
    'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'BOLETO', 'DINHEIRO'
  ];
  if (!metodosValidos.includes(dados.metodo_pagamento)) {
    erros.push('Método de pagamento inválido');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}