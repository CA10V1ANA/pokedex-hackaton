import { PokemonDetailResponse } from './pokemon-api.models';
import { PokemonCardModel, PokemonDetailModel, PokemonStatModel } from './pokemon.models';

/**
 * Funções puras de mapeamento: DTO da API → View Model da UI.
 * Sem efeitos colaterais. Ideais para testes unitários.
 *
 * Concentrar transformações aqui significa que se a API mudar o formato,
 * mudamos apenas este arquivo — os componentes não precisam saber.
 */

/**
 * Formata o ID com zeros à esquerda: 25 → '#0025'
 */
export function formatPokemonId(id: number): string {
  return `#${String(id).padStart(4, '0')}`;
}

/**
 * Extrai a melhor URL de imagem disponível.
 * Prioridade: official artwork > sprite padrão > fallback vazio
 */
export function extractImageUrl(response: PokemonDetailResponse): string {
  return (
    response.sprites.other?.['official-artwork']?.front_default ??
    response.sprites.front_default ??
    ''
  );
}

/**
 * Capitaliza a primeira letra: 'pikachu' → 'Pikachu'
 */
export function capitalizeName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Mapeia um PokemonDetailResponse (DTO) para PokemonCardModel (View Model do card).
 */
export function mapToPokemonCard(response: PokemonDetailResponse): PokemonCardModel {
  return {
    id: response.id,
    name: capitalizeName(response.name),
    imageUrl: extractImageUrl(response),
    types: response.types.map(t => t.type.name),
    paddedId: formatPokemonId(response.id),
  };
}

/**
 * Mapeia um PokemonDetailResponse (DTO) para PokemonDetailModel (View Model do detalhe/Quick View).
 *
 * Conversões:
 *  - height: decímetros → metros  (ex: 4 → 0.4)
 *  - weight: hectogramas → kg     (ex: 60 → 6.0)
 */
export function mapToPokemonDetail(response: PokemonDetailResponse): PokemonDetailModel {
  const stats: PokemonStatModel[] = response.stats.map(s => ({
    name: s.stat.name,
    value: s.base_stat,
  }));

  return {
    id: response.id,
    name: capitalizeName(response.name),
    paddedId: formatPokemonId(response.id),
    imageUrl: extractImageUrl(response),
    types: response.types.map(t => t.type.name),
    heightM: response.height / 10,
    weightKg: response.weight / 10,
    abilities: response.abilities
      .filter(a => !a.is_hidden) // Omitimos habilidades ocultas no MVP
      .map(a => capitalizeName(a.ability.name)),
    stats,
  };
}
