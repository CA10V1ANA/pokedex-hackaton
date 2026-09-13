import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PokemonApiService } from '../../core/services/pokemon-api.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { PokemonCardModel, PokemonDetailModel } from '../../models/pokemon.models';
import { RemoteData, idle, loading, success, failure } from '../../models/remote-data.model';
import { PokemonCardComponent } from '../../components/pokemon-card/pokemon-card.component';
import { QuickViewComponent } from '../../components/quick-view/quick-view.component';

interface PokedexState {
  total: number;
  cards: PokemonCardModel[];
}

@Component({
  selector: 'app-pokedex-page',
  standalone: true,
  imports: [PokemonCardComponent, QuickViewComponent, FormsModule, TitleCasePipe],
  templateUrl: './pokedex.component.html',
  styleUrl: './pokedex.component.scss'
})
export class PokedexPageComponent implements OnInit {
  private readonly pokemonApi = inject(PokemonApiService);
  readonly favoritesService = inject(FavoritesService);

  // Array para renderizar 12 cards esqueleto durante o loading
  readonly skeletonCount = Array.from({ length: 12 }, (_, i) => i);

  // Estado da listagem principal (browse ou filtro por tipo)
  protected readonly listState = signal<RemoteData<PokedexState>>(idle());

  // Estado da busca
  protected readonly searchState = signal<RemoteData<PokemonDetailModel>>(idle());

  // Quick View
  protected readonly selectedPokemon = signal<PokemonDetailModel | null>(null);
  protected readonly detailLoading = signal(false);

  // Busca
  protected searchQuery = '';
  protected readonly isSearchMode = signal(false);

  // Filtro por tipo
  protected readonly availableTypes = signal<string[]>([]);
  protected selectedType = '';    // '' = "Todos"
  protected readonly isTypeDropdownOpen = signal(false);

  // Filtro por favoritos
  protected readonly showFavoritesOnly = signal(false);

  // Paginação
  protected readonly pageSize = 12;
  protected currentPage = 1;
  protected totalPages = 1;

  ngOnInit(): void {
    // Carrega a lista de tipos para popular o select
    this.pokemonApi.getTypes().subscribe({
      next: (types) => this.availableTypes.set(types),
      error: () => console.warn('Não foi possível carregar os tipos.')
    });

    this.loadPage(1);
  }

  // ─── CARREGAMENTO (Browse ou Filtro) ──────────────────────────

  loadPage(page: number, autoSelect?: 'first' | 'last'): void {
    if (this.showFavoritesOnly()) {
      this.loadFavoritesPage(page, autoSelect);
      return;
    }

    this.currentPage = page;
    const offset = (page - 1) * this.pageSize;
    if (!autoSelect) {
      this.selectedPokemon.set(null);
    }
    this.listState.set(loading());

    const request$ = this.selectedType
      ? this.pokemonApi.getPokemonsByType(this.selectedType, this.pageSize, offset)
      : this.pokemonApi.getPagedPokemons(this.pageSize, offset);

    request$.subscribe({
      next: (result) => {
        this.totalPages = Math.ceil(result.total / this.pageSize);
        this.listState.set(success(result));
        if (autoSelect === 'first' && result.cards.length > 0) {
          this.openPokemonDetail(result.cards[0]);
        } else if (autoSelect === 'last' && result.cards.length > 0) {
          this.openPokemonDetail(result.cards[result.cards.length - 1]);
        }
      },
      error: () => {
        this.listState.set(failure('Não foi possível carregar os Pokémons. Tente novamente.'));
      }
    });
  }

  loadFavoritesPage(page: number, autoSelect?: 'first' | 'last'): void {
    this.currentPage = page;
    const favIds = this.favoritesService.favorites();
    this.totalPages = Math.ceil(favIds.length / this.pageSize) || 1;

    if (!autoSelect) {
      this.selectedPokemon.set(null);
    }

    if (favIds.length === 0) {
      this.listState.set(success({ total: 0, cards: [] }));
      return;
    }

    this.listState.set(loading());
    const offset = (page - 1) * this.pageSize;
    const pageIds = favIds.slice(offset, offset + this.pageSize);

    forkJoin(pageIds.map(id => this.pokemonApi.getPokemonDetailMapped(id))).subscribe({
      next: (details) => {
        const cards = details.map(d => this.toCard(d));
        this.listState.set(success({ total: favIds.length, cards }));
        if (autoSelect === 'first' && cards.length > 0) {
          this.openPokemonDetail(cards[0]);
        } else if (autoSelect === 'last' && cards.length > 0) {
          this.openPokemonDetail(cards[cards.length - 1]);
        }
      },
      error: () => {
        this.listState.set(failure('Não foi possível carregar os favoritos.'));
      }
    });
  }

  // ─── FILTRO POR FAVORITOS ─────────────────────────────────────

  toggleFavoritesFilter(): void {
    this.clearSearch(false);
    this.selectedType = '';
    const nextVal = !this.showFavoritesOnly();
    this.showFavoritesOnly.set(nextVal);
    if (nextVal) {
      this.loadFavoritesPage(1);
    } else {
      this.loadPage(1);
    }
  }

  onToggleFavorite(id: number): void {
    this.favoritesService.toggleFavorite(id);
    if (this.showFavoritesOnly()) {
      this.loadFavoritesPage(this.currentPage);
    }
  }

  onCardTypeClick(type: string): void {
    if (this.showFavoritesOnly()) {
      this.showFavoritesOnly.set(false);
    }
    this.selectTypeFilter(type);
  }

  // ─── FILTRO POR TIPO ──────────────────────────────────────────

  toggleTypeDropdown(event?: MouseEvent): void {
    if (this.isSearchMode()) return;
    if (event) {
      event.stopPropagation();
    }
    this.isTypeDropdownOpen.update(open => !open);
  }

  closeTypeDropdown(): void {
    this.isTypeDropdownOpen.set(false);
  }

  selectCustomType(type: string): void {
    this.selectedType = type;
    this.closeTypeDropdown();
    this.onTypeChange();
  }

  clearTypeFilter(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedType = '';
    this.closeTypeDropdown();
    this.onTypeChange();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.type-filter-wrapper') && !target?.closest('.type-side-drawer')) {
      this.closeTypeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeTypeDropdown();
  }

  onTypeChange(): void {
    if (this.showFavoritesOnly()) {
      this.showFavoritesOnly.set(false);
    }
    // Ao trocar de tipo, reset de página e sai do modo search (regra C)
    this.clearSearch(false);
    this.loadPage(1);
  }

  selectTypeFilter(type: string): void {
    if (this.showFavoritesOnly()) {
      this.showFavoritesOnly.set(false);
    }
    this.selectedType = this.selectedType === type ? '' : type;
    this.closeTypeDropdown();
    this.onTypeChange();
  }

  // ─── PAGINAÇÃO ────────────────────────────────────────────────

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) this.loadPage(this.currentPage + 1);
  }

  goToPrevPage(): void {
    if (this.currentPage > 1) this.loadPage(this.currentPage - 1);
  }

  // ─── QUICK VIEW ───────────────────────────────────────────────

  openPokemonDetail(card: PokemonCardModel): void {
    this.detailLoading.set(true);
    this.selectedPokemon.set(null);

    this.pokemonApi.getPokemonDetailMapped(card.id).subscribe({
      next: (detail) => {
        this.selectedPokemon.set(detail);
        this.detailLoading.set(false);
      },
      error: () => this.detailLoading.set(false)
    });
  }

  get currentCards(): PokemonCardModel[] {
    const state = this.listState();
    return state.status === 'success' ? state.data.cards : [];
  }

  get currentCardIndex(): number {
    const sel = this.selectedPokemon();
    if (!sel) return -1;
    return this.currentCards.findIndex(c => c.id === sel.id);
  }

  get hasPrevPokemon(): boolean {
    const sel = this.selectedPokemon();
    if (!sel) return false;
    const idx = this.currentCardIndex;
    if (idx > 0) return true;
    if (idx === 0 && this.currentPage > 1) return true;
    return !this.isSearchMode() && sel.id > 1;
  }

  get hasNextPokemon(): boolean {
    const sel = this.selectedPokemon();
    if (!sel) return false;
    const idx = this.currentCardIndex;
    const cards = this.currentCards;
    if (idx !== -1 && idx < cards.length - 1) return true;
    if (idx !== -1 && idx === cards.length - 1 && this.currentPage < this.totalPages) return true;
    return !this.isSearchMode() && sel.id < 1025;
  }

  onQuickViewPrev(): void {
    const sel = this.selectedPokemon();
    if (!sel) return;
    const idx = this.currentCardIndex;
    const cards = this.currentCards;

    if (idx > 0) {
      this.openPokemonDetail(cards[idx - 1]);
    } else if (idx === 0 && this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, 'last');
    } else if (sel.id > 1) {
      this.loadDetailById(sel.id - 1);
    }
  }

  onQuickViewNext(): void {
    const sel = this.selectedPokemon();
    if (!sel) return;
    const idx = this.currentCardIndex;
    const cards = this.currentCards;

    if (idx !== -1 && idx < cards.length - 1) {
      this.openPokemonDetail(cards[idx + 1]);
    } else if (idx !== -1 && idx === cards.length - 1 && this.currentPage < this.totalPages) {
      this.loadPage(this.currentPage + 1, 'first');
    } else if (sel.id < 1025) {
      this.loadDetailById(sel.id + 1);
    }
  }

  loadDetailById(id: number): void {
    this.detailLoading.set(true);
    this.pokemonApi.getPokemonDetailMapped(id).subscribe({
      next: (detail) => {
        this.selectedPokemon.set(detail);
        this.detailLoading.set(false);
      },
      error: () => this.detailLoading.set(false)
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    if (event.key === 'ArrowLeft' && this.hasPrevPokemon) {
      this.onQuickViewPrev();
    } else if (event.key === 'ArrowRight' && this.hasNextPokemon) {
      this.onQuickViewNext();
    }
  }

  // ─── BUSCA GLOBAL ─────────────────────────────────────────────

  performSearch(): void {
    const query = this.searchQuery.trim();
    if (!query) return;

    // Busca limpa o filtro de tipo (regra C do protocolo)
    this.selectedType = '';
    this.isSearchMode.set(true);
    this.selectedPokemon.set(null);
    this.searchState.set(loading());

    this.pokemonApi.searchPokemon(query).subscribe({
      next: (result) => {
        this.searchState.set(success(result));
        this.selectedPokemon.set(result);
      },
      error: (err) => {
        const msg = err.type === 'not_found'
          ? `Pokémon "${err.query}" não encontrado. Verifique o nome ou ID.`
          : 'Falha de conexão. Verifique sua internet e tente novamente.';
        this.searchState.set(failure(msg));
      }
    });
  }

  clearSearch(reloadPage = true): void {
    this.searchQuery = '';
    this.isSearchMode.set(false);
    this.searchState.set(idle());
    this.selectedPokemon.set(null);
    if (reloadPage) this.loadPage(this.currentPage);
  }

  // ─── HELPER ───────────────────────────────────────────────────

  toCard(detail: PokemonDetailModel): PokemonCardModel {
    return {
      id: detail.id,
      name: detail.name,
      imageUrl: detail.imageUrl,
      types: detail.types,
      paddedId: detail.paddedId,
    };
  }
}
