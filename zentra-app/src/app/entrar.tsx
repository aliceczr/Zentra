import { Text, View, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './../components/style.styles';
import { useAuthForm } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export default function Entrar() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { loading, error, handleSignIn } = useAuthForm();
  const { user } = useAuth();
  
  const handleSubmit = async () => {
    const success = await handleSignIn(email, password);
    
    if (success) {
      console.log('✅ Login realizado! Verificando perfil...');
      
      // Verificar se usuário tem perfil completo
      try {
        const profile = await userService.getUserProfile();
        
        if (profile) {
          console.log('✅ Perfil encontrado, redirecionando para home');
          Alert.alert('Bem-vindo de volta!', 'Login realizado com sucesso!');
          router.replace('/(tabs)/home');
        } else {
          console.log('ℹ️ Perfil não encontrado, redirecionando para completar');
          Alert.alert(
            'Complete seu perfil',
            'Para continuar, complete seus dados pessoais.',
            [{ text: 'OK', onPress: () => router.replace('/completar-perfil') }]
          );
        }
      } catch (error) {
        console.log('ℹ️ Erro ao buscar perfil (provavelmente não existe), redirecionando para completar');
        Alert.alert(
          'Complete seu perfil',
          'Para continuar, complete seus dados pessoais.',
          [{ text: 'OK', onPress: () => router.replace('/completar-perfil') }]
        );
      }
      
      // Limpar campos
      setEmail('');
      setPassword('');
      
    } else if (error) {
      Alert.alert('Erro', error);
    }
  }
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
              Bem Vindo de Volta! 👋
            </Text>
            <Text style={[styles.texto, { fontSize: 16, color: '#6B7280', lineHeight: 24 }]}>
              Sua farmácia digital está pronta para você.
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
                  onChangeText={setEmail}
                  placeholder="Digite seu email"
                  style={{ flex: 1, paddingVertical: 16, fontSize: 16, color: '#133E4E' }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={{ marginBottom: 24 }}>
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
                  onChangeText={setPassword}
                  placeholder="Digite sua senha"
                  secureTextEntry
                  style={{ flex: 1, paddingVertical: 16, fontSize: 16, color: '#133E4E' }}
                />
              </View>
            </View>

            {/* Login Button */}
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
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <TouchableOpacity 
            onPress={() => router.push('/cadastro')}
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
              Não tem uma conta?{' '}
              <Text style={{ color: '#48C9B0', fontWeight: '600' }}>
                Cadastre-se
              </Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}