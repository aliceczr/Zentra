import { supabase } from '../../supabase-client';

export interface EnderecoData {
    user_id: string;
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
    async _getAuthenticatedUserId() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        return user.id;
    },
    async criaEndereco({ user_id, tipo, cep, logradouro, bairro, cidade, numero, complemento, estado, pais, referencia, principal }: EnderecoData) {
        const authUserId = await this._getAuthenticatedUserId();
        if (authUserId !== user_id) {
            throw new Error('Dados de usuário inconsistentes');
        }
        if (principal) {
            await supabase
                .from('endereco_usuario')
                .update({ principal: false })
                .eq('user_id', user_id);
        }

        const enderecoData = {
            user_id,
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
        };

        const { data, error } = await supabase
            .from('endereco_usuario')
            .insert([enderecoData])
            .select();

        if (error) {
            throw error;
        }

        return data;
    },

    async buscarEnderecosPorUsuario(userId: string) {
        const authUserId = await this._getAuthenticatedUserId();
        if (authUserId !== userId) {
            throw new Error('Usuário não autenticado');
        }

        const { data, error } = await supabase
            .from('endereco_usuario')
            .select('*')
            .eq('user_id', userId)
            .order('principal', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data || [];
    },

    async atualizarEndereco(enderecoId: string, dadosAtualizacao: Partial<EnderecoData>) {
        const authUserId = await this._getAuthenticatedUserId();

        // Se está definindo como principal, remover principal dos outros
        if (dadosAtualizacao.principal === true) {
            await supabase
                .from('endereco_usuario')
                .update({ principal: false })
                .eq('user_id', authUserId);
        }

        const { data, error } = await supabase
            .from('endereco_usuario')
            .update({
                ...dadosAtualizacao,
                updated_at: new Date().toISOString()
            })
            .eq('id', enderecoId)
            .eq('user_id', authUserId)
            .select();

        if (error) {
            throw error;
        }

        return data;
    },

    async removerEndereco(enderecoId: string) {
        const authUserId = await this._getAuthenticatedUserId();

        const { error } = await supabase
            .from('endereco_usuario')
            .delete()
            .eq('id', enderecoId)
            .eq('user_id', authUserId);

        if (error) {
            throw error;
        }

        return { success: true };
    },

    async definirEnderecoPrincipal(userId: string, enderecoId: string) {
        const authUserId = await this._getAuthenticatedUserId();
        if (authUserId !== userId) {
            throw new Error('Usuário não autenticado');
        }
        // Remover principal de todos os endereços do usuário
        await supabase
            .from('endereco_usuario')
            .update({ principal: false })
            .eq('user_id', userId);

        // Definir o específico como principal
        const { data, error } = await supabase
            .from('endereco_usuario')
            .update({ 
                principal: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', enderecoId)
            .eq('user_id', userId)
            .select();

        if (error) {
            throw error;
        }

        return data;
    },

    async buscarEnderecoPrincipal(userId: string) {
        const authUserId = await this._getAuthenticatedUserId();
        if (authUserId !== userId) {
            throw new Error('Usuário não autenticado');
        }
        
        const { data, error } = await supabase
            .from('endereco_usuario')
            .select('*')
            .eq('user_id', userId)
            .eq('principal', true)
            .single();
        
        if (error && error.code !== 'PGRST116') { 
            throw error;
        }
        
        return data || null;
    },

    async buscarCEP(cep: string) {
        const cepLimpo = cep.replace(/\D/g, '');
        
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
                cep: data.cep,
                logradouro: data.logradouro,
                complemento: data.complemento,
                bairro: data.bairro,
                cidade: data.localidade,
                estado: data.uf,
                pais: 'Brasil'
            };
        } catch (error) {
            // preserva e relança o erro original quando possível
            if (error instanceof Error) throw error;
            throw new Error('Erro ao buscar CEP');
        }
    }
};