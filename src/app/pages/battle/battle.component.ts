import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonApiService } from '../../core/services/pokemon-api.service';
import { PokemonDetailModel } from '../../models/pokemon.models';

@Component({
  selector: 'app-battle',
  standalone: true,
  imports: [TitleCasePipe, UpperCasePipe, FormsModule],
  templateUrl: './battle.component.html',
  styleUrl: './battle.component.scss'
})
export class BattleComponent implements OnInit {
  private api = inject(PokemonApiService);

  // Stages Configuration
  stages = [
    { id: 'neutral', name: 'Arena Neutra', types: [] },
    { id: 'volcano', name: 'Vulcão', types: ['fire', 'ground', 'rock'] },
    { id: 'ocean', name: 'Oceano', types: ['water', 'ice'] },
    { id: 'forest', name: 'Floresta', types: ['bug', 'grass', 'poison'] },
    { id: 'powerplant', name: 'Usina Elétrica', types: ['electric', 'steel'] }
  ];
  currentStageId = signal<string>('neutral');
  allowedPokemons = signal<string[]>([]); // List of allowed names for the stage
  stageLoading = signal(false);

  pokemon1 = signal<PokemonDetailModel | null>(null);
  pokemon2 = signal<PokemonDetailModel | null>(null);
  
  search1 = signal('');
  search2 = signal('');

  // Autocomplete UI state
  showSuggestions1 = signal(false);
  showSuggestions2 = signal(false);
  
  loading1 = signal(false);
  loading2 = signal(false);

  winner = signal<1 | 2 | 0 | null>(null);

  // Computed signals for suggestions
  suggestions1 = computed(() => {
    const q = this.search1().toLowerCase();
    if (!q) return [];
    return this.allowedPokemons().filter(p => p.includes(q)).slice(0, 5);
  });

  suggestions2 = computed(() => {
    const q = this.search2().toLowerCase();
    if (!q) return [];
    return this.allowedPokemons().filter(p => p.includes(q)).slice(0, 5);
  });

  ngOnInit() {
    this.changeStage('neutral');
  }

  changeStage(stageId: string) {
    this.currentStageId.set(stageId);
    this.stageLoading.set(true);
    // Reset battle
    this.clear(1);
    this.clear(2);
    
    const stage = this.stages.find(s => s.id === stageId);
    if (!stage) return;

    this.api.getAllPokemonNamesByTypes(stage.types).subscribe(names => {
      this.allowedPokemons.set(names);
      this.stageLoading.set(false);
    });
  }

  selectSuggestion(player: 1 | 2, name: string) {
    if (player === 1) {
      this.search1.set(name);
      this.showSuggestions1.set(false);
    } else {
      this.search2.set(name);
      this.showSuggestions2.set(false);
    }
    this.search(player);
  }

  search(player: 1 | 2) {
    const query = player === 1 ? this.search1().trim().toLowerCase() : this.search2().trim().toLowerCase();
    if (!query) return;

    // Check if allowed
    if (!this.allowedPokemons().includes(query)) {
      alert(`O Pokémon '${query}' não é permitido neste estágio!`);
      return;
    }

    if (player === 1) {
      this.loading1.set(true);
      this.showSuggestions1.set(false);
    } else {
      this.loading2.set(true);
      this.showSuggestions2.set(false);
    }

    this.api.searchPokemon(query).subscribe({
      next: (data: PokemonDetailModel) => {
        if (player === 1) {
          this.pokemon1.set(data);
          this.loading1.set(false);
        } else {
          this.pokemon2.set(data);
          this.loading2.set(false);
        }
        this.winner.set(null); // Reset battle
      },
      error: () => {
        if (player === 1) this.loading1.set(false);
        else this.loading2.set(false);
        alert(`Pokémon '${query}' não encontrado!`);
      }
    });
  }

  calculateStats(p: PokemonDetailModel): number {
    return p.stats.reduce((acc, stat) => acc + stat.value, 0);
  }

  battle() {
    const p1 = this.pokemon1();
    const p2 = this.pokemon2();
    if (!p1 || !p2) return;

    const stats1 = this.calculateStats(p1);
    const stats2 = this.calculateStats(p2);

    if (stats1 > stats2) {
      this.winner.set(1);
    } else if (stats2 > stats1) {
      this.winner.set(2);
    } else {
      this.winner.set(0);
    }
  }

  clear(player: 1 | 2) {
    if (player === 1) {
      this.pokemon1.set(null);
      this.search1.set('');
      this.showSuggestions1.set(false);
    } else {
      this.pokemon2.set(null);
      this.search2.set('');
      this.showSuggestions2.set(false);
    }
    this.winner.set(null);
  }
}
