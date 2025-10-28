import { useState } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';

export const useAuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, signIn } = useAuthContext();

  const handleSignUp = async (email: string, password: string, confirmPassword: string) => {
    console.log('🔐 useAuthForm.handleSignUp chamado');
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      console.error('❌ Senhas não coincidem');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📞 Chamando authContext.signUp...');
      const result = await signUp(email, password);
      console.log('✅ authContext.signUp concluído:', result);
      return result; // Retorna o resultado completo
    } catch (err) {
      console.error('❌ Erro no signUp:', err);
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
    handleSignIn,
    clearError,
  };
};