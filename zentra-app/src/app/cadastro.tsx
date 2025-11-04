import { Text, View, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './../components/style.styles';
import { useAuthForm } from '../hooks/useAuth';

export default function Cadastro() {
  // Dados de autenticação
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { loading, error, handleSignUp, clearError } = useAuthForm();

  const handleSubmit = async () => {
    // Etapa 1: Cadastro básico - apenas email e senha
    if (!email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    
    console.log('📋 Cadastro básico - Etapa 1:', { email });
    
    const success = await handleSignUp(email, password, confirmPassword);
    
    if (success) {
      Alert.alert(
        'Quase lá! 📧', 
        'Conta criada! Verifique seu email e confirme sua conta. Depois faça login para completar seu perfil com dados pessoais.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpar campos
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              // Redirecionar para tela de login
              router.push('/entrar');
            }
          }
        ]
      );
    } else {
      Alert.alert('Erro', error || 'Erro desconhecido ao cadastrar');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EAF6F6' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, padding: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginTop: 20, marginBottom: 30 }}>
            <Text style={[styles.titulo, { fontSize: 28, color: '#133E4E', marginBottom: 10 }]}>
              Crie sua conta 🚀
            </Text>
            <Text style={[styles.texto, { fontSize: 16, color: '#6B7280', lineHeight: 24 }]}>
              Primeiro, vamos criar sua conta. Depois você poderá completar seu perfil.
            </Text>
          </View>

          {/* Form Container */}
          <View style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 16, 
            padding: 24, 
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3
          }}>
            
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#133E4E', marginBottom: 20 }}>
              Dados da Conta
            </Text>

            {/* Email Field */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#133E4E', marginBottom: 8 }}>
                Email
              </Text>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                borderWidth: 1, 
                borderColor: '#D1D5DB', 
                borderRadius: 12, 
                paddingHorizontal: 16,
                backgroundColor: '#F9FAFB'
              }}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) clearError();
                  }}
                  placeholder="Digite seu email"
                  style={{ flex: 1, paddingVertical: 16, fontSize: 16, color: '#133E4E' }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#133E4E', marginBottom: 8 }}>
                Senha
              </Text>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                borderWidth: 1, 
                borderColor: '#D1D5DB', 
                borderRadius: 12, 
                paddingHorizontal: 16,
                backgroundColor: '#F9FAFB'
              }}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) clearError();
                  }}
                  placeholder="Mínimo 6 caracteres"
                  style={{ flex: 1, paddingVertical: 16, fontSize: 16, color: '#133E4E' }}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#133E4E', marginBottom: 8 }}>
                Confirmar Senha
              </Text>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                borderWidth: 1, 
                borderColor: '#D1D5DB', 
                borderRadius: 12, 
                paddingHorizontal: 16,
                backgroundColor: '#F9FAFB'
              }}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (error) clearError();
                  }}
                  placeholder="Confirme sua senha"
                  style={{ flex: 1, paddingVertical: 16, fontSize: 16, color: '#133E4E' }}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View style={{ 
                backgroundColor: '#FEE2E2', 
                borderColor: '#FECACA', 
                borderWidth: 1, 
                borderRadius: 8, 
                padding: 12, 
                marginBottom: 20 
              }}>
                <Text style={{ color: '#DC2626', fontSize: 14, textAlign: 'center' }}>
                  {error}
                </Text>
              </View>
            )}

            {/* Register Button */}
            <TouchableOpacity 
              style={{ 
                backgroundColor: loading ? '#9CA3AF' : '#48C9B0',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
                shadowColor: '#48C9B0',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={{ 
                color: '#FFFFFF', 
                fontSize: 16, 
                fontWeight: '600',
                letterSpacing: 0.5
              }}>
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <TouchableOpacity 
            onPress={() => router.push('/entrar')}
            style={{ 
              alignItems: 'center',
              padding: 16
            }}
          >
            <Text style={{ 
              fontSize: 16, 
              color: '#6B7280',
              textAlign: 'center'
            }}>
              Já tem uma conta?{' '}
              <Text style={{ color: '#48C9B0', fontWeight: '600' }}>
                Entrar
              </Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}