import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProdutoContext } from '../../contexts/produtoContext';
import { useAdicionarAoCarrinho, useCarrinhoContador } from '../../hooks/hooksCarrinho';

export default function ProdutoDetalhes() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { produtos, carregarProdutos } = useProdutoContext();
  const { adicionarProduto, temNoCarrinho, loading } = useAdicionarAoCarrinho();
  const { quantidade: quantidadeCarrinho, temItens } = useCarrinhoContador();
  
  const [quantidade, setQuantidade] = useState(1);


  const produto = produtos.find(p => p.id === Number(id));
  
  
  const jaNoCarrinho = produto ? temNoCarrinho(produto.id) : false;

  const isSoldOut = produto ? (typeof (produto as any).estoque_atual === 'number' ? (produto as any).estoque_atual <= 0 : false) : false;

  const [retrying, setRetrying] = useState(false);

  const handleVoltar = () => {
    router.back();
  };
  const handleComprar = async () => {
    if (!produto) return;
    
    try {
      
      if (isSoldOut) {
        Alert.alert('Esgotado', 'Este produto está esgotado e não pode ser adicionado ao carrinho.');
        return;
      }
      
      if (typeof (produto as any).estoque_atual === 'number' && quantidade > (produto as any).estoque_atual) {
        Alert.alert('Quantidade inválida', `Apenas ${(produto as any).estoque_atual} unidade(s) disponíveis.`);
        return;
      }

      await adicionarProduto(produto, quantidade);
      
      Alert.alert(
        'Produto Adicionado!',
        `${produto.nome} foi adicionado ao carrinho.`,
        [
          { text: 'Continuar Comprando', style: 'cancel' },
          { 
            text: 'Ver Carrinho', 
            onPress: () => router.push('/(tabs)/carrinho')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o produto ao carrinho.');
    }
  };

  if (!produto) {
    const handleRetry = async () => {
      setRetrying(true);
      try {
        await carregarProdutos();
      } catch (e) {
        
      } finally {
        setRetrying(false);
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Produto não encontrado</Text>
          <Text style={[styles.errorText, { color: '#666', marginBottom: 16, fontSize: 14 }]}>Este produto pode ter sido removido ou estar indisponível no momento.</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.voltarButton, { marginRight: 8 }]} onPress={handleVoltar}>
              <Text style={styles.voltarButtonText}>Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.voltarButton, { backgroundColor: '#2F9A8A', opacity: retrying ? 0.7 : 1 }]}
              onPress={handleRetry}
              disabled={retrying}
            >
              {retrying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.voltarButtonText}>Atualizar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleVoltar} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>
          {produto.nome}
        </Text>
        
        <View style={styles.headerRight}>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/(tabs)/carrinho')}
          >
            <Ionicons name="cart-outline" size={24} color="#333" />
            {temItens && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{quantidadeCarrinho}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Imagem do Produto */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: produto.imagem_principal || 'https://via.placeholder.com/300x300/f0f0f0/cccccc?text=Produto' 
            }}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        {/* Informações Básicas */}
        <View style={styles.basicInfo}>
          <Text style={styles.productName}>{produto.nome}</Text>
          <Text style={styles.productBrand}>
            {produto.marca} • {produto.apresentacao || produto.dimensoes_cm}
          </Text>
          
          <View style={styles.priceContainer}>
            <View style={styles.priceSection}>
              <Text style={styles.price}>R$ {produto.preco.toFixed(2).replace('.', ',')}</Text>
              
              {/* Controles de quantidade */}
              <View style={styles.quantidadeContainer}>
                <Text style={styles.quantidadeLabel}>Qtd:</Text>
                <TouchableOpacity 
                  style={styles.quantidadeBotao}
                  onPress={() => setQuantidade(Math.max(1, quantidade - 1))}
                >
                  <Ionicons name="remove" size={14} color="#133E4E" />
                </TouchableOpacity>
                
                <Text style={styles.quantidadeTexto}>{quantidade}</Text>
                
                <TouchableOpacity 
                  style={styles.quantidadeBotao}
                  onPress={() => {
                    // Se houver informação de estoque, não ultrapassar
                    if (typeof (produto as any).estoque_atual === 'number') {
                      setQuantidade(q => Math.min((produto as any).estoque_atual as number, q + 1));
                    } else {
                      setQuantidade(q => q + 1);
                    }
                  }}
                >
                  <Ionicons name="add" size={14} color="#133E4E" />
                </TouchableOpacity>
              </View>
            </View>
            
            {isSoldOut ? (
              <View style={[styles.buyButton, styles.buyButtonDisabled, styles.soldOutButton]}>
                <Text style={[styles.buyButtonText, styles.soldOutText]}>Esgotado</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.buyButton, loading && styles.buyButtonDisabled]} 
                onPress={handleComprar}
                disabled={loading}
              >
                <Ionicons name="cart" size={14} color="white" style={styles.buyButtonIcon} />
                <Text style={styles.buyButtonText}>
                  {loading ? 'Adicionando...' : jaNoCarrinho ? 'Adicionar +' : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Características */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Características</Text>
          
          <View style={styles.caracteristicas}>
            {produto.codigo_barras && (
              <View style={styles.caracteristicaItem}>
                <Text style={styles.caracteristicaLabel}>Código do produto</Text>
                <Text style={styles.caracteristicaValue}>{produto.codigo_barras}</Text>
              </View>
            )}
            
            {produto.apresentacao && (
              <View style={styles.caracteristicaItem}>
                <Text style={styles.caracteristicaLabel}>Apresentação</Text>
                <Text style={styles.caracteristicaValue}>{produto.apresentacao}</Text>
              </View>
            )}
            
            {produto.marca && (
              <View style={styles.caracteristicaItem}>
                <Text style={styles.caracteristicaLabel}>Marca</Text>
                <Text style={styles.caracteristicaValue}>{produto.marca}</Text>
              </View>
            )}
            
            {produto.fabricante && (
              <View style={styles.caracteristicaItem}>
                <Text style={styles.caracteristicaLabel}>Fabricante</Text>
                <Text style={styles.caracteristicaValue}>{produto.fabricante}</Text>
              </View>
            )}
            
            {produto.registro_ms && (
              <View style={styles.caracteristicaItem}>
                <Text style={styles.caracteristicaLabel}>Registro MS</Text>
                <Text style={styles.caracteristicaValue}>{produto.registro_ms}</Text>
              </View>
            )}
            
            {produto.principio_ativo && (
              <View style={styles.caracteristicaItem}>
                <Text style={styles.caracteristicaLabel}>Princípio Ativo</Text>
                <Text style={styles.caracteristicaValue}>{produto.principio_ativo}</Text>
              </View>
            )}
            
            {produto.dosagem && (
              <View style={styles.caracteristicaItem}>
                <Text style={styles.caracteristicaLabel}>Dosagem</Text>
                <Text style={styles.caracteristicaValue}>{produto.dosagem}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Composição */}
        {produto.composicao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Composição</Text>
            <Text style={styles.sectionText}>{produto.composicao}</Text>
          </View>
        )}

        {/* Indicação */}
        {produto.indicacao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Indicação</Text>
            <Text style={styles.sectionText}>{produto.indicacao}</Text>
          </View>
        )}

        {/* Contraindicação */}
        {produto.contraindicacao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contraindicação</Text>
            <Text style={styles.sectionText}>{produto.contraindicacao}</Text>
          </View>
        )}

        {/* Modo de Uso */}
        {produto.modo_uso && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Modo de Uso</Text>
            <Text style={styles.sectionText}>{produto.modo_uso}</Text>
          </View>
        )}

        {/* Informações Regulamentares */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Regulamentares</Text>
          
          {produto.controlado && (
            <Text style={styles.warningText}>⚠️ Medicamento controlado</Text>
          )}
          
          {produto.requer_receita && (
            <Text style={styles.warningText}>📋 Requer receita médica</Text>
          )}
          
          {!produto.controlado && !produto.requer_receita && (
            <Text style={styles.infoText}>✅ Medicamento de venda livre</Text>
          )}
        </View>

        {/* Espaçamento final */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF6F6',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  voltarButton: {
    backgroundColor: '#48C9B0', 
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  voltarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff', 
  },
  headerButton: {
    padding: 8,
    position: 'relative',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#133E4E', 
    marginHorizontal: 12,
  },
  headerRight: {
    flexDirection: 'row',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#48C9B0', 
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 30,
    alignItems: 'center',
  },
  productImage: {
    width: 250,
    height: 250,
  },
  basicInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff', 
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#133E4E', 
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 22, 
    fontWeight: 'bold',
    color: '#133E4E',
  },
  buyButton: {
    backgroundColor: '#48C9B0', 
    paddingHorizontal: 24, 
    paddingVertical: 10, 
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch', 
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14, 
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff', 
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#133E4E', 
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  caracteristicas: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
  },
  caracteristicaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  caracteristicaLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  caracteristicaValue: {
    fontSize: 14,
    color: '#133E4E', 
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  warningText: {
    fontSize: 14,
    color: '#e74c3c', 
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#48C9B0', 
    marginBottom: 8,
  },
  bulaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
  },
  bulaLabel: {
    fontSize: 16,
    color: '#133E4E', 
    fontWeight: '500',
  },
  bulaLink: {
    fontSize: 16,
    color: '#48C9B0', 
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  
  // Estilos para controles de quantidade
  quantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, 
  },
  quantidadeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#133E4E',
    marginRight: 4,
  },
  quantidadeBotao: {
    width: 28, 
    height: 28, 
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quantidadeTexto: {
    fontSize: 14, 
    fontWeight: 'bold',
    color: '#133E4E',
    minWidth: 24, 
    textAlign: 'center',
  },
  
  // Estilos atualizados do botão de comprar
  buyButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buyButtonIcon: {
    marginRight: 6, 
  },
  soldOutButton: {
    backgroundColor: '#b0b0b0',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  soldOutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  bottomSpacing: {
    height: 30,
  },
});