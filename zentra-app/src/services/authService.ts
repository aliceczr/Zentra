import { supabase } from '../../supabase-client';

export interface SignUpData {
  email: string;
  password: string;

}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  async signUp({ email, password }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined // Para desenvolvimento - não exige confirmação
      }
    });

    if (error) {
     
      if (error.message.includes('already registered')) {
        throw new Error('Este email já está cadastrado. Tente fazer login.');
      }
      if (error.message.includes('invalid email')) {
        throw new Error('Email inválido. Verifique o formato.');
      }
      if (error.message.includes('password')) {
        throw new Error('Senha deve ter pelo menos 6 caracteres.');
      }
      
      throw new Error(error.message);
    }

    return data;
  },

  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(error.message);
    }

    return user;
  }
};