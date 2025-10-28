import { useState } from 'react';
import { enderecoService, EnderecoData } from '../services/enderecoService';
import { useAuth } from '../contexts/AuthContext';

// Interface para os dados de endereço sem user_id (será preenchido automaticamente)
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

// Hook personalizado para criar endereço de usuário
export const useCreateEndereco = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleCreateEndereco = async (enderecoData: CreateEnderecoData) => {
    // Validação de usuário autenticado
    if (!user?.id) {
      setError('Usuário não autenticado');
      return false;
    }

    // Validação dos campos obrigatórios
    const { tipo, cep, logradouro, bairro, cidade, numero, estado, pais, principal } = enderecoData;
    
    if (!tipo || !cep || !logradouro || !bairro || !cidade || !numero || !estado || !pais) {
      setError('Todos os campos obrigatórios devem ser preenchidos');
      return false;
    }

    // Validação de CEP (formato brasileiro)
    const validateCEP = (cep: string) => {
      const cleanCEP = cep.replace(/[^\d]/g, '');
      return cleanCEP.length === 8;
    };

    if (!validateCEP(cep)) {
      setError('CEP deve ter 8 dígitos');
      return false;
    }

    // Validação de tipo de endereço
    const tiposValidos = ['residencial', 'comercial', 'trabalho', 'outro'];
    if (!tiposValidos.includes(tipo.toLowerCase())) {
      setError('Tipo de endereço inválido');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepara os dados completos com user_id
      const enderecoCompleto: EnderecoData = {
        user_id: user.id,
        tipo: tipo.toLowerCase(),
        cep: cep.replace(/[^\d]/g, ''), // Remove formatação do CEP
        logradouro,
        bairro,
        cidade,
        numero,
        complemento: enderecoData.complemento || '',
        estado,
        pais,
        referencia: enderecoData.referencia || '',
        principal
      };

      const resultado = await enderecoService.criaEndereco(enderecoCompleto);

      if (resultado !== null) {
        return true;
      } else {
        setError('Erro ao criar endereço');
        return false;
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido ao criar endereço';
      setError(mensagem);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    loading,
    error,
    handleCreateEndereco,
    clearError,
  };
};

// Hook para validação de CEP via API dos Correios (opcional)
export const useValidateCEP = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/[^\d]/g, '');
    
    if (cleanCEP.length !== 8) {
      setError('CEP deve ter 8 dígitos');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        return null;
      }

      return {
        cep: data.cep,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
        complemento: data.complemento || ''
      };
    } catch (err) {
      setError('Erro ao validar CEP');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    loading,
    error,
    validateCEP,
    clearError,
  };
};
