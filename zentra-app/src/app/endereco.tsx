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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  useCriarEndereco, 
  useBuscarCEP, 
  formatarCEP,
  validarCEP,
  obterTextoTipo 
} from '../hooks/userEndereco';

export default function EnderecoScreen() {
  const router = useRouter();
  const {
    formData,
    loading: salvandoEndereco,
    error,
    atualizarCampo,
    limparFormulario,
    criar,
    limparErro,
    podeSubmeter,
  } = useCriarEndereco();

  const {
    buscarCEP,
    loading: buscandoCEP,
    error: erroCEP,
    limparErro: limparErroCEP,
  } = useBuscarCEP();

  const [cepBuscado, setCepBuscado] = useState(false);

  const tiposEndereco = [
    { valor: 'residencial', label: 'Residencial', icone: 'home' },
    { valor: 'comercial', label: 'Comercial', icone: 'business' },
    { valor: 'trabalho', label: 'Trabalho', icone: 'briefcase' },
    { valor: 'outro', label: 'Outro', icone: 'location' },
  ] as const;

  const handleBuscarCEP = async () => {
    if (!validarCEP(formData.cep)) {
      Alert.alert('Erro', 'CEP deve ter 8 dígitos');
      return;
    }

    limparErroCEP();
    const dadosEndereco = await buscarCEP(formData.cep);
    
    if (dadosEndereco) {
      atualizarCampo('logradouro', dadosEndereco.logradouro);
      atualizarCampo('bairro', dadosEndereco.bairro);
      atualizarCampo('cidade', dadosEndereco.cidade);
      atualizarCampo('estado', dadosEndereco.estado);
      setCepBuscado(true);
    }
  };

  const handleSalvarEndereco = async () => {
    limparErro();
    const sucesso = await criar();
    
    if (sucesso) {
      Alert.alert(
        'Endereço Cadastrado!',
        'Seu endereço foi cadastrado com sucesso.',
        [
          {
            text: 'Continuar',
            onPress: () => router.back()
          }
        ]
      );
    }
  };

  const renderTipoEndereco = () => (
    <View style={[styles.secao, styles.firstSection]}>
      <Text style={styles.secaoTitulo}>Tipo de Endereço</Text>
      <View style={styles.tiposContainer}>
        {tiposEndereco.map((tipo) => (
          <TouchableOpacity
            key={tipo.valor}
            style={[
              styles.tipoItem,
              formData.tipo === tipo.valor && styles.tipoSelecionado
            ]}
            onPress={() => atualizarCampo('tipo', tipo.valor)}
          >
            <Ionicons 
              name={tipo.icone as any} 
              size={20} 
              color={formData.tipo === tipo.valor ? '#fff' : '#48C9B0'} 
            />
            <Text style={[
              styles.tipoTexto,
              formData.tipo === tipo.valor && styles.tipoTextoSelecionado
            ]}>
              {tipo.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCEP = () => (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>CEP</Text>
      
      <View style={styles.cepContainer}>
        <TextInput
          style={[styles.input, styles.cepInput]}
          placeholder="00000-000"
          placeholderTextColor="#999"
          value={formatarCEP(formData.cep)}
          onChangeText={(text) => {
            const cepLimpo = text.replace(/[^\d]/g, '');
            atualizarCampo('cep', cepLimpo);
            setCepBuscado(false);
          }}
          keyboardType="numeric"
          maxLength={9}
        />
        
        <TouchableOpacity
          style={[
            styles.buscarCepButton,
            (!validarCEP(formData.cep) || buscandoCEP) && styles.buscarCepButtonDisabled
          ]}
          onPress={handleBuscarCEP}
          disabled={!validarCEP(formData.cep) || buscandoCEP}
        >
          {buscandoCEP ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="search" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      
      {erroCEP && (
        <Text style={styles.errorText}>{erroCEP}</Text>
      )}
    </View>
  );

  const renderEndereco = () => (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>Endereço</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Logradouro (Rua, Avenida, etc.)"
        placeholderTextColor="#999"
        value={formData.logradouro}
        onChangeText={(text) => atualizarCampo('logradouro', text)}
        editable={!buscandoCEP}
      />
      
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.inputNumero]}
          placeholder="Número"
          placeholderTextColor="#999"
          value={formData.numero}
          onChangeText={(text) => atualizarCampo('numero', text)}
          keyboardType="numeric"
        />
        
        <TextInput
          style={[styles.input, styles.inputComplemento]}
          placeholder="Complemento (opcional)"
          placeholderTextColor="#999"
          value={formData.complemento}
          onChangeText={(text) => atualizarCampo('complemento', text)}
        />
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Bairro"
        placeholderTextColor="#999"
        value={formData.bairro}
        onChangeText={(text) => atualizarCampo('bairro', text)}
        editable={!buscandoCEP}
      />
      
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.inputCidade]}
          placeholder="Cidade"
          placeholderTextColor="#999"
          value={formData.cidade}
          onChangeText={(text) => atualizarCampo('cidade', text)}
          editable={!buscandoCEP}
        />
        
        <TextInput
          style={[styles.input, styles.inputEstado]}
          placeholder="Estado (UF)"
          placeholderTextColor="#999"
          value={formData.estado}
          onChangeText={(text) => atualizarCampo('estado', text.toUpperCase())}
          maxLength={2}
          autoCapitalize="characters"
          editable={!buscandoCEP}
        />
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Referência (opcional)"
        placeholderTextColor="#999"
        value={formData.referencia}
        onChangeText={(text) => atualizarCampo('referencia', text)}
        multiline
        numberOfLines={2}
      />
    </View>
  );

  const renderOpcoes = () => (
    <View style={styles.secao}>
      <TouchableOpacity
        style={styles.principalContainer}
        onPress={() => atualizarCampo('principal', !formData.principal)}
      >
        <View style={styles.principalCheckbox}>
          {formData.principal && (
            <Ionicons name="checkmark" size={16} color="#fff" />
          )}
        </View>
        <Text style={styles.principalTexto}>
          Definir como endereço principal
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.voltarButton}>
            <Ionicons name="arrow-back" size={24} color="#133E4E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Endereço</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderTipoEndereco()}
          {renderCEP()}
          {renderEndereco()}
          {renderOpcoes()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          <TouchableOpacity
            style={[
              styles.salvarButton,
              (!podeSubmeter || salvandoEndereco) && styles.salvarButtonDisabled
            ]}
            onPress={handleSalvarEndereco}
            disabled={!podeSubmeter || salvandoEndereco}
          >
            {salvandoEndereco ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.salvarButtonText}>Salvar Endereço</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: '#EAF6F6',
  },
  firstSection: {
    marginTop: 8,
  },
  secao: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
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
  tiposContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0fffe',
    borderWidth: 1,
    borderColor: '#48C9B0',
    minWidth: 100,
  },
  tipoSelecionado: {
    backgroundColor: '#48C9B0',
  },
  tipoTexto: {
    marginLeft: 6,
    fontSize: 14,
    color: '#48C9B0',
    fontWeight: '500',
  },
  tipoTextoSelecionado: {
    color: '#fff',
  },
  cepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cepInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  buscarCepButton: {
    backgroundColor: '#48C9B0',
    borderRadius: 8,
    padding: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buscarCepButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
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
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inputNumero: {
    flex: 1,
  },
  inputComplemento: {
    flex: 2,
  },
  inputCidade: {
    flex: 2,
  },
  inputEstado: {
    flex: 1,
  },
  principalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  principalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#48C9B0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  principalTexto: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  salvarButton: {
    backgroundColor: '#48C9B0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  salvarButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  salvarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
});