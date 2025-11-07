import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Pagamento, 
  MetodoPagamentoUsuario, 
  CriarPagamento, 
  AtualizarPagamento, 
  FiltrosPagamentos,
  criarPagamento,
  buscarPagamentoPorId,
  buscarPagamentos,
  atualizarPagamento,
  buscarMetodosUsuario
} from '../services/pedidoService';


interface PagamentoState {
  pagamentos: Pagamento[];
  pagamentoAtual: Pagamento | null;
  metodosUsuario: MetodoPagamentoUsuario[];
  metodoPrincipal: MetodoPagamentoUsuario | null;
  loading: boolean;
  error: string | null;
  filtros: FiltrosPagamentos;
}

interface PagamentoActions {
  // Pagamentos
  criarNovoPagamento: (dados: CriarPagamento) => Promise<Pagamento>;
  buscarPagamento: (id: number) => Promise<void>;
  listarPagamentos: (filtros?: FiltrosPagamentos) => Promise<void>;
  atualizarStatusPagamento: (id: number, dados: AtualizarPagamento) => Promise<void>;
  
  // Métodos de pagamento
  carregarMetodosUsuario: (usuarioId: string) => Promise<void>;
  definirMetodoPrincipal: (metodo: MetodoPagamentoUsuario) => void;
  
  // Filtros e Estado
  atualizarFiltros: (novosFiltros: Partial<FiltrosPagamentos>) => void;
  limparFiltros: () => void;
  limparErro: () => void;
  
  // Utilitários
  recarregarDados: (usuarioId?: string) => Promise<void>;
}

interface PagamentoContextType extends PagamentoState, PagamentoActions {}


const initialState: PagamentoState = {
  pagamentos: [],
  pagamentoAtual: null,
  metodosUsuario: [],
  metodoPrincipal: null,
  loading: false,
  error: null,
  filtros: {}
};


const PagamentoContext = createContext<PagamentoContextType | undefined>(undefined);

interface PagamentoProviderProps {
  children: ReactNode;
}

export function PagamentoProvider({ children }: PagamentoProviderProps) {
  // Estados locais
  const [pagamentos, setPagamentos] = useState<Pagamento[]>(initialState.pagamentos);
  const [pagamentoAtual, setPagamentoAtual] = useState<Pagamento | null>(initialState.pagamentoAtual);
  const [metodosUsuario, setMetodosUsuario] = useState<MetodoPagamentoUsuario[]>(initialState.metodosUsuario);
  const [metodoPrincipal, setMetodoPrincipal] = useState<MetodoPagamentoUsuario | null>(initialState.metodoPrincipal);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [error, setError] = useState<string | null>(initialState.error);
  const [filtros, setFiltros] = useState<FiltrosPagamentos>(initialState.filtros);

  // Função utilitária para tratar erros
  const handleError = (error: any, operacao: string) => {
    const mensagem = error instanceof Error ? error.message : `Erro na ${operacao}`;
    setError(mensagem);
    console.error(`Erro na ${operacao}:`, error);
  };



  const criarNovoPagamento = async (dados: CriarPagamento): Promise<Pagamento> => {
    try {
      setLoading(true);
      setError(null);
      
      const novoPagamento = await criarPagamento(dados);
      
      // Adicionar à lista local
      setPagamentos(prev => [novoPagamento, ...prev]);
      setPagamentoAtual(novoPagamento);
      
      return novoPagamento;
    } catch (error) {
      handleError(error, 'criar pagamento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const buscarPagamento = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const pagamento = await buscarPagamentoPorId(id);
      setPagamentoAtual(pagamento);
    } catch (error) {
      handleError(error, 'buscar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const listarPagamentos = async (novosFiltros?: FiltrosPagamentos): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const filtrosParaUsar = novosFiltros || filtros;
      const pagamentosEncontrados = await buscarPagamentos(filtrosParaUsar);
      
      setPagamentos(pagamentosEncontrados);
      if (novosFiltros) {
        setFiltros(filtrosParaUsar);
      }
    } catch (error) {
      handleError(error, 'listar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusPagamento = async (id: number, dados: AtualizarPagamento): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const pagamentoAtualizado = await atualizarPagamento(id, dados);
      
      // Atualizar na lista local
      setPagamentos(prev => 
        prev.map(p => p.id === id ? pagamentoAtualizado : p)
      );
      
      // Atualizar pagamento atual se for o mesmo
      if (pagamentoAtual?.id === id) {
        setPagamentoAtual(pagamentoAtualizado);
      }
    } catch (error) {
      handleError(error, 'atualizar pagamento');
    } finally {
      setLoading(false);
    }
  };



  const carregarMetodosUsuario = async (usuarioId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const metodos = await buscarMetodosUsuario(usuarioId);
      setMetodosUsuario(metodos);
      
      // Definir método principal
      const principal = metodos.find(m => m.principal);
      setMetodoPrincipal(principal || null);
    } catch (error) {
      handleError(error, 'carregar métodos de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const definirMetodoPrincipal = (metodo: MetodoPagamentoUsuario): void => {
    setMetodoPrincipal(metodo);
    
    // Atualizar lista marcando apenas este como principal
    setMetodosUsuario(prev => 
      prev.map(m => ({
        ...m,
        principal: m.id === metodo.id
      }))
    );
  };


  const atualizarFiltros = (novosFiltros: Partial<FiltrosPagamentos>): void => {
    setFiltros((prev: FiltrosPagamentos) => ({ ...prev, ...novosFiltros }));
  };

  const limparFiltros = (): void => {
    setFiltros({});
  };

  const limparErro = (): void => {
    setError(null);
  };

  const recarregarDados = async (usuarioId?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Recarregar pagamentos
      await listarPagamentos(filtros);
      
      // Recarregar métodos se usuário foi fornecido
      if (usuarioId) {
        await carregarMetodosUsuario(usuarioId);
      }
    } catch (error) {
      handleError(error, 'recarregar dados');
    } finally {
      setLoading(false);
    }
  };


  const contextValue: PagamentoContextType = {
    // Estado
    pagamentos,
    pagamentoAtual,
    metodosUsuario,
    metodoPrincipal,
    loading,
    error,
    filtros,
    
    // Ações - Pagamentos
    criarNovoPagamento,
    buscarPagamento,
    listarPagamentos,
    atualizarStatusPagamento,
    
    // Ações - Métodos
    carregarMetodosUsuario,
    definirMetodoPrincipal,
    
    // Ações - Filtros e Estado
    atualizarFiltros,
    limparFiltros,
    limparErro,
    recarregarDados,
  };

  return (
    <PagamentoContext.Provider value={contextValue}>
      {children}
    </PagamentoContext.Provider>
  );
}


export function usePagamentoContext() {
  const context = useContext(PagamentoContext);
  
  if (context === undefined) {
    throw new Error('usePagamentoContext deve ser usado dentro de um PagamentoProvider');
  }
  
  return context;
}