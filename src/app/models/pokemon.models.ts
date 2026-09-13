/**
 * View Models da Pokédex — modelos de apresentação.
 *
 * Diferença crucial entre DTO e View Model:
 * - DTO (pokemon-api.models.ts): espelha o JSON bruto da API
 * - View Model (aqui): representa os dados já preparados para a UI
 *
 * Exemplos de transformação:
 *   API:  height: 4          → UI: heightM: 0.4
 *   API:  weight: 60         → UI: weightKg: 6.0
 *   API:  types[0].type.name → UI: types: ['grass', 'poison']
 */

export interface PokemonCardModel {
  id: number;
  name: string;            // Capitalizado para exibição: "Bulbasaur"
  imageUrl: string;        // URL da imagem (official artwork ou sprite)
  types: string[];         // ['grass', 'poison']
  paddedId: string;        // '#0001' para exibição
}

export interface PokemonDetailModel {
  id: number;
  name: string;
  paddedId: string;
  imageUrl: string;
  types: string[];
  heightM: number;         // Altura em metros (API retorna decímetros)
  weightKg: number;        // Peso em kg (API retorna hectogramas)
  abilities: string[];     // Nomes das habilidades, sem habilidades ocultas no MVP
  stats: PokemonStatModel[];
}

export interface PokemonStatModel {
  name: string;            // 'hp', 'attack', 'defense', etc
  value: number;           // Valor base
}
