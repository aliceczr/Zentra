import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Pagamento, 
  MetodoPagamentoUsuario, 
  CriarPagamento, 
  AtualizarPagamento, 
  FiltrosPagamentos,
  buscarPagamentoPorId,
  buscarPagamentos,
  atualizarPagamento,
  buscarMetodosUsuario
} from '../services/pedidoService';
import { criarPagamento } from '../services/pagamentoService';


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

  criarNovoPagamento: (dados: CriarPagamento) => Promise<Pagamento>;
  buscarPagamento: (id: number) => Promise<void>;
  listarPagamentos: (filtros?: FiltrosPagamentos) => Promise<void>;
  atualizarStatusPagamento: (id: number, dados: AtualizarPagamento) => Promise<void>;

  carregarMetodosUsuario: (usuarioId: string) => Promise<void>;
  definirMetodoPrincipal: (metodo: MetodoPagamentoUsuario) => void;

  atualizarFiltros: (novosFiltros: Partial<FiltrosPagamentos>) => void;
  limparFiltros: () => void;
  limparErro: () => void;
  
  
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

  const [pagamentos, setPagamentos] = useState<Pagamento[]>(initialState.pagamentos);
  const [pagamentoAtual, setPagamentoAtual] = useState<Pagamento | null>(initialState.pagamentoAtual);
  const [metodosUsuario, setMetodosUsuario] = useState<MetodoPagamentoUsuario[]>(initialState.metodosUsuario);
  const [metodoPrincipal, setMetodoPrincipal] = useState<MetodoPagamentoUsuario | null>(initialState.metodoPrincipal);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [error, setError] = useState<string | null>(initialState.error);
  const [filtros, setFiltros] = useState<FiltrosPagamentos>(initialState.filtros);

  const handleError = (error: any, operacao: string) => {
    const mensagem = error instanceof Error ? error.message : `Erro na ${operacao}`;
    setError(mensagem);
    console.error(`Erro na ${operacao}:`, error);
  };



  const criarNovoPagamento = async (dados: CriarPagamento): Promise<Pagamento> => {
    try {
      setLoading(true);
      setError(null);
      
  const novoPagamento = await criarPagamento(dados as any);
      
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
      
     
      setPagamentos(prev => 
        prev.map(p => p.id === id ? pagamentoAtualizado : p)
      );
      
   
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
      
  
      await listarPagamentos(filtros);
      
      
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

    pagamentos,
    pagamentoAtual,
    metodosUsuario,
    metodoPrincipal,
    loading,
    error,
    filtros,

    criarNovoPagamento,
    buscarPagamento,
    listarPagamentos,
    atualizarStatusPagamento,
    
   
    carregarMetodosUsuario,
    definirMetodoPrincipal,
    
   
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