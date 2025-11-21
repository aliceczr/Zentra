import AsyncStorage from '@react-native-async-storage/async-storage';
import { Produto, buscarPorId, buscarPorIds } from './produtoService';

const CARRINHO_KEY = '@zentra:carrinho';

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
  adicionadoEm: string;
}


export interface ResumoCarrinho {
  quantidadeTotal: number;
  valorTotal: number;
  quantidadeItens: number;
}


export const carrinhoService = {

  async carregarCarrinho(): Promise<ItemCarrinho[]> {
    try {
      const data = await AsyncStorage.getItem(CARRINHO_KEY);
      if (data) {
      
        let parsed: any;
        try {
          parsed = JSON.parse(data);
        } catch (err) {
          console.error('Erro ao parsear carrinho do storage:', err);
          return [];
        }

        const itens: ItemCarrinho[] = Array.isArray(parsed) ? parsed : (parsed.items || []);

        const idsUnicos = Array.from(new Set(itens.map(i => i.produto.id)));
        const produtosMap = await buscarPorIds(idsUnicos);

        const itensValidados: ItemCarrinho[] = [];
        for (const item of itens) {
          const produtoAtualizado = produtosMap.get(item.produto.id) || null;
          if (!produtoAtualizado) {
            console.warn(`Produto ${item.produto.id} não encontrado, removendo do carrinho`);
            continue;
          }

          if (produtoAtualizado.preco !== item.precoUnitario) {
            itensValidados.push({
              ...item,
              precoUnitario: produtoAtualizado.preco,
              precoTotal: produtoAtualizado.preco * item.quantidade,
              produto: produtoAtualizado,
            });
          } else {
            itensValidados.push({ ...item, produto: produtoAtualizado });
          }
        }

        return itensValidados;
      }

      return [];
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      return [];
    }
  },

 
  async salvarCarrinho(itens: ItemCarrinho[]): Promise<void> {
    try {

      const payload = { version: 1, items: itens };
      await AsyncStorage.setItem(CARRINHO_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
      throw new Error(`Falha ao salvar carrinho: ${String(error)}`);
    }
  },


  async adicionarItem(produto: Produto, quantidade: number = 1): Promise<ItemCarrinho[]> {
    try {
      const itensAtuais = await this.carregarCarrinho();
      const itemExistente = itensAtuais.find(item => item.produto.id === produto.id);

      let novosItens: ItemCarrinho[];

      if (itemExistente) {
        
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
      return novosItens;
    } catch (error) {
      console.error('Erro ao adicionar item ao carrinho:', { produtoId: produto?.id, error });
      throw new Error(`Falha ao adicionar produto ${produto?.id} ao carrinho: ${String(error)}`);
    }
  },


  async atualizarQuantidade(produtoId: number, novaQuantidade: number): Promise<ItemCarrinho[]> {
    try {
      const itensAtuais = await this.carregarCarrinho();

      if (novaQuantidade <= 0) {
       
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
      return novosItens;
    } catch (error) {
      console.error('Erro ao atualizar quantidade no carrinho:', { produtoId, novaQuantidade, error });
      throw new Error(`Falha ao atualizar quantidade do produto ${produtoId}: ${String(error)}`);
    }
  },


  async removerItem(produtoId: number): Promise<ItemCarrinho[]> {
    try {
      const itensAtuais = await this.carregarCarrinho();
      const novosItens = itensAtuais.filter(item => item.produto.id !== produtoId);

      await this.salvarCarrinho(novosItens);
      return novosItens;
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', { produtoId, error });
      throw new Error(`Falha ao remover produto ${produtoId} do carrinho: ${String(error)}`);
    }
  },


  async limparCarrinho(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CARRINHO_KEY);
      
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      throw new Error(`Falha ao limpar carrinho: ${String(error)}`);
    }
  },

 
  async temNoCarrinho(produtoId: number): Promise<boolean> {
    try {
      const itens = await this.carregarCarrinho();
      return itens.some(item => item.produto.id === produtoId);
    } catch (error) {
      console.error('Erro ao verificar carrinho:', error);
      return false;
    }
  },


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
  async validarCarrinho(): Promise<{ itensAtualizados: ItemCarrinho[]; alteracoes: string[] }> {
    try {
      const itens = await this.carregarCarrinho();
      const alteracoes: string[] = [];
      const itensValidados: ItemCarrinho[] = [];

      const idsUnicos = Array.from(new Set(itens.map(i => i.produto.id)));
      const produtosMap = await buscarPorIds(idsUnicos);

      for (const item of itens) {
        const produtoAtualizado = produtosMap.get(item.produto.id) || null;
        if (!produtoAtualizado) {
          alteracoes.push(`${item.produto.nome} não está mais disponível`);
          continue;
        }

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
      }

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