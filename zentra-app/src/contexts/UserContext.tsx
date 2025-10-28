import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { userService } from '../services/userService';
import { supabase } from '../../supabase-client';
import { useAuth } from './AuthContext';

interface UserContextType {
  profile: any; // Defina um tipo adequado para o perfil do usuário
  loadingProfile: boolean;
  fetchUserProfile: () => Promise<void>;
  criarPerfil: (data: { auth_id: string; nome: string; cpf: string; telefone: string; dataNascimento: string }) => Promise<boolean>;
}   

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const { user } = useAuth();

  const fetchUserProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    try {
      const userProfile = await userService.getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const criarPerfil = async (data: { auth_id: string; nome: string; cpf: string; telefone: string; dataNascimento: string }): Promise<boolean> => {
    try {
      await userService.createProfile(data);
      // Atualiza o perfil após criar
      await fetchUserProfile();
      return true;
    } catch (error) {
      console.error('Error creating profile:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user]); // Executa quando o usuário muda

  return (
    <UserContext.Provider value={{ profile, loadingProfile, fetchUserProfile, criarPerfil }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};