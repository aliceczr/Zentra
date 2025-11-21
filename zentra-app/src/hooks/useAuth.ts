import { useState } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { userService } from '../services/userService';

export const useAuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, signIn } = useAuthContext();

  const handleSignUp = async (email: string, password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signUp(email, password);
      return result;
    } catch (err) {
      console.error('Erro no signUp:', err);
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpWithProfile = async (
    email: string, 
    password: string, 
    confirmPassword: string,
    profileData: {
      nome: string;
      cpf: string;
      telefone: string;
      dataNascimento: string;
    }
  ) => {
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      console.error('Senhas não coincidem');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const authResult = await signUp(email, password);
      if (!authResult) {
        throw new Error('Erro ao criar conta de autenticação');
      }
      

      const user = authResult.user;
      
      if (!user?.id) {
        throw new Error('Usuário criado mas ID não encontrado');
      }

   
      await userService.createProfile({
        auth_id: user.id,
        nome: profileData.nome,
        cpf: profileData.cpf,
        telefone: profileData.telefone,
        dataNascimento: profileData.dataNascimento
      });

      
      return true;
      
    } catch (err) {
      console.error('Erro no cadastro completo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    loading,
    error,
    handleSignUp,
    handleSignUpWithProfile,
    handleSignIn,
    clearError,
  };
};