import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import {
  PokemonListResponse,
  PokemonDetailResponse,
  NamedApiResource,
  TypeListResponse,
  TypeDetailResponse
} from '../../models/pokemon-api.models';
import { PokemonCardModel, PokemonDetailModel } from '../../models/pokemon.models';
import { mapToPokemonCard, mapToPokemonDetail } from '../../models/pokemon.mapper';

/**
 * PokemonApiService — única classe que conhece a URL da PokéAPI.
 * Nenhum componente deve fazer requisições HTTP diretamente.
 */
@Injectable({
  providedIn: 'root'
})
export class PokemonApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = 'https://pokeapi.co/api/v2';

  /** Busca a lista paginada de pokémons (apenas nome e url). */
  getPokemonList(limit: number, offset: number): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(
      `${this.BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
    );
  }

  /** Busca os detalhes completos de um pokémon (DTO bruto). */
  getPokemonDetail(idOrName: string | number): Observable<PokemonDetailResponse> {
    return this.http.get<PokemonDetailResponse>(
      `${this.BASE_URL}/pokemon/${idOrName}`
    );
  }

  /**
   * Retorna uma página de cards mapeados + total de pokémons.
   * Combina 1 GET de lista + N GETs de detalhe em paralelo via forkJoin,
   * depois mapeia cada detalhe para PokemonCardModel (View Model do card).
   */
  getPagedPokemons(limit: number, offset: number): Observable<{ total: number; cards: PokemonCardModel[] }> {
    return this.getPokemonList(limit, offset).pipe(
      switchMap((listResponse: PokemonListResponse) => {
        const detailRequests: Observable<PokemonDetailResponse>[] = listResponse.results.map(
          (resource: NamedApiResource) => this.getPokemonDetail(resource.name)
        );
        return forkJoin(detailRequests).pipe(
          // map: transforma o array de DTOs em array de View Models
          map((details: PokemonDetailResponse[]) => ({
            total: listResponse.count,
            cards: details.map(mapToPokemonCard)
          }))
        );
      })
    );
  }

  /**
   * Busca o detalhe de um único pokémon mapeado para o View Model de detalhe.
   * Usado na página/Quick View de detalhes.
   */
  getPokemonDetailMapped(idOrName: string | number): Observable<PokemonDetailModel> {
    return this.getPokemonDetail(idOrName).pipe(
      map(mapToPokemonDetail)
    );
  }

  /**
   * Busca um Pokémon por nome ou ID (busca global).
   * Normaliza a entrada (trim + lowercase) antes de enviar.
   *
   * Erros tratados de forma diferente:
   * - 404 → throwError('not_found') — Pokémon não existe
   * - outros → throwError('network_error') — falha técnica
   */
  searchPokemon(query: string): Observable<PokemonDetailModel> {
    const normalized = query.trim().toLowerCase();
    return this.getPokemonDetail(normalized).pipe(
      map(mapToPokemonDetail),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return throwError(() => ({ type: 'not_found', query: normalized }));
        }
        return throwError(() => ({ type: 'network_error' }));
      })
    );
  }

  /**
   * Busca todos os tipos de Pokémon disponíveis na API.
   * Usado para popular o select de filtro.
   * Excluímos 'unknown' e 'shadow' pois são tipos especiais sem pokémons jogáveis.
   */
  getTypes(): Observable<string[]> {
    return this.http.get<TypeListResponse>(`${this.BASE_URL}/type`).pipe(
      map(res => res.results
        .map(r => r.name)
        .filter(name => name !== 'unknown' && name !== 'shadow')
      )
    );
  }

  /**
   * Retorna os cards de uma página de Pokémons filtrados por tipo.
   *
   * O endpoint /type/{name} devolve TODOS os Pokémon daquele tipo de uma vez.
   * A paginação é feita client-side: slicamos o array antes de buscar detalhes.
   * Isso evita buscar centenas de detalhes de uma vez só.
   *
   * Trade-off aceito: o total já é sabido antes de paginar (melhor UX para paginação).
   */
  getPokemonsByType(typeName: string, limit: number, offset: number): Observable<{ total: number; cards: PokemonCardModel[] }> {
    return this.http.get<TypeDetailResponse>(`${this.BASE_URL}/type/${typeName}`).pipe(
      switchMap((typeResponse: TypeDetailResponse) => {
        const allPokemon = typeResponse.pokemon;
        const total = allPokemon.length;

        // Paginação client-side: pega apenas os N itens da página atual
        const pageSlice = allPokemon.slice(offset, offset + limit);

        if (pageSlice.length === 0) {
          return [{ total, cards: [] }]; // Página vazia mas não erro
        }

        const detailRequests = pageSlice.map(entry =>
          this.getPokemonDetail(entry.pokemon.name)
        );

        return forkJoin(detailRequests).pipe(
          map(details => ({
            total,
            cards: details.map(mapToPokemonCard)
          }))
        );
      })
    );
  }
}
