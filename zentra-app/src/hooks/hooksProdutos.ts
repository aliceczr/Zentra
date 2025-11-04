import { useState, useEffect } from 'react';
import { Produto, FiltrosProduto, FiltroOpcao, buscarFabricantes, buscarMarcas, buscarCategorias } from '../services/produtoService';
import { buscarProdutos, buscarPorId } from '../services/produtoService';
import { useProdutoContext } from '../contexts/produtoContext';

// Hook básico para buscar produtos
export function useProdutos(filtrosIniciais?: FiltrosProduto) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar produtos
  const carregarProdutos = async (filtros?: FiltrosProduto) => {
    try {
      setLoading(true);
      setError(null);
      
      const produtosCarregados = await buscarProdutos(filtros || filtrosIniciais);
      setProdutos(produtosCarregados);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao carregar produtos';
      setError(mensagem);
      console.error('Erro no hook useProdutos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar produtos quando o hook é inicializado
  useEffect(() => {
    carregarProdutos();
  }, []);

  return {
    produtos,
    loading,
    error,
    carregarProdutos,
    recarregar: () => carregarProdutos(filtrosIniciais),
  };
}

// Hook para buscar um produto específico por ID
export function useProduto(id: number | null) {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar produto por ID
  const carregarProduto = async (produtoId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const produtoCarregado = await buscarPorId(produtoId);
      setProduto(produtoCarregado);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao carregar produto';
      setError(mensagem);
      console.error('Erro no hook useProduto:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar produto quando ID muda
  useEffect(() => {
    if (id !== null) {
      carregarProduto(id);
    } else {
      setProduto(null);
    }
  }, [id]);

  return {
    produto,
    loading,
    error,
    recarregar: () => id && carregarProduto(id),
    limpar: () => setProduto(null),
  };
}

// Hook avançado para busca com filtros dinâmicos
export function useBuscaProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosProduto>({});

  // Função para buscar com filtros
  const buscar = async (novosFiltros: FiltrosProduto) => {
    try {
      setLoading(true);
      setError(null);
      setFiltros(novosFiltros);
      
      const produtosBuscados = await buscarProdutos(novosFiltros);
      setProdutos(produtosBuscados);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro na busca';
      setError(mensagem);
      console.error('Erro no hook useBuscaProdutos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar por texto
  const buscarPorTexto = async (texto: string) => {
    await buscar({ ...filtros, busca: texto });
  };

  // Função para filtrar por categoria
  const filtrarPorCategoria = async (categoriaId: number) => {
    await buscar({ ...filtros, categoria_id: categoriaId });
  };

  // Função para produtos em destaque
  const buscarDestaques = async () => {
    await buscar({ ...filtros, destaque: true });
  };

  // Função para limpar filtros
  const limparFiltros = async () => {
    await buscar({});
  };

  return {
    produtos,
    loading,
    error,
    filtros,
    buscar,
    buscarPorTexto,
    filtrarPorCategoria,
    buscarDestaques,
    limparFiltros,
  };
}

// Interface para item do carrinho
interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
}

// Hook para gerenciar carrinho de compras
export function useCarrinho() {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Calcular total do carrinho
  const calcularTotal = (): number => {
    return itens.reduce((total, item) => total + item.precoTotal, 0);
  };

  // Calcular quantidade total de itens
  const calcularQuantidadeTotal = (): number => {
    return itens.reduce((total, item) => total + item.quantidade, 0);
  };

  // Verificar se produto está no carrinho
  const temNoCarrinho = (produtoId: number): boolean => {
    return itens.some(item => item.produto.id === produtoId);
  };

  // Obter quantidade de um produto específico
  const obterQuantidade = (produtoId: number): number => {
    const item = itens.find(item => item.produto.id === produtoId);
    return item ? item.quantidade : 0;
  };

  // Adicionar produto ao carrinho
  const adicionarItem = async (produto: Produto, quantidade: number = 1) => {
    try {
      setLoading(true);
      
      const itemExistente = itens.find(item => item.produto.id === produto.id);
      
      if (itemExistente) {
        // Atualizar quantidade se já existe
        await atualizarQuantidade(produto.id!, itemExistente.quantidade + quantidade);
      } else {
        // Adicionar novo item
        const novoItem: ItemCarrinho = {
          produto,
          quantidade,
          precoUnitario: produto.preco,
          precoTotal: produto.preco * quantidade,
        };
        
        setItens(prev => [...prev, novoItem]);
        console.log('Produto adicionado ao carrinho:', produto.nome);
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar quantidade de um item
  const atualizarQuantidade = async (produtoId: number, novaQuantidade: number) => {
    try {
      setLoading(true);
      
      if (novaQuantidade <= 0) {
        await removerItem(produtoId);
        return;
      }
      
      setItens(prev => prev.map(item => {
        if (item.produto.id === produtoId) {
          return {
            ...item,
            quantidade: novaQuantidade,
            precoTotal: item.precoUnitario * novaQuantidade,
          };
        }
        return item;
      }));
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remover item do carrinho
  const removerItem = async (produtoId: number) => {
    try {
      setLoading(true);
      
      setItens(prev => prev.filter(item => item.produto.id !== produtoId));
      console.log('Produto removido do carrinho:', produtoId);
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  // Limpar carrinho
  const limparCarrinho = () => {
    setItens([]);
  };

  return {
    itens,
    loading,
    total: calcularTotal(),
    quantidadeTotal: calcularQuantidadeTotal(),
    temNoCarrinho,
    obterQuantidade,
    adicionarItem,
    atualizarQuantidade,
    removerItem,
    limparCarrinho,
    isEmpty: itens.length === 0,
  };
}

export function useProdutosList() {
  const { 
    produtos, 
    loading, 
    error, 
    filtros,
    carregarProdutos
  } = useProdutoContext();
  
  console.log('📋 HOOK useProdutosList: produtos recebidos do Context:', produtos.length);
  console.log('📋 HOOK useProdutosList: primeiro produto:', produtos[0]);
  
  // Alias para manter compatibilidade com interface anterior
  const buscar = carregarProdutos;
  
  return {
    produtos,
    loading,
    error,
    filtros,
    buscar,
    // Funções extras compatíveis
    buscarPorTexto: async (texto: string) => {
      await carregarProdutos({ ...filtros, busca: texto });
    },
    filtrarPorCategoria: async (categoriaId: number) => {
      await carregarProdutos({ ...filtros, categoria_id: categoriaId });
    },
    buscarDestaques: async () => {
      await carregarProdutos({ ...filtros, destaque: true });
    },
    limparFiltros: async () => {
      await carregarProdutos({});
    },
  };
}

/**
 * Hook especializado para filtros de produtos
 */
export function useProdutoFiltros() {
  const { 
    filtros, 
    atualizarFiltros, 
    limparFiltros, 
    carregarProdutos 
  } = useProdutoContext();
  
  return {
    filtros,
    atualizarFiltros,
    limparFiltros,
    aplicarFiltros: carregarProdutos,
  };
}

/**
 * Hook especializado para detalhes de produto
 */
export function useProdutoDetalhes() {
  const { 
    produtoSelecionado, 
    selecionarProduto, 
    limparProdutoSelecionado 
  } = useProdutoContext();
  
  return {
    produto: produtoSelecionado,
    selecionarProduto,
    limparProduto: limparProdutoSelecionado,
  };
}

// =============================================================================
// 🏭 HOOK PARA FILTROS DINÂMICOS
// =============================================================================

/**
 * Hook para carregar filtros dinâmicos do banco de dados
 * Busca fabricantes, marcas e categorias disponíveis
 */
export function useFiltrosDinamicos() {
  const [fabricantes, setFabricantes] = useState<FiltroOpcao[]>([]);
  const [marcas, setMarcas] = useState<FiltroOpcao[]>([]);
  const [categorias, setCategorias] = useState<FiltroOpcao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar todos os filtros
  const carregarFiltros = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 HOOK: Carregando filtros dinâmicos...');
      
      // Carregar todos os filtros em paralelo
      const [fabricantesData, marcasData, categoriasData] = await Promise.all([
        buscarFabricantes(),
        buscarMarcas(),
        buscarCategorias()
      ]);
      
      setFabricantes(fabricantesData);
      setMarcas(marcasData);
      setCategorias(categoriasData);
      
      console.log('✅ HOOK: Filtros carregados:', {
        fabricantes: fabricantesData.length - 1, // -1 para descontar "Todos"
        marcas: marcasData.length - 1,
        categorias: categoriasData.length - 1
      });
      
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao carregar filtros';
      setError(mensagem);
      console.error('❌ HOOK: Erro ao carregar filtros:', err);
    } finally {
      setLoading(false);
    }
  };

  // Recarregar apenas fabricantes (útil quando produtos são atualizados)
  const recarregarFabricantes = async () => {
    try {
      const fabricantesData = await buscarFabricantes();
      setFabricantes(fabricantesData);
    } catch (err) {
      console.error('❌ HOOK: Erro ao recarregar fabricantes:', err);
    }
  };

  // Recarregar apenas marcas
  const recarregarMarcas = async () => {
    try {
      const marcasData = await buscarMarcas();
      setMarcas(marcasData);
    } catch (err) {
      console.error('❌ HOOK: Erro ao recarregar marcas:', err);
    }
  };

  // Carregar filtros na inicialização
  useEffect(() => {
    carregarFiltros();
  }, []);

  return {
    // Estados
    fabricantes,
    marcas,
    categorias,
    loading,
    error,
    
    // Ações
    carregarFiltros,
    recarregarFabricantes,
    recarregarMarcas,
    
    // Status
    temFabricantes: fabricantes.length > 1,
    temMarcas: marcas.length > 1,
    temCategorias: categorias.length > 1,
  };
}