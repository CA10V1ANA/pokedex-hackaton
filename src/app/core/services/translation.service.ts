
import { Injectable, signal } from '@angular/core';

export type Lang = 'pt' | 'en' | 'es';

const DICTIONARY = {
  pt: {
    SEARCH_PLACEHOLDER: 'Buscar por nome ou número (ex: Pikachu, 25)...',
    BTN_SEARCH: 'Buscar',
    BTN_FILTERS: 'Filtros Avançados',
    BTN_FAVORITES: 'Favoritos',
    EMPTY_STATE_TITLE: 'Nenhum Pokémon selecionado',
    EMPTY_STATE_DESC: 'Selecione um Pokémon no catálogo para ver suas medidas, habilidades e status base aqui.',
    PAGE: 'Página',
    PREV: 'Anterior',
    NEXT: 'Próxima',
    SIMULATE_BATTLE: 'Simular Batalha',
    HEIGHT: 'ALTURA',
    WEIGHT: 'PESO',
    ABILITIES: 'HABILIDADES',
    BASE_STATS: 'STATS BASE',
    MODE_LIGHT: 'Modo Claro',
    MODE_DARK: 'Modo Escuro'
  },
  en: {
    SEARCH_PLACEHOLDER: 'Search by name or number (e.g. Pikachu, 25)...',
    BTN_SEARCH: 'Search',
    BTN_FILTERS: 'Advanced Filters',
    BTN_FAVORITES: 'Favorites',
    EMPTY_STATE_TITLE: 'No Pokémon selected',
    EMPTY_STATE_DESC: 'Select a Pokémon from the catalog to see its measurements, abilities, and base stats here.',
    PAGE: 'Page',
    PREV: 'Previous',
    NEXT: 'Next',
    SIMULATE_BATTLE: 'Simulate Battle',
    HEIGHT: 'HEIGHT',
    WEIGHT: 'WEIGHT',
    ABILITIES: 'ABILITIES',
    BASE_STATS: 'BASE STATS',
    MODE_LIGHT: 'Light Mode',
    MODE_DARK: 'Dark Mode'
  },
  es: {
    SEARCH_PLACEHOLDER: 'Buscar por nombre o número (ej: Pikachu, 25)...',
    BTN_SEARCH: 'Buscar',
    BTN_FILTERS: 'Filtros Avanzados',
    BTN_FAVORITES: 'Favoritos',
    EMPTY_STATE_TITLE: 'Ningún Pokémon seleccionado',
    EMPTY_STATE_DESC: 'Selecciona un Pokémon del catálogo para ver sus medidas, habilidades y estadísticas base aquí.',
    PAGE: 'Página',
    PREV: 'Anterior',
    NEXT: 'Siguiente',
    SIMULATE_BATTLE: 'Simular Batalla',
    HEIGHT: 'ALTURA',
    WEIGHT: 'PESO',
    ABILITIES: 'HABILIDADES',
    BASE_STATS: 'ESTADÍSTICAS BASE',
    MODE_LIGHT: 'Modo Claro',
    MODE_DARK: 'Modo Oscuro'
  }
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  currentLang = signal<Lang>('pt');

  setLang(lang: Lang) {
    this.currentLang.set(lang);
    localStorage.setItem('lang', lang);
  }

  initLang() {
    const saved = localStorage.getItem('lang') as Lang;
    if (saved && (saved === 'pt' || saved === 'en' || saved === 'es')) {
      this.currentLang.set(saved);
    }
  }

  t(key: keyof typeof DICTIONARY['pt']): string {
    return DICTIONARY[this.currentLang()][key] || key;
  }
}
