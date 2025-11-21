import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
} from 'react-native';
import { TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useListaCarrinho } from '../../hooks/hooksCarrinho';
import { useAuth } from '../../contexts/AuthContext';
import { useEnderecoCheckout } from '../../hooks/userEndereco';
import { criarPedido, buscarPedidoPorId } from '../../services/pedidoService';
import { criarPagamento } from '../../services/pagamentoService';

type ResumoCompra = {
  codigo_pedido: string;
  total: number;
  endereco_entrega: string;
};

export default function PagamentoScreen() {
 
  function formatarValidade(val: string) {
    const limpo = val.replace(/\D/g, '').slice(0, 4);
    if (limpo.length <= 2) return limpo;
    return limpo.slice(0, 2) + '/' + limpo.slice(2);
  }
  const [cartao, setCartao] = React.useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: '',
  });

  function formatarNumeroCartao(numero: string) {
    return numero.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
  }
  const [metodoPagamento, setMetodoPagamento] = React.useState<'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO'>('CARTAO_CREDITO');
  const router = useRouter();
  const { itens, resumo, valorTotalFormatado } = useListaCarrinho();
  const { user } = useAuth();
  const { enderecoEntrega } = useEnderecoCheckout();
  const [resumoCompra, setResumoCompra] = React.useState<ResumoCompra | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState('');
  const [modalVisible, setModalVisible] = React.useState(false);
  const [paymentError, setPaymentError] = React.useState<string | null>(null);

  const [simulateStatus, setSimulateStatus] = React.useState<'NONE' | 'APROVADO' | 'RECUSADO'>('APROVADO');

 
  async function processPayment() {
    setLoading(true);
    setErro('');
    setPaymentError(null);
    try {

      if (!user || !user.id) throw new Error('Usuário não encontrado');
      if (!enderecoEntrega || !enderecoEntrega.id) throw new Error('Endereço não encontrado');

      const validacaoCartao = validarCartaoCampos();
      if (!validacaoCartao.valido) {
        setErro(validacaoCartao.erros.join('. '));
        setLoading(false);
        return;
      }

    
      const pedido = await criarPedido({
        usuario_id: user.id,
        endereco_id: enderecoEntrega.id,
        itens: itens.map(item => ({
          produto_id: item.produto.id,
          quantidade: item.quantidade,
          preco_unitario: item.produto.preco,
        })),
        subtotal: resumo.valorTotal,
        taxa_entrega: 0,
        desconto: 0,
        total: resumo.valorTotal,
        observacoes: '',
        tempo_estimado_entrega: 30,
      });

      const pagamentoPayload = {
        pedido_id: pedido.id,
       
        status: simulateStatus === 'NONE' ? 'PENDENTE' : simulateStatus,
        status_detail: metodoPagamento,
        valor_pago: pedido.total,
      } as any;

      const pagamentoCriado = await criarPagamento(pagamentoPayload as any);


      const statusRetorno = ((pagamentoCriado as any).status_pagamento || (pagamentoCriado as any).status || '').toString().toUpperCase();


      if (statusRetorno !== 'APROVADO' && statusRetorno !== 'PAGO' && statusRetorno !== 'APPROVED') {
        const detalhe = (pagamentoCriado as any).status_detail || (pagamentoCriado as any).metodo_pagamento || null;
        setPaymentError(detalhe ? `Pagamento recusado: ${detalhe}` : 'Pagamento recusado. Tente outro método.');
        setModalVisible(true);
        setLoading(false);
        return;
      }

  
      const pedidoCompleto = await buscarPedidoPorId(pedido.id);
      if (!pedidoCompleto) throw new Error('Pedido não encontrado');

 
      router.push('/compra-sucesso');

    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      setErro(err instanceof Error ? err.message : 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }


  function handleTryAgain() {
    setModalVisible(false);
    processPayment();
  }

  function handleChooseOther() {
    setModalVisible(false);

  }

  function validarCartaoCampos(): { valido: boolean; erros: string[] } {
    const erros: string[] = [];
    const numeroLimpo = cartao.numero.replace(/\D/g, '');

 
    if (metodoPagamento === 'CARTAO_CREDITO' || metodoPagamento === 'CARTAO_DEBITO') {
      if (!numeroLimpo || numeroLimpo.length < 13) {
        erros.push('Número do cartão inválido');
      }

      if (!cartao.nome || cartao.nome.trim().length < 2) {
        erros.push('Nome do titular é obrigatório');
      }


      const validade = (cartao.validade || '').replace(/\s/g, '');
      if (!/^\d{2}\/\d{2}$/.test(validade)) {
        erros.push('Validade deve ter o formato MM/AA');
      } else {
        const [mm, aa] = validade.split('/').map(s => parseInt(s, 10));
        if (isNaN(mm) || mm < 1 || mm > 12) {
          erros.push('Mês da validade inválido');
        }

      }

      const cvvLimpo = (cartao.cvv || '').replace(/\D/g, '');
      if (!cvvLimpo || (cvvLimpo.length !== 3 && cvvLimpo.length !== 4)) {
        erros.push('CVV inválido');
      }
    }

    return { valido: erros.length === 0, erros };
  }

  const handleVoltarCarrinho = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
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
        {/* Modal de pagamento recusado */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Pagamento recusado</Text>
              <Text style={styles.modalText}>{paymentError || 'Seu pagamento foi recusado. Por favor, tente outro método.'}</Text>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleTryAgain}>
                  <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>Tentar novamente</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalButton} onPress={handleChooseOther}>
                  <Text style={styles.modalButtonText}>Escolher outro método</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 32}}>
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
          {/* Footer com método de pagamento e botão */}
          <View style={styles.footer}>
            <View style={styles.footerInfo}>
              <Text style={styles.footerLabel}>Total a pagar</Text>
              <Text style={styles.footerValor}>{valorTotalFormatado}</Text>
            </View>
            {/* Seletor de método de pagamento */}
            {!resumoCompra && (
              <View style={{marginBottom: 16}}>
                <Text style={{fontWeight: 'bold', marginBottom: 8}}>Escolha o método de pagamento:</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: metodoPagamento === 'CARTAO_CREDITO' ? '#48C9B0' : '#eee',
                      padding: 10,
                      borderRadius: 8,
                      marginRight: 8,
                      alignItems: 'center',
                    }}
                    onPress={() => setMetodoPagamento('CARTAO_CREDITO')}
                  >
                    <Text style={{color: metodoPagamento === 'CARTAO_CREDITO' ? '#fff' : '#133E4E'}}>Cartão de Crédito</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: metodoPagamento === 'CARTAO_DEBITO' ? '#48C9B0' : '#eee',
                      padding: 10,
                      borderRadius: 8,
                      marginRight: 8,
                      alignItems: 'center',
                    }}
                    onPress={() => setMetodoPagamento('CARTAO_DEBITO')}
                  >
                    <Text style={{color: metodoPagamento === 'CARTAO_DEBITO' ? '#fff' : '#133E4E'}}>Cartão de Débito</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: metodoPagamento === 'DINHEIRO' ? '#48C9B0' : '#eee',
                      padding: 10,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                    onPress={() => setMetodoPagamento('DINHEIRO')}
                  >
                    <Text style={{color: metodoPagamento === 'DINHEIRO' ? '#fff' : '#133E4E'}}>Dinheiro</Text>
                  </TouchableOpacity>
                </View>
                {/* Campos do cartão se selecionado */}
                {(metodoPagamento === 'CARTAO_CREDITO' || metodoPagamento === 'CARTAO_DEBITO') && (
                  <View style={{marginTop: 16}}>
                    <Text style={{fontWeight: 'bold', marginBottom: 8}}>Dados do Cartão</Text>
                    <View style={{marginBottom: 8}}>
                      <Text>Número do cartão</Text>
                      <View style={{borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginTop: 4}}>
                        <TextInput
                          style={{padding: 8}}
                          keyboardType="numeric"
                          maxLength={19}
                          placeholder="0000 0000 0000 0000"
                          value={formatarNumeroCartao(cartao.numero)}
                          onChangeText={(v: string) => setCartao(c => ({...c, numero: v.replace(/\D/g, '').slice(0,16)}))}
                        />
                      </View>
                    </View>
                    <View style={{marginBottom: 8}}>
                      <Text>Nome do titular</Text>
                      <View style={{borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginTop: 4}}>
                        <TextInput
                          style={{padding: 8}}
                          placeholder="Nome impresso no cartão"
                          value={cartao.nome}
                          onChangeText={(v: string) => setCartao(c => ({...c, nome: v}))}
                        />
                      </View>
                    </View>
                    <View style={{flexDirection: 'row', gap: 8}}>
                      <View style={{flex: 1}}>
                        <Text>Validade</Text>
                        <View style={{borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginTop: 4}}>
                          <TextInput
                            style={{padding: 8}}
                            placeholder="MM/AA"
                            maxLength={5}
                            value={formatarValidade(cartao.validade)}
                            onChangeText={(v: string) => setCartao(c => ({...c, validade: formatarValidade(v)}))}
                          />
                        </View>
                      </View>
                      <View style={{flex: 1}}>
                        <Text>CVV</Text>
                        <View style={{borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginTop: 4}}>
                          <TextInput
                            style={{padding: 8}}
                            keyboardType="numeric"
                            maxLength={4}
                            placeholder="CVV"
                            value={cartao.cvv}
                            onChangeText={(v: string) => setCartao(c => ({...c, cvv: v}))}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
            {resumoCompra ? (
              <View style={{alignItems: 'center', marginTop: 16}}>
                <Text style={{fontSize: 18, color: '#133E4E', fontWeight: 'bold'}}>Compra realizada com sucesso!</Text>
                <Text style={{marginTop: 8}}>Resumo:</Text>
                <Text style={{marginTop: 4}}>Pedido: {resumoCompra.codigo_pedido}</Text>
                <Text>Total: R$ {resumoCompra.total.toFixed(2).replace('.', ',')}</Text>
                <Text>Entrega: {resumoCompra.endereco_entrega}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: loading ? '#ccc' : '#48C9B0',
                  paddingVertical: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 8,
                }}
                disabled={loading}
                onPress={() => processPayment()}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
                  {loading ? 'Processando...' : 'Pagar agora'}
                </Text>
              </TouchableOpacity>
            )}
            {!!erro && <Text style={{color: 'red', marginTop: 8}}>{erro}</Text>}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#133E4E',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#48C9B0',
  },
  modalButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonPrimaryText: {
    color: '#fff',
  },
});
