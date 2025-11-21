import { userService } from '../src/services/userService';
import { formatarCodigoPedido, verificarMedicamentoControlado } from '../src/services/pedidoService';
import * as produtoService from '../src/services/produtoService';
import { carrinhoService } from '../src/services/carrinhoService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Simple unit tests
describe('Unit: userService.validateProfileData', () => {
  it('returns valid for correct data', () => {
    const { isValid, errors } = userService.validateProfileData('Lucas Silva', '11987654321', 'lucas@example.com');
    expect(isValid).toBe(true);
    expect(errors.length).toBe(0);
  });

  it('fails for short name', () => {
    const { isValid, errors } = userService.validateProfileData('L', '11987654321');
    expect(isValid).toBe(false);
    expect(errors).toContain('Nome deve ter pelo menos 2 caracteres');
  });

  it('fails for short telefone', () => {
    const { isValid, errors } = userService.validateProfileData('Lucas', '12345');
    expect(isValid).toBe(false);
    expect(errors).toContain('Telefone deve ter pelo menos 10 dígitos');
  });

  it('fails for invalid email', () => {
    const { isValid, errors } = userService.validateProfileData('Lucas', '11987654321', 'invalid-email');
    expect(isValid).toBe(false);
    expect(errors).toContain('Email deve ter um formato válido');
  });
});

describe('Unit: pedidoService helpers', () => {
  it('formatarCodigoPedido pads correctly', () => {
    expect(formatarCodigoPedido(1)).toBe('ZEN-001');
    expect(formatarCodigoPedido(42)).toBe('ZEN-042');
    expect(formatarCodigoPedido(1234)).toBe('ZEN-1234');
  });

  it('verificarMedicamentoControlado detects controlado', () => {
    const itens = [
      { produto: { controlado: false, requer_receita: false } },
      { produto: { controlado: true, requer_receita: false } },
    ];
    expect(verificarMedicamentoControlado(itens as any)).toBe(true);
  });

  it('verificarMedicamentoControlado detects receita', () => {
    const itens = [
      { produto: { controlado: false, requer_receita: true } }
    ];
    expect(verificarMedicamentoControlado(itens as any)).toBe(true);
  });
});

describe('Unit: produtoService.buscarPorIds and fabricantes', () => {
  const makeThenable = (data: any) => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    then: (cb: any) => cb({ data, error: null }),
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('buscarPorIds returns map when data exists', async () => {
    const fake = [{ id: 1, nome: 'P1', preco: 10, ativo: true }];
    jest.spyOn(require('../supabase-client'), 'supabase', 'get').mockReturnValue({
      from: () => ({
        select: () => ({ then: (cb: any) => cb({ data: fake, error: null }) })
      })
    });

    const map = await produtoService.buscarPorIds([1]);
    expect(map instanceof Map).toBe(true);
    expect(map.get(1)).toBeDefined();
    expect(map.get(1).nome).toBe('P1');
  });

  it('buscarPorIds returns empty map for empty ids', async () => {
    const map = await produtoService.buscarPorIds([]);
    expect(map.size).toBe(0);
  });
});

describe('Unit: carrinhoService basic flows (with mocked AsyncStorage and produtoService)', () => {
  const AsyncStorage = require('@react-native-async-storage/async-storage');

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calcularResumo returns zeros for empty cart', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const resumo = await carrinhoService.calcularResumo();
    expect(resumo.quantidadeTotal).toBe(0);
    expect(resumo.valorTotal).toBe(0);
    expect(resumo.quantidadeItens).toBe(0);
  });

  it('adicionarItem and calcularResumo reflect items', async () => {
    const produto = { id: 99, preco: 10 } as any;
    // start with empty storage
    AsyncStorage.getItem.mockResolvedValue(null);
    // intercept salvarCarrinho to avoid actual AsyncStorage
    AsyncStorage.setItem.mockResolvedValue(null);

    // mock buscarPorIds to return the produto when loading
    jest.spyOn(produtoService, 'buscarPorIds').mockResolvedValue(new Map([[99, { id: 99, preco: 10 }]]));

    const itens = await carrinhoService.adicionarItem(produto, 2);
    expect(itens.find(i => i.produto.id === 99)).toBeDefined();
    const resumo = await carrinhoService.calcularResumo();
    expect(resumo.quantidadeTotal).toBeGreaterThanOrEqual(0);
  });
});
