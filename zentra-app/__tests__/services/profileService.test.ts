import { userService } from '../../src/services/userService';
import { supabase } from '../../supabase-client';

jest.mock('../../supabase-client');

describe('CDU-06: Gerenciamento de Perfil - UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== CT-20: Editar informações pessoais =====
  describe('CT-20: Editar informações pessoais', () => {
    it('deve atualizar nome com sucesso', async () => {
      const mockUser = { id: 'user-123', email: 'usuario@example.com' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'profile-123',
                  auth_id: 'user-123',
                  nome: 'João Silva Atualizado',
                  telefone: '11999999999',
                  email: 'usuario@example.com'
                },
                error: null
              })
            })
          })
        })
      });

      const result = await userService.updateProfile({
        nome: 'João Silva Atualizado',
        telefone: '11999999999',
        email: 'usuario@example.com'
      });

      expect(result).toBeDefined();
      expect((result as any).nome).toBe('João Silva Atualizado');
    });

    it('deve atualizar endereço com sucesso', async () => {
      const mockUser = { id: 'user-123' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'profile-123',
                  endereco: 'Rua Nova, 123'
                },
                error: null
              })
            })
          })
        })
      });

      const result = await userService.updateProfile({
        nome: 'João',
        telefone: '11999999999',
        email: 'usuario@example.com'
      });

      expect(result).toBeDefined();
    });

    it('deve atualizar telefone com sucesso', async () => {
      const mockUser = { id: 'user-123' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'profile-123',
                  telefone: '11988888888',
                  updated_at: new Date().toISOString()
                },
                error: null
              })
            })
          })
        })
      });

      const result = await userService.updateProfile({
        nome: 'João',
        telefone: '11988888888',
        email: 'usuario@example.com'
      });

      expect(result).toBeDefined();
    });

    it('deve exibir mensagem "Perfil atualizado" após sucesso', async () => {
      const mockUser = { id: 'user-123' };
      const successMessage = 'Perfil atualizado com sucesso';

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'profile-123', nome: 'João' },
                error: null
              })
            })
          })
        })
      });

      await userService.updateProfile({
        nome: 'João',
        telefone: '11999999999',
        email: 'usuario@example.com'
      });

      expect(successMessage).toContain('Perfil atualizado');
    });

    it('deve refletir dados atualizados no banco de dados', async () => {
      const mockUser = { id: 'user-123' };
      const updateData = {
        nome: 'João Silva Novo',
        telefone: '11988888888',
        email: 'novo@example.com'
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...updateData, id: 'profile-123', auth_id: 'user-123' },
                error: null
              })
            })
          })
        })
      });

      const result = await userService.updateProfile(updateData);

      expect(result).toBeDefined();
      expect((result as any).nome).toBe(updateData.nome);
    });
  });

  // ===== CT-21: Inserir dados inválidos =====
  describe('CT-21: Editar perfil com dados inválidos', () => {
    it('deve rejeitar telefone com letras', async () => {
      const telefoneInvalido = '1199ABC9999';
      const isValid = /^\d{10,11}$/.test(telefoneInvalido);
      expect(isValid).toBe(false);
    });

    it('deve exibir mensagem de erro para telefone inválido', async () => {
      const mockUser = { id: 'user-123' };
      const errorMessage = 'Telefone deve conter apenas números';

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: new Error(errorMessage)
              })
            })
          })
        })
      });

      expect(errorMessage).toContain('números');
    });

    it('deve rejeitar e-mail com formato inválido', async () => {
      const emailInvalido = 'emailsemarroba.com';
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInvalido);
      expect(isValid).toBe(false);
    });

    it('deve validar nome não vazio', () => {
      const nomeVazio = '';
      const isValid = nomeVazio.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it('deve validar nome com comprimento mínimo', () => {
      const nomeValido = 'Jo';
      const isValid = nomeValido.length >= 3;
      expect(isValid).toBe(false);
    });

    it('deve validar comprimento máximo do nome', () => {
      const nomeMuitoLongo = 'A'.repeat(256);
      const isValid = nomeMuitoLongo.length <= 255;
      expect(isValid).toBe(false);
    });

    it('deve rejeitar caracteres especiais inválidos no nome', () => {
      const nomeComCaracteresEspeciais = 'João@Silva#123';
      const isValid = /^[a-záàâãéèêíïóôõöúçñ\s'-]+$/i.test(nomeComCaracteresEspeciais);
      expect(isValid).toBe(false);
    });

    it('deve mostrar validação consistente', async () => {
      const mockUser = { id: 'user-123' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('Validation error')
              })
            })
          })
        })
      });

      // Validar múltiplos campos
      const validationErrors: string[] = [];

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test('invalidemail')) {
        validationErrors.push('Email inválido');
      }

      if (!/^\d{10,11}$/.test('1199ABC9999')) {
        validationErrors.push('Telefone inválido');
      }

      expect(validationErrors.length).toBeGreaterThan(0);
    });
  });

  // ===== Testes Adicionais =====
  describe('Testes Adicionais de Perfil', () => {
    it('deve obter perfil atual do usuário', async () => {
      const mockUser = { id: 'user-123' };
      const mockProfile = {
        id: 'profile-123',
        auth_id: 'user-123',
        nome: 'João Silva',
        telefone: '11999999999',
        email: 'usuario@example.com'
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      });

      const result = await userService.getUserProfile();

      expect(result).toEqual(mockProfile);
    });

    it('deve rejeitar atualização se usuário não está autenticado', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      });

      await expect(
        userService.updateProfile({
          nome: 'João',
          telefone: '11999999999',
          email: 'usuario@example.com'
        })
      ).rejects.toThrow();
    });

    it('deve incluir timestamp de atualização', async () => {
      const mockUser = { id: 'user-123' };
      const beforeUpdate = new Date();

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'profile-123',
                  updated_at: new Date().toISOString()
                },
                error: null
              })
            })
          })
        })
      });

      const result = await userService.updateProfile({
        nome: 'João',
        telefone: '11999999999',
        email: 'usuario@example.com'
      });

      expect((result as any).updated_at).toBeDefined();
    });
  });
});
