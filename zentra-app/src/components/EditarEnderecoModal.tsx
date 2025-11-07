import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEndereco } from '../hooks/userEndereco';

// ============================================================================
// 🏠 MODAL PARA EDITAR ENDEREÇO
// ============================================================================

interface EditarEnderecoModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditarEnderecoModal({ 
  visible, 
  onClose, 
  onSuccess 
}: EditarEnderecoModalProps) {
  const { 
    enderecoPrincipal, 
    loading: loadingEndereco, 
    atualizar, 
    criar,
    recarregar,
    validar 
  } = useEndereco();

  // Estados do formulário
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [referencia, setReferencia] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // ============================================================================
  // 🔄 EFEITOS
  // ============================================================================
  useEffect(() => {
    if (visible) {
      if (enderecoPrincipal) {
        // Carregar dados do endereço existente
        setCep(enderecoPrincipal.cep || '');
        setLogradouro(enderecoPrincipal.logradouro || '');
        setNumero(enderecoPrincipal.numero || '');
        setComplemento(enderecoPrincipal.complemento || '');
        setBairro(enderecoPrincipal.bairro || '');
        setCidade(enderecoPrincipal.cidade || '');
        setEstado(enderecoPrincipal.estado || '');
        setReferencia(enderecoPrincipal.referencia || '');
      } else {
        // Limpar campos para novo endereço
        limparFormulario();
      }
      setErrors([]);
    }
  }, [visible, enderecoPrincipal]);

  // ============================================================================
  // 🧹 LIMPAR FORMULÁRIO
  // ============================================================================
  const limparFormulario = () => {
    setCep('');
    setLogradouro('');
    setNumero('');
    setComplemento('');
    setBairro('');
    setCidade('');
    setEstado('');
    setReferencia('');
  };

  // ============================================================================
  // 📍 FORMATAÇÃO DE CEP
  // ============================================================================
  const formatarCep = (texto: string) => {
    // Remove tudo que não é número
    const numeros = texto.replace(/\D/g, '');
    
    // Aplica máscara 99999-999
    if (numeros.length <= 8) {
      return numeros.replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    return cep; // Não permite mais que 8 dígitos
  };

  const handleCepChange = (texto: string) => {
    const cepFormatado = formatarCep(texto);
    setCep(cepFormatado);
  };

  // ============================================================================
  // 🔍 BUSCAR CEP
  // ============================================================================
  const buscarCep = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      Alert.alert('CEP Inválido', 'Digite um CEP válido com 8 dígitos');
      return;
    }

    setLoadingCep(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        Alert.alert('CEP não encontrado', 'Verifique o CEP digitado');
        return;
      }

      // Preencher campos automaticamente
      setLogradouro(data.logradouro || '');
      setBairro(data.bairro || '');
      setCidade(data.localidade || '');
      setEstado(data.uf || '');
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      Alert.alert('Erro', 'Não foi possível buscar o CEP. Verifique sua conexão.');
    } finally {
      setLoadingCep(false);
    }
  };

  // ============================================================================
  // ✅ VALIDAÇÃO
  // ============================================================================
  const validarFormulario = () => {
    const erros: string[] = [];

    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      erros.push('CEP deve ter 8 dígitos');
    }

    if (!logradouro.trim()) {
      erros.push('Logradouro é obrigatório');
    }

    if (!numero.trim()) {
      erros.push('Número é obrigatório');
    }

    if (!bairro.trim()) {
      erros.push('Bairro é obrigatório');
    }

    if (!cidade.trim()) {
      erros.push('Cidade é obrigatória');
    }

    if (!estado.trim()) {
      erros.push('Estado é obrigatório');
    }

    setErrors(erros);
    return erros.length === 0;
  };

  // ============================================================================
  // 💾 SALVAR ENDERECO
  // ============================================================================
  const handleSalvar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    
    try {
      const dadosEndereco = {
        tipo: 'residencial',
        cep: cep.replace(/\D/g, ''), // Remove formatação
        logradouro: logradouro.trim(),
        numero: numero.trim(),
        complemento: complemento.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
        pais: 'Brasil',
        referencia: referencia.trim(),
        principal: true, // Sempre principal (só temos 1 endereço)
      };

      let sucesso = false;

      if (enderecoPrincipal?.id) {
        // Atualizar endereço existente
        sucesso = await atualizar(enderecoPrincipal.id, dadosEndereco);
      } else {
        // Criar novo endereço
        sucesso = await criar(dadosEndereco);
      }

      if (sucesso) {
        await recarregar(); // Recarregar dados
        
        Alert.alert(
          'Sucesso!',
          enderecoPrincipal?.id ? 
            'Endereço atualizado com sucesso.' : 
            'Endereço cadastrado com sucesso.',
          [
            {
              text: 'OK',
              onPress: () => {
                onSuccess?.();
                onClose();
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o endereço.');
      }

    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível salvar o endereço.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // 🚫 CANCELAR
  // ============================================================================
  const handleCancelar = () => {
    Alert.alert(
      'Cancelar Edição',
      'Tem certeza que deseja cancelar? As alterações serão perdidas.',
      [
        { text: 'Continuar Editando', style: 'cancel' },
        { 
          text: 'Cancelar', 
          style: 'destructive',
          onPress: onClose 
        }
      ]
    );
  };

  // ============================================================================
  // 🎨 RENDER
  // ============================================================================
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancelar}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancelar} style={styles.headerButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {enderecoPrincipal?.id ? 'Editar Endereço' : 'Cadastrar Endereço'}
          </Text>
          
          <TouchableOpacity 
            onPress={handleSalvar} 
            style={[styles.headerButton, loading && styles.headerButtonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#48C9B0" />
            ) : (
              <Text style={styles.salvarText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Título da Seção */}
          <View style={styles.sectionHeader}>
            <Ionicons name="home-outline" size={20} color="#48C9B0" />
            <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
          </View>

          {/* Erros de Validação */}
          {errors.length > 0 && (
            <View style={styles.errorContainer}>
              {errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>
                  • {error}
                </Text>
              ))}
            </View>
          )}

          {/* Campo CEP */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>CEP *</Text>
            <View style={styles.cepContainer}>
              <TextInput
                style={[styles.textInput, styles.cepInput]}
                value={cep}
                onChangeText={handleCepChange}
                placeholder="99999-999"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={9}
              />
              <TouchableOpacity 
                style={[styles.buscarCepButton, loadingCep && styles.buttonDisabled]}
                onPress={buscarCep}
                disabled={loadingCep || cep.replace(/\D/g, '').length !== 8}
              >
                {loadingCep ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="search" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldHint}>
              Digite o CEP e toque na lupa para buscar automaticamente
            </Text>
          </View>

          {/* Campo Logradouro */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Logradouro *</Text>
            <TextInput
              style={styles.textInput}
              value={logradouro}
              onChangeText={setLogradouro}
              placeholder="Rua, Avenida, Travessa..."
              placeholderTextColor="#999"
              autoCapitalize="words"
            />
          </View>

          {/* Número e Complemento */}
          <View style={styles.rowContainer}>
            <View style={[styles.fieldContainer, styles.flexField]}>
              <Text style={styles.fieldLabel}>Número *</Text>
              <TextInput
                style={styles.textInput}
                value={numero}
                onChangeText={setNumero}
                placeholder="123"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.fieldContainer, styles.flexField, styles.fieldMarginLeft]}>
              <Text style={styles.fieldLabel}>Complemento</Text>
              <TextInput
                style={styles.textInput}
                value={complemento}
                onChangeText={setComplemento}
                placeholder="Apto, Bloco..."
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Campo Bairro */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Bairro *</Text>
            <TextInput
              style={styles.textInput}
              value={bairro}
              onChangeText={setBairro}
              placeholder="Nome do bairro"
              placeholderTextColor="#999"
              autoCapitalize="words"
            />
          </View>

          {/* Cidade e Estado */}
          <View style={styles.rowContainer}>
            <View style={[styles.fieldContainer, styles.flexField]}>
              <Text style={styles.fieldLabel}>Cidade *</Text>
              <TextInput
                style={styles.textInput}
                value={cidade}
                onChangeText={setCidade}
                placeholder="Nome da cidade"
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
            </View>
            
            <View style={[styles.fieldContainer, styles.fieldMarginLeft]}>
              <Text style={styles.fieldLabel}>Estado *</Text>
              <TextInput
                style={[styles.textInput, styles.estadoInput]}
                value={estado}
                onChangeText={(text) => setEstado(text.toUpperCase())}
                placeholder="SP"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>
          </View>

          {/* Campo Referência */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Ponto de Referência</Text>
            <TextInput
              style={styles.textInput}
              value={referencia}
              onChangeText={setReferencia}
              placeholder="Próximo ao mercado, em frente à escola..."
              placeholderTextColor="#999"
              autoCapitalize="sentences"
              multiline
              numberOfLines={2}
            />
            <Text style={styles.fieldHint}>
              Ajude o entregador a encontrar seu endereço
            </Text>
          </View>

          {/* Informações */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#48C9B0" />
            <Text style={styles.infoText}>
              Este endereço será usado para todas as suas entregas. Certifique-se de que as informações estão corretas.
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    padding: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#133E4E',
  },
  salvarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#48C9B0',
  },

  // Conteúdo
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#133E4E',
    marginLeft: 8,
  },

  // Erros
  errorContainer: {
    backgroundColor: '#fff2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    padding: 12,
    marginBottom: 20,
    borderRadius: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 4,
  },

  // Campos
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#133E4E',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  fieldHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  // CEP
  cepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cepInput: {
    flex: 1,
    marginRight: 12,
  },
  buscarCepButton: {
    backgroundColor: '#48C9B0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },

  // Layout em linha
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flexField: {
    flex: 1,
  },
  fieldMarginLeft: {
    marginLeft: 12,
  },
  estadoInput: {
    width: 80,
  },

  // Info
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f8f8',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 12,
    color: '#48C9B0',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});