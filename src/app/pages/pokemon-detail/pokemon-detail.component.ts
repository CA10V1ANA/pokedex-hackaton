import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { PokemonApiService } from '../../core/services/pokemon-api.service';
import { PokemonDetailModel } from '../../models/pokemon.models';
import { RemoteData, loading, success, failure } from '../../models/remote-data.model';

import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss'
})
export class PokemonDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pokemonApi = inject(PokemonApiService);
  private readonly favoritesService = inject(FavoritesService);

  protected readonly state = signal<RemoteData<PokemonDetailModel>>(loading());

  protected readonly pokemon = computed<PokemonDetailModel | null>(() => {
    const s = this.state();
    return s.status === 'success' ? s.data : null;
  });

  protected readonly isFavorite = computed(() => {
    const p = this.pokemon();
    return p ? this.favoritesService.isFavorite(p.id) : false;
  });

  toggleFavorite(): void {
    const p = this.pokemon();
    if (p) this.favoritesService.toggleFavorite(p.id);
  }

  getStatColor(value: number): string {
    if (value >= 100) return '#10b981';
    if (value >= 75)  return '#3b82f6';
    if (value >= 50)  return '#f59e0b';
    return '#f97316';
  }

  ngOnInit(): void {
    // Escuta mudanças de parâmetro na rota para recarregar ao trocar de Pokémon
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.router.navigate(['/']);
        return;
      }
      this.loadPokemon(id);
    });
  }

  loadPokemon(id: string | number): void {
    this.state.set(loading());
    this.pokemonApi.getPokemonDetailMapped(id).subscribe({
      next: (detail) => this.state.set(success(detail)),
      error: (err) => {
        const msg = err?.status === 404
          ? `Pokémon "${id}" não encontrado.`
          : 'Erro ao carregar. Tente novamente.';
        this.state.set(failure(msg));
      }
    });
  }

  goToPokemon(id: number): void {
    if (id < 1 || id > 1025) return;
    this.router.navigate(['/pokemon', id]);
  }

  padId(id: number): string {
    return String(id).padStart(4, '0');
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    const current = this.pokemon();
    if (!current) return;

    if (event.key === 'ArrowLeft' && current.id > 1) {
      this.goToPokemon(current.id - 1);
    } else if (event.key === 'ArrowRight' && current.id < 1025) {
      this.goToPokemon(current.id + 1);
    }
  }
}
