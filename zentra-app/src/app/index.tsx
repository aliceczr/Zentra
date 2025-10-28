import { Link } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './../components/style.styles';
import { Image } from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { supabase } from '../../supabase-client';


export default function LoginScreen() {
    const router = useRouter();
    const { user, loading, isRegistering } = useAuth();
    
    const [fontsLoaded] = useFonts({
      'PoppinsBold': require('./../assets/fonts/PoppinsBold.ttf'),
      'PoppinsSemiBold': require('./../assets/fonts/PoppinsSemiBold.ttf'),
      'NunitoRegular': require('./../assets/fonts/NunitoRegular.ttf'),
  
    });

    // Se usuário já estiver logado, redireciona para home (exceto durante cadastro)
    useEffect(() => {
      console.log('🏠 Index - Estado do auth:', { user: user?.id, loading, isRegistering });
      
      if (!loading && user && !isRegistering) {
        console.log('👤 Usuário logado detectado, redirecionando...');
        router.replace('/(tabs)/home');
      }
    }, [user, loading, isRegistering]);

    // Função para limpar sessão (para debug)
    const handleClearSession = async () => {
      console.log('🧹 Limpando sessão...');
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Erro ao fazer logout:', error);
        } else {
          console.log('✅ Sessão limpa!');
        }
      } catch (error) {
        console.error('Erro ao limpar sessão:', error);
      }
    };

    if (!fontsLoaded || loading) {
      return null; // ou uma tela de carregamento
      
    }
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Bem Vindo à Farma Zentra!</Text>
        <Image
          source={require('./../assets/images/logo_zentra.png')}
          style={{ width: 200, height: 200, marginBottom: 30 }}
        />
        <Text style={styles.texto}>Entre com dor e saia Zentra!</Text>
        <View style={styles.homeButtonContainer}>
          <TouchableOpacity style={styles.home_button}>
            <Text style={{ fontFamily: 'PoppinsSemiBold' }} onPress={() => router.push('/entrar')}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.home_button}>
            <Text style={{ fontFamily: 'PoppinsSemiBold' }} onPress={() => router.push('/cadastro')}>Cadastre-se</Text>
          </TouchableOpacity>
          
          {/* Botão de teste */}
          <TouchableOpacity 
            style={[styles.home_button, { backgroundColor: '#48C9B0', marginTop: 10 }]}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={{ fontFamily: 'PoppinsSemiBold', color: 'white' }}>🧪 Testar Sistema</Text>
          </TouchableOpacity>
          
          {/* Botão temporário para limpar sessão */}
          <TouchableOpacity 
            style={[styles.home_button, { backgroundColor: '#ff4444', marginTop: 10 }]}
            onPress={handleClearSession}
          >
            <Text style={{ fontFamily: 'PoppinsSemiBold', color: 'white' }}>🧹 Limpar Sessão (Debug)</Text>
          </TouchableOpacity>
        </View>

      </View>
      
    );
  }



