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
                    user_id: user_id,
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
            ])
            .select();
            
        console.log('📊 EnderecoService - Resultado insert:', { data, error });
        
        if (error) {
            console.error('❌ EnderecoService - Erro no insert:', error);
            throw new Error(error.message);
        }
        return data;
    },

    async buscarEnderecosPorUsuario(userId: string) {
        console.log('🔍 EnderecoService - buscarEnderecosPorUsuario chamado para:', userId);
        
        const { data, error } = await supabase
            .from('endereco_usuario')
            .select('*')
            .eq('user_id', userId)
            .order('principal', { ascending: false });
        
        console.log('📊 EnderecoService - Resultado busca:', { data, error });
        
        if (error) {
            console.error('❌ EnderecoService - Erro na busca:', error);
            throw new Error(error.message);
        }
        
        return data;
    },

    async atualizarEndereco(enderecoId: string, dadosAtualizacao: Partial<EnderecoData>) {
        console.log('✏️ EnderecoService - atualizarEndereco chamado:', { enderecoId, dadosAtualizacao });
        
        const { data, error } = await supabase
            .from('endereco_usuario')
            .update(dadosAtualizacao)
            .eq('id', enderecoId)
            .select();
        
        console.log('📊 EnderecoService - Resultado atualização:', { data, error });
        
        if (error) {
            console.error('❌ EnderecoService - Erro na atualização:', error);
            throw new Error(error.message);
        }
        
        return data;
    },

    async removerEndereco(enderecoId: string) {
        console.log('🗑️ EnderecoService - removerEndereco chamado para:', enderecoId);
        
        const { data, error } = await supabase
            .from('endereco_usuario')
            .delete()
            .eq('id', enderecoId);
        
        console.log('📊 EnderecoService - Resultado remoção:', { data, error });
        
        if (error) {
            console.error('❌ EnderecoService - Erro na remoção:', error);
            throw new Error(error.message);
        }
        
        return data;
    },

    async definirEnderecoPrincipal(userId: string, enderecoId: string) {
        console.log('⭐ EnderecoService - definirEnderecoPrincipal chamado:', { userId, enderecoId });
        
        try {
            // Primeiro, remove o status principal de todos os endereços do usuário
            const { error: updateError } = await supabase
                .from('endereco_usuario')
                .update({ principal: false })
                .eq('user_id', userId);
            
            if (updateError) {
                throw new Error(`Erro ao atualizar endereços: ${updateError.message}`);
            }
            
            // Depois, define o endereço específico como principal
            const { data, error } = await supabase
                .from('endereco_usuario')
                .update({ principal: true })
                .eq('id', enderecoId)
                .eq('user_id', userId)
                .select();
            
            console.log('📊 EnderecoService - Resultado definir principal:', { data, error });
            
            if (error) {
                console.error('❌ EnderecoService - Erro ao definir principal:', error);
                throw new Error(error.message);
            }
            
            return data;
        } catch (err) {
            console.error('❌ EnderecoService - Erro geral:', err);
            throw err;
        }
    },

    async buscarEnderecoPrincipal(userId: string) {
        console.log('⭐ EnderecoService - buscarEnderecoPrincipal chamado para:', userId);
        
        const { data, error } = await supabase
            .from('endereco_usuario')
            .select('*')
            .eq('user_id', userId)
            .eq('principal', true)
            .single();
        
        console.log('📊 EnderecoService - Resultado busca principal:', { data, error });
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('❌ EnderecoService - Erro na busca principal:', error);
            throw new Error(error.message);
        }
        
        return data;
    },

    // Função utilitária para buscar CEP via API
    async buscarCEP(cep: string) {
        const cepLimpo = cep.replace(/[^\d]/g, '');
        
        if (cepLimpo.length !== 8) {
            throw new Error('CEP deve ter 8 dígitos');
        }
        
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();
            
            if (data.erro) {
                throw new Error('CEP não encontrado');
            }
            
            return {
                logradouro: data.logradouro,
                bairro: data.bairro,
                cidade: data.localidade,
                estado: data.uf,
                cep: cepLimpo,
            };
        } catch (error) {
            console.error('❌ EnderecoService - Erro ao buscar CEP:', error);
            throw new Error('Erro ao buscar CEP');
        }
    }
};
