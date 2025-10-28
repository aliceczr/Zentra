import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { buscarProdutos, buscarPorId } from '../services/produtoService';
import { useBuscaProdutos, useProduto, useProdutos } from '../hooks/hooksProdutos';
import { Produto } from '../services/produtoService';

export default function TesteScreen() {
  const [resultadoService, setResultadoService] = useState<string>('');
  const [resultadoHook, setResultadoHook] = useState<string>('');
  
  // Hook de busca
  const { produtos: produtosBusca, loading: loadingBusca, buscar } = useBuscaProdutos();
  
  // Hook de produto específico
  const { produto, loading: loadingProduto, recarregar } = useProduto(1);
  
  // Hook básico
  const { produtos: produtosBasico, loading: loadingBasico, recarregar: recarregarBasico } = useProdutos();

  // Teste 1: Service direto
  const testarService = async () => {
    try {
      console.log('🧪 Testando Service...');
      
      // Buscar todos os produtos
      const produtos = await buscarProdutos();
      console.log('✅ Service buscarProdutos:', produtos.length, 'produtos');
      
      // Buscar produto específico
      const produto = await buscarPorId(1);
      console.log('✅ Service buscarPorId:', produto?.nome);
      
      setResultadoService(`✅ Service OK! ${produtos.length} produtos encontrados`);
    } catch (error) {
      console.error('❌ Erro no Service:', error);
      setResultadoService(`❌ Erro no Service: ${error}`);
    }
  };

  // Teste 2: Hook de busca
  const testarHookBusca = async () => {
    try {
      console.log('🧪 Testando Hook de Busca...');
      await buscar({});
      setResultadoHook(`✅ Hook Busca OK! ${produtosBusca.length} produtos`);
    } catch (error) {
      console.error('❌ Erro no Hook:', error);
      setResultadoHook(`❌ Erro no Hook: ${error}`);
    }
  };

  // Teste 3: Filtros
  const testarFiltros = async () => {
    try {
      console.log('🧪 Testando Filtros...');
      await buscar({ preco_max: 20 });
      console.log('✅ Filtro por preço aplicado');
    } catch (error) {
      console.error('❌ Erro nos Filtros:', error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#EAF6F6' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 }}>
        🧪 TESTES DO SISTEMA
      </Text>

      {/* Teste Service */}
      <View style={{ marginBottom: 30, padding: 15, backgroundColor: '#fff', borderRadius: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          1️⃣ Teste Service Direto
        </Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#48C9B0', padding: 15, borderRadius: 5, marginBottom: 10 }}
          onPress={testarService}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Testar Service
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 14 }}>{resultadoService}</Text>
      </View>

      {/* Teste Hook Básico */}
      <View style={{ marginBottom: 30, padding: 15, backgroundColor: '#fff', borderRadius: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          2️⃣ Hook Básico (useProdutos)
        </Text>
        <Text>Loading: {loadingBasico ? 'Sim' : 'Não'}</Text>
        <Text>Produtos: {produtosBasico.length}</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#48C9B0', padding: 10, borderRadius: 5, marginTop: 10 }}
          onPress={recarregarBasico}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Recarregar</Text>
        </TouchableOpacity>
      </View>

      {/* Teste Hook de Busca */}
      <View style={{ marginBottom: 30, padding: 15, backgroundColor: '#fff', borderRadius: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          3️⃣ Hook de Busca
        </Text>
        <Text>Loading: {loadingBusca ? 'Sim' : 'Não'}</Text>
        <Text>Produtos: {produtosBusca.length}</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#48C9B0', padding: 15, borderRadius: 5, marginBottom: 10 }}
          onPress={testarHookBusca}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Testar Hook Busca
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 14 }}>{resultadoHook}</Text>
      </View>

      {/* Teste Produto Específico */}
      <View style={{ marginBottom: 30, padding: 15, backgroundColor: '#fff', borderRadius: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          4️⃣ Hook Produto Específico
        </Text>
        <Text>Loading: {loadingProduto ? 'Sim' : 'Não'}</Text>
        <Text>Produto: {produto?.nome || 'Nenhum'}</Text>
        <Text>Preço: R$ {produto?.preco || '0,00'}</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#48C9B0', padding: 10, borderRadius: 5, marginTop: 10 }}
          onPress={recarregar}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Recarregar</Text>
        </TouchableOpacity>
      </View>

      {/* Teste Filtros */}
      <View style={{ marginBottom: 30, padding: 15, backgroundColor: '#fff', borderRadius: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          5️⃣ Teste Filtros
        </Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#48C9B0', padding: 15, borderRadius: 5, marginBottom: 10 }}
          onPress={testarFiltros}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Filtrar por Preço ≤ R$ 20
          </Text>
        </TouchableOpacity>
        <Text>Resultados filtrados: {produtosBusca.length}</Text>
      </View>

      {/* Lista dos primeiros produtos */}
      <View style={{ marginBottom: 50, padding: 15, backgroundColor: '#fff', borderRadius: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          📋 Primeiros Produtos
        </Text>
        {produtosBasico.slice(0, 3).map((produto, index) => (
          <View key={produto.id} style={{ marginBottom: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 }}>
            <Text style={{ fontWeight: 'bold' }}>{produto.nome}</Text>
            <Text>R$ {produto.preco.toFixed(2)}</Text>
            <Text>Fabricante: {produto.fabricante}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}