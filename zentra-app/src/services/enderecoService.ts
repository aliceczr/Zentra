import {supabase} from '../../supabase-client';

export interface EnderecoData {
    user_id: string; // FK para auth.users.id (mesmo que perfil_usuario.user_id)
    tipo: string; 
    cep: string;
    logradouro: string;
    bairro: string;
    cidade: string;
    numero: string;
    complemento: string;
    estado: string;
    pais: string;
    referencia: string;
    principal: boolean;
    
}

export const enderecoService = {
    async criaEndereco({user_id, tipo, cep, logradouro, bairro, cidade, numero, complemento, estado, pais, referencia, principal}: EnderecoData) {
        console.log('🏠 EnderecoService - criaEndereco chamado com:', {
            user_id, tipo, cep, logradouro, bairro, cidade, numero
        });
        
        const {data, error} = await supabase
            .from('endereco_usuario')
            .insert([
                {
                    user_id: user_id, // Voltando para user_id
                    tipo,
                    cep,
                    logradouro,
                    bairro,
                    cidade,
                    numero,
                    complemento,
                    estado,
                    pais,
                    referencia,
                    principal
                }
            ]);
            
        console.log('📊 EnderecoService - Resultado insert:', { data, error });
        
        if (error) {
            console.error('❌ EnderecoService - Erro no insert:', error);
            throw new Error(error.message);
        }
        return data;
    },

};
