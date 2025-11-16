import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { 
  carrinhoService, 
  ItemCarrinho, 
  ResumoCarrinho 
} from '../services/carrinhoService';
import { Produto } from '../services/produtoService';



interface CarrinhoState {
  itens: ItemCarrinho[];
  resumo: ResumoCarrinho;
  loading: boolean;
  error: string | null;
}


interface CarrinhoActions {
 
  adicionarProduto: (produto: Produto, quantidade?: number) => Promise<void>;
  removerProduto: (produtoId: number) => Promise<void>;
  atualizarQuantidade: (produtoId: number, quantidade: number) => Promise<void>;
  limparCarrinho: () => Promise<void>;
  temNoCarrinho: (produtoId: number) => boolean;
  obterQuantidade: (produtoId: number) => number;
  recarregarCarrinho: () => Promise<void>;
  validarCarrinho: () => Promise<void>;
}


interface CarrinhoContextType extends CarrinhoState, CarrinhoActions {}


const initialState: CarrinhoState = {
  itens: [],
  resumo: {
    quantidadeTotal: 0,
    valorTotal: 0,
    quantidadeItens: 0,
  },
  loading: false,
  error: null,
};


const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined);


interface CarrinhoProviderProps {
  children: ReactNode;
}



export function CarrinhoProvider({ children }: CarrinhoProviderProps) {
  
  const [itens, setItens] = useState<ItemCarrinho[]>(initialState.itens);
  const [resumo, setResumo] = useState<ResumoCarrinho>(initialState.resumo);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [error, setError] = useState<string | null>(initialState.error);

  
  const handleError = (error: any, operacao: string) => {
    const mensagem = error instanceof Error ? error.message : `Erro na ${operacao}`;
    setError(mensagem);
    console.error(`Erro na ${operacao}:`, error);
    
    
    if (operacao.includes('adicionar') || operacao.includes('remover')) {
      Alert.alert('Erro', mensagem);
    }
  };

  
  const atualizarEstado = async (novosItens: ItemCarrinho[]) => {
    setItens(novosItens);
   
    const novoResumo = await carrinhoService.calcularResumo();
    setResumo(novoResumo);
  };



  const adicionarProduto = async (produto: Produto, quantidade: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const novosItens = await carrinhoService.adicionarItem(produto, quantidade);
      await atualizarEstado(novosItens);
    } catch (error) {
      handleError(error, 'adicionar produto');
    } finally {
      setLoading(false);
    }
  };

  const removerProduto = async (produtoId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const novosItens = await carrinhoService.removerItem(produtoId);
      await atualizarEstado(novosItens);
    } catch (error) {
      handleError(error, 'remover produto');
    } finally {
      setLoading(false);
    }
  };


  const atualizarQuantidade = async (produtoId: number, quantidade: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const novosItens = await carrinhoService.atualizarQuantidade(produtoId, quantidade);
      await atualizarEstado(novosItens);
    } catch (error) {
      handleError(error, 'atualizar quantidade');
    } finally {
      setLoading(false);
    }
  };


  const limparCarrinho = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await carrinhoService.limparCarrinho();
      setItens([]);
      setResumo({
        quantidadeTotal: 0,
        valorTotal: 0,
        quantidadeItens: 0,
      });
    } catch (error) {
      handleError(error, 'limpar carrinho');
    } finally {
      setLoading(false);
    }
  };


  const recarregarCarrinho = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const itensCarregados = await carrinhoService.carregarCarrinho();
      await atualizarEstado(itensCarregados);
    } catch (error) {
      handleError(error, 'recarregar carrinho');
    } finally {
      setLoading(false);
    }
  };


  const validarCarrinho = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { itensAtualizados, alteracoes } = await carrinhoService.validarCarrinho();
      
      if (alteracoes.length > 0) {
        
        const mensagem = alteracoes.join('\n');
        Alert.alert('Carrinho Atualizado', mensagem);
        
        await atualizarEstado(itensAtualizados);
      }
    } catch (error) {
      handleError(error, 'validar carrinho');
    } finally {
      setLoading(false);
    }
  };



  const temNoCarrinho = (produtoId: number): boolean => {
    return itens.some(item => item.produto.id === produtoId);
  };


  const obterQuantidade = (produtoId: number): number => {
    const item = itens.find(item => item.produto.id === produtoId);
    return item ? item.quantidade : 0;
  };



  
  useEffect(() => {
    recarregarCarrinho();
  }, []);

  
  useEffect(() => {
    const validarPeriodicamente = setInterval(() => {
      if (itens.length > 0) {
        validarCarrinho();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(validarPeriodicamente);
  }, [itens.length]);



  const contextValue: CarrinhoContextType = {
    itens,
    resumo,
    loading,
    error,
    
  
    adicionarProduto,
    removerProduto,
    atualizarQuantidade,
    limparCarrinho,
    recarregarCarrinho,
    validarCarrinho,
    
  
    temNoCarrinho,
    obterQuantidade,
  };

  return (
    <CarrinhoContext.Provider value={contextValue}>
      {children}
    </CarrinhoContext.Provider>
  );
}


export function useCarrinhoContext() {
  const context = useContext(CarrinhoContext);
  
  if (context === undefined) {
    throw new Error('useCarrinhoContext deve ser usado dentro de um CarrinhoProvider');
  }
  
  return context;
}