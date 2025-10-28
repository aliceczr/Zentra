
import {supabase} from '../../supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import { mockProdutos } from '../data/mocks/mockProdutosTeste';

const USE_SUPABASE = false; // 👈 Mudando para mock para testes

// Interface para produtos vindos do banco (com ID)
export interface Produto {
  id: number; // ID gerado automaticamente pelo banco
  categoria_id: number;
  nome: string;
  descricao?: string;
  composicao?: string;
  indicacao?: string;
  contraindicacao?: string;
  modo_uso?: string;
  codigo_barras?: string;
  preco: number;
  controlado: boolean;
  requer_receita: boolean;
  imagem_principal?: string;
  imagens_adicionais?: string[];
  peso_gramas?: number;
  dimensoes_cm?: string;
  fabricante?: string;
  marca?: string;
  slug: string;
  destaque: boolean;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
  // Novos campos para detalhes
  bula_url?: string;
  registro_ms?: string;
  principio_ativo?: string;
  dosagem?: string;
  apresentacao?: string;
}

// Interface para criar produtos (sem ID - banco vai gerar)
export interface CriarProduto {
  categoria_id: number;
  nome: string;
  descricao?: string;
  composicao?: string;
  indicacao?: string;
  contraindicacao?: string;
  modo_uso?: string;
  codigo_barras?: string;
  preco: number;
  controlado?: boolean;
  requer_receita?: boolean;
  imagem_principal?: string;
  imagens_adicionais?: string[];
  peso_gramas?: number;
  dimensoes_cm?: string;
  fabricante?: string;
  marca?: string;
  slug: string;
  destaque?: boolean;
  ativo?: boolean;
}

// Interface para filtros de busca
export interface FiltrosProduto {
  categoria_id?: number;
  destaque?: boolean;
  ativo?: boolean;
  controlado?: boolean;
  requer_receita?: boolean;
  preco_min?: number;
  preco_max?: number;
  fabricante?: string;
  marca?: string;
  busca?: string; // busca por nome ou descrição
}

// Interface para dados de criação (sem campos auto-gerados)
export interface CriarProduto {
  categoria_id: number;
  nome: string;
  descricao?: string;
  composicao?: string;
  indicacao?: string;
  contraindicacao?: string;
  modo_uso?: string;
  codigo_barras?: string;
  preco: number;
  controlado?: boolean;
  requer_receita?: boolean;
  imagem_principal?: string;
  imagens_adicionais?: string[];
  peso_gramas?: number;
  dimensoes_cm?: string;
  fabricante?: string;
  marca?: string;
  slug: string;
  destaque?: boolean;
  ativo?: boolean;
}

// =============================================================================
// 🔹 MOCK SERVICE CLASS
// =============================================================================
class MockProdutoService {

  async buscarProdutos(filtros?: FiltrosProduto): Promise<Produto[]> {
    console.log("🔹 Usando dados mockados para produtos...");
    
    // Usar dados reais do arquivo mockProdutos
    let produtos = mockProdutos.filter(p => p.ativo);
    
    // Aplicar filtros no mock data
    if (filtros) {
      if (filtros.categoria_id) {
        produtos = produtos.filter(p => p.categoria_id === filtros.categoria_id);
      }
      if (filtros.destaque !== undefined) {
        produtos = produtos.filter(p => p.destaque === filtros.destaque);
      }
      if (filtros.controlado !== undefined) {
        produtos = produtos.filter(p => p.controlado === filtros.controlado);
      }
      if (filtros.requer_receita !== undefined) {
        produtos = produtos.filter(p => p.requer_receita === filtros.requer_receita);
      }
      if (filtros.preco_min !== undefined) {
        produtos = produtos.filter(p => p.preco >= filtros.preco_min!);
      }
      if (filtros.preco_max !== undefined) {
        produtos = produtos.filter(p => p.preco <= filtros.preco_max!);
      }
      if (filtros.fabricante) {
        produtos = produtos.filter(p => p.fabricante === filtros.fabricante);
      }
      if (filtros.marca) {
        produtos = produtos.filter(p => p.marca === filtros.marca);
      }
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        produtos = produtos.filter(p => 
          p.nome.toLowerCase().includes(busca) || 
          (p.descricao && p.descricao.toLowerCase().includes(busca))
        );
      }
    }
    
    return produtos.sort((a, b) => 
      new Date(b.criado_em || '').getTime() - new Date(a.criado_em || '').getTime()
    );
  }

  async buscarPorId(id: number): Promise<Produto | null> {
    console.log("🔹 Buscando produto mock por ID...");
    
    // Buscar produto por ID nos dados mock
    const produto = mockProdutos.find(p => p.id === id && p.ativo);
    return produto || null;
  }
}

// Instância do mock service
const mockService = new MockProdutoService();


// =============================================================================
// 🔹 SUPABASE FUNCTIONS
// =============================================================================
async function buscarProdutosSupabase(filtros?: FiltrosProduto): Promise<Produto[]> {
  try {
    console.log("🟢 Buscando produtos do Supabase...");
    
    let query = supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('criado_em', { ascending: false });

    // Aplicar filtros se fornecidos
    if (filtros) {
      if (filtros.categoria_id) {
        query = query.eq('categoria_id', filtros.categoria_id);
      }
      if (filtros.destaque !== undefined) {
        query = query.eq('destaque', filtros.destaque);
      }
      if (filtros.controlado !== undefined) {
        query = query.eq('controlado', filtros.controlado);
      }
      if (filtros.requer_receita !== undefined) {
        query = query.eq('requer_receita', filtros.requer_receita);
      }
      if (filtros.preco_min !== undefined) {
        query = query.gte('preco', filtros.preco_min);
      }
      if (filtros.preco_max !== undefined) {
        query = query.lte('preco', filtros.preco_max);
      }
      if (filtros.fabricante) {
        query = query.eq('fabricante', filtros.fabricante);
      }
      if (filtros.marca) {
        query = query.eq('marca', filtros.marca);
      }
      if (filtros.busca) {
        query = query.or(`nome.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%`);
      }
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error(`Buscar produtos falhou: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
}

async function buscarPorIdSupabase(id: number): Promise<Produto | null> {
  try {
    console.log("🟢 Buscando produto do Supabase por ID...");
    
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .eq('ativo', true)
      .single();

    if (error) {
      console.error('Erro ao buscar produto por ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error);
    return null;
  }
}

// =============================================================================
// 🎯 EXPORT FUNCTIONS (ESCOLHA AUTOMÁTICA)
// =============================================================================
export async function buscarProdutos(filtros?: FiltrosProduto): Promise<Produto[]> {
  if (!USE_SUPABASE) {
    return await mockService.buscarProdutos(filtros);
  } else {
    return await buscarProdutosSupabase(filtros);
  }
}

export async function buscarPorId(id: number): Promise<Produto | null> {
  if (!USE_SUPABASE) {
    return await mockService.buscarPorId(id);
  } else {
    return await buscarPorIdSupabase(id);
  }
}