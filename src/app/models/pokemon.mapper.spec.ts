import { describe, it, expect } from 'vitest';
import {
  formatPokemonId,
  capitalizeName,
  mapToPokemonCard,
  mapToPokemonDetail,
  extractImageUrl,
} from './pokemon.mapper';
import { PokemonDetailResponse } from './pokemon-api.models';

/**
 * Testes do Mapper: funções puras que convertem DTO → View Model.
 *
 * Por que testar funções puras primeiro?
 * - Sem efeitos colaterais: resultado previsível, sem mocks necessários.
 * - São o coração da transformação de dados — um bug aqui afeta toda a UI.
 * - Excelente ROI: fáceis de escrever, alta cobertura de lógica real.
 */

// ─── Fixture: DTO simulando a resposta da PokéAPI ─────────────────────────
const mockDetailResponse: PokemonDetailResponse = {
  id: 25,
  name: 'pikachu',
  height: 4,      // decímetros → deve virar 0.4 m
  weight: 60,     // hectogramas → deve virar 6.0 kg
  sprites: {
    front_default: 'https://sprites.example.com/pikachu.png',
    other: {
      'official-artwork': {
        front_default: 'https://artwork.example.com/pikachu.png',
      },
    },
  },
  types: [
    { slot: 1, type: { name: 'electric', url: '' } },
  ],
  abilities: [
    { ability: { name: 'static', url: '' }, is_hidden: false, slot: 1 },
    { ability: { name: 'lightning-rod', url: '' }, is_hidden: true, slot: 3 },
  ],
  stats: [
    { base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } },
    { base_stat: 55, effort: 0, stat: { name: 'attack', url: '' } },
    { base_stat: 40, effort: 0, stat: { name: 'defense', url: '' } },
  ],
};

// ─── Testes de formatPokemonId ─────────────────────────────────────────────
describe('formatPokemonId', () => {
  it('formata IDs com menos de 4 dígitos com zeros à esquerda', () => {
    expect(formatPokemonId(1)).toBe('#0001');
    expect(formatPokemonId(25)).toBe('#0025');
    expect(formatPokemonId(151)).toBe('#0151');
  });

  it('não adiciona zeros quando o ID já tem 4 ou mais dígitos', () => {
    expect(formatPokemonId(1000)).toBe('#1000');
    expect(formatPokemonId(10000)).toBe('#10000');
  });
});

// ─── Testes de capitalizeName ──────────────────────────────────────────────
describe('capitalizeName', () => {
  it('capitaliza a primeira letra e mantém o restante igual', () => {
    expect(capitalizeName('pikachu')).toBe('Pikachu');
    expect(capitalizeName('mr-mime')).toBe('Mr-mime');
  });

  it('não altera nomes já capitalizados', () => {
    expect(capitalizeName('Bulbasaur')).toBe('Bulbasaur');
  });
});

// ─── Testes de extractImageUrl ────────────────────────────────────────────
describe('extractImageUrl', () => {
  it('prioriza o official artwork quando disponível', () => {
    const url = extractImageUrl(mockDetailResponse);
    expect(url).toBe('https://artwork.example.com/pikachu.png');
  });

  it('usa o sprite padrão quando o artwork não está disponível', () => {
    const withoutArtwork: PokemonDetailResponse = {
      ...mockDetailResponse,
      sprites: { front_default: 'https://sprites.example.com/pikachu.png' },
    };
    expect(extractImageUrl(withoutArtwork)).toBe('https://sprites.example.com/pikachu.png');
  });

  it('retorna string vazia quando nenhuma imagem está disponível', () => {
    const noImages: PokemonDetailResponse = {
      ...mockDetailResponse,
      sprites: { front_default: null },
    };
    expect(extractImageUrl(noImages)).toBe('');
  });
});

// ─── Testes de mapToPokemonCard ───────────────────────────────────────────
describe('mapToPokemonCard', () => {
  it('converte o DTO corretamente para o View Model do card', () => {
    const card = mapToPokemonCard(mockDetailResponse);

    expect(card.id).toBe(25);
    expect(card.name).toBe('Pikachu');  // capitalizado
    expect(card.paddedId).toBe('#0025');
    expect(card.types).toEqual(['electric']);
    expect(card.imageUrl).toBe('https://artwork.example.com/pikachu.png');
  });
});

// ─── Testes de mapToPokemonDetail ─────────────────────────────────────────
describe('mapToPokemonDetail', () => {
  it('converte altura de decímetros para metros', () => {
    const detail = mapToPokemonDetail(mockDetailResponse);
    expect(detail.heightM).toBe(0.4);  // 4 / 10 = 0.4
  });

  it('converte peso de hectogramas para quilogramas', () => {
    const detail = mapToPokemonDetail(mockDetailResponse);
    expect(detail.weightKg).toBe(6);   // 60 / 10 = 6
  });

  it('exclui habilidades ocultas (is_hidden: true)', () => {
    const detail = mapToPokemonDetail(mockDetailResponse);
    expect(detail.abilities).toEqual(['Static']);   // lightning-rod é oculta e deve ser excluída
    expect(detail.abilities).not.toContain('Lightning-rod');
  });

  it('mapeia os stats corretamente', () => {
    const detail = mapToPokemonDetail(mockDetailResponse);
    expect(detail.stats).toHaveLength(3);
    expect(detail.stats[0]).toEqual({ name: 'hp', value: 35 });
    expect(detail.stats[1]).toEqual({ name: 'attack', value: 55 });
  });
});
