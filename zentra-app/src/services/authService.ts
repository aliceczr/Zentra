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
      
      throw error;
    }

    return data;
  },

  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }

    return user;
  }
  ,

  /**
   * Envia email de recuperação de senha (reset password) usando Supabase.
   * Usamos o fluxo padrão do Supabase: ele enviará um link hospedado onde o usuário
   * poderá redefinir a senha (sem necessidade de deep-link no app).
   */
  async sendPasswordRecovery(email: string, redirectTo?: string) {
    try {
      // v2 API: resetPasswordForEmail
      const opts = redirectTo ? { redirectTo } : undefined;
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, opts as any);
      if (error) {
        // mapear mensagens comuns para algo amigável
        if (error.message && error.message.toLowerCase().includes('invalid')) {
          throw new Error('Email inválido. Verifique o endereço informado.');
        }
        throw error;
      }
      return data;
    } catch (err: any) {
      throw err;
    }
  }

};