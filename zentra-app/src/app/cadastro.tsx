import { Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { styles } from './../components/style.styles';
import { useAuthForm } from '../hooks/useAuth';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { loading, error, handleSignUp, clearError } = useAuthForm();

  const handleSubmit = async () => {
    // Validação local primeiro
    if (password !== confirmPassword) {
      alert('Erro: As senhas não coincidem!');
      return;
    }
    
    const success = await handleSignUp(email, password, confirmPassword);
    
    if (success) {
      alert('Sucesso! Cadastro realizado com sucesso! Verifique seu email e confirme para fazer login.');
      // Limpar campos
      setNome('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      // Redirecionar para tela de login
      router.push('/entrar');
    } else {
      // Se chegou aqui, deu erro no Supabase
      alert(`Erro: ${error || 'Erro desconhecido ao cadastrar'}`);
    }
  };

  return (
    <View>
      <Text style={[styles.titulo, { paddingTop: 20 }, { paddingLeft: 20 }]}>Crie sua conta</Text>
      <Text style={[styles.texto, { padding: 30 }, { paddingTop: 20 }, { paddingLeft: 20 }]}>Preencha os dados para se cadastrar.</Text>
      <View style={{ padding: 30 }}>
        <Text>Nome:</Text>
        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Digite seu nome"
          style={styles.buttonForm}
        />
        <Text>Email:</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Digite seu email"
          style={styles.buttonForm}
        />
        <Text>Senha:</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Digite sua senha"
          secureTextEntry
          style={styles.buttonForm}
        />
        <Text>Confirme a senha:</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Digite sua senha novamente"
          secureTextEntry
          style={styles.buttonForm}
        />
        <TouchableOpacity 
          style={styles.buttonEntrar} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.textForm}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}