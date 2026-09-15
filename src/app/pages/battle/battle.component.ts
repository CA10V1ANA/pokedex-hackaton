import { Component, inject, signal } from '@angular/core';
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
export class BattleComponent {
  private api = inject(PokemonApiService);

  pokemon1 = signal<PokemonDetailModel | null>(null);
  pokemon2 = signal<PokemonDetailModel | null>(null);
  
  search1 = signal('');
  search2 = signal('');

  loading1 = signal(false);
  loading2 = signal(false);

  winner = signal<1 | 2 | 0 | null>(null); // 1 = P1, 2 = P2, 0 = Draw, null = no battle yet

  search(player: 1 | 2) {
    const query = player === 1 ? this.search1().trim().toLowerCase() : this.search2().trim().toLowerCase();
    if (!query) return;

    if (player === 1) this.loading1.set(true);
    else this.loading2.set(true);

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
    } else {
      this.pokemon2.set(null);
      this.search2.set('');
    }
    this.winner.set(null);
  }
}
