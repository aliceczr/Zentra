import { useState, useCallback } from 'react';
import { enderecoService, EnderecoData } from '../services/enderecoService';
import { useEnderecoContext, Endereco } from '../contexts/enderecoContext';


export interface CreateEnderecoData {
  tipo: string;
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  numero: string;
  complemento?: string;
  estado: string;
  pais: string;
  referencia?: string;
  principal: boolean;
}

export interface EnderecoFormData {
  tipo: string;
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  numero: string;
  complemento: string;
  estado: string;
  pais: string;
  referencia: string;
  principal: boolean;
}



export function useEndereco() {
  const {
    enderecos,
    enderecoPrincipal,
    loading,
    error,
    criarEndereco,
    buscarEnderecos,
    atualizarEndereco,
    removerEndereco,
    definirEnderecoPrincipal,
    limparErro,
    recarregarEnderecos,
    validarEndereco
  } = useEnderecoContext();

  return {
   
    enderecos,
    enderecoPrincipal,
    loading,
    error,
    

    criar: criarEndereco,
    buscar: buscarEnderecos,
    atualizar: atualizarEndereco,
    remover: removerEndereco,
    definirPrincipal: definirEnderecoPrincipal,
    
   
    limparErro,
    recarregar: recarregarEnderecos,
    validar: validarEndereco,
    
  
    temEnderecos: enderecos.length > 0,
    quantidadeEnderecos: enderecos.length,
    enderecosResidenciais: enderecos.filter(e => e.tipo === 'residencial'),
    enderecosComerciais: enderecos.filter(e => e.tipo === 'comercial'),
  };
}



export function useCriarEndereco() {
  const { criarEndereco, loading, error, limparErro } = useEnderecoContext();
  const [formData, setFormData] = useState<EnderecoFormData>({
    tipo: 'residencial',
    cep: '',
    logradouro: '',
    bairro: '',
    cidade: '',
    numero: '',
    complemento: '',
    estado: '',
    pais: 'Brasil',
    referencia: '',
    principal: false,
  });

  const atualizarCampo = useCallback((campo: keyof EnderecoFormData, valor: string | boolean) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const limparFormulario = useCallback(() => {
    setFormData({
      tipo: 'residencial',
      cep: '',
      logradouro: '',
      bairro: '',
      cidade: '',
      numero: '',
      complemento: '',
      estado: '',
      pais: 'Brasil',
      referencia: '',
      principal: false,
    });
  }, []);

  const criar = useCallback(async (): Promise<boolean> => {
    const sucesso = await criarEndereco(formData);
    if (sucesso) {
      limparFormulario();
    }
    return sucesso;
  }, [criarEndereco, formData, limparFormulario]);

  return {
   
    formData,
    loading,
    error,
    
 
    atualizarCampo,
    limparFormulario,
    criar,
    limparErro,
    
    
    podeSubmeter: formData.cep.length === 8 && 
                  formData.logradouro.trim() !== '' && 
                  formData.bairro.trim() !== '' && 
                  formData.cidade.trim() !== '' && 
                  formData.numero.trim() !== '',
  };
}



export function useBuscarCEP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarCEP = useCallback(async (cep: string) => {
    setLoading(true);
    setError(null);

    try {
      const dadosEndereco = await enderecoService.buscarCEP(cep);
      return dadosEndereco;
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao buscar CEP';
      setError(mensagem);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const limparErro = useCallback(() => setError(null), []);

  return {
    buscarCEP,
    loading,
    error,
    limparErro,
  };
}

export function useEnderecoCheckout() {
  const { enderecoPrincipal, enderecos, loading } = useEnderecoContext();
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<string | null>(null);

 
  const enderecoEntrega = enderecoSelecionado 
    ? enderecos.find(e => e.id === enderecoSelecionado) 
    : enderecoPrincipal;

  return {
 
    enderecoPrincipal,
    enderecos,
    enderecoEntrega,
    enderecoSelecionado,
    loading,
    

    selecionarEndereco: setEnderecoSelecionado,
    
 
    temEnderecoEntrega: !!enderecoEntrega,
    podeFinalizarCompra: !!enderecoEntrega && !loading,
    
    
    enderecoFormatado: enderecoEntrega ? formatarEndereco(enderecoEntrega) : '',
    
  
    enderecosDisponiveis: enderecos.map(endereco => ({
      id: endereco.id ?? '',
      label: `${endereco.tipo} - ${endereco.logradouro}, ${endereco.numero}`,
      completo: formatarEndereco(endereco),
      principal: !!endereco.principal,
    })),
  };
}



export function formatarEndereco(endereco: Endereco): string {
  if (!endereco) return '';

  const partes: string[] = [];
  if (endereco.logradouro) partes.push(endereco.logradouro);
  if (endereco.numero) partes.push(String(endereco.numero));
  if (endereco.complemento && endereco.complemento.trim() !== '') partes.push(endereco.complemento.trim());
  if (endereco.bairro) partes.push(endereco.bairro);
  if (endereco.cidade) partes.push(endereco.cidade);
  if (endereco.estado) partes.push(endereco.estado);
  if (endereco.cep) partes.push(endereco.cep);

  return partes.join(', ');
}

export function formatarCEP(cep: string): string {
  const cepLimpo = cep.replace(/[^\d]/g, '');
  if (cepLimpo.length === 8) {
    return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
  }
  return cepLimpo;
}

export function validarCEP(cep: string): boolean {
  const cepLimpo = cep.replace(/[^\d]/g, '');
  return cepLimpo.length === 8;
}


export function obterTextoTipo(tipo: string): string {
  const tipos: Record<string, string> = {
    'residencial': 'Residencial',
    'comercial': 'Comercial',
    'trabalho': 'Trabalho',
    'outro': 'Outro',
  };
  
  return tipos[tipo.toLowerCase()] || 'Outro';
}




export function useEstatisticasEndereco() {
  const { enderecos } = useEnderecoContext();

  const estatisticas = {
    total: enderecos.length,
    porTipo: enderecos.reduce((acc, endereco) => {
      acc[endereco.tipo] = (acc[endereco.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    temPrincipal: enderecos.some(e => e.principal),
    principais: enderecos.filter(e => e.principal).length,
  };

  return {
    estatisticas,
    enderecoMaisUsado: Object.entries(estatisticas.porTipo)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null,
  };
}

