import {supabase} from '../../supabase-client';

export interface createProfile {
    auth_id: string; // FK para auth.users (atualizado para coincidir com a tabela)
    nome: string;
    cpf: string;
    telefone: string;
    dataNascimento: string;
}

export const userService = {
    async createProfile({auth_id, nome, cpf, telefone, dataNascimento}: createProfile) {
        console.log('🔍 UserService - createProfile chamado com:', {
            auth_id, nome, cpf, telefone, dataNascimento
        });
        
        // Verificar se usuário está autenticado
        const { data: { user } } = await supabase.auth.getUser();
        console.log('🔐 Auth status:', { 
            userId: user?.id, 
            email: user?.email, 
            confirmed: user?.email_confirmed_at,
            userIdMatch: user?.id === auth_id
        });
        
        // Verificar se auth.uid() funciona
        const { data: authCheck } = await supabase.rpc('auth.uid');
        console.log('🔑 auth.uid() check:', authCheck);
        
        const insertData = {
            auth_id: auth_id, // Corrigindo: enviar para a coluna auth_id da tabela
            nome,
            cpf,
            telefone,
            data_nascimento: dataNascimento,
        };
        
        console.log('📤 Dados sendo inseridos:', insertData);
        
        const {data, error} = await supabase
            .from('perfil_usuario')
            .insert([insertData]);
            
        console.log('📊 UserService - Resultado insert:', { data, error });
        
        if (error) {
            console.error('❌ UserService - Erro no insert:', error);
            console.error('📋 Detalhes do erro:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
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
            .eq('auth_id', user.id) // Corrigindo para auth_id
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    },

    // Outros métodos como updateProfile, deleteProfile podem ser adicionados aqui
};
