import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'pokedex_favorites_v1';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly favoritesSignal = signal<number[]>(this.loadFromStorage());

  /** Lista reativa de IDs favoritos */
  readonly favorites = this.favoritesSignal.asReadonly();

  /** Total de favoritos salvos */
  readonly count = computed(() => this.favoritesSignal().length);

  /** Verifica se um determinado ID é favorito */
  isFavorite(id: number): boolean {
    return this.favoritesSignal().includes(id);
  }

  /** Alterna o status de favorito (adiciona ou remove) */
  toggleFavorite(id: number): void {
    const current = this.favoritesSignal();
    const updated = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id];

    this.favoritesSignal.set(updated);
    this.saveToStorage(updated);
  }

  private loadFromStorage(): number[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return [];
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(n => typeof n === 'number') : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: number[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch {
      // Ignora erro de quota se ocorrer
    }
  }
}
