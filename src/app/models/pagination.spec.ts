import { describe, it, expect } from 'vitest';

/**
 * Testes da lógica de paginação.
 *
 * Por que testar isso separadamente?
 * A regra offset = (page - 1) * pageSize parece simples,
 * mas um erro aqui faz a listagem pular ou repetir Pokémon.
 * Um teste simples nos protege de regressões silenciosas.
 */

// Função pura extraída da lógica do componente
function calculateOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

// Função pura para calcular total de páginas
function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

// Regras para os botões de paginação
function canGoNext(currentPage: number, totalPages: number): boolean {
  return currentPage < totalPages;
}

function canGoPrev(currentPage: number): boolean {
  return currentPage > 1;
}

// ─── Testes de calculateOffset ────────────────────────────────────────────
describe('calculateOffset', () => {
  it('retorna 0 na primeira página', () => {
    expect(calculateOffset(1, 12)).toBe(0);
  });

  it('retorna 12 na segunda página com pageSize 12', () => {
    expect(calculateOffset(2, 12)).toBe(12);
  });

  it('retorna 36 na quarta página com pageSize 12', () => {
    // Requer raciocínio: (4-1) * 12 = 36
    expect(calculateOffset(4, 12)).toBe(36);
  });

  it('retorna 24 na terceira página com pageSize 12', () => {
    expect(calculateOffset(3, 12)).toBe(24);
  });
});

// ─── Testes de calculateTotalPages ────────────────────────────────────────
describe('calculateTotalPages', () => {
  it('calcula corretamente quando total é múltiplo exato do pageSize', () => {
    expect(calculateTotalPages(120, 12)).toBe(10);
  });

  it('arredonda para cima quando há sobra', () => {
    // 1302 pokémons / 12 = 108.5 → deve ser 109
    expect(calculateTotalPages(1302, 12)).toBe(109);
  });

  it('retorna 1 quando o total é menor que o pageSize', () => {
    expect(calculateTotalPages(5, 12)).toBe(1);
  });
});

// ─── Testes de canGoNext / canGoPrev ─────────────────────────────────────
describe('canGoNext', () => {
  it('permite avançar quando não está na última página', () => {
    expect(canGoNext(1, 10)).toBe(true);
    expect(canGoNext(5, 10)).toBe(true);
  });

  it('bloqueia quando está na última página', () => {
    expect(canGoNext(10, 10)).toBe(false);
  });
});

describe('canGoPrev', () => {
  it('permite voltar quando não está na primeira página', () => {
    expect(canGoPrev(2)).toBe(true);
    expect(canGoPrev(10)).toBe(true);
  });

  it('bloqueia na primeira página', () => {
    expect(canGoPrev(1)).toBe(false);
  });
});
