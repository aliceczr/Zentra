jest.mock('../../supabase-client', () => ({
  supabase: {
    from: jest.fn()
  }
}));

import * as produtoService from '../../src/services/produtoService';
import { supabase } from '../../supabase-client';

describe('Integration: produto flows', () => {
  afterEach(() => jest.resetAllMocks());

  it('buscarFabricantes aggregates counts', async () => {
    const fake = [
      { fabricante: 'A' },
      { fabricante: 'B' },
      { fabricante: 'A' }
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({ then: (cb: any) => cb({ data: fake, error: null }) }),
      eq: () => ({ then: (cb: any) => cb({ data: fake, error: null }) })
    });

    const res = await produtoService.buscarFabricantes();
    expect(Array.isArray(res)).toBe(true);
    // Expect at least the 'todos' option and two fabricantes
    expect(res.some(r => r.label.includes('A'))).toBe(true);
  });

  it('buscarMarcas aggregates counts', async () => {
    const fake = [
      { marca: 'M1' },
      { marca: 'M1' },
      { marca: 'M2' }
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({ then: (cb: any) => cb({ data: fake, error: null }) })
    });

    const res = await produtoService.buscarMarcas();
    expect(res.some(r => r.value === 'M1')).toBe(true);
  });
});
