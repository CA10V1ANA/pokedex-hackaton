/**
 * DTOs (Data Transfer Objects) da PokéAPI.
 * Estas interfaces espelham o formato JSON retornado pela API.
 * Não representam o modelo de apresentação — apenas o contrato com a API.
 */

// Estrutura básica que a API usa para referenciar recursos pelo nome + url
export interface NamedApiResource {
  name: string;
  url: string;
}

// Resposta da chamada GET /pokemon?limit=N&offset=N
export interface PokemonListResponse {
  count: number;           // Total de pokémons existentes na API
  next: string | null;     // URL da próxima página (null se for a última)
  previous: string | null; // URL da página anterior (null se for a primeira)
  results: NamedApiResource[];
}

// Sprite (imagem) do pokémon vinda do detalhe
export interface PokemonSprites {
  front_default: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
    };
  };
}

// Tipo do pokémon dentro do detalhe (ex: grass, poison)
export interface PokemonType {
  slot: number;
  type: NamedApiResource;
}

// Habilidade do pokémon
export interface PokemonAbility {
  ability: NamedApiResource;
  is_hidden: boolean;
  slot: number;
}

// Stat base do pokémon (ex: hp, attack, defense)
export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedApiResource;
}

// Resposta completa da chamada GET /pokemon/{id-or-name}
export interface PokemonDetailResponse {
  id: number;
  name: string;
  height: number;  // Em decímetros (dividir por 10 para metros)
  weight: number;  // Em hectogramas (dividir por 10 para kg)
  sprites: PokemonSprites;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
}

// Resposta de GET /type — lista todos os tipos
export interface TypeListResponse {
  count: number;
  results: NamedApiResource[];
}

// Cada entrada do array 'pokemon' dentro de GET /type/{name}
export interface TypePokemonEntry {
  pokemon: NamedApiResource;
  slot: number;
}

// Resposta de GET /type/{name}
export interface TypeDetailResponse {
  id: number;
  name: string;
  pokemon: TypePokemonEntry[];
}
