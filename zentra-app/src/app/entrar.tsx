import { Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { styles } from './../components/style.styles';
import { useAuthForm } from '../hooks/useAuth';


export default function Entrar() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { loading, error, handleSignIn } = useAuthForm();
  
  const handleSubmit = async () => {
    const success = await handleSignIn(email, password);
    
    if (success) {
      alert('Sucesso! Login realizado com sucesso!');
      // Limpar campos
      setEmail('');
      setPassword('');
      // Redirecionar para home (tabs)
      router.replace('/(tabs)/home');
    } else if (error) {
      alert(`Erro: ${error}`);
    }
  }
  return (
    <View>
      <Text style={[styles.titulo, { paddingTop: 20 }, {paddingLeft: 20 }]}>Bem Vindo de Volta!</Text>
      <Text style={[styles.texto, {padding: 30 }, { paddingTop: 20 }, {paddingLeft: 20 }]}>Sua farmácia digital está pronta para você.</Text>
      <View style={{padding: 30 }}>
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
      <TouchableOpacity 
        style={styles.buttonEntrar} 
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.textForm}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Text>
      </TouchableOpacity>
    </View>

  </View>
  );
}