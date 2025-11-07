import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Confetti from '../components/Confetti';

const mensagemPrincipal = {
  titulo: 'Compra Finalizada!',
  subtitulo: 'Seu pedido foi confirmado com sucesso.',
  descricao:
    'Agora é só relaxar e acompanhar as atualizações na área de pedidos. Obrigado por confiar na Zentra!',
};

export default function CompraSucessoScreen() {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        bounciness: 12,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const confettiTimeout = setTimeout(() => setShowConfetti(false), 3200);
    return () => clearTimeout(confettiTimeout);
  }, [fadeAnim, scaleAnim, slideAnim]);

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={60} color="#fff" />
      </View>

      <Text style={styles.successTitle}>{mensagemPrincipal.titulo}</Text>
      <Text style={styles.successSubtitle}>{mensagemPrincipal.subtitulo}</Text>
    </Animated.View>
  );

  const renderMensagem = () => (
    <Animated.View
      style={[
        styles.mensagemContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.mensagemTitulo}>Tudo certo por aqui!</Text>
      <Text style={styles.mensagemDescricao}>{mensagemPrincipal.descricao}</Text>

      <View style={styles.mensagemLista}>
        <Ionicons name="checkmark-circle" size={20} color="#48C9B0" />
        <Text style={styles.mensagemItem}>Você receberá atualizações do pedido por e-mail.</Text>
      </View>
      <View style={styles.mensagemLista}>
        <Ionicons name="cube" size={20} color="#48C9B0" />
        <Text style={styles.mensagemItem}>O status pode ser consultado em "Meus Pedidos".</Text>
      </View>
      <View style={styles.mensagemLista}>
        <Ionicons name="time" size={20} color="#48C9B0" />
        <Text style={styles.mensagemItem}>Prazo de entrega estimado: 3 a 7 dias úteis.</Text>
      </View>
    </Animated.View>
  );

  const renderBotoes = () => (
    <Animated.View
      style={[
        styles.botoesContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
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
      {showConfetti && <Confetti count={60} duration={3200} />}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderMensagem()}
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
    paddingHorizontal: 16,
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
  mensagemContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  mensagemTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#133E4E',
    marginBottom: 12,
  },
  mensagemDescricao: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 16,
  },
  mensagemLista: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mensagemItem: {
    marginLeft: 12,
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
    flex: 1,
  },
  botoesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eef3f2',
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