import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProdutoContext } from '../../contexts/produtoContext';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { produtos, atualizarFiltros, limparFiltros } = useProdutoContext();
  const { user } = useAuth();
  
  // Estado local para o input de busca
  const [textoBusca, setTextoBusca] = useState('');

  // Produtos em promoção (primeiros 3 produtos para demonstração)
  const produtosPromocao = produtos.slice(0, 3);

  const handleBuscar = async (texto?: string) => {
    const termoBusca = texto || textoBusca;
    if (termoBusca.trim()) {
      // Atualiza apenas os filtros no Context (não filtra ainda)
      atualizarFiltros({ busca: termoBusca.trim() });
      // Navega para a lista que aplicará a busca ao carregar
      router.push('/(tabs)/list_produtos');
    } else {
      // Se não há texto, limpa os filtros e vai para a lista
      limparFiltros();
      router.push('/(tabs)/list_produtos');
    }
  };

  const handleCategoriaPress = async (categoriaId: number) => {
    // Atualiza apenas os filtros no Context (não filtra ainda)
    atualizarFiltros({ categoria_id: categoriaId });
    // Navega para a lista que aplicará o filtro ao carregar
    router.push('/(tabs)/list_produtos');
  };

  const handleProdutoPress = (produtoId: number) => {
    router.push(`/produto/${produtoId}` as any);
  };

  const renderProdutoPromocao = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.produtoPromocaoCard}
      onPress={() => handleProdutoPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.produtoPromocaoImageContainer}>
        <Image
          source={{
            uri: item.imagem_principal || 'https://via.placeholder.com/100x100/48C9B0/FFFFFF?text=Produto'
          }}
          style={styles.produtoPromocaoImage}
          resizeMode="contain"
        />
        <View style={styles.descontoBadge}>
          <Text style={styles.descontoBadgeText}>15%</Text>
        </View>
      </View>
      
      <View style={styles.produtoPromocaoInfo}>
        <Text style={styles.produtoPromocaoNome} numberOfLines={2}>
          {item.nome}
        </Text>
        <Text style={styles.produtoPromocaoPreco}>
          R$ {item.preco.toFixed(2).replace('.', ',')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header com saudação */}
        <View style={styles.header}>
          <View style={styles.saudacao}>
            <Text style={styles.saudacaoTexto}>Olá!</Text>
            <Text style={styles.saudacaoNome}>
              {user?.email?.split('@')[0] || 'Bem-vindo(a)'}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.perfilButton}>
            <Ionicons name="person-circle-outline" size={32} color="#133E4E" />
          </TouchableOpacity>
        </View>

        {/* Banner Principal */}
        <View style={styles.bannerContainer}>
          <View style={styles.banner}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitulo}>Farmácia Online</Text>
              <Text style={styles.bannerSubtitulo}>
                Medicamentos com entrega rápida
              </Text>
              <TouchableOpacity style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>Ver Ofertas</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bannerIcone}>
              <Ionicons name="medical" size={60} color="#48C9B0" />
            </View>
          </View>
        </View>

        {/* Categorias Rápidas */}
        <View style={styles.categoriasContainer}>
          <Text style={styles.secaoTitulo}>Categorias</Text>
          
          <View style={styles.categoriasGrid}>
            <TouchableOpacity
              style={styles.categoriaItem}
              onPress={() => handleCategoriaPress(1)}
            >
              <View style={styles.categoriaIcone}>
                <Ionicons name="medical" size={24} color="#48C9B0" />
              </View>
              <Text style={styles.categoriaTexto}>Medicamentos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoriaItem}
              onPress={() => handleCategoriaPress(3)}
            >
              <View style={styles.categoriaIcone}>
                <Ionicons name="sparkles" size={24} color="#48C9B0" />
              </View>
              <Text style={styles.categoriaTexto}>Cosméticos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoriaItem}
              onPress={() => handleCategoriaPress(4)}
            >
              <View style={styles.categoriaIcone}>
                <Ionicons name="water" size={24} color="#48C9B0" />
              </View>
              <Text style={styles.categoriaTexto}>Higiene</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoriaItem}
              onPress={() => router.push('/(tabs)/list_produtos')}
            >
              <View style={styles.categoriaIcone}>
                <Ionicons name="flash" size={24} color="#48C9B0" />
              </View>
              <Text style={styles.categoriaTexto}>Todos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Produtos em Promoção */}
        <View style={styles.promocaoContainer}>
          <View style={styles.promocaoHeader}>
            <Text style={styles.secaoTitulo}>🔥 Produtos em Promoção</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/list_produtos')}>
              <Text style={styles.verTodosTexto}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={produtosPromocao}
            renderItem={renderProdutoPromocao}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promocaoList}
          />
        </View>

        {/* Banner Informativo */}
        <View style={styles.infoBannerContainer}>
          <View style={styles.infoBanner}>
            <View style={styles.infoBannerIcone}>
              <Ionicons name="timer" size={24} color="#48C9B0" />
            </View>
            <View style={styles.infoBannerTexto}>
              <Text style={styles.infoBannerTitulo}>Entrega Rápida</Text>
              <Text style={styles.infoBannerSubtitulo}>
                Receba seus medicamentos em até 2 horas
              </Text>
            </View>
          </View>
        </View>

        {/* Espaçamento final */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF6F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  saudacao: {
    flex: 1,
  },
  saudacaoTexto: {
    fontSize: 16,
    color: '#666',
  },
  saudacaoNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#133E4E',
  },
  perfilButton: {
    padding: 4,
  },
  bannerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  banner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#133E4E',
    marginBottom: 4,
  },
  bannerSubtitulo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: '#48C9B0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  bannerIcone: {
    marginLeft: 16,
  },
  buscaContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  buscaInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buscaIcon: {
    marginRight: 8,
  },
  buscaInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#133E4E',
  },
  categoriasContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#133E4E',
    marginBottom: 16,
  },
  categoriasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoriaItem: {
    alignItems: 'center',
    flex: 1,
  },
  categoriaIcone: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoriaTexto: {
    fontSize: 12,
    color: '#133E4E',
    textAlign: 'center',
    fontWeight: '500',
  },
  promocaoContainer: {
    marginBottom: 24,
  },
  promocaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  verTodosTexto: {
    fontSize: 14,
    color: '#48C9B0',
    fontWeight: '600',
  },
  promocaoList: {
    paddingLeft: 20,
  },
  produtoPromocaoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  produtoPromocaoImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 8,
  },
  produtoPromocaoImage: {
    width: 80,
    height: 80,
  },
  descontoBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  descontoBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  produtoPromocaoInfo: {
    alignItems: 'center',
  },
  produtoPromocaoNome: {
    fontSize: 12,
    color: '#133E4E',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  produtoPromocaoPreco: {
    fontSize: 14,
    color: '#48C9B0',
    fontWeight: 'bold',
  },
  infoBannerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoBanner: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoBannerIcone: {
    marginRight: 12,
  },
  infoBannerTexto: {
    flex: 1,
  },
  infoBannerTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#133E4E',
    marginBottom: 2,
  },
  infoBannerSubtitulo: {
    fontSize: 12,
    color: '#666',
  },
  bottomSpacing: {
    height: 20,
  },
});