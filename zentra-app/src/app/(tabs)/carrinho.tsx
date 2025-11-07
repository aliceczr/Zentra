import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useListaCarrinho, useItemCarrinho } from '../../hooks/hooksCarrinho';
import { ItemCarrinho } from '../../services/carrinhoService';
import { styles } from '../../components/style.styles';

// ============================================================================
// 🛒 TELA DO CARRINHO
// ============================================================================

export default function CarrinhoScreen() {
  const router = useRouter();
  const {
    itens,
    resumo,
    loading,
    isEmpty,
    limparTudo,
    valorTotalFormatado,
    quantidadeItensTexto,
  } = useListaCarrinho();

  // Função para confirmar e limpar carrinho
  const handleLimparCarrinho = () => {
    Alert.alert(
      'Limpar Carrinho',
      'Tem certeza que deseja remover todos os produtos do carrinho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: limparTudo 
        },
      ]
    );
  };

  // Função para ir para checkout
  const handleIrParaCheckout = () => {
    if (isEmpty) {
      Alert.alert(
        'Carrinho Vazio',
        'Adicione produtos ao carrinho para continuar.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    router.push('/(tabs)/pagamentos');
  };

  // Componente para item do carrinho
  const ItemCarrinhoComponent = ({ item }: { item: ItemCarrinho }) => {
    const {
      quantidade,
      incrementar,
      decrementar,
      remover,
      podeDecrementar,
    } = useItemCarrinho(item.produto.id);

    const handleRemover = () => {
      Alert.alert(
        'Remover Produto',
        `Deseja remover ${item.produto.nome} do carrinho?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Remover', style: 'destructive', onPress: remover },
        ]
      );
    };

    return (
      <View style={styles.carrinhoItemContainer}>
        {/* Imagem do produto */}
        <View style={styles.carrinhoItemImageContainer}>
          <Image
            source={{
              uri: item.produto.imagem_principal || 
                'https://via.placeholder.com/80x80/48C9B0/FFFFFF?text=Produto'
            }}
            style={styles.carrinhoItemImage}
            resizeMode="contain"
          />
        </View>

        {/* Informações do produto */}
        <View style={styles.carrinhoItemInfo}>
          <Text style={styles.carrinhoItemNome} numberOfLines={2}>
            {item.produto.nome}
          </Text>
          
          <Text style={styles.carrinhoItemPreco}>
            R$ {item.precoUnitario.toFixed(2).replace('.', ',')}
          </Text>

          {/* Controles de quantidade */}
          <View style={styles.carrinhoQuantidadeContainer}>
            <TouchableOpacity
              style={[
                styles.carrinhoQuantidadeBotao,
                !podeDecrementar && styles.carrinhoQuantidadeBotaoDisabled
              ]}
              onPress={decrementar}
              disabled={!podeDecrementar}
            >
              <Ionicons 
                name="remove" 
                size={16} 
                color={podeDecrementar ? "#133E4E" : "#ccc"} 
              />
            </TouchableOpacity>

            <Text style={styles.carrinhoQuantidadeTexto}>
              {quantidade}
            </Text>

            <TouchableOpacity
              style={styles.carrinhoQuantidadeBotao}
              onPress={incrementar}
            >
              <Ionicons name="add" size={16} color="#133E4E" />
            </TouchableOpacity>
          </View>

          {/* Preço total do item */}
          <Text style={styles.carrinhoItemPrecoTotal}>
            Total: R$ {item.precoTotal.toFixed(2).replace('.', ',')}
          </Text>
        </View>

        {/* Botão remover */}
        <TouchableOpacity
          style={styles.carrinhoRemoverBotao}
          onPress={handleRemover}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    );
  };

  // Tela vazia
  if (isEmpty) {
    return (
      <SafeAreaView style={styles.carrinhoContainer}>
        <View style={styles.carrinhoVazioContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.carrinhoVazioTitulo}>
            Seu carrinho está vazio
          </Text>
          <Text style={styles.carrinhoVazioSubtitulo}>
            Adicione produtos para continuar
          </Text>
          <TouchableOpacity
            style={styles.carrinhoVazioBotao}
            onPress={() => router.push('/(tabs)/list_produtos')}
          >
            <Text style={styles.carrinhoVazioBotaoTexto}>
              Ver Produtos
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.carrinhoContainer}>
      {/* Header */}
      <View style={styles.carrinhoHeader}>
        <Text style={styles.carrinhoTitulo}>Meu Carrinho</Text>
        <Text style={styles.carrinhoSubtitulo}>
          {quantidadeItensTexto}
        </Text>
        
        {itens.length > 0 && (
          <TouchableOpacity
            style={styles.carrinhoLimparBotao}
            onPress={handleLimparCarrinho}
          >
            <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
            <Text style={styles.carrinhoLimparTexto}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.carrinhoLoadingContainer}>
          <ActivityIndicator size="small" color="#48C9B0" />
          <Text style={styles.carrinhoLoadingTexto}>Atualizando...</Text>
        </View>
      )}

      {/* Lista de itens */}
      <ScrollView 
        style={styles.carrinhoLista}
        showsVerticalScrollIndicator={false}
      >
        {itens.map((item) => (
          <ItemCarrinhoComponent 
            key={item.produto.id} 
            item={item} 
          />
        ))}
      </ScrollView>

      {/* Footer com resumo e checkout */}
      <View style={styles.carrinhoFooter}>
        {/* Resumo */}
        <View style={styles.carrinhoResumoContainer}>
          <View style={styles.carrinhoResumoLinha}>
            <Text style={styles.carrinhoResumoLabel}>
              Subtotal ({resumo.quantidadeTotal} {resumo.quantidadeTotal === 1 ? 'item' : 'itens'})
            </Text>
            <Text style={styles.carrinhoResumoValor}>
              {valorTotalFormatado}
            </Text>
          </View>

          <View style={styles.carrinhoResumoLinha}>
            <Text style={styles.carrinhoResumoLabel}>Entrega</Text>
            <Text style={styles.carrinhoResumoValorGratis}>Grátis</Text>
          </View>

          <View style={[styles.carrinhoResumoLinha, styles.carrinhoResumoTotal]}>
            <Text style={styles.carrinhoResumoLabelTotal}>Total</Text>
            <Text style={styles.carrinhoResumoValorTotal}>
              {valorTotalFormatado}
            </Text>
          </View>
        </View>

        {/* Botão de checkout */}
        <TouchableOpacity
          style={styles.carrinhoCheckoutBotao}
          onPress={handleIrParaCheckout}
        >
          <Ionicons name="card-outline" size={20} color="white" />
          <Text style={styles.carrinhoCheckoutTexto}>
            Finalizar Pedido
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}