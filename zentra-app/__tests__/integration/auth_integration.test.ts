jest.mock('../../supabase-client', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
      signOut: jest.fn(),
    }
  }
}));

import { authService } from '../../src/services/authService';
import { supabase } from '../../supabase-client';

describe('Integration: auth flow (mocked supabase)', () => {
  afterEach(() => jest.resetAllMocks());

  it('signUp -> signIn -> getCurrentUser', async () => {
    const fakeUser = { id: 'u1', email: 'test@example.com' };
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({ data: { user: fakeUser }, error: null });
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ data: { session: { user: fakeUser } }, error: null });
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: fakeUser }, error: null });

    const signup = await authService.signUp({ email: 'test@example.com', password: 'senha123' });
    expect(signup).toBeDefined();

    const signin = await authService.signIn({ email: 'test@example.com', password: 'senha123' });
    expect(signin).toBeDefined();

    const current = await authService.getCurrentUser();
    expect(current).toEqual(fakeUser);
  });
});
