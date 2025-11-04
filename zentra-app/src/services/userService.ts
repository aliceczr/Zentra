import {supabase} from '../../supabase-client';

// ============================================================================
// 🏗 INTERFACES
// ============================================================================
export interface createProfile {
    auth_id: string; // FK para auth.users (atualizado para coincidir com a tabela)
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

// ============================================================================
// 🎭 CONFIGURAÇÃO MOCK
// ============================================================================
const USE_MOCK = false; // ✅ Alterado para false - usando Supabase agora!

// Mock data para testes
const MOCK_PROFILES = new Map<string, UserProfile>([
    ['mock-user-1', {
        id: 'profile-1',
        auth_id: 'mock-user-1',
        nome: 'João Silva Santos',
        cpf: '12345678901',
        telefone: '11999887766',
        email: 'joao.silva@email.com',
        data_nascimento: '1990-05-15',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
    }],
    ['mock-user-2', {
        id: 'profile-2', 
        auth_id: 'mock-user-2',
        nome: 'Maria Oliveira Costa',
        cpf: '98765432109',
        telefone: '11987654321',
        email: 'maria.oliveira@email.com',
        data_nascimento: '1985-08-22',
        created_at: '2024-02-10T14:30:00Z',
        updated_at: '2024-02-10T14:30:00Z'
    }]
]);

export const userService = {
    async createProfile({auth_id, nome, cpf, telefone, dataNascimento}: createProfile) {
        if (USE_MOCK) {
            console.log('🎭 UserService - createProfile (MOCK) chamado com:', {
                auth_id, nome, cpf, telefone, dataNascimento
            });
            
            // Simular delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const newProfile: UserProfile = {
                id: `profile-${Date.now()}`,
                auth_id,
                nome,
                cpf,
                telefone,
                email: '', // Será obtido do auth.user.email
                data_nascimento: dataNascimento,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            MOCK_PROFILES.set(auth_id, newProfile);
            console.log('✅ Perfil criado (MOCK):', newProfile);
            return newProfile;
        }

        // ===== IMPLEMENTAÇÃO SUPABASE =====
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
        if (USE_MOCK) {
            console.log('🎭 UserService - getUserProfile (MOCK)');
            
            // Simular delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Usar um perfil mock fixo ou baseado no email do user atual
            const { data: { user } } = await supabase.auth.getUser();
            const mockUserId = user?.id || 'mock-user-1';
            
            let profile = MOCK_PROFILES.get(mockUserId);
            
            // Se não existir, criar um perfil mock baseado no email
            if (!profile) {
                profile = {
                    id: `profile-${Date.now()}`,
                    auth_id: mockUserId,
                    nome: user?.email?.split('@')[0]?.replace(/\./g, ' ') || 'Usuário Teste',
                    cpf: '12345678901',
                    telefone: '11999887766',
                    email: user?.email || 'usuario@teste.com',
                    data_nascimento: '1990-01-01',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                MOCK_PROFILES.set(mockUserId, profile);
            }
            
            console.log('✅ Perfil retornado (MOCK):', profile);
            return profile;
        }

        // ===== IMPLEMENTAÇÃO SUPABASE =====
        console.log('🔍 UserService - getUserProfile (SUPABASE) chamado');
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.log('❌ getUserProfile: Usuário não autenticado');
            throw new Error('Usuário não autenticado');
        }

        console.log('👤 getUserProfile: Usuário autenticado:', { 
            id: user.id, 
            email: user.email 
        });

        const { data, error } = await supabase
            .from('perfil_usuario')
            .select('*')
            .eq('auth_id', user.id) // Corrigindo para auth_id
            .single();

        if (error) {
            console.log('❌ getUserProfile: Erro na query:', error.message);
            throw new Error(error.message);
        }

        console.log('✅ getUserProfile: Perfil encontrado:', data);
        return data;
    },

    async updateProfile({nome, telefone, email}: updateProfile) {
        if (USE_MOCK) {
            console.log('🎭 UserService - updateProfile (MOCK) chamado com:', {
                nome, telefone, email
            });
            
            // Simular delay
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Buscar usuário atual
            const { data: { user } } = await supabase.auth.getUser();
            const mockUserId = user?.id || 'mock-user-1';
            
            let profile = MOCK_PROFILES.get(mockUserId);
            
            if (!profile) {
                throw new Error('Perfil não encontrado');
            }
            
            // Atualizar dados
            const updatedProfile: UserProfile = {
                ...profile,
                nome,
                telefone,
                email,
                updated_at: new Date().toISOString()
            };
            
            MOCK_PROFILES.set(mockUserId, updatedProfile);
            console.log('✅ Perfil atualizado (MOCK):', updatedProfile);
            return updatedProfile;
        }

        // ===== IMPLEMENTAÇÃO SUPABASE =====
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
            console.error('❌ Erro ao atualizar perfil:', error);
            throw new Error(error.message);
        }

        console.log('✅ Perfil atualizado:', data);
        return data;
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
            MOCK_PROFILES.clear();
            console.log('🧹 Dados mock limpos');
        }
    },

    /**
     * Validar campos de perfil
     */
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
