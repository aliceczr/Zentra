import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { 
  useHistoricoPedidos, 
  formatarStatusPedido, 
  formatarDataPedido
} from '../../hooks/hooksHistorico';
import { formatarValor } from '../../hooks/hooksPagamento';
import { Pedido } from '../../services/pedidoService';

// ============================================================================
// 📋 COMPONENTE CARD DE PEDIDO
// ============================================================================

interface PedidoCardProps {
  pedido: Pedido;
  onPress: () => void;
}

function PedidoCard({ pedido, onPress }: PedidoCardProps) {
  const statusInfo = formatarStatusPedido(pedido); // ✅ Passa o pedido completo
  const temMedicamentoControlado = pedido.itens?.some(item => 
    item.produto?.controlado || item.produto?.requer_receita
  ) || false;

  return (
    <TouchableOpacity style={styles.pedidoCard} onPress={onPress}>
      {/* Header do Pedido */}
      <View style={styles.pedidoHeader}>
        <View style={styles.pedidoInfo}>
          <Text style={styles.codigoPedido}>{pedido.codigo_pedido}</Text>
          <Text style={styles.dataPedido}>{formatarDataPedido(pedido.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.cor }]}>
          <Ionicons name={statusInfo.icone as any} size={16} color="#fff" />
          <Text style={styles.statusTexto}>{statusInfo.texto}</Text>
        </View>
      </View>

      {/* Produtos do Pedido */}
      <View style={styles.produtosContainer}>
        {pedido.itens?.slice(0, 2).map((item, index) => (
          <View key={index} style={styles.produtoItem}>
            <View style={styles.produtoInfo}>
              <Text style={styles.produtoNome} numberOfLines={1}>
                {item.produto?.nome || 'Produto não disponível'}
              </Text>
              <Text style={styles.produtoDetalhes}>
                {item.quantidade}x • {formatarValor(item.preco_unitario)}
                {item.produto?.requer_receita && (
                  <Text style={styles.receitaTexto}> • Receita</Text>
                )}
              </Text>
            </View>
            {item.produto?.controlado && (
              <Ionicons name="medical" size={16} color="#e74c3c" />
            )}
          </View>
        ))}
        
        {(pedido.itens?.length || 0) > 2 && (
          <Text style={styles.maisItens}>
            +{(pedido.itens?.length || 0) - 2} item(ns)
          </Text>
        )}
      </View>

      {/* Footer do Pedido */}
      <View style={styles.pedidoFooter}>
        <View style={styles.valorContainer}>
          <Text style={styles.valorLabel}>Total:</Text>
          <Text style={styles.valorTotal}>{formatarValor(pedido.total)}</Text>
        </View>
        
        <View style={styles.metadados}>
          {temMedicamentoControlado && (
            <View style={styles.controlledBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#e74c3c" />
              <Text style={styles.controlledText}>Controlado</Text>
            </View>
          )}
          
          <View style={styles.itensCount}>
            <Ionicons name="medical-outline" size={12} color="#666" />
            <Text style={styles.itensText}>{pedido.itens?.length || 0} item(ns)</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// 📱 COMPONENTE PRINCIPAL - HISTÓRICO SIMPLES
// ============================================================================

export default function HistoricoScreen() {
  const router = useRouter();
  const {
    pedidos,
    loading,
    error,
    estatisticas,
    recarregar
  } = useHistoricoPedidos();

  const handlePedidoPress = (pedido: Pedido) => {
    // Navegar para detalhes do pedido
    router.push(`/pedido-detalhes/${pedido.id}` as any);
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>Erro ao carregar histórico</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={recarregar}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Compras</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Estatísticas Rápidas */}
      {!loading && pedidos.length > 0 && (
        <View style={styles.estatisticasContainer}>
          <View style={styles.estatisticaItem}>
            <Text style={styles.estatisticaNumero}>{estatisticas.totalPedidos}</Text>
            <Text style={styles.estatisticaLabel}>Pedidos</Text>
          </View>
          <View style={styles.estatisticaItem}>
            <Text style={styles.estatisticaNumero}>{formatarValor(estatisticas.valorTotal)}</Text>
            <Text style={styles.estatisticaLabel}>Total Gasto</Text>
          </View>
          <View style={styles.estatisticaItem}>
            <Text style={styles.estatisticaNumero}>{estatisticas.pedidosEntregues}</Text>
            <Text style={styles.estatisticaLabel}>Finalizados</Text>
          </View>
        </View>
      )}

      {/* Lista de Pedidos */}
      <ScrollView
        style={styles.pedidosList}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={recarregar}
            colors={['#48C9B0']}
            tintColor="#48C9B0"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading && pedidos.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#48C9B0" />
            <Text style={styles.loadingText}>Carregando histórico...</Text>
          </View>
        ) : pedidos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
            <Text style={styles.emptyMessage}>
              Você ainda não fez nenhuma compra na nossa farmácia.
            </Text>
          </View>
        ) : (
          <View style={styles.pedidosContainer}>
            {pedidos.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                onPress={() => handlePedidoPress(pedido)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// 🎨 ESTILOS
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  // Estatísticas
  estatisticasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  estatisticaItem: {
    alignItems: 'center',
  },
  estatisticaNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#48C9B0',
  },
  estatisticaLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  // Lista de Pedidos
  pedidosList: {
    flex: 1,
  },
  pedidosContainer: {
    padding: 20,
    gap: 15,
  },

  // Card do Pedido
  pedidoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pedidoInfo: {
    flex: 1,
  },
  codigoPedido: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dataPedido: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusTexto: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },

  // Produtos
  produtosContainer: {
    marginBottom: 12,
  },
  produtoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  produtoInfo: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  produtoDetalhes: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  receitaTexto: {
    color: '#e74c3c',
    fontWeight: '500',
  },
  maisItens: {
    fontSize: 12,
    color: '#48C9B0',
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Footer do Pedido
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  valorContainer: {
    alignItems: 'flex-start',
  },
  valorLabel: {
    fontSize: 12,
    color: '#666',
  },
  valorTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  metadados: {
    alignItems: 'flex-end',
    gap: 4,
  },
  controlledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlledText: {
    fontSize: 10,
    color: '#e74c3c',
    fontWeight: '500',
  },
  itensCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itensText: {
    fontSize: 10,
    color: '#666',
  },

  // Estados
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e74c3c',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#48C9B0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});