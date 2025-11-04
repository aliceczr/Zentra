import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProdutosList, useFiltrosDinamicos } from '../../hooks/hooksProdutos';
import { Produto, FiltroOpcao } from '../../services/produtoService';
import { styles } from '../../components/style.styles';
import { useAdicionarAoCarrinho, useCarrinhoContador } from '../../hooks/hooksCarrinho';

export default function ListProdutosScreen() {
  // Hook para navegação
  const router = useRouter();
  
  // Hook para busca de produtos via Context (Nova Arquitetura)
  const { produtos, loading, error, buscar, filtros } = useProdutosList();
  
  // 🆕 Hook para filtros dinâmicos do banco
  const { 
    fabricantes, 
    marcas, 
    categorias, 
    loading: loadingFiltros, 
    error: errorFiltros,
    carregarFiltros 
  } = useFiltrosDinamicos();
  
  // Hooks do carrinho
  const adicionarAoCarrinho = useAdicionarAoCarrinho();
  const contadorCarrinho = useCarrinhoContador();
  
  // Estados dos filtros
  const [precoMin, setPrecoMin] = useState<string>('');
  const [precoMax, setPrecoMax] = useState<string>('');
  const [fabricanteSelecionado, setFabricanteSelecionado] = useState<string>('');
  const [marcaSelecionada, setMarcaSelecionada] = useState<string>('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  
  // Estado da busca por texto
  const [textoBusca, setTextoBusca] = useState<string>('');
  
  // Sincronizar estado local com filtros do contexto
  useEffect(() => {
    if (filtros.busca && filtros.busca !== textoBusca) {
      setTextoBusca(filtros.busca);
    }
    if (filtros.categoria_id && filtros.categoria_id.toString() !== categoriaSelecionada) {
      setCategoriaSelecionada(filtros.categoria_id.toString());
    }
  }, [filtros]);
  
  // Estados para controlar dropdowns abertos
  const [fabricanteAberto, setFabricanteAberto] = useState<boolean>(false);
  const [marcaAberta, setMarcaAberta] = useState<boolean>(false);
  const [categoriaAberta, setCategoriaAberta] = useState<boolean>(false);
  
  // Estado para controlar modal de filtros
  const [modalFiltrosVisivel, setModalFiltrosVisivel] = useState<boolean>(false);
  
  // Contador de filtros ativos
  const [filtrosAtivos, setFiltrosAtivos] = useState<number>(0);

  // Carregar produtos iniciais com filtros do contexto
  useEffect(() => {
    buscar(filtros);
  }, []);

  // Atualizar contador de filtros ativos
  useEffect(() => {
    let count = 0;
    if (precoMin) count++;
    if (precoMax) count++;
    if (fabricanteSelecionado) count++;
    if (marcaSelecionada) count++;
    if (categoriaSelecionada) count++;
    if (textoBusca) count++; // Incluir busca no contador
    setFiltrosAtivos(count);
  }, [precoMin, precoMax, fabricanteSelecionado, marcaSelecionada, categoriaSelecionada, textoBusca]);

  // Função de debounce para busca
  const debounce = (func: Function, delay: number) => {
    let timeoutId: number;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay) as any;
    };
  };

  // Busca com debounce - usa arquitetura Context
  const buscarComDebounce = useCallback(
    debounce((texto: string) => {
      const filtrosAtualizados = {
        ...filtros,
        preco_min: precoMin ? parseFloat(precoMin) : undefined,
        preco_max: precoMax ? parseFloat(precoMax) : undefined,
        fabricante: fabricanteSelecionado || undefined,
        marca: marcaSelecionada || undefined,
        categoria_id: categoriaSelecionada ? parseInt(categoriaSelecionada) : undefined,
        busca: texto || undefined, // Adiciona busca por texto
      };
      
      // Remove campos undefined para não enviar filtros vazios
      Object.keys(filtrosAtualizados).forEach(key => {
        if (filtrosAtualizados[key as keyof typeof filtrosAtualizados] === undefined) {
          delete filtrosAtualizados[key as keyof typeof filtrosAtualizados];
        }
      });
      
      buscar(filtrosAtualizados);
    }, 500), // 500ms de delay
    [filtros, precoMin, precoMax, fabricanteSelecionado, marcaSelecionada, categoriaSelecionada]
  );

  // Função para lidar com mudança no texto de busca
  const handleBuscaTexto = (texto: string) => {
    setTextoBusca(texto);
    buscarComDebounce(texto);
  };

  // Aplicar filtros (CORRIGIDO: agora acumula filtros anteriores)
  const aplicarFiltros = () => {
    const novosFiles = {
      ...filtros, // ✅ Mantém filtros anteriores (incluindo busca)
      preco_min: precoMin ? parseFloat(precoMin) : undefined,
      preco_max: precoMax ? parseFloat(precoMax) : undefined,
      fabricante: fabricanteSelecionado || undefined,
      marca: marcaSelecionada || undefined,
      categoria_id: categoriaSelecionada ? parseInt(categoriaSelecionada) : undefined,
      busca: textoBusca || undefined, // ✅ Inclui busca atual
    };
    
    // Remove campos undefined
    Object.keys(novosFiles).forEach(key => {
      if (novosFiles[key as keyof typeof novosFiles] === undefined) {
        delete novosFiles[key as keyof typeof novosFiles];
      }
    });
    
    buscar(novosFiles);
    setModalFiltrosVisivel(false); // Fechar modal após aplicar
  };

  // Limpar todos os filtros (CORRIGIDO: inclui busca)
  const limparFiltros = () => {
    setPrecoMin('');
    setPrecoMax('');
    setFabricanteSelecionado('');
    setMarcaSelecionada('');
    setCategoriaSelecionada('');
    setTextoBusca(''); // ✅ Limpa busca também
    buscar({});
  };

  // Renderizar dropdown
  const renderDropdown = (
    titulo: string,
    opcoes: FiltroOpcao[],
    valorSelecionado: string,
    onSelect: (valor: string) => void,
    aberto: boolean,
    setAberto: (aberto: boolean) => void
  ) => (
    <View style={styles.mobileDropdownContainer}>
      <TouchableOpacity 
        style={styles.mobileDropdownHeader}
        onPress={() => setAberto(!aberto)}
      >
        <Text style={styles.mobileDropdownTitulo}>{titulo}</Text>
        <Text style={styles.mobileDropdownIcone}>{aberto ? '−' : '+'}</Text>
      </TouchableOpacity>
      
      {aberto && (
        <ScrollView 
          style={styles.mobileDropdownOpcoes}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {opcoes.map(opcao => (
            <TouchableOpacity 
              key={opcao.id}
              style={[
                styles.mobileDropdownOpcao,
                valorSelecionado === opcao.value && styles.mobileDropdownOpcaoSelecionado
              ]}
              onPress={() => {
                onSelect(opcao.value);
                setAberto(false);
              }}
            >
              <Text style={[
                styles.mobileDropdownOpcaoTexto,
                valorSelecionado === opcao.value && styles.mobileDropdownOpcaoTextoSelecionado
              ]}>
                {opcao.label}
              </Text>
              {valorSelecionado === opcao.value && (
                <Text style={styles.mobileDropdownCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  // Função para navegar para detalhes do produto
  const navegarParaDetalhes = (produtoId: number) => {
    router.push(`/produto/${produtoId}` as any);
  };

  // Função para adicionar produto ao carrinho
  const handleAdicionarCarrinho = async (produto: Produto, event: any) => {
    // Impedir que o evento de clique abra a página de detalhes
    event.stopPropagation();
    
    try {
      await adicionarAoCarrinho.adicionarProduto(produto, 1);
    } catch (error) {
      console.error('Erro ao adicionar produto ao carrinho:', error);
    }
  };

  // Renderizar item do produto em formato mobile
  const renderProduto = ({ item }: { item: Produto }) => (
    <TouchableOpacity 
      style={styles.mobileProdutoCard}
      onPress={() => navegarParaDetalhes(item.id)}
      activeOpacity={0.7}
    >
      {/* Badge de desconto - apenas para produtos em destaque */}
      {item.destaque && (
        <View style={styles.mobileDescontoBadge}>
          <Text style={styles.mobileDescontoTexto}>15%</Text>
        </View>
      )}
      
      {/* Imagem do produto */}
      <View style={styles.mobileProdutoImagemContainer}>
        <Image 
          source={{ uri: item.imagem_principal || 'https://via.placeholder.com/120x120/48C9B0/FFFFFF?text=Produto' }}
          style={styles.mobileProdutoImagem}
          resizeMode="contain"
          onLoad={() => console.log('✅ LISTA: Imagem carregada:', item.nome)}
          onError={(error) => {
            console.log('❌ LISTA: Erro ao carregar imagem:', item.nome);
            console.log('❌ LISTA: URL da imagem:', item.imagem_principal);
            console.log('❌ LISTA: Detalhes do erro:', error.nativeEvent);
          }}
        />
      </View>
      
      {/* Informações do produto */}
      <View style={styles.mobileProdutoInfo}>
        <Text style={styles.mobileProdutoFabricante}>{item.fabricante}</Text>
        <Text style={styles.mobileProdutoNome} numberOfLines={2}>{item.nome}</Text>
        <Text style={styles.mobileProdutoDescricao} numberOfLines={1}>{item.descricao}</Text>
        
        {/* Preços */}
        <View style={styles.mobileProdutoPrecos}>
          {/* Preço cortado apenas para produtos em destaque */}
          {item.destaque && (
            <Text style={styles.mobilePrecoOriginal}>R$ {(item.preco * 1.18).toFixed(2)}</Text>
          )}
          <Text style={styles.mobilePrecoAtual}>R$ {item.preco.toFixed(2)}</Text>
        </View>
        
        {/* Botão comprar */}
        <TouchableOpacity 
          style={styles.mobileBotaoComprar}
          onPress={(event) => handleAdicionarCarrinho(item, event)}
        >
          <Ionicons name="cart" size={16} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.mobileBotaoComprarTexto}>Comprar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.mobileContainer}>
      {/* Header com busca e filtro */}
      <View style={styles.mobileHeader}>
        <View style={styles.mobileBuscaContainer}>
          <Ionicons name="search" size={16} color="#999" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.mobileBuscaInput}
            placeholder="Buscar medicamentos..."
            placeholderTextColor="#999"
            value={textoBusca}
            onChangeText={handleBuscaTexto}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            enablesReturnKeyAutomatically={true}
          />
        </View>
        
        {/* Botão de filtro com contador */}
        <TouchableOpacity 
          style={styles.mobileFiltroButton}
          onPress={() => setModalFiltrosVisivel(true)}
        >
          <Text style={styles.mobileFiltroIcone}>⚟</Text>
          {filtrosAtivos > 0 && (
            <View style={styles.mobileFiltroContador}>
              <Text style={styles.mobileFiltroContadorTexto}>{filtrosAtivos}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Botão do carrinho */}
        <TouchableOpacity 
          style={styles.mobileCarrinhoButton}
          onPress={() => router.push('/carrinho' as any)}
        >
          <Ionicons name="cart" size={24} color="#48C9B0" />
          {contadorCarrinho.itens > 0 && (
            <View style={styles.mobileCarrinhoContador}>
              <Text style={styles.mobileCarrinhoContadorTexto}>{contadorCarrinho.itens}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Informações dos resultados */}
      <View style={styles.mobileResultadosInfo}>
        <Text style={styles.mobileResultadosTexto}>
          {produtos.length} produtos encontrados
        </Text>
        {filtrosAtivos > 0 && (
          <TouchableOpacity onPress={limparFiltros}>
            <Text style={styles.mobileLimparFiltros}>Limpar filtros</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de produtos */}
      {loading ? (
        <View style={styles.mobileLoadingContainer}>
          <Text style={styles.mobileLoadingTexto}>Carregando produtos...</Text>
        </View>
      ) : error ? (
        <View style={styles.mobileErrorContainer}>
          <Text style={styles.mobileErrorTexto}>Erro: {error}</Text>
        </View>
      ) : (
        <FlatList
          data={produtos}
          renderItem={renderProduto}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          style={styles.mobileProdutosList}
          contentContainerStyle={styles.mobileProdutosContent}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.mobileProdutosRow}
        />
      )}

      {/* Modal de Filtros */}
      <Modal
        visible={modalFiltrosVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalFiltrosVisivel(false)}
      >
        <View style={styles.mobileModalOverlay}>
          <View style={styles.mobileModalContainer}>
            {/* Header do modal */}
            <View style={styles.mobileModalHeader}>
              <Text style={styles.mobileModalTitulo}>Filtros</Text>
              <TouchableOpacity 
                onPress={() => setModalFiltrosVisivel(false)}
                style={styles.mobileModalFechar}
              >
                <Text style={styles.mobileModalFecharTexto}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Conteúdo dos filtros */}
            <ScrollView style={styles.mobileModalContent} showsVerticalScrollIndicator={false}>
              {/* Filtro Preço Mínimo */}
              <View style={styles.mobileFiltroSecao}>
                <Text style={styles.mobileFiltroTitulo}>Preço Mínimo</Text>
                <TextInput
                  style={styles.mobileFiltroInput}
                  placeholder="R$ 0,00"
                  value={precoMin}
                  onChangeText={setPrecoMin}
                  keyboardType="numeric"
                />
              </View>
              
              {/* Filtro Preço Máximo */}
              <View style={styles.mobileFiltroSecao}>
                <Text style={styles.mobileFiltroTitulo}>Preço Máximo</Text>
                <TextInput
                  style={styles.mobileFiltroInput}
                  placeholder="R$ 999,00"
                  value={precoMax}
                  onChangeText={setPrecoMax}
                  keyboardType="numeric"
                />
              </View>
              
              {/* Dropdown Fabricante */}
              {renderDropdown(
                'Fabricante',
                fabricantes,
                fabricanteSelecionado,
                setFabricanteSelecionado,
                fabricanteAberto,
                setFabricanteAberto
              )}
              
              {/* Dropdown Marca */}
              {renderDropdown(
                'Marca',
                marcas,
                marcaSelecionada,
                setMarcaSelecionada,
                marcaAberta,
                setMarcaAberta
              )}
              
              {/* Dropdown Categoria */}
              {renderDropdown(
                'Categoria',
                categorias,
                categoriaSelecionada,
                setCategoriaSelecionada,
                categoriaAberta,
                setCategoriaAberta
              )}
            </ScrollView>

            {/* Botões de ação do modal */}
            <View style={styles.mobileModalAcoes}>
              <TouchableOpacity 
                style={styles.mobileModalBotaoLimpar} 
                onPress={limparFiltros}
              >
                <Text style={styles.mobileModalBotaoLimparTexto}>Limpar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.mobileModalBotaoAplicar} 
                onPress={aplicarFiltros}
              >
                <Text style={styles.mobileModalBotaoAplicarTexto}>
                  Aplicar {filtrosAtivos > 0 ? `(${filtrosAtivos})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
