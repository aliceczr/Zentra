
import {supabase} from '../../supabase-client';
import { PostgrestError } from '@supabase/supabase-js';


export interface Produto {
  id: number; 
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
  bula_url?: string;
  registro_ms?: string;
  principio_ativo?: string;
  dosagem?: string;
  apresentacao?: string;
}


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
  busca?: string; 
}




export async function buscarProdutos(filtros?: FiltrosProduto): Promise<Produto[]> {
  try {
    let query = supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false });

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
      throw new Error(`Buscar produtos falhou: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    throw error;
  }
}

export async function buscarPorId(id: number): Promise<Produto | null> {
  try {
    
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


export interface FiltroOpcao {
  id: string;
  label: string;
  value: string;
  count?: number; 
}


export async function buscarFabricantes(): Promise<FiltroOpcao[]> {
  try {
    
    const { data, error } = await supabase
      .from('produtos')
      .select('fabricante')
      .eq('ativo', true)
      .not('fabricante', 'is', null)
      .not('fabricante', 'eq', '');

    if (error) {
      console.error('Erro ao buscar fabricantes:', error);
      return [{ id: 'todos', label: 'Todos os Fabricantes', value: '' }];
    }

    const fabricantesCount: { [key: string]: number } = {};
    data.forEach(item => {
      if (item.fabricante) {
        fabricantesCount[item.fabricante] = (fabricantesCount[item.fabricante] || 0) + 1;
      }
    });

    const fabricantesOpcoes: FiltroOpcao[] = [
      { id: 'todos', label: 'Todos os Fabricantes', value: '' }
    ];
    const fabricantesLista: FiltroOpcao[] = Object.entries(fabricantesCount).map(([fabricante, count]) => ({
      id: fabricante.toLowerCase().replace(/\s+/g, '-'),
      label: `${fabricante} (${count})`,
      value: fabricante,
      count
    }));

    fabricantesLista.sort((a, b) => a.value.localeCompare(b.value));

    return [
      { id: 'todos', label: 'Todos os Fabricantes', value: '' },
      ...fabricantesLista,
    ];

  } catch (error) {
    console.error('Erro geral ao buscar fabricantes:', error);
    return [{ id: 'todos', label: 'Todos os Fabricantes', value: '' }];
  }
}


export async function buscarMarcas(): Promise<FiltroOpcao[]> {
  try {
    
    const { data, error } = await supabase
      .from('produtos')
      .select('marca')
      .eq('ativo', true)
      .not('marca', 'is', null)
      .not('marca', 'eq', '');

    if (error) {
      console.error('Erro ao buscar marcas:', error);
      return [{ id: 'todas', label: 'Todas as Marcas', value: '' }];
    }

    const marcasCount: { [key: string]: number } = {};
    data.forEach(item => {
      if (item.marca) {
        marcasCount[item.marca] = (marcasCount[item.marca] || 0) + 1;
      }
    });


    const marcasOpcoes: FiltroOpcao[] = [
      { id: 'todas', label: 'Todas as Marcas', value: '' }
    ];

    const marcasLista: FiltroOpcao[] = Object.entries(marcasCount).map(([marca, count]) => ({
      id: marca.toLowerCase().replace(/\s+/g, '-'),
      label: `${marca} (${count})`,
      value: marca,
      count
    }));

    marcasLista.sort((a, b) => a.value.localeCompare(b.value));

    return [
      { id: 'todas', label: 'Todas as Marcas', value: '' },
      ...marcasLista,
    ];

  } catch (error) {
    console.error('Erro geral ao buscar marcas:', error);
    return [{ id: 'todas', label: 'Todas as Marcas', value: '' }];
  }
}


export async function buscarCategorias(): Promise<FiltroOpcao[]> {
  try {
    
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nome')
      .order('nome');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
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

    return categoriasOpcoes;

  } catch (error) {
    console.error('Erro geral ao buscar categorias:', error);
    return [{ id: 'todas', label: 'Todas as Categorias', value: '' }];
  }
}


export async function buscarPorIds(ids: number[]): Promise<Map<number, Produto>> {
  try {
    if (!ids || ids.length === 0) return new Map();

    // Supabase supports `in` to fetch multiple ids in one query
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .in('id', ids)
      .eq('ativo', true);

    if (error) {
      console.error('Erro ao buscar produtos por IDs:', error);
      return new Map();
    }

    const map = new Map<number, Produto>();
    (data || []).forEach((p: Produto) => map.set(p.id, p));
    return map;
  } catch (error) {
    console.error('Erro ao buscar produtos por IDs:', error);
    return new Map();
  }
}