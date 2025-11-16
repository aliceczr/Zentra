import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Produto, FiltrosProduto, FiltroOpcao } from '../services/produtoService';
import { buscarProdutos, buscarPorId } from '../services/produtoService';


interface ProdutoState {
  produtos: Produto[];
  produtoSelecionado: Produto | null;
  loading: boolean;
  error: string | null;
  filtros: FiltrosProduto;
}


interface ProdutoActions {
  carregarProdutos: (filtros?: FiltrosProduto) => Promise<void>;
  selecionarProduto: (id: number) => Promise<void>;
  limparProdutoSelecionado: () => void;
  atualizarFiltros: (novosFiltros: Partial<FiltrosProduto>) => void;
  limparFiltros: () => void;
  buscarPorTexto: (texto: string) => Promise<void>;
  filtrarPorCategoria: (categoriaId: number) => Promise<void>;
  filtrarPorDestaque: () => Promise<void>;
}

interface ProdutoContextType extends ProdutoState, ProdutoActions {}

const initialState: ProdutoState = {
  produtos: [],
  produtoSelecionado: null,
  loading: false,
  error: null,
  filtros: {} 
};


const ProdutoContext = createContext<ProdutoContextType | undefined>(undefined);


interface ProdutoProviderProps {
  children: ReactNode;
}


export function ProdutoProvider({ children }: ProdutoProviderProps) {
 
  const [produtos, setProdutos] = useState<Produto[]>(initialState.produtos);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(initialState.produtoSelecionado);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [error, setError] = useState<string | null>(initialState.error);
  const [filtros, setFiltros] = useState<FiltrosProduto>(initialState.filtros);


  const handleError = (error: any, operacao: string) => {
    const mensagem = error instanceof Error ? error.message : `Erro na ${operacao}`;
    setError(mensagem);
    console.error(`Erro na ${operacao}:`, error);
  };

 
  const carregarProdutos = async (novosFiltros?: FiltrosProduto) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtrosParaUsar = novosFiltros || filtros;
      
      const produtosCarregados = await buscarProdutos(filtrosParaUsar);
      
      setProdutos(produtosCarregados);
      
      if (novosFiltros) {
        setFiltros(filtrosParaUsar);
      }
    } catch (error) {
      console.error('Context: Erro ao carregar produtos:', error);
      handleError(error, 'carregar produtos');
    } finally {
      setLoading(false);
    }
  };


  const selecionarProduto = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const produto = await buscarPorId(id);
      setProdutoSelecionado(produto);
    } catch (error) {
      handleError(error, 'selecionar produto');
    } finally {
      setLoading(false);
    }
  };


  const limparProdutoSelecionado = () => {
    setProdutoSelecionado(null);
  };

  const atualizarFiltros = (novosFiltros: Partial<FiltrosProduto>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };


  const limparFiltros = () => {
    setFiltros({});
  };


  const buscarPorTexto = async (texto: string) => {
    await carregarProdutos({ ...filtros, busca: texto });
  };


  const filtrarPorCategoria = async (categoriaId: number) => {
    await carregarProdutos({ ...filtros, categoria_id: categoriaId });
  };


  const filtrarPorDestaque = async () => {
    await carregarProdutos({ ...filtros, destaque: true });
  };
  
  useEffect(() => {
    carregarProdutos();
  }, []);

 
  const contextValue: ProdutoContextType = {
    
    produtos,
    produtoSelecionado,
    loading,
    error,
    filtros,
    

    carregarProdutos,
    selecionarProduto,
    limparProdutoSelecionado,
    atualizarFiltros,
    limparFiltros,
    buscarPorTexto,
    filtrarPorCategoria,
    filtrarPorDestaque,
  };

  return (
    <ProdutoContext.Provider value={contextValue}>
      {children}
    </ProdutoContext.Provider>
  );
}

export function useProdutoContext() {
  const context = useContext(ProdutoContext);
  
  if (context === undefined) {
    throw new Error('useProdutoContext deve ser usado dentro de um ProdutoProvider');
  }
  
  return context;
}