// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(() => {
    localStorage.clear();
    service = new FavoritesService();
  });

  it('inicia com lista vazia se nada estiver no localStorage', () => {
    expect(service.favorites()).toEqual([]);
    expect(service.count()).toBe(0);
  });

  it('adiciona um pokemon aos favoritos', () => {
    service.toggleFavorite(25);
    expect(service.isFavorite(25)).toBe(true);
    expect(service.count()).toBe(1);
    expect(service.favorites()).toContain(25);
  });

  it('remove um pokemon que já era favorito', () => {
    service.toggleFavorite(25);
    expect(service.isFavorite(25)).toBe(true);

    service.toggleFavorite(25);
    expect(service.isFavorite(25)).toBe(false);
    expect(service.count()).toBe(0);
  });

  it('persiste os favoritos no localStorage', () => {
    service.toggleFavorite(1);
    service.toggleFavorite(4);

    const stored = JSON.parse(localStorage.getItem('pokedex_favorites_v1') || '[]');
    expect(stored).toEqual([1, 4]);
  });
});
