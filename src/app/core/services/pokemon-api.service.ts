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
   * Busca todas as gerações disponíveis na API.
   */
  getGenerations(): Observable<{ name: string; url: string }[]> {
    return this.http.get<any>(`${this.BASE_URL}/generation`).pipe(
      map(res => res.results)
    );
  }

  /**
   * Retorna os cards filtrados por múltiplos tipos e/ou geração.
   * Faz a interseção dos resultados no client-side.
   */
  getFilteredPokemons(types: string[], generation: string, limit: number, offset: number): Observable<{ total: number; cards: PokemonCardModel[] }> {
    const requests: Observable<string[]>[] = [];

    // Busca os pokémons de cada tipo selecionado
    types.forEach(type => {
      requests.push(
        this.http.get<TypeDetailResponse>(`${this.BASE_URL}/type/${type}`).pipe(
          map(res => res.pokemon.map(p => p.pokemon.name))
        )
      );
    });

    // Busca as espécies da geração selecionada
    if (generation) {
      requests.push(
        this.http.get<any>(`${this.BASE_URL}/generation/${generation}`).pipe(
          map(res => res.pokemon_species.map((s: any) => s.name))
        )
      );
    }

    // Se não há filtros, volta para o getPagedPokemons normal
    if (requests.length === 0) {
      return this.getPagedPokemons(limit, offset);
    }

    return forkJoin(requests).pipe(
      switchMap((nameArrays: string[][]) => {
        // Interseção dos arrays (só mantém nomes que existem em TODOS os arrays filtrados)
        let intersected = nameArrays[0];
        for (let i = 1; i < nameArrays.length; i++) {
          const set = new Set(nameArrays[i]);
          intersected = intersected.filter(name => set.has(name.split('-')[0])); // Trata sufixos de formas alternativas caso a espécie base seja diferente
        }

        const total = intersected.length;
        const pageSlice = intersected.slice(offset, offset + limit);

        if (pageSlice.length === 0) {
          import('rxjs').then(m => m.of({ total, cards: [] })); // fallback
          // Retornar um observable vazio em caso de 0 resultados
          return new Observable<{ total: number; cards: PokemonCardModel[] }>(sub => {
            sub.next({ total: 0, cards: [] });
            sub.complete();
          });
        }

        const detailRequests = pageSlice.map(name => this.getPokemonDetail(name));

        return forkJoin(detailRequests).pipe(
          map(details => ({
            total,
            cards: details.map(mapToPokemonCard)
          }))
        );
      })
    );
  }

  /**
   * Busca todos os nomes de Pokémons disponíveis (útil para autocomplete global).
   */
  getAllPokemonNames(): Observable<string[]> {
    return this.http.get<PokemonListResponse>(`${this.BASE_URL}/pokemon?limit=10000`).pipe(
      map(res => res.results.map(p => p.name))
    );
  }

  /**
   * Busca todos os nomes de Pokémons filtrados por um array de tipos (útil para restrição de Estágios).
   * Retorna uma lista unificada (união, não interseção).
   */
  getAllPokemonNamesByTypes(types: string[]): Observable<string[]> {
    if (!types || types.length === 0) {
      return this.getAllPokemonNames();
    }
    
    const requests = types.map(type => 
      this.http.get<TypeDetailResponse>(`${this.BASE_URL}/type/${type}`).pipe(
        map(res => res.pokemon.map(p => p.pokemon.name))
      )
    );

    return forkJoin(requests).pipe(
      map(nameArrays => {
        const allNames = new Set<string>();
        nameArrays.forEach(arr => {
          arr.forEach(name => allNames.add(name));
        });
        return Array.from(allNames);
      })
    );
  }
}
