import { useState, useCallback } from 'react';
import { usePagamentoContext } from '../contexts/pagamentoContext';
import { 
  Pagamento, 
  MetodoPagamentoUsuario, 
  CriarPagamento,
  MetodoPagamento,
  StatusPagamento
} from '../services/pedidoService';

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
  
    pagamentos,
    pagamentoAtual,
    loading,
    error,
    filtros,
    
    
    criarPagamento: criarNovoPagamento,
    buscarPorId: buscarPagamento,
    listar: listarPagamentos,
    atualizarStatus: atualizarStatusPagamento,
    atualizarFiltros,
    limparFiltros,
    limparErro,
    recarregar: recarregarDados,
    
   
    temPagamentos: pagamentos.length > 0,
    quantidadePagamentos: pagamentos.length,
  };
}



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
   
    metodos: metodosUsuario,
    principal: metodoPrincipal,
    loading,
    error,
    
 
    carregar: carregarMetodosUsuario,
    definirPrincipal: definirMetodoPrincipal,
    
    temMetodos: metodosUsuario.length > 0,
    quantidadeMetodos: metodosUsuario.length,
    metodosCartao: metodosUsuario.filter(m => m.tipo === 'CARTAO_CREDITO' || m.tipo === 'CARTAO_DEBITO'),
    temPix: metodosUsuario.some(m => m.tipo === 'PIX'),
  };
}


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
    
    historico: pagamentos,
    loading,
    error,
    
   
    carregar: carregarHistorico,
    
   
    temHistorico: pagamentos.length > 0,
    totalPago: pagamentos
      .filter(p => p.status === 'APROVADO')
      .reduce((total, p) => total + (p.valor_pago ?? 0), 0),
    quantidadePagamentos: pagamentos.length,
    
    
  pagamentosAprovados: pagamentos.filter(p => p.status === 'APROVADO'),
  pagamentosPendentes: pagamentos.filter(p => p.status === 'PENDENTE'),
  pagamentosRecusados: pagamentos.filter(p => p.status === 'RECUSADO'),
  };
}


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
          status: novoStatus,
          status_detail: dadosAdicionais ? JSON.stringify(dadosAdicionais) : undefined,
          data_aprovacao: novoStatus === 'APROVADO' ? new Date().toISOString() : undefined,
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
   
    pagamento: pagamentoAtual,
    status: pagamentoAtual?.status,
    loading: loading || atualizando,
    error,
    
 
    acompanhar,
    aprovar: () => atualizarStatus('APROVADO'),
    recusar: (motivo?: string) => atualizarStatus('RECUSADO', { motivo_recusa: motivo }),
    cancelar: (motivo?: string) => atualizarStatus('CANCELADO', { motivo_cancelamento: motivo }),
    
    
    isPendente: pagamentoAtual?.status === 'PENDENTE',
    isProcessando: pagamentoAtual?.status === 'PROCESSANDO',
    isAprovado: pagamentoAtual?.status === 'APROVADO',
    isRecusado: pagamentoAtual?.status === 'RECUSADO',
    isCancelado: pagamentoAtual?.status === 'CANCELADO',
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
    
    etapaAtual,
    metodoSelecionado,
    dadosPagamento,
    metodosDisponiveis: metodosUsuario,
    
    
    selecionarMetodo,
    definirDados,
    confirmar: confirmarPagamento,
    reiniciar,
    voltarEtapa: () => {
      if (etapaAtual === 'dados') setEtapaAtual('metodo');
      else if (etapaAtual === 'confirmacao') setEtapaAtual('dados');
    },
    
  
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


export function calcularParcelas(valor: number, parcelas: number, taxaJuros: number = 0): number {
  if (parcelas <= 1) return valor;
  
  const valorComJuros = valor * (1 + taxaJuros / 100);
  return valorComJuros / parcelas;
}

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


export function obterCorStatus(status: StatusPagamento): string {
  const corMap: Record<StatusPagamento, string> = {
    'PENDENTE': '#FFA500',     
    'PROCESSANDO': '#2196F3',  
    'APROVADO': '#4CAF50',     
    'RECUSADO': '#F44336',     
    'CANCELADO': '#9E9E9E',    
    'ESTORNADO': '#FF9800'    
  };
  
  return corMap[status] || '#9E9E9E';
}

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


export function suportaParcelamento(metodo: MetodoPagamento): boolean {
  return metodo === 'CARTAO_CREDITO';
}


export function validarDadosPagamento(dados: any): { valido: boolean; erros: string[] } {
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
  const metodoInformado = dados.metodo_pagamento || dados.metodo;
  if (!metodosValidos.includes(metodoInformado)) {
    erros.push('Método de pagamento inválido');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}