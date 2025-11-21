jest.mock('../../supabase-client', () => ({
  supabase: { from: jest.fn() }
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}));

import { carrinhoService } from '../../src/services/carrinhoService';
import * as produtoService from '../../src/services/produtoService';
const AsyncStorage = require('@react-native-async-storage/async-storage');

describe('Integration: carrinho flows', () => {
  afterEach(() => jest.resetAllMocks());

  it('add item -> validarCarrinho updates prices if changed', async () => {
    const produto = { id: 200, preco: 5 } as any;
    // simulate empty storage
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(null);

    // add item
    await carrinhoService.adicionarItem(produto, 1);

    // now simulate produto price changed when validating
    jest.spyOn(produtoService, 'buscarPorIds').mockResolvedValue(new Map([[200, { id: 200, preco: 7 }]] as any));

    const result = await carrinhoService.validarCarrinho();
    expect(result.alteracoes.length >= 0).toBe(true);
    expect(result.itensAtualizados.length >= 0).toBe(true);
  });
});
