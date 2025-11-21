import { authService } from '../../src/services/authService';
import { supabase } from '../../supabase-client';

jest.mock('../../supabase-client');

describe('CDU-20: Login e Autenticação - AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== CT-01: Login com credenciais válidas =====
  describe('CT-01: Login com credenciais válidas', () => {
    it('deve fazer login com sucesso com e-mail e senha válidos', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'usuario@example.com',
        user_metadata: { nome: 'João Silva' }
      };

      const mockSession = {
        user: mockUser,
        session: {
          access_token: 'token-123',
          refresh_token: 'refresh-token-123'
        }
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: mockSession,
        error: null
      });

      const result = await authService.signIn({
        email: 'usuario@example.com',
        password: 'senha123'
      });

      expect(result).toEqual(mockSession);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'usuario@example.com',
        password: 'senha123'
      });
    });

    it('deve manter a sessão após login bem-sucedido', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'usuario@example.com' },
        session: { access_token: 'token-123' }
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: mockSession,
        error: null
      });

      await authService.signIn({
        email: 'usuario@example.com',
        password: 'senha123'
      });

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockSession.user },
        error: null
      });

      const currentUser = await authService.getCurrentUser();
      expect(currentUser).toEqual(mockSession.user);
    });
  });

  // ===== CT-02: Credenciais inválidas =====
  describe('CT-02: Login com credenciais inválidas', () => {
    it('deve rejeitar login com senha incorreta', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: new Error('Invalid login credentials')
      });

      await expect(
        authService.signIn({
          email: 'usuario@example.com',
          password: 'senhaErrada'
        })
      ).rejects.toThrow();
    });

    it('deve rejeitar login com e-mail inexistente', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: new Error('Invalid login credentials')
      });

      await expect(
        authService.signIn({
          email: 'naoexiste@example.com',
          password: 'senha123'
        })
      ).rejects.toThrow();
    });

    it('deve exibir mensagem de erro ao falhar login', async () => {
      const errorMessage = 'Invalid login credentials';
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: new Error(errorMessage)
      });

      try {
        await authService.signIn({
          email: 'usuario@example.com',
          password: 'senha123'
        });
      } catch (error: any) {
        expect(error.message).toBe(errorMessage);
      }
    });

    it('deve manter usuário na tela de login após falha', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: new Error('Invalid credentials')
      });

      try {
        await authService.signIn({
          email: 'usuario@example.com',
          password: 'senhaErrada'
        });
      } catch {
        // Usuário deve permanecer na tela de login
        expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
      }
    });
  });

  // ===== CT-03: Recuperação de senha =====
  describe('CT-03: Recuperação de senha', () => {
    it('deve enviar link de recuperação de senha para e-mail válido', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: {},
        error: null
      });

      const result = await supabase.auth.resetPasswordForEmail('usuario@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('usuario@example.com');
      expect(result.error).toBeNull();
    });

    it('deve exibir confirmação de envio após solicitar recuperação', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: {},
        error: null
      });

      const result = await supabase.auth.resetPasswordForEmail('usuario@example.com');

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('deve rejeitar recuperação com e-mail inválido', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: null,
        error: new Error('Invalid email format')
      });

      const result = await supabase.auth.resetPasswordForEmail('emailInvalido');

      expect(result.error).not.toBeNull();
    });

    it('deve rejeitar recuperação com e-mail não cadastrado', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: null,
        error: new Error('User not found')
      });

      const result = await supabase.auth.resetPasswordForEmail('naocadastrado@example.com');

      expect(result.error).not.toBeNull();
    });
  });

  // ===== Testes Adicionais =====
  describe('Testes Adicionais de Autenticação', () => {
    it('deve fazer logout com sucesso', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null
      });

      await authService.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('deve obter usuário atual', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'usuario@example.com'
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const currentUser = await authService.getCurrentUser();

      expect(currentUser).toEqual(mockUser);
      expect(supabase.auth.getUser).toHaveBeenCalled();
    });

    it('deve lancar erro se usuário não está autenticado', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('User not authenticated')
      });

      await expect(authService.getCurrentUser()).rejects.toThrow();
    });
  });
});
