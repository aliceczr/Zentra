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
},
  buttonForm:{
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.2)',
    width: '100%', // ocupa toda a largura do container
    alignSelf: 'stretch', // garante que a linha se estique
    marginBottom: 20,
    fontFamily: 'NunitoRegular', // nome da fonte carregada
    color: '#133E4E',
      },
  textForm: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    fontFamily: 'NunitoRegular', // nome da fonte carregada
    color: '#133E4E',
  },
  buttonEntrar: {
    marginTop: 20,
    backgroundColor: '#48C9B0',
}, 
  viewForm: {
    padding: 30,
  },

  banner:{
    width: '100%',
    height: 450,
    overflow: 'hidden',
    elevation: 8, // sombra no Android
    shadowColor: '#000', // sombra no iOS
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    alignSelf: 'center', // centraliza o banner
  },
  banner_image:{
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center', // centraliza o conteúdo horizontalmente
    paddingHorizontal: 20,
  },
  banner_text: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center', // centraliza o texto
    maxWidth: '90%',
    lineHeight: 30,
    fontFamily: 'PoppinsBold', // nome da fonte carregada
  },

  // Estilos para produtos
  productGrid: {
    padding: 16,
    paddingBottom: 100, // espaço para tab bar
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    margin: 6,
    flex: 1,
    maxWidth: '30%', // para 3 colunas
    elevation: 3, // sombra Android
    shadowColor: '#000', // sombra iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    alignItems: 'center',
  },
  productImageContainer: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    alignItems: 'center',
    width: '100%',
  },
  productName: {
    fontSize: 12,
    color: '#133E4E',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'NunitoRegular',
  },
  productPrice: {
    fontSize: 14,
    color: '#48C9B0',
    fontWeight: 'bold',
    fontFamily: 'PoppinsSemiBold',
  },

  // Estilos para banner de categorias
  categoryBannerContainer: {
    marginVertical: 20,
  },
  categoryBannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#133E4E',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'PoppinsBold',
  },
  categoryScrollView: {
    paddingHorizontal: 16,
  },
  categoryScrollContainer: {
    paddingRight: 16,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 100,
  },
  categoryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    fontSize: 12,
    color: '#133E4E',
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'NunitoRegular',
    maxWidth: 80,
  },
  
  /* =================================
     📱 COMPONENTE: list_produtos.tsx - FILTROS DROPDOWN
     ================================= */
  listContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  listConteudoPrincipal: {
    flex: 1,
    flexDirection: 'row',
  },
  
  // Sidebar de Filtros
  listSidebarFiltros: {
    width: 300,
    backgroundColor: 'white',
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  
  listFiltroSecao: {
    marginBottom: 20,
  },
  
  listFiltroTituloContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  
  listFiltroTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  
  listFiltroIcone: {
    fontSize: 18,
    color: '#48C9B0',
    fontWeight: 'bold',
  },
  
  // Input de Preço
  listFiltroInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    marginTop: 8,
  },
  
  // Dropdown Options
  listFiltroOpcoes: {
    marginTop: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingVertical: 8,
    maxHeight: 200,
  },
  
  listFiltroOpcao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  
  listFiltroOpcaoSelecionado: {
    backgroundColor: '#e8f8f5',
  },
  
  listFiltroOpcaoTexto: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  
  listFiltroOpcaoTextoSelecionado: {
    color: '#48C9B0',
    fontWeight: '500',
  },
  
  listFiltroCheck: {
    color: '#48C9B0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Botões de Ação
  listFiltrosAcoes: {
    marginTop: 24,
    gap: 12,
  },
  
  listBotaoAplicar: {
    backgroundColor: '#48C9B0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  listBotaoAplicarTexto: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  listBotaoLimpar: {
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  listBotaoLimparTexto: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Grid de Produtos
  listProdutosContainer: {
    flex: 1,
    padding: 16,
  },
  
  listLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  listLoadingTexto: {
    fontSize: 16,
    color: '#666',
  },
  
  listErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  listErrorTexto: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  
  listProdutosGrid: {
    padding: 0,
  },
  
  // Card do Produto
  listProdutoCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: 'relative',
    maxWidth: 180,
  },
  
  listDescontoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  
  listDescontoTexto: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  listProdutoImagemContainer: {
    height: 120,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  listProdutoImagem: {
    width: '100%',
    height: '100%',
  },
  
  listProdutoInfo: {
    gap: 4,
  },
  
  listProdutoFabricante: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
  },
  
  listProdutoNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  
  listProdutoDescricao: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  
  listProdutoPrecos: {
    marginVertical: 8,
  },
  
  listPrecoOriginal: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  
  listPrecoAtual: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#48C9B0',
  },
  
  listBotaoComprar: {
    backgroundColor: '#48C9B0',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  
  listBotaoComprarTexto: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  /* =================================
     📱 LAYOUT MOBILE - FILTROS E PRODUTOS
     ================================= */
  
  // Container principal mobile
  mobileContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Header com busca e filtro
  mobileHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  mobileBuscaContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    marginRight: 12,
  },
  
  mobileBuscaInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  
  mobileFiltroButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#48C9B0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  mobileFiltroIcone: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  
  mobileFiltroContador: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  mobileFiltroContadorTexto: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Botão do carrinho na listagem
  mobileCarrinhoButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#48C9B0',
  },
  
  mobileCarrinhoContador: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  mobileCarrinhoContadorTexto: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Informações dos resultados
  mobileResultadosInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  mobileResultadosTexto: {
    fontSize: 14,
    color: '#666',
  },
  
  mobileLimparFiltros: {
    fontSize: 14,
    color: '#48C9B0',
    fontWeight: '500',
  },
  
  // Lista de produtos mobile
  mobileProdutosList: {
    flex: 1,
  },
  
  mobileProdutosContent: {
    padding: 8,
    paddingBottom: 100,
  },
  
  mobileProdutosRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  
  // Card do produto mobile
  mobileProdutoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    margin: 4,
    flex: 1,
    maxWidth: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: 'relative',
  },
  
  mobileDescontoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  
  mobileDescontoTexto: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  mobileProdutoImagemContainer: {
    height: 100,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  mobileProdutoImagem: {
    width: '100%',
    height: '100%',
  },
  
  mobileProdutoInfo: {
    gap: 4,
  },
  
  mobileProdutoFabricante: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
  },
  
  mobileProdutoNome: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
    lineHeight: 16,
  },
  
  mobileProdutoDescricao: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  
  mobileProdutoPrecos: {
    marginVertical: 6,
  },
  
  mobilePrecoOriginal: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  
  mobilePrecoAtual: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#48C9B0',
  },
  
  mobileBotaoComprar: {
    backgroundColor: '#48C9B0',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  
  mobileBotaoComprarTexto: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  
  // Estados de loading e erro mobile
  mobileLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  mobileLoadingTexto: {
    fontSize: 16,
    color: '#666',
  },
  
  mobileErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  mobileErrorTexto: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  
  /* =================================
     📋 MODAL DE FILTROS MOBILE
     ================================= */
  
  mobileModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  mobileModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '95%', // Aumentado de 80% para 95%
    minHeight: '70%', // Altura mínima para garantir espaço adequado
    paddingTop: 8,
  },
  
  mobileModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  mobileModalTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  
  mobileModalFechar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  mobileModalFecharTexto: {
    fontSize: 16,
    color: '#666',
  },
  
  mobileModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10, // Adiciona espaço no topo
    paddingBottom: 30, // Aumentado de 20 para 30 - Espaço extra no final
  },
  
  // Seções de filtro no modal
  mobileFiltroSecao: {
    marginBottom: 20,
    marginTop: 16,
  },
  
  mobileFiltroTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  
  mobileFiltroInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  
  // Dropdown no modal
  mobileDropdownContainer: {
    marginBottom: 20,
  },
  
  mobileDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  
  mobileDropdownTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  mobileDropdownIcone: {
    fontSize: 18,
    color: '#48C9B0',
    fontWeight: 'bold',
  },
  
  mobileDropdownOpcoes: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    maxHeight: 300, // Aumentado de 200 para 300
  },
  
  mobileDropdownOpcao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16, // Aumentado de 12 para 16
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    minHeight: 50, // Aumentado de 44 para 50 para facilitar o toque
  },
  
  mobileDropdownOpcaoSelecionado: {
    backgroundColor: '#e8f8f5',
  },
  
  mobileDropdownOpcaoTexto: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  
  mobileDropdownOpcaoTextoSelecionado: {
    color: '#48C9B0',
    fontWeight: '500',
  },
  
  mobileDropdownCheck: {
    color: '#48C9B0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Botões de ação do modal
  mobileModalAcoes: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  
  mobileModalBotaoLimpar: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  mobileModalBotaoLimparTexto: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  
  mobileModalBotaoAplicar: {
    flex: 2,
    backgroundColor: '#48C9B0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  mobileModalBotaoAplicarTexto: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  /* =================================
     🛒 COMPONENTE: carrinho.tsx - TELA DO CARRINHO
     ================================= */
  carrinhoContainer: {
    flex: 1,
    backgroundColor: '#EAF6F6',
  },

  // Header do carrinho
  carrinhoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  carrinhoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#133E4E',
  },

  carrinhoSubtitulo: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginLeft: 16,
  },

  carrinhoLimparBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },

  carrinhoLimparTexto: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 4,
  },

  // Loading
  carrinhoLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
  },

  carrinhoLoadingTexto: {
    marginLeft: 8,
    color: '#666',
  },

  // Lista de itens
  carrinhoLista: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Item do carrinho
  carrinhoItemContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  carrinhoItemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  carrinhoItemImage: {
    width: '100%',
    height: '100%',
  },

  carrinhoItemInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },

  carrinhoItemNome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#133E4E',
    marginBottom: 4,
  },

  carrinhoItemPreco: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },

  carrinhoItemPrecoTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#48C9B0',
  },

  // Controles de quantidade
  carrinhoQuantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },

  carrinhoQuantidadeBotao: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },

  carrinhoQuantidadeBotaoDisabled: {
    backgroundColor: '#f9f9f9',
    borderColor: '#eee',
  },

  carrinhoQuantidadeTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#133E4E',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },

  // Botão remover
  carrinhoRemoverBotao: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Carrinho vazio
  carrinhoVazioContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  carrinhoVazioTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#133E4E',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },

  carrinhoVazioSubtitulo: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },

  carrinhoVazioBotao: {
    backgroundColor: '#48C9B0',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },

  carrinhoVazioBotaoTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Footer com resumo
  carrinhoFooter: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },

  carrinhoResumoContainer: {
    marginBottom: 20,
  },

  carrinhoResumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  carrinhoResumoTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
  },

  carrinhoResumoLabel: {
    fontSize: 14,
    color: '#666',
  },

  carrinhoResumoLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#133E4E',
  },

  carrinhoResumoValor: {
    fontSize: 14,
    color: '#133E4E',
  },

  carrinhoResumoValorGratis: {
    fontSize: 14,
    color: '#48C9B0',
    fontWeight: '500',
  },

  carrinhoResumoValorTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#48C9B0',
  },

  // Botão checkout
  carrinhoCheckoutBotao: {
    flexDirection: 'row',
    backgroundColor: '#48C9B0',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  carrinhoCheckoutTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
// #133E4E -> texto , #010304, #48C9B0 -> botões, #A3C1AD, #EAF6F6 -> fundo, #5D6D7E, #FFFFFF