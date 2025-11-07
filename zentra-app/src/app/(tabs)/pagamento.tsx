import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useListaCarrinho } from '../../hooks/hooksCarrinho';
import { useAuth } from '../../contexts/AuthContext';
import { useEnderecoCheckout } from '../../hooks/userEndereco';
import { MercadoPagoButton } from '../../components/MercadoPagoButton';

export default function PagamentoScreen() {
  const router = useRouter();
  const { itens, resumo, valorTotalFormatado } = useListaCarrinho();
  const { user } = useAuth();
  const { enderecoEntrega } = useEnderecoCheckout();

  const handleVoltarCarrinho = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleVoltarCarrinho}
          style={styles.botaoVoltar}
        >
          <Ionicons name="arrow-back" size={24} color="#133E4E" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Finalizar Compra</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Resumo da Compra */}
        <View style={styles.resumoContainer}>
          <Text style={styles.resumoTitulo}>Resumo do Pedido</Text>
          
          {/* Lista de Produtos */}
          {itens.map((item) => (
            <View key={item.produto.id} style={styles.itemContainer}>
              <Image
                source={{
                  uri: item.produto.imagem_principal || 
                    'https://via.placeholder.com/60x60/48C9B0/FFFFFF?text=Produto'
                }}
                style={styles.itemImagem}
                resizeMode="contain"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemNome} numberOfLines={2}>
                  {item.produto.nome}
                </Text>
                <Text style={styles.itemQuantidade}>
                  Quantidade: {item.quantidade}
                </Text>
              </View>
              <Text style={styles.itemValor}>
                R$ {(item.produto.preco * item.quantidade).toFixed(2).replace('.', ',')}
              </Text>
            </View>
          ))}

          {/* Linha divisória */}
          <View style={styles.divider} />

          {/* Total */}
          <View style={styles.linhaTotal}>
            <Text style={styles.labelTotal}>Total</Text>
            <Text style={styles.valorTotal}>
              {valorTotalFormatado}
            </Text>
          </View>
        </View>

        {/* Informação sobre pagamento */}
        <View style={styles.infoContainer}>
          <Ionicons name="shield-checkmark" size={24} color="#48C9B0" />
          <Text style={styles.infoTexto}>
            Pagamento seguro processado pelo Mercado Pago
          </Text>
        </View>
      </ScrollView>

      {/* Footer com botão de pagamento */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Total a pagar</Text>
          <Text style={styles.footerValor}>{valorTotalFormatado}</Text>
        </View>
        <MercadoPagoButton 
          itensCarrinho={itens}
          dadosUsuario={user}
          enderecoEntrega={enderecoEntrega}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF6F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#133E4E',
    fontFamily: 'PoppinsBold',
  },
  scrollView: {
    flex: 1,
  },
  resumoContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  resumoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#133E4E',
    marginBottom: 16,
    fontFamily: 'PoppinsBold',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImagem: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemNome: {
    fontSize: 14,
    color: '#133E4E',
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'NunitoRegular',
  },
  itemQuantidade: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoRegular',
  },
  itemValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#48C9B0',
    fontFamily: 'PoppinsSemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  linhaResumo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  labelResumo: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoRegular',
  },
  valorResumo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#133E4E',
    fontFamily: 'NunitoRegular',
  },
  linhaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  labelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#133E4E',
    fontFamily: 'PoppinsBold',
  },
  valorTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#48C9B0',
    fontFamily: 'PoppinsBold',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#48C9B0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoTexto: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoRegular',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'NunitoRegular',
  },
  footerValor: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#133E4E',
    fontFamily: 'PoppinsBold',
  },
});
