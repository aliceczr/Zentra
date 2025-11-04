import {supabase} from '../../supabase-client';

// ============================================================================
// 🎭 CONFIGURAÇÃO MOCK
// ============================================================================
const USE_MOCK = false; // ✅ Alterado para false - usando Supabase agora!

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

// ============================================================================
// 🎭 DADOS MOCK (MANTIDOS PARA REFERÊNCIA)
// ============================================================================

export interface EnderecoMock extends EnderecoData {
    id: string;
    created_at: string;
    updated_at: string;
}

// Dados mock em memória (não serão usados com USE_MOCK = false)
const MOCK_ENDERECOS = new Map<string, EnderecoMock[]>([
    ['mock-user-1', [
        {
            id: 'endereco-1',
            user_id: 'mock-user-1',
            tipo: 'RESIDENCIAL',
            cep: '01234567',
            logradouro: 'Rua das Flores, 123',
            bairro: 'Centro',
            cidade: 'São Paulo',
            numero: '123',
            complemento: 'Apto 45',
            estado: 'SP',
            pais: 'Brasil',
            referencia: 'Próximo ao shopping',
            principal: true,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z'
        }
    ]]
]);

export const enderecoService = {
    async criaEndereco({user_id, tipo, cep, logradouro, bairro, cidade, numero, complemento, estado, pais, referencia, principal}: EnderecoData) {
        if (USE_MOCK) {
            console.log('🎭 EnderecoService - criaEndereco (MOCK) chamado com:', {
                user_id, tipo, cep, logradouro, bairro, cidade, numero
            });
            
            // Simular delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Buscar endereços existentes do usuário
            let enderecosUsuario = MOCK_ENDERECOS.get(user_id) || [];
            
            // Se é o primeiro endereço ou foi marcado como principal
            if (enderecosUsuario.length === 0 || principal) {
                // Remover principal de outros endereços se necessário
                enderecosUsuario = enderecosUsuario.map(endereco => ({ 
                    ...endereco, 
                    principal: false 
                }));
                principal = true;
            }
            
            const novoEndereco: EnderecoMock = {
                id: `endereco-${Date.now()}`,
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
                principal,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            enderecosUsuario.push(novoEndereco);
            MOCK_ENDERECOS.set(user_id, enderecosUsuario);
            
            console.log('✅ Endereço criado (MOCK):', novoEndereco);
            return [novoEndereco];
        }

        // ===== IMPLEMENTAÇÃO SUPABASE =====
        console.log('🏠 EnderecoService - criaEndereco (SUPABASE) chamado com:', {
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
        if (USE_MOCK) {
            console.log('🎭 EnderecoService - buscarEnderecosPorUsuario (MOCK) chamado para:', userId);
            
            // Simular delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const enderecosUsuario = MOCK_ENDERECOS.get(userId) || [];
            
            // Ordenar por principal primeiro
            const enderecosOrdenados = enderecosUsuario.sort((a, b) => {
                if (a.principal && !b.principal) return -1;
                if (!a.principal && b.principal) return 1;
                return 0;
            });
            
            console.log('✅ Endereços encontrados (MOCK):', enderecosOrdenados);
            return enderecosOrdenados;
        }

        // ===== IMPLEMENTAÇÃO SUPABASE =====
        console.log('🔍 EnderecoService - buscarEnderecosPorUsuario (SUPABASE) chamado para:', userId);
        
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
        if (USE_MOCK) {
            console.log('🎭 EnderecoService - atualizarEndereco (MOCK) chamado:', { enderecoId, dadosAtualizacao });
            
            // Simular delay
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Buscar o endereço em todos os usuários
            let enderecoEncontrado: EnderecoMock | null = null;
            let userIdEncontrado: string | null = null;
            
            for (const [userId, enderecos] of MOCK_ENDERECOS.entries()) {
                const endereco = enderecos.find(e => e.id === enderecoId);
                if (endereco) {
                    enderecoEncontrado = endereco;
                    userIdEncontrado = userId;
                    break;
                }
            }
            
            if (!enderecoEncontrado || !userIdEncontrado) {
                throw new Error('Endereço não encontrado');
            }
            
            // Se está definindo como principal, remover principal dos outros
            if (dadosAtualizacao.principal === true) {
                const enderecosUsuario = MOCK_ENDERECOS.get(userIdEncontrado)!;
                const enderecosAtualizados = enderecosUsuario.map(endereco => 
                    endereco.id === enderecoId 
                        ? { ...endereco, ...dadosAtualizacao, updated_at: new Date().toISOString() }
                        : { ...endereco, principal: false }
                );
                MOCK_ENDERECOS.set(userIdEncontrado, enderecosAtualizados);
                
                const enderecoAtualizado = enderecosAtualizados.find(e => e.id === enderecoId)!;
                console.log('✅ Endereço atualizado como principal (MOCK):', enderecoAtualizado);
                return [enderecoAtualizado];
            } else {
                // Atualização normal
                const enderecosUsuario = MOCK_ENDERECOS.get(userIdEncontrado)!;
                const enderecosAtualizados = enderecosUsuario.map(endereco => 
                    endereco.id === enderecoId 
                        ? { ...endereco, ...dadosAtualizacao, updated_at: new Date().toISOString() }
                        : endereco
                );
                MOCK_ENDERECOS.set(userIdEncontrado, enderecosAtualizados);
                
                const enderecoAtualizado = enderecosAtualizados.find(e => e.id === enderecoId)!;
                console.log('✅ Endereço atualizado (MOCK):', enderecoAtualizado);
                return [enderecoAtualizado];
            }
        }

        // ===== IMPLEMENTAÇÃO SUPABASE =====
        console.log('✏️ EnderecoService - atualizarEndereco (SUPABASE) chamado:', { enderecoId, dadosAtualizacao });
        
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
        if (USE_MOCK) {
            console.log('🎭 EnderecoService - removerEndereco (MOCK) chamado para:', enderecoId);
            
            // Simular delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Buscar o endereço em todos os usuários
            for (const [userId, enderecos] of MOCK_ENDERECOS.entries()) {
                const indiceEndereco = enderecos.findIndex(e => e.id === enderecoId);
                if (indiceEndereco !== -1) {
                    const enderecosAtualizados = enderecos.filter(e => e.id !== enderecoId);
                    MOCK_ENDERECOS.set(userId, enderecosAtualizados);
                    console.log('✅ Endereço removido (MOCK)');
                    return { success: true };
                }
            }
            
            throw new Error('Endereço não encontrado');
        }

        // ===== IMPLEMENTAÇÃO SUPABASE =====
        console.log('🗑️ EnderecoService - removerEndereco (SUPABASE) chamado para:', enderecoId);
        
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
        if (USE_MOCK) {
            console.log('🎭 EnderecoService - definirEnderecoPrincipal (MOCK) chamado:', { userId, enderecoId });
            
            // Simular delay
            await new Promise(resolve => setTimeout(resolve, 400));
            
            const enderecosUsuario = MOCK_ENDERECOS.get(userId) || [];
            
            // Verificar se o endereço existe
            const enderecoExiste = enderecosUsuario.find(e => e.id === enderecoId);
            if (!enderecoExiste) {
                throw new Error('Endereço não encontrado');
            }
            
            // Atualizar endereços: remover principal de todos e definir o específico como principal
            const enderecosAtualizados = enderecosUsuario.map(endereco => ({
                ...endereco,
                principal: endereco.id === enderecoId,
                updated_at: endereco.id === enderecoId ? new Date().toISOString() : endereco.updated_at
            }));
            
            MOCK_ENDERECOS.set(userId, enderecosAtualizados);
            
            const enderecoPrincipal = enderecosAtualizados.find(e => e.id === enderecoId)!;
            console.log('✅ Endereço definido como principal (MOCK):', enderecoPrincipal);
            return [enderecoPrincipal];
        }

        // ===== IMPLEMENTAÇÃO SUPABASE =====
        console.log('⭐ EnderecoService - definirEnderecoPrincipal (SUPABASE) chamado:', { userId, enderecoId });
        
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
        if (USE_MOCK) {
            console.log('🎭 EnderecoService - buscarEnderecoPrincipal (MOCK) chamado para:', userId);
            
            // Simular delay
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const enderecosUsuario = MOCK_ENDERECOS.get(userId) || [];
            const enderecoPrincipal = enderecosUsuario.find(endereco => endereco.principal);
            
            console.log('✅ Endereço principal encontrado (MOCK):', enderecoPrincipal);
            return enderecoPrincipal || null;
        }

        // ===== IMPLEMENTAÇÃO SUPABASE =====
        console.log('⭐ EnderecoService - buscarEnderecoPrincipal (SUPABASE) chamado para:', userId);
        
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
    },

    // ============================================================================
    // 🔧 MÉTODOS UTILITÁRIOS  
    // ============================================================================
    
    /**
     * Alternar entre modo mock e Supabase (para desenvolvimento)
     */
    getMockMode() {
        return USE_MOCK;
    },

    /**
     * Limpar dados mock (para testes)
     */
    clearMockData() {
        if (USE_MOCK) {
            MOCK_ENDERECOS.clear();
            console.log('🧹 Dados mock de endereços limpos');
        }
    },

    /**
     * Adicionar endereços mock para usuário específico (para testes)
     */
    addMockEnderecos(userId: string, enderecos: EnderecoMock[]) {
        if (USE_MOCK) {
            MOCK_ENDERECOS.set(userId, enderecos);
            console.log(`🎭 Endereços mock adicionados para usuário ${userId}:`, enderecos);
        }
    }
};
