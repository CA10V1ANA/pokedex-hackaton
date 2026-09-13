import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PokemonDetailModel } from '../../models/pokemon.models';

@Component({
  selector: 'app-quick-view',
  standalone: true,
  imports: [NgClass, RouterLink],
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

  /**
   * Retorna uma cor semântica para a barra com base na força do atributo.
   */
  getStatColor(value: number): string {
    if (value >= 100) return '#10b981'; // Excelente (Verde esmeralda)
    if (value >= 75)  return '#3b82f6'; // Muito Bom (Azul)
    if (value >= 50)  return '#f59e0b'; // Regular/Bom (Âmbar)
    return '#f97316';                   // Inicial/Baixo (Coral)
  }
}
