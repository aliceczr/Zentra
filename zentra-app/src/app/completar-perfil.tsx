import { Text, View, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { styles } from './../components/style.styles';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export default function CompletarPerfil() {
  // Dados pessoais
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();

  // Função para formatar CPF
  const formatCPF = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return cleaned;
  };

  // Função para formatar telefone
  const formatTelefone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return cleaned;
  };

  // Função para formatar data de nascimento
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
      // Preparar dados do perfil
      const profileData = {
        auth_id: user.id,
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ''), // Remove formatação
        telefone: telefone.replace(/\D/g, ''), // Remove formatação
        dataNascimento: dataNascimento.split('/').reverse().join('-') // DD/MM/AAAA -> AAAA-MM-DD
      };
      
      console.log('📋 Criando perfil:', profileData);
      
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
      console.error('❌ Erro ao completar perfil:', error);
      Alert.alert('Erro', 'Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <Text style={[styles.titulo, { paddingTop: 20 }, { paddingLeft: 20 }]}>Complete seu Perfil</Text>
      <Text style={[styles.texto, { padding: 30 }, { paddingTop: 20 }, { paddingLeft: 20 }]}>
        Agora que sua conta foi confirmada, vamos completar seus dados pessoais.
      </Text>
      
      <View style={{ padding: 30 }}>
        {/* Dados Pessoais */}
        <Text style={[styles.titulo, { fontSize: 18, marginBottom: 15 }]}>Dados Pessoais</Text>
        
        <Text>Nome Completo:</Text>
        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Digite seu nome completo"
          style={styles.buttonForm}
        />
        
        <Text>CPF:</Text>
        <TextInput
          value={cpf}
          onChangeText={(text) => setCpf(formatCPF(text))}
          placeholder="000.000.000-00"
          style={styles.buttonForm}
          keyboardType="numeric"
          maxLength={14}
        />
        
        <Text>Telefone:</Text>
        <TextInput
          value={telefone}
          onChangeText={(text) => setTelefone(formatTelefone(text))}
          placeholder="(00) 00000-0000"
          style={styles.buttonForm}
          keyboardType="phone-pad"
          maxLength={15}
        />
        
        <Text>Data de Nascimento:</Text>
        <TextInput
          value={dataNascimento}
          onChangeText={(text) => setDataNascimento(formatDataNascimento(text))}
          placeholder="DD/MM/AAAA"
          style={styles.buttonForm}
          keyboardType="numeric"
          maxLength={10}
        />

        <TouchableOpacity
          style={[styles.buttonEntrar, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Salvando perfil...' : 'Completar Perfil'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
          <Text style={[styles.texto, { textAlign: 'center', color: '#007AFF', marginTop: 15 }]}>
            Pular por agora (completar depois)
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}