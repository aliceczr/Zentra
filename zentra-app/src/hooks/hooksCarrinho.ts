import { useCarrinhoContext } from '../contexts/carrinhoContext';
import { Produto } from '../services/produtoService';

export function useCarrinho() {
  const context = useCarrinhoContext();
  
  return {
    // Estado completo
    itens: context.itens,
    resumo: context.resumo,
    loading: context.loading,
    error: context.error,
    
    // Ações principais
    adicionarProduto: context.adicionarProduto,
    removerProduto: context.removerProduto,
    atualizarQuantidade: context.atualizarQuantidade,
    limparCarrinho: context.limparCarrinho,
    
    // Consultas
    temNoCarrinho: context.temNoCarrinho,
    obterQuantidade: context.obterQuantidade,
    
    // Utilitários
    recarregarCarrinho: context.recarregarCarrinho,
    validarCarrinho: context.validarCarrinho,
    
    // Propriedades derivadas úteis
    isEmpty: context.itens.length === 0,
    quantidadeItens: context.resumo.quantidadeItens,
    quantidadeTotal: context.resumo.quantidadeTotal,
    valorTotal: context.resumo.valorTotal,
  };
}


export function useCarrinhoContador() {
  const { resumo, loading } = useCarrinhoContext();
  
  return {
    quantidade: resumo.quantidadeTotal, // Total de itens (considerando quantidades)
    itens: resumo.quantidadeItens,      // Número de produtos diferentes
    valor: resumo.valorTotal,           // Valor total em R$
    loading,
    
    // Propriedades derivadas
    temItens: resumo.quantidadeItens > 0,
    valorFormatado: `R$ ${resumo.valorTotal.toFixed(2).replace('.', ',')}`,
  };
}


export function useAdicionarAoCarrinho() {
  const { adicionarProduto, temNoCarrinho, obterQuantidade, loading } = useCarrinhoContext();
  
  return {
    adicionarProduto,
    temNoCarrinho,
    obterQuantidade,
    loading,
    
    // Função auxiliar para adicionar com feedback
    adicionarComFeedback: async (produto: Produto, quantidade: number = 1) => {
      try {
        await adicionarProduto(produto, quantidade);
        return { sucesso: true, mensagem: `${produto.nome} adicionado ao carrinho` };
      } catch (error) {
        return { sucesso: false, mensagem: 'Erro ao adicionar produto' };
      }
    },
  };
}


export function useItemCarrinho(produtoId: number) {
  const { 
    temNoCarrinho, 
    obterQuantidade, 
    atualizarQuantidade, 
    removerProduto,
    loading 
  } = useCarrinhoContext();
  
  const estaNoCarrinho = temNoCarrinho(produtoId);
  const quantidade = obterQuantidade(produtoId);
  
  return {
    estaNoCarrinho,
    quantidade,
    loading,
    
    // Ações do item
    incrementar: () => atualizarQuantidade(produtoId, quantidade + 1),
    decrementar: () => atualizarQuantidade(produtoId, Math.max(0, quantidade - 1)),
    remover: () => removerProduto(produtoId),
    definirQuantidade: (novaQuantidade: number) => atualizarQuantidade(produtoId, novaQuantidade),
    
    // Propriedades derivadas
    podeDecrementar: quantidade > 1,
    podeIncrementar: true,
  };
}


export function useListaCarrinho() {
  const { 
    itens, 
    resumo, 
    loading, 
    error, 
    limparCarrinho, 
    validarCarrinho,
    recarregarCarrinho 
  } = useCarrinhoContext();
  
  return {
    itens,
    resumo,
    loading,
    error,
    
    // Ações da lista
    limparTudo: limparCarrinho,
    validar: validarCarrinho,
    recarregar: recarregarCarrinho,
    
    // Propriedades derivadas
    isEmpty: itens.length === 0,
    valorTotalFormatado: `R$ ${resumo.valorTotal.toFixed(2).replace('.', ',')}`,
    quantidadeItensTexto: resumo.quantidadeItens === 1 
      ? '1 produto' 
      : `${resumo.quantidadeItens} produtos`,
    quantidadeTotalTexto: resumo.quantidadeTotal === 1
      ? '1 item'
      : `${resumo.quantidadeTotal} itens`,
  };
}


export function useCarrinhoValidacao() {
  const { validarCarrinho, recarregarCarrinho, loading, error } = useCarrinhoContext();
  
  return {
    validar: validarCarrinho,
    recarregar: recarregarCarrinho,
    loading,
    error,
    
    // Função para validar quando app fica ativo
    validarSeNecessario: async () => {
      if (!loading) {
        await validarCarrinho();
      }
    },
  };
}


export function useCarrinhoCheckout() {
  const { itens, resumo, loading, validarCarrinho } = useCarrinhoContext();
  
  // Validar se carrinho está pronto para checkout
  const podeFinalizarCompra = itens.length > 0 && !loading;
  
  return {
    itens,
    resumo,
    loading,
    podeFinalizarCompra,
    
    // Preparar dados para checkout
    prepararCheckout: async () => {
      // Validar carrinho antes do checkout
      await validarCarrinho();
      
      return {
        itens: itens.map(item => ({
          produtoId: item.produto.id,
          nome: item.produto.nome,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          precoTotal: item.precoTotal,
        })),
        resumo,
        timestamp: new Date().toISOString(),
      };
    },
    
    // Propriedades úteis para checkout
    valorTotalFormatado: `R$ ${resumo.valorTotal.toFixed(2).replace('.', ',')}`,
    temItensControlados: itens.some(item => item.produto.controlado),
    temItensComReceita: itens.some(item => item.produto.requer_receita),
  };
}

 
export function useCarrinhoPersistencia() {
  const { itens, loading } = useCarrinhoContext();
  
  return {
    itens,
    loading,
    ultimaAtualizacao: new Date().toISOString(),
    temDados: itens.length > 0,
  };
}

