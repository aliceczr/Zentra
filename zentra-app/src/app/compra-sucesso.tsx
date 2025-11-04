import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatarValor } from '../hooks/hooksPagamento';
import { useAuth } from '../contexts/AuthContext';
import Confetti from '../components/Confetti';

const { width } = Dimensions.get('window');

export default function CompraSucessoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  
  // Animações
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [showConfetti, setShowConfetti] = useState(true);

  // Dados simulados (na implementação real viriam dos params ou context)
  const dadosCompra = {
    pedidoId: params.pedidoId || 'ZEN-' + Date.now().toString().slice(-6),
    valor: parseFloat(params.valor as string) || 89.90,
    metodo: params.metodo || 'PIX',
    parcelas: parseInt(params.parcelas as string) || 1,
    dataCompra: new Date().toLocaleString('pt-BR'),
    status: 'APROVADO',
    previsaoEntrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
  };

  useEffect(() => {
    // Animação de entrada
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Parar confetti após 4 segundos
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const getMetodoTexto = (metodo: string) => {
    const metodos: Record<string, string> = {
      'PIX': 'PIX',
      'CARTAO_CREDITO': 'Cartão de Crédito',
      'CARTAO_DEBITO': 'Cartão de Débito',
    };
    return metodos[metodo] || metodo;
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={60} color="#fff" />
      </View>
      
      <Text style={styles.successTitle}>Compra Finalizada!</Text>
      <Text style={styles.successSubtitle}>
        Seu pagamento foi processado com sucesso
      </Text>
    </Animated.View>
  );

  const renderDetalhesCompra = () => (
    <Animated.View 
      style={[
        styles.detalhesContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Text style={styles.secaoTitulo}>Detalhes da Compra</Text>
      
      <View style={styles.detalheItem}>
        <Text style={styles.detalheLabel}>Número do Pedido</Text>
        <Text style={styles.detalheValor}>{dadosCompra.pedidoId}</Text>
      </View>
      
      <View style={styles.detalheItem}>
        <Text style={styles.detalheLabel}>Valor Total</Text>
        <Text style={[styles.detalheValor, styles.valorDestaque]}>
          {formatarValor(dadosCompra.valor)}
        </Text>
      </View>
      
      <View style={styles.detalheItem}>
        <Text style={styles.detalheLabel}>Método de Pagamento</Text>
        <Text style={styles.detalheValor}>
          {getMetodoTexto(Array.isArray(dadosCompra.metodo) ? dadosCompra.metodo[0] : dadosCompra.metodo)}
          {dadosCompra.parcelas > 1 && ` (${dadosCompra.parcelas}x)`}
        </Text>
      </View>
      
      <View style={styles.detalheItem}>
        <Text style={styles.detalheLabel}>Data da Compra</Text>
        <Text style={styles.detalheValor}>{dadosCompra.dataCompra}</Text>
      </View>
      
      <View style={styles.detalheItem}>
        <Text style={styles.detalheLabel}>Status</Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusIndicator} />
          <Text style={styles.statusTexto}>Pagamento Aprovado</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderBotoes = () => (
    <Animated.View 
      style={[
        styles.botoesContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.botaoSecundario}
        onPress={() => router.push('/(tabs)/perfil')}
      >
        <Ionicons name="receipt" size={20} color="#48C9B0" />
        <Text style={styles.botaoSecundarioTexto}>Meus Pedidos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.botaoPrimario}
        onPress={() => router.push('/(tabs)/home')}
      >
        <Text style={styles.botaoPrimarioTexto}>Continuar Comprando</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {showConfetti && <Confetti count={60} duration={3000} />}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderDetalhesCompra()}
      </ScrollView>
      
      {renderBotoes()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#48C9B0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#48C9B0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#133E4E',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  detalhesContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#133E4E',
    marginBottom: 16,
  },
  detalheItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detalheLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detalheValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#133E4E',
    textAlign: 'right',
    flex: 1,
  },
  valorDestaque: {
    fontSize: 18,
    color: '#48C9B0',
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#48C9B0',
    marginRight: 8,
  },
  statusTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#48C9B0',
  },
  botoesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  botaoSecundario: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#48C9B0',
    backgroundColor: '#f0fffe',
  },
  botaoSecundarioTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#48C9B0',
    marginLeft: 8,
  },
  botaoPrimario: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#48C9B0',
  },
  botaoPrimarioTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
});