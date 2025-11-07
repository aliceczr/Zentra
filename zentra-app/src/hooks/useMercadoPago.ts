
import { useState } from 'react';
import { Alert } from 'react-native';
import { mercadoPagoService, ItemMercadoPago, DadosComprador } from '../services/mercadoPagoService';
import { mercadoPagoSupabaseService } from '../services/mercadoPagoSupabaseService';
import { criarPedido } from '../services/pedidoService';
import { router } from 'expo-router';

export function useMercadoPago() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pagarComMercadoPago = async (
    itensCarrinho: any[],
    dadosUsuario: any,
    enderecoEntrega: any
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Iniciando pagamento MP');

      // Validações básicas
      if (!itensCarrinho || itensCarrinho.length === 0) {
        throw new Error('Carrinho vazio');
      }

      if (!dadosUsuario?.id) {
        throw new Error('ID do usuário obrigatório');
      }

      if (!enderecoEntrega?.id) {
        throw new Error('Endereço de entrega obrigatório');
      }

      // ✅ 1. CRIAR PEDIDO PRIMEIRO (igual outros métodos de pagamento)
      const total = itensCarrinho.reduce((sum, item) => 
        sum + (Number(item.precoUnitario || item.preco || item.price || 0) * (item.quantidade || 1)), 0
      );

      console.log('🔍 DEBUG - Itens carrinho:', JSON.stringify(itensCarrinho, null, 2));

      const pedidoPayload = {
        usuario_id: dadosUsuario.id,
        endereco_id: enderecoEntrega.id,
        itens: itensCarrinho.map((item) => {
          const produtoId = item.produto?.id || item.produto_id || item.id || item.produtoId;
          console.log('🔍 DEBUG - Item:', { produto_id: produtoId, item_original: item });
          
          if (!produtoId) {
            console.error('❌ produto_id não encontrado no item:', item);
            throw new Error(`produto_id não encontrado no item do carrinho`);
          }
          
          return {
            produto_id: produtoId,
            quantidade: item.quantidade || item.quantity || 1,
            preco_unitario: Number(item.precoUnitario || item.preco || item.price || 0),
          };
        }),
        subtotal: total,
        taxa_entrega: 0,
        desconto: 0,
        total: total,
      };

      console.log('🏦 Criando pedido no banco...', pedidoPayload);
      const pedidoCriado = await criarPedido(pedidoPayload);
      console.log('✅ Pedido criado:', pedidoCriado.codigo_pedido);

      // ✅ 2. CONVERTER ITENS PARA FORMATO MP
      const items: ItemMercadoPago[] = itensCarrinho.map(item => ({
        id: (item.produto?.id || item.produto_id || item.id || 'produto').toString(),
        title: item.produto?.nome || item.nome || item.title || 'Produto',
        quantity: item.quantidade || item.quantity || 1,
        unit_price: Number(item.precoUnitario || item.preco || item.price || 0),
        picture_url: item.produto?.imagem_principal || item.imagem_principal || item.image,
        currency_id: 'BRL',
      }));

     
      const comprador: DadosComprador = {
        user_id: dadosUsuario.id, 
        email: dadosUsuario.email,
        name: dadosUsuario.nome?.split(' ')[0] || 'Cliente',
        surname: dadosUsuario.nome?.split(' ').slice(1).join(' ') || '',
        phone: dadosUsuario.telefone?.replace(/\D/g, ''),
      };

      console.log('🛒 Processando:', items.length, 'itens para pedido:', pedidoCriado.codigo_pedido);

    
      const resultado = await mercadoPagoService.processarPagamento(
        items,
        comprador,
        pedidoCriado.codigo_pedido 
      );

      if (resultado.preferenceId) {
        console.log('✅ Pagamento iniciado com preferência:', resultado.preferenceId);
        
     
        router.push({
          pathname: '/aguardando-pagamento',
          params: { 
            preferenceId: resultado.preferenceId,
            pedidoId: pedidoCriado.codigo_pedido, 
          }
        });
        
        return true;
      } else {
        throw new Error('Falha ao criar preferência do pagamento');
      }

    } catch (err: any) {
      console.error('❌ Erro no pagamento:', err);
      const errorMessage = err.message || 'Erro ao processar pagamento';
      setError(errorMessage);
      
      Alert.alert(
        'Erro no Pagamento', 
        errorMessage,
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setLoading(false);
    }
  };


  const limparEstado = () => {
    setLoading(false);
    setError(null);
  };

  return {
    loading,
    error,
    pagarComMercadoPago,
    limparEstado,
  };
}