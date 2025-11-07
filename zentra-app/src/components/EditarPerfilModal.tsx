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
import { useUser } from '../contexts/UserContext';
import { userService } from '../services/userService';

// ============================================================================
// 📝 MODAL PARA EDITAR DADOS PESSOAIS
// ============================================================================

interface EditarPerfilModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditarPerfilModal({ 
  visible, 
  onClose, 
  onSuccess 
}: EditarPerfilModalProps) {
  const { profile, fetchUserProfile } = useUser();

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // ============================================================================
  // 🔄 EFEITOS
  // ============================================================================
  useEffect(() => {
    if (visible && profile) {
      // Carregar dados atuais quando modal abrir
      setNome(profile.nome || '');
      setTelefone(profile.telefone || '');
      setEmail(profile.email || '');
      setErrors([]);
    }
  }, [visible, profile]);

  // ============================================================================
  // 📱 FORMATAÇÃO DE TELEFONE
  // ============================================================================
  const formatarTelefone = (texto: string) => {
    // Remove tudo que não é número
    const numeros = texto.replace(/\D/g, '');
    
    // Aplica máscara (11) 99999-9999
    if (numeros.length <= 11) {
      return numeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    return telefone; // Não permite mais que 11 dígitos
  };

  const handleTelefoneChange = (texto: string) => {
    const telefoneFormatado = formatarTelefone(texto);
    setTelefone(telefoneFormatado);
  };

  // ============================================================================
  // ✅ VALIDAÇÃO
  // ============================================================================
  const validarFormulario = () => {
    const nomeClean = nome.trim();
    const telefoneClean = telefone.replace(/\D/g, '');
    const emailClean = email.trim();

    const validation = userService.validateProfileData(nomeClean, telefoneClean, emailClean);
    
    setErrors(validation.errors);
    return validation.isValid;
  };

  // ============================================================================
  // 💾 SALVAR ALTERAÇÕES
  // ============================================================================
  const handleSalvar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    
    try {
      const nomeClean = nome.trim();
      const telefoneClean = telefone.replace(/\D/g, ''); // Remove formatação
      const emailClean = email.trim();

      await userService.updateProfile({
        nome: nomeClean,
        telefone: telefoneClean,
        email: emailClean
      });

      // Atualizar o contexto
      await fetchUserProfile();

      Alert.alert(
        'Sucesso!',
        'Seus dados foram atualizados com sucesso.',
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

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível atualizar seus dados.'
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
          
          <Text style={styles.headerTitle}>Editar Dados</Text>
          
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
            <Ionicons name="person-outline" size={20} color="#48C9B0" />
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
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

          {/* Campo Nome */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nome Completo *</Text>
            <TextInput
              style={styles.textInput}
              value={nome}
              onChangeText={setNome}
              placeholder="Digite seu nome completo"
              placeholderTextColor="#999"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={100}
            />
          </View>

          {/* Campo Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email *</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="seu.email@exemplo.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={100}
            />
          </View>

          {/* Campo Telefone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Telefone *</Text>
            <TextInput
              style={styles.textInput}
              value={telefone}
              onChangeText={handleTelefoneChange}
              placeholder="(11) 99999-9999"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={15}
            />
            <Text style={styles.fieldHint}>
              Digite apenas números, a formatação será aplicada automaticamente
            </Text>
          </View>

          {/* Campo CPF (Readonly) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>CPF</Text>
            <View style={styles.readonlyField}>
              <Text style={styles.readonlyText}>
                {profile?.cpf ? 
                  profile.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') 
                  : 'Não informado'
                }
              </Text>
              <Ionicons name="lock-closed-outline" size={16} color="#ccc" />
            </View>
            <Text style={styles.fieldHint}>
              O CPF não pode ser alterado por motivos de segurança
            </Text>
          </View>

          {/* Informações */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#48C9B0" />
            <Text style={styles.infoText}>
              Estes dados são utilizados para identificação e entrega dos seus pedidos.
            </Text>
          </View>

        </ScrollView>

        {/* Botões do Footer (alternativo ao header) */}
        {false && ( // Desabilitado pois já temos botões no header
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelar}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSalvar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    marginBottom: 20,
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

  // Campo readonly
  readonlyField: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readonlyText: {
    fontSize: 16,
    color: '#666',
  },

  // Info
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f8f8',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#48C9B0',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },

  // Footer (não utilizado)
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#48C9B0',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});