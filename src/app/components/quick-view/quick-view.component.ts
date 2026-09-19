import { StatRowComponent } from '../stat-row/stat-row.component';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PokemonDetailModel } from '../../models/pokemon.models';

@Component({
  selector: 'app-quick-view',
  standalone: true,
  imports: [StatRowComponent, NgClass, RouterLink],
  templateUrl: './quick-view.component.html',
  styleUrl: './quick-view.component.scss'
})
export class QuickViewComponent {
  /**
   * Quando null, o painel exibe o estado vazio ("Selecione um Pokémon").
   * Quando preenchido, exibe os dados completos.
   */
  @Input() pokemon: PokemonDetailModel | null = null;
  @Input() hasPrev = false;
  @Input() hasNext = false;
  @Input() isFavorite = false;

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();

  

  
  sendToSimulator() {
    alert('Simulador de Batalha em construção! PokǸmon ' + this.pokemon?.name + ' carregado na arena.');
    // Aqui no futuro injetamos no serviço de batalha
  }

  formatStatName(name: string): string {
    const statMap: Record<string, string> = {
      'hp': 'HP',
      'attack': 'ATK',
      'defense': 'DEF',
      'special-attack': 'SP. ATK',
      'special-defense': 'SP. DEF',
      'speed': 'SPD'
    };
    return statMap[name.toLowerCase()] || name.toUpperCase();
  }
}
