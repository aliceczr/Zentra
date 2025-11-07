import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { 
  carrinhoService, 
  ItemCarrinho, 
  ResumoCarrinho 
} from '../services/carrinhoService';
import { Produto } from '../services/produtoService';

// ============================================================================
// 🛒 CARRINHO CONTEXT - Estado Global do Carrinho
// ============================================================================

// Interface para o estado do carrinho
interface CarrinhoState {
  itens: ItemCarrinho[];
  resumo: ResumoCarrinho;
  loading: boolean;
  error: string | null;
}

// Interface para as ações do carrinho
interface CarrinhoActions {
  // Ações principais
  adicionarProduto: (produto: Produto, quantidade?: number) => Promise<void>;
  removerProduto: (produtoId: number) => Promise<void>;
  atualizarQuantidade: (produtoId: number, quantidade: number) => Promise<void>;
  limparCarrinho: () => Promise<void>;
  
  // Consultas
  temNoCarrinho: (produtoId: number) => boolean;
  obterQuantidade: (produtoId: number) => number;
  
  // Utilitários
  recarregarCarrinho: () => Promise<void>;
  validarCarrinho: () => Promise<void>;
}

// Interface completa do contexto
interface CarrinhoContextType extends CarrinhoState, CarrinhoActions {}

// Estado inicial
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

// Criar o contexto
const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined);

// Props do provider
interface CarrinhoProviderProps {
  children: ReactNode;
}

// ============================================================================
// 🏪 CARRINHO PROVIDER - Implementação do Context
// ============================================================================

export function CarrinhoProvider({ children }: CarrinhoProviderProps) {
  // Estados locais
  const [itens, setItens] = useState<ItemCarrinho[]>(initialState.itens);
  const [resumo, setResumo] = useState<ResumoCarrinho>(initialState.resumo);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [error, setError] = useState<string | null>(initialState.error);

  // Função utilitária para tratar erros
  const handleError = (error: any, operacao: string) => {
    const mensagem = error instanceof Error ? error.message : `Erro na ${operacao}`;
    setError(mensagem);
    console.error(`Erro na ${operacao}:`, error);
    
    // Mostrar alerta para o usuário em operações críticas
    if (operacao.includes('adicionar') || operacao.includes('remover')) {
      Alert.alert('Erro', mensagem);
    }
  };

  // Função para atualizar estado com novos itens
  const atualizarEstado = async (novosItens: ItemCarrinho[]) => {
    setItens(novosItens);
    
    // Calcular resumo
    const novoResumo = await carrinhoService.calcularResumo();
    setResumo(novoResumo);
  };

  // =========================================================================
  // 📝 AÇÕES DO CARRINHO
  // =========================================================================

  /**
   * Adicionar produto ao carrinho
   */
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

  /**
   * Remover produto do carrinho
   */
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

  /**
   * Atualizar quantidade de um produto
   */
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

  /**
   * Limpar todo o carrinho
   */
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

  /**
   * Recarregar carrinho do AsyncStorage
   */
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

  /**
   * Validar carrinho (verificar produtos removidos/preços alterados)
   */
  const validarCarrinho = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { itensAtualizados, alteracoes } = await carrinhoService.validarCarrinho();
      
      if (alteracoes.length > 0) {
        // Mostrar alterações para o usuário
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

  // =========================================================================
  // 📋 CONSULTAS (Síncronas para melhor performance)
  // =========================================================================

  /**
   * Verificar se produto está no carrinho
   */
  const temNoCarrinho = (produtoId: number): boolean => {
    return itens.some(item => item.produto.id === produtoId);
  };

  /**
   * Obter quantidade de um produto específico
   */
  const obterQuantidade = (produtoId: number): number => {
    const item = itens.find(item => item.produto.id === produtoId);
    return item ? item.quantidade : 0;
  };

  // =========================================================================
  // 🔄 EFEITOS
  // =========================================================================

  // Carregar carrinho inicialmente
  useEffect(() => {
    recarregarCarrinho();
  }, []);

  // Validar carrinho periodicamente (opcional)
  useEffect(() => {
    const validarPeriodicamente = setInterval(() => {
      if (itens.length > 0) {
        validarCarrinho();
      }
    }, 5 * 60 * 1000); // A cada 5 minutos

    return () => clearInterval(validarPeriodicamente);
  }, [itens.length]);

  // =========================================================================
  // 🎯 CONTEXT VALUE
  // =========================================================================

  const contextValue: CarrinhoContextType = {
    // Estado
    itens,
    resumo,
    loading,
    error,
    
    // Ações
    adicionarProduto,
    removerProduto,
    atualizarQuantidade,
    limparCarrinho,
    recarregarCarrinho,
    validarCarrinho,
    
    // Consultas
    temNoCarrinho,
    obterQuantidade,
  };

  return (
    <CarrinhoContext.Provider value={contextValue}>
      {children}
    </CarrinhoContext.Provider>
  );
}

// ============================================================================
// 🪝 HOOK PERSONALIZADO
// ============================================================================

export function useCarrinhoContext() {
  const context = useContext(CarrinhoContext);
  
  if (context === undefined) {
    throw new Error('useCarrinhoContext deve ser usado dentro de um CarrinhoProvider');
  }
  
  return context;
}