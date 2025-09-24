import { Link } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './../components/style.styles';
import { Image } from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';


export default function LoginScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({
      'PoppinsBold': require('./../assets/fonts/PoppinsBold.ttf'),
      'PoppinsSemiBold': require('./../assets/fonts/PoppinsSemiBold.ttf'),
      'NunitoRegular': require('./../assets/fonts/NunitoRegular.ttf'),
  
    });

    if (!fontsLoaded) {
      return null; // ou uma tela de carregamento
      
    }
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Bem Vindo ao Zentra!</Text>
        <Image
          source={require('./../assets/images/logo_zentra.png')}
          style={{ width: 200, height: 200, marginBottom: 30 }}
        />
        <Text style={styles.texto}>Entrou estressado. Saiu Zentra!</Text>

        <View style={styles.homeButtonContainer}>
          <TouchableOpacity style={styles.home_button}>
            <Text style={{ fontFamily: 'PoppinsSemiBold' }} onPress={() => router.push('/entrar')}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.home_button}>
            <Text style={{ fontFamily: 'PoppinsSemiBold' }} onPress={() => router.push('/cadastro')}>Cadastre-se</Text>
          </TouchableOpacity>
          
        </View>

      </View>
      
    );
  }



