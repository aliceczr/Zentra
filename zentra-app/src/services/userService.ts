import { supabase } from '../../supabase-client';

export interface createProfile {
    auth_id: string;
    nome: string;
    cpf: string;
    telefone: string;
    dataNascimento: string;
}

export interface updateProfile {
    nome: string;
    telefone: string;
    email: string;
}

export interface UserProfile {
    id?: string;
    auth_id: string;
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    data_nascimento: string;
    created_at?: string;
    updated_at?: string;
}

export const userService = {
    async createProfile({ auth_id, nome, cpf, telefone, dataNascimento }: createProfile) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || user.id !== auth_id) {
            throw new Error('Usuário não autenticado ou dados inconsistentes');
        }
        
        const insertData = {
            auth_id: auth_id,
            nome,
            cpf,
            telefone,
            data_nascimento: dataNascimento,
        };
        
        const { data, error } = await supabase
            .from('perfil_usuario')
            .insert([insertData]);
            
        if (error) {
            throw new Error(error.message);
        }
        
        return data;
    },

    async getUserProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        const { data, error } = await supabase
            .from('perfil_usuario')
            .select('*')
            .eq('auth_id', user.id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    },

    async updateProfile({ nome, telefone, email }: updateProfile) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        const updateData = {
            nome,
            telefone,
            email,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('perfil_usuario')
            .update(updateData)
            .eq('auth_id', user.id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    },

    validateProfileData(nome: string, telefone: string, email?: string) {
        const errors: string[] = [];

        if (!nome || nome.trim().length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }

        if (!telefone || telefone.replace(/\D/g, '').length < 10) {
            errors.push('Telefone deve ter pelo menos 10 dígitos');
        }

        if (email && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                errors.push('Email deve ter um formato válido');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};
