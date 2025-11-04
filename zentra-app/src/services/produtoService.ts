
import {supabase} from '../../supabase-client';
import { PostgrestError } from '@supabase/supabase-js';


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



// =============================================================================
// 🟢 SUPABASE FUNCTIONS
// =============================================================================
export async function buscarProdutos(filtros?: FiltrosProduto): Promise<Produto[]> {
  try {
    console.log("🟢 SERVICE: Buscando produtos do Supabase com filtros:", filtros);
    
    let query = supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    // Aplicar filtros se fornecidos
    if (filtros) {
      if (filtros.categoria_id) {
        query = query.eq('categoria_id', filtros.categoria_id);
        console.log("🔧 SERVICE: Aplicando filtro categoria_id:", filtros.categoria_id);
      }
      if (filtros.destaque !== undefined) {
        query = query.eq('destaque', filtros.destaque);
        console.log("🔧 SERVICE: Aplicando filtro destaque:", filtros.destaque);
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
        console.log("🔧 SERVICE: Aplicando busca por texto:", filtros.busca);
      }
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('❌ SERVICE: Erro ao buscar produtos:', error);
      throw new Error(`Buscar produtos falhou: ${error.message}`);
    }
    
    console.log('✅ SERVICE: Produtos retornados do Supabase:', data?.length || 0);
    console.log('📊 SERVICE: Primeiro produto:', data?.[0]);
    
    return data || [];
  } catch (error) {
    console.error('❌ SERVICE: Erro geral ao buscar produtos:', error);
    throw error;
  }
}

export async function buscarPorId(id: number): Promise<Produto | null> {
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
// 🏭 FUNÇÕES PARA FILTROS DINÂMICOS
// =============================================================================

// Interface para opções de filtro
export interface FiltroOpcao {
  id: string;
  label: string;
  value: string;
  count?: number; // Quantidade de produtos com essa opção
}

// Buscar fabricantes únicos do banco
export async function buscarFabricantes(): Promise<FiltroOpcao[]> {
  try {
    console.log("🏭 SERVICE: Buscando fabricantes únicos do banco...");
    
    const { data, error } = await supabase
      .from('produtos')
      .select('fabricante')
      .eq('ativo', true)
      .not('fabricante', 'is', null)
      .not('fabricante', 'eq', '');

    if (error) {
      console.error('❌ Erro ao buscar fabricantes:', error);
      return [{ id: 'todos', label: 'Todos os Fabricantes', value: '' }];
    }

    // Contar ocorrências de cada fabricante
    const fabricantesCount: { [key: string]: number } = {};
    data.forEach(item => {
      if (item.fabricante) {
        fabricantesCount[item.fabricante] = (fabricantesCount[item.fabricante] || 0) + 1;
      }
    });

    // Converter para formato de opções
    const fabricantesOpcoes: FiltroOpcao[] = [
      { id: 'todos', label: 'Todos os Fabricantes', value: '' }
    ];

    Object.entries(fabricantesCount).forEach(([fabricante, count]) => {
      fabricantesOpcoes.push({
        id: fabricante.toLowerCase().replace(/\s+/g, '-'),
        label: `${fabricante} (${count})`,
        value: fabricante,
        count
      });
    });

    // Ordenar por nome
    fabricantesOpcoes.slice(1).sort((a, b) => a.value.localeCompare(b.value));

    console.log("✅ Fabricantes encontrados:", fabricantesOpcoes.length - 1);
    return fabricantesOpcoes;

  } catch (error) {
    console.error('❌ Erro geral ao buscar fabricantes:', error);
    return [{ id: 'todos', label: 'Todos os Fabricantes', value: '' }];
  }
}

// Buscar marcas únicas do banco
export async function buscarMarcas(): Promise<FiltroOpcao[]> {
  try {
    console.log("🏷️ SERVICE: Buscando marcas únicas do banco...");
    
    const { data, error } = await supabase
      .from('produtos')
      .select('marca')
      .eq('ativo', true)
      .not('marca', 'is', null)
      .not('marca', 'eq', '');

    if (error) {
      console.error('❌ Erro ao buscar marcas:', error);
      return [{ id: 'todas', label: 'Todas as Marcas', value: '' }];
    }

    // Contar ocorrências de cada marca
    const marcasCount: { [key: string]: number } = {};
    data.forEach(item => {
      if (item.marca) {
        marcasCount[item.marca] = (marcasCount[item.marca] || 0) + 1;
      }
    });

    // Converter para formato de opções
    const marcasOpcoes: FiltroOpcao[] = [
      { id: 'todas', label: 'Todas as Marcas', value: '' }
    ];

    Object.entries(marcasCount).forEach(([marca, count]) => {
      marcasOpcoes.push({
        id: marca.toLowerCase().replace(/\s+/g, '-'),
        label: `${marca} (${count})`,
        value: marca,
        count
      });
    });

    // Ordenar por nome
    marcasOpcoes.slice(1).sort((a, b) => a.value.localeCompare(b.value));

    console.log("✅ Marcas encontradas:", marcasOpcoes.length - 1);
    return marcasOpcoes;

  } catch (error) {
    console.error('❌ Erro geral ao buscar marcas:', error);
    return [{ id: 'todas', label: 'Todas as Marcas', value: '' }];
  }
}

// Buscar categorias do banco (bonus - para também ser dinâmico)
export async function buscarCategorias(): Promise<FiltroOpcao[]> {
  try {
    console.log("📂 SERVICE: Buscando categorias do banco...");
    
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nome')
      .order('nome');

    if (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      return [{ id: 'todas', label: 'Todas as Categorias', value: '' }];
    }

    const categoriasOpcoes: FiltroOpcao[] = [
      { id: 'todas', label: 'Todas as Categorias', value: '' }
    ];

    data.forEach(categoria => {
      categoriasOpcoes.push({
        id: categoria.id.toString(),
        label: categoria.nome,
        value: categoria.id.toString()
      });
    });

    console.log("✅ Categorias encontradas:", categoriasOpcoes.length - 1);
    return categoriasOpcoes;

  } catch (error) {
    console.error('❌ Erro geral ao buscar categorias:', error);
    return [{ id: 'todas', label: 'Todas as Categorias', value: '' }];
  }
}