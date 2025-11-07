import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMercadoPago } from '../hooks/useMercadoPago';


const styles = {
  button: {
    backgroundColor: '#009EE3',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#009EE3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
};

// ============================================================================
// 🧩 COMPONENTE SIMPLES
// ============================================================================

interface MercadoPagoButtonProps {
  itensCarrinho: any[];
  dadosUsuario: any;
  enderecoEntrega: any; // ✅ Agora é obrigatório o endereço
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  title?: string;
}

export function MercadoPagoButton({
  itensCarrinho,
  dadosUsuario,
  enderecoEntrega, // ✅ Agora recebe endereço
  onSuccess,
  onError,
  disabled = false,
  title = 'Pagar com Mercado Pago',
}: MercadoPagoButtonProps) {
  
  const { loading, pagarComMercadoPago } = useMercadoPago();

  const handlePagamento = async () => {
    try {
      const sucesso = await pagarComMercadoPago(
        itensCarrinho,
        dadosUsuario,
        enderecoEntrega // ✅ Passa o endereço
      );

      if (sucesso) {
        onSuccess?.();
      } else {
        onError?.('Falha ao iniciar pagamento');
      }
    } catch (error: any) {
      onError?.(error.message || 'Erro no pagamento');
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
      ]}
      onPress={handlePagamento}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.text}>Processando...</Text>
        </>
      ) : (
        <>
          <Ionicons name="card" size={20} color="#FFFFFF" />
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}


export function MercadoPagoPixButton(props: Omit<MercadoPagoButtonProps, 'title'>) {
  return (
    <MercadoPagoButton 
      {...props} 
      title="Pagar com PIX 🚀"
    />
  );
}

export default MercadoPagoButton;