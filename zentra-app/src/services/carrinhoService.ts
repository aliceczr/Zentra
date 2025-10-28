import AsyncStorage from '@react-native-async-storage/async-storage';
import { Produto, buscarPorId } from './produtoService';

// Chave para armazenamento no AsyncStorage
const CARRINHO_KEY = '@zentra:carrinho';

// Interface para item do carrinho
export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
  adicionadoEm: string;
}

// Interface para resumo do carrinho
export interface ResumoCarrinho {
  quantidadeTotal: number;
  valorTotal: number;
  quantidadeItens: number;
}

// ============================================================================
// 🛒 CARRINHO SERVICE - Gerenciamento com AsyncStorage
// ============================================================================

export const carrinhoService = {
  
  /**
   * Carregar carrinho do AsyncStorage
   */
  async carregarCarrinho(): Promise<ItemCarrinho[]> {
    try {
      const data = await AsyncStorage.getItem(CARRINHO_KEY);
      if (data) {
        const itens: ItemCarrinho[] = JSON.parse(data);
        
        // Validar se os produtos ainda existem (opcional para MVP)
        const itensValidados = await Promise.all(
          itens.map(async (item) => {
            try {
              // Verificar se produto ainda existe
              const produtoAtualizado = await buscarPorId(item.produto.id);
              
              // Se produto não existe mais, retorna null para remover
              if (!produtoAtualizado) {
                console.warn(`Produto ${item.produto.id} não encontrado, removendo do carrinho`);
                return null;
              }
              
              // Atualizar preço se mudou
              if (produtoAtualizado.preco !== item.precoUnitario) {
                return {
                  ...item,
                  precoUnitario: produtoAtualizado.preco,
                  precoTotal: produtoAtualizado.preco * item.quantidade,
                  produto: produtoAtualizado,
                };
              }
              
              return { ...item, produto: produtoAtualizado };
            } catch (error) {
              console.warn(`Produto ${item.produto.id} não encontrado, removendo do carrinho`);
              return null; // Produto não existe mais
            }
          })
        );
        
        // Filtrar itens nulos (produtos que não existem mais)
        return itensValidados.filter((item): item is ItemCarrinho => item !== null);
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      return [];
    }
  },

  /**
   * Salvar carrinho no AsyncStorage
   */
  async salvarCarrinho(itens: ItemCarrinho[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CARRINHO_KEY, JSON.stringify(itens));
      console.log('Carrinho salvo com sucesso:', itens.length, 'itens');
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
      throw new Error('Falha ao salvar carrinho');
    }
  },

  /**
   * Adicionar item ao carrinho
   */
  async adicionarItem(produto: Produto, quantidade: number = 1): Promise<ItemCarrinho[]> {
    try {
      const itensAtuais = await this.carregarCarrinho();
      const itemExistente = itensAtuais.find(item => item.produto.id === produto.id);

      let novosItens: ItemCarrinho[];

      if (itemExistente) {
        // Atualizar quantidade se já existe
        novosItens = itensAtuais.map(item => {
          if (item.produto.id === produto.id) {
            const novaQuantidade = item.quantidade + quantidade;
            return {
              ...item,
              quantidade: novaQuantidade,
              precoTotal: item.precoUnitario * novaQuantidade,
            };
          }
          return item;
        });
      } else {
        // Adicionar novo item
        const novoItem: ItemCarrinho = {
          produto,
          quantidade,
          precoUnitario: produto.preco,
          precoTotal: produto.preco * quantidade,
          adicionadoEm: new Date().toISOString(),
        };
        
        novosItens = [...itensAtuais, novoItem];
      }

      await this.salvarCarrinho(novosItens);
      console.log(`Produto ${produto.nome} adicionado ao carrinho`);
      return novosItens;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      throw new Error('Falha ao adicionar produto ao carrinho');
    }
  },

  /**
   * Atualizar quantidade de um item
   */
  async atualizarQuantidade(produtoId: number, novaQuantidade: number): Promise<ItemCarrinho[]> {
    try {
      const itensAtuais = await this.carregarCarrinho();

      if (novaQuantidade <= 0) {
        // Remove item se quantidade é 0 ou menor
        return await this.removerItem(produtoId);
      }

      const novosItens = itensAtuais.map(item => {
        if (item.produto.id === produtoId) {
          return {
            ...item,
            quantidade: novaQuantidade,
            precoTotal: item.precoUnitario * novaQuantidade,
          };
        }
        return item;
      });

      await this.salvarCarrinho(novosItens);
      console.log(`Quantidade atualizada para produto ${produtoId}: ${novaQuantidade}`);
      return novosItens;
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      throw new Error('Falha ao atualizar quantidade');
    }
  },

  /**
   * Remover item do carrinho
   */
  async removerItem(produtoId: number): Promise<ItemCarrinho[]> {
    try {
      const itensAtuais = await this.carregarCarrinho();
      const novosItens = itensAtuais.filter(item => item.produto.id !== produtoId);

      await this.salvarCarrinho(novosItens);
      console.log(`Produto ${produtoId} removido do carrinho`);
      return novosItens;
    } catch (error) {
      console.error('Erro ao remover item:', error);
      throw new Error('Falha ao remover produto do carrinho');
    }
  },

  /**
   * Limpar todo o carrinho
   */
  async limparCarrinho(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CARRINHO_KEY);
      console.log('Carrinho limpo com sucesso');
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      throw new Error('Falha ao limpar carrinho');
    }
  },

  /**
   * Verificar se produto está no carrinho
   */
  async temNoCarrinho(produtoId: number): Promise<boolean> {
    try {
      const itens = await this.carregarCarrinho();
      return itens.some(item => item.produto.id === produtoId);
    } catch (error) {
      console.error('Erro ao verificar carrinho:', error);
      return false;
    }
  },

  /**
   * Obter quantidade de um produto específico
   */
  async obterQuantidade(produtoId: number): Promise<number> {
    try {
      const itens = await this.carregarCarrinho();
      const item = itens.find(item => item.produto.id === produtoId);
      return item ? item.quantidade : 0;
    } catch (error) {
      console.error('Erro ao obter quantidade:', error);
      return 0;
    }
  },

  /**
   * Calcular resumo do carrinho
   */
  async calcularResumo(): Promise<ResumoCarrinho> {
    try {
      const itens = await this.carregarCarrinho();
      
      const quantidadeTotal = itens.reduce((total, item) => total + item.quantidade, 0);
      const valorTotal = itens.reduce((total, item) => total + item.precoTotal, 0);
      const quantidadeItens = itens.length;

      return {
        quantidadeTotal,
        valorTotal,
        quantidadeItens,
      };
    } catch (error) {
      console.error('Erro ao calcular resumo:', error);
      return {
        quantidadeTotal: 0,
        valorTotal: 0,
        quantidadeItens: 0,
      };
    }
  },

  /**
   * Validar carrinho (verificar produtos removidos/preços alterados)
   */
  async validarCarrinho(): Promise<{ itensAtualizados: ItemCarrinho[]; alteracoes: string[] }> {
    try {
      const itens = await this.carregarCarrinho();
      const alteracoes: string[] = [];
      const itensValidados: ItemCarrinho[] = [];

      for (const item of itens) {
        try {
          const produtoAtualizado = await buscarPorId(item.produto.id);
          
          // Se produto não existe mais, pula para o catch
          if (!produtoAtualizado) {
            alteracoes.push(`${item.produto.nome} não está mais disponível`);
            continue; // Não adiciona à lista validada (remove automaticamente)
          }
          
          // Verificar mudança de preço
          if (produtoAtualizado.preco !== item.precoUnitario) {
            alteracoes.push(`Preço de ${produtoAtualizado.nome} foi atualizado`);
            
            itensValidados.push({
              ...item,
              precoUnitario: produtoAtualizado.preco,
              precoTotal: produtoAtualizado.preco * item.quantidade,
              produto: produtoAtualizado,
            });
          } else {
            itensValidados.push({ ...item, produto: produtoAtualizado });
          }
        } catch (error) {
          alteracoes.push(`${item.produto.nome} não está mais disponível`);
          // Não adiciona à lista validada (remove automaticamente)
        }
      }

      // Salvar carrinho validado se houve alterações
      if (alteracoes.length > 0) {
        await this.salvarCarrinho(itensValidados);
      }

      return {
        itensAtualizados: itensValidados,
        alteracoes,
      };
    } catch (error) {
      console.error('Erro ao validar carrinho:', error);
      return {
        itensAtualizados: [],
        alteracoes: ['Erro ao validar carrinho'],
      };
    }
  },
};