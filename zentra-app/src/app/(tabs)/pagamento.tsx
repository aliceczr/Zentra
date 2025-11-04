import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  useCheckoutPagamento, 
  useCriarPagamento, 
  formatarValor,
  validarDadosPagamento,
  obterTextoMetodo
} from '../../hooks/hooksPagamento';
import { useCarrinhoCheckout, useListaCarrinho } from '../../hooks/hooksCarrinho';
import { useAuth } from '../../contexts/AuthContext';
import { useEnderecoCheckout } from '../../hooks/userEndereco';
import { MetodoPagamento, criarPedido, criarPagamento as criarPagamentoService, CriarPedido, CriarPagamento } from '../../services/pedidoService';

export default function PagamentoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    itens, 
    resumo, 
    podeFinalizarCompra,
    prepararCheckout
  } = useCarrinhoCheckout();
  
  const { limparTudo: limparCarrinho } = useListaCarrinho();
  
  const {
    temEnderecoEntrega,
    enderecoEntrega,
    enderecoFormatado
  } = useEnderecoCheckout();
  
  const {
    etapaAtual,
    metodoSelecionado,
    dadosPagamento,
    selecionarMetodo,
    definirDados,
    confirmar,
    reiniciar,
    voltarEtapa,
    podeConfirmar,
    isProcessando
  } = useCheckoutPagamento();

  // Estados para dados do pagamento
  const [metodoEscolhido, setMetodoEscolhido] = useState<MetodoPagamento>('CARTAO_CREDITO');
  const [parcelas, setParcelas] = useState(1);
  const [dadosCartao, setDadosCartao] = useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: '',
    cpf: ''
  });

  // Funções de formatação
  const formatarNumeroCartao = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    return numeros.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatarValidade = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length >= 2) {
      return numeros.slice(0, 2) + '/' + numeros.slice(2, 4);
    }
    return numeros;
  };

  const formatarCPF = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Removido: não mostrar alerta de carrinho vazio
  // O usuário já entende que precisa de itens para finalizar a compra

  const handleVoltarCarrinho = () => {
    router.back();
  };

  const handleSelecionarMetodo = (metodo: MetodoPagamento) => {
    setMetodoEscolhido(metodo);
    
    // Todos os métodos agora requerem dados do cartão
    setDadosCartao({
      numero: '',
      nome: '',
      validade: '',
      cvv: '',
      cpf: ''
    });
  };

  const handleConfirmarDados = () => {
    // Validar dados do cartão
    const { numero, nome, validade, cvv, cpf } = dadosCartao;
    
    if (!numero || !nome || !validade || !cvv || !cpf) {
      Alert.alert('Erro', 'Preencha todos os campos do cartão.');
      return;
    }
    
    definirDados({
      metodo_pagamento: metodoEscolhido,
      parcelas,
      dados_cartao: dadosCartao
    });
  };

  const handleFinalizarPagamento = async () => {
    try {
      // Verificar se tem endereço de entrega
      if (!temEnderecoEntrega) {
        Alert.alert(
          'Endereço de Entrega',
          'É necessário cadastrar um endereço de entrega para finalizar a compra.',
          [
            {
              text: 'Cadastrar Endereço',
              onPress: () => router.push('/endereco')
            },
            {
              text: 'Cancelar',
              style: 'cancel'
            }
          ]
        );
        return;
      }

      // Preparar dados do checkout
      const dadosCheckout = await prepararCheckout();
      
      // Verificar se temos usuário e endereço válidos
      if (!user?.id) {
        Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
        return;
      }
      
      if (!enderecoEntrega?.id) {
        Alert.alert('Erro', 'Endereço de entrega não encontrado.');
        return;
      }
      
      // Criar pedido primeiro para obter o pedido_id do banco
      const pedidoPayload: CriarPedido = {
        usuario_id: user.id, // UUID string diretamente
        endereco_id: enderecoEntrega.id, // UUID string diretamente
        itens: dadosCheckout.itens.map((i) => ({
          produto_id: i.produtoId,
          quantidade: i.quantidade,
          preco_unitario: i.precoUnitario,
        })),
        subtotal: resumo.valorTotal,
        taxa_entrega: 0,
        desconto: 0,
        total: resumo.valorTotal,
      };

      console.log('Criando pedido no backend...', pedidoPayload);
      const pedidoCriado = await criarPedido(pedidoPayload);
      console.log('Pedido criado:', pedidoCriado);

      // Criar dados do pagamento com o pedido real
      const dadosPagamentoFinal: CriarPagamento = {
        pedido_id: pedidoCriado.id,
        metodo_pagamento: metodoEscolhido,
        valor_pago: resumo.valorTotal,
        parcelas: metodoEscolhido === 'CARTAO_CREDITO' ? parcelas : 1,
        dados_pagamento: {
          ...dadosPagamento,
          itens_carrinho: dadosCheckout.itens,
          usuario_id: user?.id,
          endereco_entrega: enderecoEntrega
        }
      };

      // Validar dados
      const validacao = validarDadosPagamento(dadosPagamentoFinal);
      if (!validacao.valido) {
        Alert.alert('Erro de Validação', validacao.erros.join('\n'));
        return;
      }

      // Confirmar pagamento (usa a função do contexto que cria o pagamento)
      const pagamento = await confirmar(dadosPagamentoFinal);
      
      // Limpar carrinho após pagamento bem-sucedido
      console.log('🛒 Limpando carrinho após pagamento aprovado...');
      await limparCarrinho();
      
      // Sucesso - navegar para tela de confirmação
      router.push({
        pathname: '/compra-sucesso',
        params: {
          pedidoId: `ZEN-${pedidoCriado.id}`,
          valor: resumo.valorTotal.toString(),
          metodo: metodoEscolhido,
          parcelas: (metodoEscolhido === 'CARTAO_CREDITO' ? parcelas : 1).toString(),
        }
      });    } catch (error) {
      console.error('Erro ao finalizar pagamento:', error);
      Alert.alert(
        'Erro no Pagamento',
        'Não foi possível processar o pagamento. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderResumoCarrinho = () => (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>Resumo do Pedido</Text>
      
      {itens.slice(0, 3).map((item) => (
        <View key={item.produto.id} style={styles.itemResumo}>
          <Text style={styles.itemNome} numberOfLines={1}>
            {item.produto.nome}
          </Text>
          <Text style={styles.itemQuantidade}>
            {item.quantidade}x
          </Text>
          <Text style={styles.itemValor}>
            {formatarValor(item.precoTotal)}
          </Text>
        </View>
      ))}
      
      {itens.length > 3 && (
        <Text style={styles.maisItens}>
          ... e mais {itens.length - 3} itens
        </Text>
      )}
      
      <View style={styles.divisor} />
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValor}>
          {formatarValor(resumo.valorTotal)}
        </Text>
      </View>
    </View>
  );

  const renderMetodosPagamento = () => (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>Método de Pagamento</Text>
      
      {/* PIX removido - somente cartões */}

      <TouchableOpacity
        style={[
          styles.metodoItem,
          metodoEscolhido === 'CARTAO_CREDITO' && styles.metodoSelecionado
        ]}
        onPress={() => handleSelecionarMetodo('CARTAO_CREDITO')}
      >
        <Ionicons name="card" size={24} color="#133E4E" />
        <View style={styles.metodoInfo}>
          <Text style={styles.metodoNome}>Cartão de Crédito</Text>
          <Text style={styles.metodoDescricao}>
            Parcelamento em até 12x
          </Text>
        </View>
        <View style={styles.metodoRadio}>
          {metodoEscolhido === 'CARTAO_CREDITO' && (
            <View style={styles.metodoRadioSelecionado} />
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.metodoItem,
          metodoEscolhido === 'CARTAO_DEBITO' && styles.metodoSelecionado
        ]}
        onPress={() => handleSelecionarMetodo('CARTAO_DEBITO')}
      >
        <Ionicons name="card" size={24} color="#666" />
        <View style={styles.metodoInfo}>
          <Text style={styles.metodoNome}>Cartão de Débito</Text>
          <Text style={styles.metodoDescricao}>
            Desconto à vista
          </Text>
        </View>
        <View style={styles.metodoRadio}>
          {metodoEscolhido === 'CARTAO_DEBITO' && (
            <View style={styles.metodoRadioSelecionado} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderDadosCartao = () => {
    // PIX foi removido - todas as opções requerem dados do cartão

    return (
      <View style={styles.secao}>
        <Text style={styles.secaoTitulo}>Dados do Cartão</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Número do cartão"
          placeholderTextColor="#999"
          value={dadosCartao.numero}
          onChangeText={(text) => {
            const numeroFormatado = formatarNumeroCartao(text);
            setDadosCartao(prev => ({ ...prev, numero: numeroFormatado }));
          }}
          keyboardType="numeric"
          maxLength={19}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Nome do titular"
          placeholderTextColor="#999"
          value={dadosCartao.nome}
          onChangeText={(text) => setDadosCartao(prev => ({ ...prev, nome: text }))}
          autoCapitalize="words"
        />
        
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.inputMeio]}
            placeholder="MM/AA"
            placeholderTextColor="#999"
            value={dadosCartao.validade}
            onChangeText={(text) => {
              const validadeFormatada = formatarValidade(text);
              setDadosCartao(prev => ({ ...prev, validade: validadeFormatada }));
            }}
            keyboardType="numeric"
            maxLength={5}
          />
          
          <TextInput
            style={[styles.input, styles.inputMeio]}
            placeholder="CVV"
            placeholderTextColor="#999"
            value={dadosCartao.cvv}
            onChangeText={(text) => {
              const cvvLimpo = text.replace(/\D/g, '');
              setDadosCartao(prev => ({ ...prev, cvv: cvvLimpo }));
            }}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="CPF do titular"
          placeholderTextColor="#999"
          value={dadosCartao.cpf}
          onChangeText={(text) => {
            const cpfFormatado = formatarCPF(text);
            setDadosCartao(prev => ({ ...prev, cpf: cpfFormatado }));
          }}
          keyboardType="numeric"
          maxLength={14}
        />
        
        {metodoEscolhido === 'CARTAO_CREDITO' && (
          <View style={styles.parcelasContainer}>
            <Text style={styles.parcelasLabel}>Parcelas</Text>
            <View style={styles.parcelasOpcoes}>
              {[1, 2, 3, 6, 12].map((numParcelas) => (
                <TouchableOpacity
                  key={numParcelas}
                  style={[
                    styles.parcelaOpcao,
                    parcelas === numParcelas && styles.parcelaOpcaoSelecionada
                  ]}
                  onPress={() => setParcelas(numParcelas)}
                >
                  <Text style={[
                    styles.parcelaTexto,
                    parcelas === numParcelas && styles.parcelaTextoSelecionado
                  ]}>
                    {numParcelas === 1 ? 'À vista' : `${numParcelas}x`}
                  </Text>
                  <Text style={[
                    styles.parcelaValor,
                    parcelas === numParcelas && styles.parcelaValorSelecionado
                  ]}>
                    {numParcelas === 1 
                      ? formatarValor(resumo.valorTotal)
                      : formatarValor(resumo.valorTotal / numParcelas)
                    }
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  // PIX foi removido: apenas dados do cartão agora
  const renderPixInfo = () => null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleVoltarCarrinho} style={styles.voltarButton}>
            <Ionicons name="arrow-back" size={24} color="#133E4E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagamento</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderResumoCarrinho()}
          {renderMetodosPagamento()}
          {renderDadosCartao()}
          {renderPixInfo()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerLabel}>Total a pagar</Text>
            <Text style={styles.footerValor}>
              {formatarValor(resumo.valorTotal)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.finalizarButton,
              (!podeFinalizarCompra || isProcessando) && styles.finalizarButtonDisabled
            ]}
            onPress={handleFinalizarPagamento}
            disabled={!podeFinalizarCompra || isProcessando}
          >
            <Text style={styles.finalizarButtonText}>
              {isProcessando ? 'Processando...' : 'Finalizar Compra'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF6F6',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  voltarButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#133E4E',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  secao: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#133E4E',
    marginBottom: 12,
  },
  itemResumo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemNome: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemQuantidade: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
  },
  itemValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#133E4E',
  },
  maisItens: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
  divisor: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#133E4E',
  },
  totalValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#48C9B0',
  },
  metodoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  metodoSelecionado: {
    borderColor: '#48C9B0',
    backgroundColor: '#f0fffe',
  },
  metodoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  metodoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#133E4E',
  },
  metodoDescricao: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  metodoRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#48C9B0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metodoRadioSelecionado: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#48C9B0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputMeio: {
    width: '48%',
  },
  parcelasContainer: {
    marginTop: 16,
  },
  parcelasLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#133E4E',
    marginBottom: 8,
  },
  parcelasOpcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  parcelaOpcao: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  parcelaOpcaoSelecionada: {
    backgroundColor: '#48C9B0',
    borderColor: '#48C9B0',
  },
  parcelaTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#133E4E',
  },
  parcelaTextoSelecionado: {
    color: '#fff',
  },
  parcelaValor: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  parcelaValorSelecionado: {
    color: '#fff',
  },
  pixInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pixTexto: {
    flex: 1,
    marginLeft: 12,
  },
  pixTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#32BCAD',
    marginBottom: 4,
  },
  pixDescricao: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  },
  footerValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#133E4E',
  },
  finalizarButton: {
    backgroundColor: '#48C9B0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finalizarButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  finalizarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
