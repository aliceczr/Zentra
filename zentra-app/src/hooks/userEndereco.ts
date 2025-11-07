import { useState, useCallback } from 'react';
import { enderecoService, EnderecoData } from '../services/enderecoService';
import { useEnderecoContext } from '../contexts/enderecoContext';
import { useAuth } from '../contexts/AuthContext';


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


/**
 * Hook principal para gerenciar endereços do usuário
 * Use em telas de perfil, checkout, cadastro de endereços
 */
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
    // Estado
    enderecos,
    enderecoPrincipal,
    loading,
    error,
    
    // Ações
    criar: criarEndereco,
    buscar: buscarEnderecos,
    atualizar: atualizarEndereco,
    remover: removerEndereco,
    definirPrincipal: definirEnderecoPrincipal,
    
    // Utilitários
    limparErro,
    recarregar: recarregarEnderecos,
    validar: validarEndereco,
    
    // Propriedades derivadas
    temEnderecos: enderecos.length > 0,
    quantidadeEnderecos: enderecos.length,
    enderecosResidenciais: enderecos.filter(e => e.tipo === 'residencial'),
    enderecosComerciais: enderecos.filter(e => e.tipo === 'comercial'),
  };
}


/**
 * Hook especializado para criar novo endereço
 * Use em telas de cadastro de endereço
 */
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
    // Estado do formulário
    formData,
    loading,
    error,
    
    // Ações
    atualizarCampo,
    limparFormulario,
    criar,
    limparErro,
    
    // Validação
    podeSubmeter: formData.cep.length === 8 && 
                  formData.logradouro.trim() !== '' && 
                  formData.bairro.trim() !== '' && 
                  formData.cidade.trim() !== '' && 
                  formData.numero.trim() !== '',
  };
}


/**
 * Hook para buscar endereço por CEP
 * Use em formulários de endereço
 */
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


/**
 * Hook especializado para fluxo de checkout
 * Use em telas de pagamento e finalização de compra
 */
export function useEnderecoCheckout() {
  const { enderecoPrincipal, enderecos, loading } = useEnderecoContext();
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<string | null>(null);

  // Endereço para entrega (selecionado ou principal)
  const enderecoEntrega = enderecoSelecionado 
    ? enderecos.find(e => e.id === enderecoSelecionado) 
    : enderecoPrincipal;

  return {
    // Estado
    enderecoPrincipal,
    enderecos,
    enderecoEntrega,
    enderecoSelecionado,
    loading,
    
    // Ações
    selecionarEndereco: setEnderecoSelecionado,
    
    // Validações
    temEnderecoEntrega: !!enderecoEntrega,
    podeFinalizarCompra: !!enderecoEntrega && !loading,
    
    // Dados formatados
    enderecoFormatado: enderecoEntrega ? formatarEndereco(enderecoEntrega) : '',
    
    // Lista para seleção
    enderecosDisponiveis: enderecos.map(endereco => ({
      id: endereco.id!,
      label: `${endereco.tipo} - ${endereco.logradouro}, ${endereco.numero}`,
      completo: formatarEndereco(endereco),
      principal: endereco.principal,
    })),
  };
}


/**
 * Formatar endereço completo
 */
export function formatarEndereco(endereco: any): string {
  const partes = [
    endereco.logradouro,
    endereco.numero,
    endereco.complemento && endereco.complemento.trim() !== '' ? endereco.complemento : null,
    endereco.bairro,
    endereco.cidade,
    endereco.estado,
    endereco.cep
  ].filter(Boolean);
  
  return partes.join(', ');
}

/**
 * Formatar CEP
 */
export function formatarCEP(cep: string): string {
  const cepLimpo = cep.replace(/[^\d]/g, '');
  if (cepLimpo.length === 8) {
    return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
  }
  return cepLimpo;
}

/**
 * Validar CEP
 */
export function validarCEP(cep: string): boolean {
  const cepLimpo = cep.replace(/[^\d]/g, '');
  return cepLimpo.length === 8;
}

/**
 * Obter texto do tipo de endereço
 */
export function obterTextoTipo(tipo: string): string {
  const tipos: Record<string, string> = {
    'residencial': 'Residencial',
    'comercial': 'Comercial',
    'trabalho': 'Trabalho',
    'outro': 'Outro',
  };
  
  return tipos[tipo.toLowerCase()] || 'Outro';
}



/**
 * Hook para estatísticas e relatórios de endereços
 * Use em telas de perfil ou dashboards
 */
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

