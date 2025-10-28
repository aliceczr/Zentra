import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';

// Hook personalizado para criar perfil de usuário
export const useCreateProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { criarPerfil } = useUser();
  const { user } = useAuth();

  const handleCreateProfile = async (
    nome: string, 
    cpf: string, 
    telefone: string, 
    dataNascimento: string
  ) => {
    // Validação básica
    if (!user?.id) {
      setError('Usuário não autenticado');
      return false;
    }

    if (!nome || !cpf || !telefone || !dataNascimento) {
      setError('Todos os campos são obrigatórios');
      return false;
    }

    // Validação de idade (16+ anos)
    const validateAge = (birthDate: string) => {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age >= 16;
    };

    if (!validateAge(dataNascimento)) {
      setError('Você deve ter pelo menos 16 anos para se cadastrar');
      return false;
    }

    // Validação básica de CPF (formato)
    const validateCPF = (cpf: string) => {
      const cleanCPF = cpf.replace(/[^\d]/g, '');
      return cleanCPF.length === 11 && !/^(\d)\1{10}$/.test(cleanCPF);
    };

    if (!validateCPF(cpf)) {
      setError('CPF inválido');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const sucesso = await criarPerfil({
        auth_id: user.id,
        nome,
        cpf: cpf.replace(/[^\d]/g, ''), // Remove formatação do CPF
        telefone,
        dataNascimento
      });

      if (sucesso) {
        return true;
      } else {
        setError('Erro ao criar perfil');
        return false;
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido ao criar perfil';
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
    handleCreateProfile,
    clearError,
  };
};