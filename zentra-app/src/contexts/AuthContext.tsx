import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { supabase } from '../../supabase-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isRegistering: boolean;
  setIsRegistering: (value: boolean) => void;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // TEMPORÁRIO: Comentando verificação inicial para debug
    // const getInitialUser = async () => {
    //   try {
    //     const currentUser = await authService.getCurrentUser();
    //     setUser(currentUser);
    //   } catch (error) {
    //     console.error('Erro ao verificar usuário:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // getInitialUser();
    
    // Marca como não carregando
    setLoading(false);

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state change:', { event, user: session?.user?.id });
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string): Promise<any> => {
    try {
      console.log('🔐 AuthContext.signUp chamado');
      const result = await authService.signUp({ email, password });
      console.log('✅ authService.signUp resultado:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro no AuthContext.signUp:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      await authService.signIn({ email, password });
    } catch (error) {
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isRegistering,
    setIsRegistering,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};