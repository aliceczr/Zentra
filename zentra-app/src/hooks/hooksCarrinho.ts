import { useCarrinhoContext } from '../contexts/carrinhoContext';
import { Produto } from '../services/produtoService';

export function useCarrinho() {
  const context = useCarrinhoContext();
  
  return {
   
    itens: context.itens,
    resumo: context.resumo,
    loading: context.loading,
    error: context.error,
    
   
    adicionarProduto: context.adicionarProduto,
    removerProduto: context.removerProduto,
    atualizarQuantidade: context.atualizarQuantidade,
    limparCarrinho: context.limparCarrinho,
    
    
    temNoCarrinho: context.temNoCarrinho,
    obterQuantidade: context.obterQuantidade,
    
    
    recarregarCarrinho: context.recarregarCarrinho,
    validarCarrinho: context.validarCarrinho,
    
   
    isEmpty: context.itens.length === 0,
    quantidadeItens: context.resumo.quantidadeItens,
    quantidadeTotal: context.resumo.quantidadeTotal,
    valorTotal: context.resumo.valorTotal,
  };
}


export function useCarrinhoContador() {
  const { resumo, loading } = useCarrinhoContext();
  
  return {
    quantidade: resumo.quantidadeTotal, 
    itens: resumo.quantidadeItens,      
    valor: resumo.valorTotal,       
    loading,
    
    
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
    
   
    incrementar: () => atualizarQuantidade(produtoId, quantidade + 1),
    decrementar: () => atualizarQuantidade(produtoId, Math.max(0, quantidade - 1)),
    remover: () => removerProduto(produtoId),
    definirQuantidade: (novaQuantidade: number) => atualizarQuantidade(produtoId, novaQuantidade),
    
    
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
    
   
    limparTudo: limparCarrinho,
    validar: validarCarrinho,
    recarregar: recarregarCarrinho,
    
    
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
    
    validarSeNecessario: async () => {
      if (!loading) {
        await validarCarrinho();
      }
    },
  };
}


export function useCarrinhoCheckout() {
  const { itens, resumo, loading, validarCarrinho } = useCarrinhoContext();
  

  const podeFinalizarCompra = itens.length > 0 && !loading;
  
  return {
    itens,
    resumo,
    loading,
    podeFinalizarCompra,
    
  
    prepararCheckout: async () => {
      
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

