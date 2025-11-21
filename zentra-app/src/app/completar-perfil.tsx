import { Text, View, TouchableOpacity, TextInput, Alert, ScrollView, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { styles } from './../components/style.styles';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export default function CompletarPerfil() {

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();


  const formatCPF = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return cleaned;
  };


  const formatTelefone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return cleaned;
  };

  const formatDataNascimento = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    if (cleaned.length >= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
    return formatted;
  };

  const validateForm = () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return false;
    }
    
    if (!cpf.trim() || cpf.replace(/\D/g, '').length !== 11) {
      Alert.alert('Erro', 'CPF deve ter 11 dígitos');
      return false;
    }
    
    if (!telefone.trim() || telefone.replace(/\D/g, '').length !== 11) {
      Alert.alert('Erro', 'Telefone deve ter 11 dígitos (com DDD)');
      return false;
    }
    
    if (!dataNascimento.trim() || dataNascimento.replace(/\D/g, '').length !== 8) {
      Alert.alert('Erro', 'Data de nascimento deve estar no formato DD/MM/AAAA');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
      router.push('/entrar');
      return;
    }
    
    setLoading(true);
    
    try {
     
      const profileData = {
        auth_id: user.id,
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ''), 
        telefone: telefone.replace(/\D/g, ''), 
        dataNascimento: dataNascimento.split('/').reverse().join('-') // 
      };
      
      
      
      await userService.createProfile(profileData);
      
      Alert.alert(
        'Sucesso!', 
        'Perfil completado com sucesso! Bem-vindo(a) ao Zentra!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.push('/(tabs)/home');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Erro ao completar perfil:', error);
      Alert.alert('Erro', 'Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EAF6F6' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
          <Text style={[styles.titulo, { fontSize: 22, paddingBottom: 8 }]}>Complete seu perfil</Text>
          <Text style={[styles.texto, { fontSize: 14, marginBottom: 16, color: '#556' }]}>Para finalizar seu cadastro, precisamos de algumas informações básicas.</Text>

          {/* Avatar / Identidade visual */}
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <Image source={{ uri: 'https://via.placeholder.com/96x96/48C9B0/FFFFFF?text=Z' }} style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 8 }} />
            <Text style={{ color: '#133E4E', fontWeight: '600' }}>{user?.email || 'Usuário'}</Text>
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: '#133E4E', marginBottom: 6 }}>Nome completo</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
              style={styles.textForm}
              placeholderTextColor="#999"
            />
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: '#133E4E', marginBottom: 6 }}>CPF</Text>
            <TextInput
              value={cpf}
              onChangeText={(text) => setCpf(formatCPF(text))}
              placeholder="000.000.000-00"
              style={styles.textForm}
              keyboardType="numeric"
              maxLength={14}
              placeholderTextColor="#999"
            />
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: '#133E4E', marginBottom: 6 }}>Telefone</Text>
            <TextInput
              value={telefone}
              onChangeText={(text) => setTelefone(formatTelefone(text))}
              placeholder="(00) 00000-0000"
              style={styles.textForm}
              keyboardType="phone-pad"
              maxLength={15}
              placeholderTextColor="#999"
            />
          </View>

          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: '#133E4E', marginBottom: 6 }}>Data de nascimento</Text>
            <TextInput
              value={dataNascimento}
              onChangeText={(text) => setDataNascimento(formatDataNascimento(text))}
              placeholder="DD/MM/AAAA"
              style={styles.textForm}
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={{ backgroundColor: '#48C9B0', paddingVertical: 14, borderRadius: 10, alignItems: 'center' }}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700' }}>Salvar e Continuar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: '#48C9B0', fontWeight: '600' }}>Pular por agora</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}