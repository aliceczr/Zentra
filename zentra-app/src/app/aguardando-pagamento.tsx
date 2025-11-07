import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mercadoPagoService } from '../services/mercadoPagoService';



export default function AguardandoPagamento() {
  const { preferenceId, pedidoId } = useLocalSearchParams<{
    preferenceId: string;
    pedidoId: string;
  }>();

  const [status, setStatus] = useState<'checking' | 'approved' | 'rejected' | 'pending' | 'cancelled'>('checking');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  
  const verificarStatus = async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log('🔍 Verificando status da preferência:', preferenceId);

      // Consultar preferência para obter informações de pagamento
      const preferencia = await mercadoPagoService.consultarPreferencia(preferenceId);
      
      if (preferencia && preferencia.payments && preferencia.payments.length > 0) {
        const ultimoPagamento = preferencia.payments[preferencia.payments.length - 1];
        console.log('💳 Status do pagamento:', ultimoPagamento.status);
        
        setStatus(ultimoPagamento.status);
        
        // Auto-navegar baseado no status
        if (ultimoPagamento.status === 'approved') {
          setTimeout(() => {
            router.replace({
              pathname: '/compra-sucesso',
              params: { pedidoId }
            });
          }, 2000);
        } else if (ultimoPagamento.status === 'rejected' || ultimoPagamento.status === 'cancelled') {
          setTimeout(() => {
            router.replace('../pagamento');
          }, 3000);
        }
      } else {
        // Se não há pagamentos ainda, continuar verificando
        setStatus('pending');
      }

    } catch (error: any) {
      console.error('❌ Erro ao verificar status:', error);
      setErro(error.message || 'Erro ao verificar pagamento');
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (!preferenceId) {
      Alert.alert('Erro', 'ID da preferência não encontrado');
      router.back();
      return;
    }

    // Verificação inicial
    verificarStatus();

    // Polling a cada 5 segundos
    const interval = setInterval(() => {
      if (status === 'checking' || status === 'pending') {
        verificarStatus();
      }
    }, 5000);

    // Timeout de 10 minutos
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (status === 'checking' || status === 'pending') {
        Alert.alert(
          'Tempo Esgotado',
          'A verificação de pagamento expirou. Verifique seu histórico.',
          [
            { text: 'OK', onPress: () => router.replace('/historico') }
          ]
        );
      }
    }, 10 * 60 * 1000); // 10 minutos

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [preferenceId, status]);



  const renderStatusContent = () => {
    switch (status) {
      case 'checking':
      case 'pending':
        return (
          <>
            <ActivityIndicator size="large" color="#009EE3" />
            <Text style={styles.title}>Verificando Pagamento...</Text>
            <Text style={styles.subtitle}>
              Aguarde enquanto confirmamos seu pagamento no Mercado Pago
            </Text>
            <View style={styles.dotsContainer}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, styles.dotActive]} />
            </View>
          </>
        );

      case 'approved':
        return (
          <>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            <Text style={styles.title}>Pagamento Aprovado! 🎉</Text>
            <Text style={styles.subtitle}>
              Redirecionando para confirmação...
            </Text>
          </>
        );

      case 'rejected':
        return (
          <>
            <Ionicons name="close-circle" size={80} color="#EF4444" />
            <Text style={styles.title}>Pagamento Rejeitado</Text>
            <Text style={styles.subtitle}>
              Seu pagamento foi rejeitado. Tente novamente.
            </Text>
          </>
        );

      case 'cancelled':
        return (
          <>
            <Ionicons name="ban" size={80} color="#F59E0B" />
            <Text style={styles.title}>Pagamento Cancelado</Text>
            <Text style={styles.subtitle}>
              O pagamento foi cancelado. Redirecionando...
            </Text>
          </>
        );

      default:
        return (
          <>
            <Ionicons name="help-circle" size={80} color="#6B7280" />
            <Text style={styles.title}>Status Desconhecido</Text>
            <Text style={styles.subtitle}>
              Não foi possível determinar o status do pagamento
            </Text>
          </>
        );
    }
  };

  if (erro) {
    return (
      <View style={styles.container}>
        <Ionicons name="alert-circle" size={80} color="#EF4444" />
        <Text style={styles.title}>Erro na Verificação</Text>
        <Text style={styles.subtitle}>{erro}</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('../pagamento')}
        >
          <Text style={styles.buttonText}>Voltar ao Pagamento</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderStatusContent()}
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Pedido:</Text>
        <Text style={styles.infoValue}>#{pedidoId}</Text>
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.replace('/historico')}
      >
        <Text style={styles.secondaryButtonText}>Ver Histórico</Text>
      </TouchableOpacity>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#009EE3',
  },
  infoContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#009EE3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: '#009EE3',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});