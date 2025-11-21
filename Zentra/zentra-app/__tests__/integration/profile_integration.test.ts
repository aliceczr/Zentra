jest.mock('../../supabase-client', () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    from: jest.fn()
  }
}));

import { userService } from '../../src/services/userService';
import { supabase } from '../../supabase-client';

describe('Integration: profile flows', () => {
  afterEach(() => jest.resetAllMocks());

  it('createProfile and getUserProfile', async () => {
    const fakeUser = { id: 'auth-1' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: fakeUser } });

    const insertResult = [{ id: 'p1', auth_id: 'auth-1', nome: 'Lucas' }];
    // Make from().insert() chain
    (supabase.from as jest.Mock).mockReturnValue({
      insert: () => ({ select: () => ({ then: (cb: any) => cb({ data: insertResult, error: null }) }) })
    });

    const created = await userService.createProfile({ auth_id: 'auth-1', nome: 'Lucas', cpf: '123', telefone: '119', dataNascimento: '2000-01-01' });
    expect(created).toBeDefined();

    // Now mock select single
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({ eq: () => ({ single: () => ({ then: (cb: any) => cb({ data: insertResult[0], error: null }) }) }) })
    });

    const profile = await userService.getUserProfile();
    expect(profile).toBeDefined();
    expect(profile.auth_id).toBe('auth-1');
  });

  it('updateProfile returns updated object', async () => {
    const fakeUser = { id: 'auth-2' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: fakeUser } });

    const updated = { id: 'p2', nome: 'Novo', telefone: '119', email: 'novo@example.com' };
    (supabase.from as jest.Mock).mockReturnValue({
      update: () => ({ eq: () => ({ select: () => ({ single: () => ({ then: (cb: any) => cb({ data: updated, error: null }) }) }) }) })
    });

    const result = await userService.updateProfile({ nome: 'Novo', telefone: '119', email: 'novo@example.com' });
    expect(result).toEqual(updated);
  });
});
