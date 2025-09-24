import { Text, View, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import { styles } from './../components/style.styles';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    alert(`Nome: ${nome}\nEmail: ${email}\nSenha: ${password}`);
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
          value={password}
          onChangeText={setPassword}
          placeholder="Digite sua senha"
          secureTextEntry
          style={styles.buttonForm}
        />
        <TouchableOpacity style={styles.buttonEntrar} onPress={handleSubmit}>
          <Text style={styles.textForm}>Cadastrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}