import { useState, useEffect } from 'react';
import { Produto, FiltrosProduto, FiltroOpcao, buscarFabricantes, buscarMarcas, buscarCategorias } from '../services/produtoService';
import { buscarProdutos, buscarPorId } from '../services/produtoService';
import { useProdutoContext } from '../contexts/produtoContext';


export function useProdutos(filtrosIniciais?: FiltrosProduto) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

 
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

export function useProduto(id: number | null) {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


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


export function useBuscaProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosProduto>({});

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

  const buscarPorTexto = async (texto: string) => {
    await buscar({ ...filtros, busca: texto });
  };

 
  const filtrarPorCategoria = async (categoriaId: number) => {
    await buscar({ ...filtros, categoria_id: categoriaId });
  };


  const buscarDestaques = async () => {
    await buscar({ ...filtros, destaque: true });
  };

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


interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
}


export function useCarrinho() {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [loading, setLoading] = useState<boolean>(false);


  const calcularTotal = (): number => {
    return itens.reduce((total, item) => total + item.precoTotal, 0);
  };

  
  const calcularQuantidadeTotal = (): number => {
    return itens.reduce((total, item) => total + item.quantidade, 0);
  };

 
  const temNoCarrinho = (produtoId: number): boolean => {
    return itens.some(item => item.produto.id === produtoId);
  };

  
  const obterQuantidade = (produtoId: number): number => {
    const item = itens.find(item => item.produto.id === produtoId);
    return item ? item.quantidade : 0;
  };

 
  const adicionarItem = async (produto: Produto, quantidade: number = 1) => {
    try {
      setLoading(true);
      
      const itemExistente = itens.find(item => item.produto.id === produto.id);
      
      if (itemExistente) {
        
        await atualizarQuantidade(produto.id!, itemExistente.quantidade + quantidade);
      } else {
        
        const novoItem: ItemCarrinho = {
          produto,
          quantidade,
          precoUnitario: produto.preco,
          precoTotal: produto.preco * quantidade,
        };
        
        setItens(prev => [...prev, novoItem]);
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  
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

 
  const removerItem = async (produtoId: number) => {
    try {
      setLoading(true);
      
      setItens(prev => prev.filter(item => item.produto.id !== produtoId));
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error);
    } finally {
      setLoading(false);
    }
  };


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
  
  const buscar = carregarProdutos;
  
  return {
    produtos,
    loading,
    error,
    filtros,
    buscar,

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


export function useFiltrosDinamicos() {
  const [fabricantes, setFabricantes] = useState<FiltroOpcao[]>([]);
  const [marcas, setMarcas] = useState<FiltroOpcao[]>([]);
  const [categorias, setCategorias] = useState<FiltroOpcao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  const carregarFiltros = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      const [fabricantesData, marcasData, categoriasData] = await Promise.all([
        buscarFabricantes(),
        buscarMarcas(),
        buscarCategorias()
      ]);
      
      setFabricantes(fabricantesData);
      setMarcas(marcasData);
      setCategorias(categoriasData);
      
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao carregar filtros';
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  };

  const recarregarFabricantes = async () => {
    try {
      const fabricantesData = await buscarFabricantes();
      setFabricantes(fabricantesData);
    } catch (err) {
      console.error('HOOK: Erro ao recarregar fabricantes:', err);
    }
  };


  const recarregarMarcas = async () => {
    try {
      const marcasData = await buscarMarcas();
      setMarcas(marcasData);
    } catch (err) {
      console.error('HOOK: Erro ao recarregar marcas:', err);
    }
  };


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
    
    
    carregarFiltros,
    recarregarFabricantes,
    recarregarMarcas,
   
    temFabricantes: fabricantes.length > 1,
    temMarcas: marcas.length > 1,
    temCategorias: categorias.length > 1,
  };
}