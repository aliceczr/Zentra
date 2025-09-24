import { Text, View, TouchableOpacity, TextInput, Button } from 'react-native';
import React, { useState } from 'react';
import { styles } from './../components/style.styles';


export default function Entrar() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const  handleSubmit = () => {
    alert(`Email: ${email}, Password: ${password}`);
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
      <TouchableOpacity style={styles.buttonEntrar} onPress={handleSubmit}>
        <Text style={styles.textForm}>Entrar</Text>
       </TouchableOpacity>
    </View>

  </View>
  );
}