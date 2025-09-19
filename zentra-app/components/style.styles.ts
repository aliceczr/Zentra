import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF6F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    color:'#133E4E',
    marginBottom: 20,
    fontFamily: 'PoppinsBold', // nome da fonte carregada
    paddingBottom: 20,
  },
  texto: {
    fontSize: 24,
    color: '#133E4E',
    fontFamily: 'NunitoRegular', // nome da fonte carregada
    
  },
  homeButtonContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 50,
},
  home_button: {
    width: 120,
    height: 40,
    alignItems: 'center',
    backgroundColor: '#48C9B0',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    
  },
  buttonText: {
    color: '#133E4E',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PoppinsSemiBold', // nome da fonte carregada
}
});
// #133E4E -> texto , #010304, #48C9B0 -> botões, #A3C1AD, #EAF6F6 -> fundo, #5D6D7E, #FFFFFF