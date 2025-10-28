import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Produto, FiltrosProduto } from '../services/produtoService';
import { buscarProdutos, buscarPorId } from '../services/produtoService';
// Dados mock para desenvolvimento
import { mockProdutos } from '../data/mocks/mockProdutosTeste';

// Interface para o estado do contexto
interface ProdutoState {
  produtos: Produto[];
  produtoSelecionado: Produto | null;
  loading: boolean;
  error: string | null;
  filtros: FiltrosProduto;
}

// Interface para as ações do contexto
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

// Interface completa do contexto (estado + ações)
interface ProdutoContextType extends ProdutoState, ProdutoActions {}

// Estado inicial do contexto
const initialState: ProdutoState = {
  produtos: [],
  produtoSelecionado: null,
  loading: false,
  error: null,
  filtros: {} // Filtros vazios inicialmente
};

// Criar o contexto
const ProdutoContext = createContext<ProdutoContextType | undefined>(undefined);

// Props do provider
interface ProdutoProviderProps {
  children: ReactNode;
}

// Provider do contexto
export function ProdutoProvider({ children }: ProdutoProviderProps) {
  // Estados locais
  const [produtos, setProdutos] = useState<Produto[]>(initialState.produtos);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(initialState.produtoSelecionado);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [error, setError] = useState<string | null>(initialState.error);
  const [filtros, setFiltros] = useState<FiltrosProduto>(initialState.filtros);

  // Função utilitária para tratar erros
  const handleError = (error: any, operacao: string) => {
    const mensagem = error instanceof Error ? error.message : `Erro na ${operacao}`;
    setError(mensagem);
    console.error(`Erro na ${operacao}:`, error);
  };

  // Ação: Carregar produtos com filtros opcionais
  const carregarProdutos = async (novosFiltros?: FiltrosProduto) => {
    try {
      setLoading(true);
      setError(null);
      
      // Para desenvolvimento, usar dados mock - futuramente será API real
      const filtrosParaUsar = novosFiltros || filtros;
      
      // Simular delay de API para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let produtosFiltrados = [...mockProdutos];
      
      // Aplicar filtros se existirem
      if (filtrosParaUsar.busca) {
        const termoBusca = filtrosParaUsar.busca.toLowerCase();
        produtosFiltrados = produtosFiltrados.filter(produto =>
          produto.nome.toLowerCase().includes(termoBusca) ||
          (produto.descricao && produto.descricao.toLowerCase().includes(termoBusca)) ||
          (produto.fabricante && produto.fabricante.toLowerCase().includes(termoBusca)) ||
          (produto.marca && produto.marca.toLowerCase().includes(termoBusca))
        );
      }
      
      if (filtrosParaUsar.categoria_id) {
        produtosFiltrados = produtosFiltrados.filter(produto =>
          produto.categoria_id === filtrosParaUsar.categoria_id
        );
      }
      
      if (filtrosParaUsar.fabricante) {
        produtosFiltrados = produtosFiltrados.filter(produto =>
          produto.fabricante === filtrosParaUsar.fabricante
        );
      }
      
      if (filtrosParaUsar.marca) {
        produtosFiltrados = produtosFiltrados.filter(produto =>
          produto.marca === filtrosParaUsar.marca
        );
      }
      
      if (filtrosParaUsar.preco_min !== undefined) {
        produtosFiltrados = produtosFiltrados.filter(produto =>
          produto.preco >= filtrosParaUsar.preco_min!
        );
      }
      
      if (filtrosParaUsar.preco_max !== undefined) {
        produtosFiltrados = produtosFiltrados.filter(produto =>
          produto.preco <= filtrosParaUsar.preco_max!
        );
      }
      
      setProdutos(produtosFiltrados);
      if (novosFiltros) {
        setFiltros(filtrosParaUsar);
      }
    } catch (error) {
      handleError(error, 'carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  // Ação: Selecionar um produto específico por ID
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

  // Ação: Limpar produto selecionado
  const limparProdutoSelecionado = () => {
    setProdutoSelecionado(null);
  };

  // Ação: Atualizar filtros sem buscar
  const atualizarFiltros = (novosFiltros: Partial<FiltrosProduto>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  // Ação: Limpar todos os filtros
  const limparFiltros = () => {
    setFiltros({});
  };

  // Ação: Buscar produtos por texto
  const buscarPorTexto = async (texto: string) => {
    await carregarProdutos({ ...filtros, busca: texto });
  };

  // Ação: Filtrar produtos por categoria
  const filtrarPorCategoria = async (categoriaId: number) => {
    await carregarProdutos({ ...filtros, categoria_id: categoriaId });
  };

  // Ação: Filtrar apenas produtos em destaque
  const filtrarPorDestaque = async () => {
    await carregarProdutos({ ...filtros, destaque: true });
  };
  
  // useEffect para carregar produtos iniciais
  useEffect(() => {
    carregarProdutos();
  }, []);

  // Atualizar o contextValue com as ações reais
  const contextValue: ProdutoContextType = {
    // Estado
    produtos,
    produtoSelecionado,
    loading,
    error,
    filtros,
    
    // Ações implementadas
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

// Hook personalizado para usar o contexto
export function useProdutoContext() {
  const context = useContext(ProdutoContext);
  
  if (context === undefined) {
    throw new Error('useProdutoContext deve ser usado dentro de um ProdutoProvider');
  }
  
  return context;
}