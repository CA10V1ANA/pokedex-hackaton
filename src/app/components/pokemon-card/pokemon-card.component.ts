import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonCardModel } from '../../models/pokemon.models';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.scss'
})
export class PokemonCardComponent {
  /**
   * IN: Recebe os dados do Pokémon da página pai (PokedexPage).
   * Usamos "required: true" (Angular 16+) para garantir que ninguém
   * consiga usar esse componente sem passar um Pokémon para ele.
   */
  @Input({ required: true }) pokemon!: PokemonCardModel;
  @Input() isFavorite = false;

  /**
   * OUT: Avisa o pai que este card foi clicado.
   * Não decidimos roteamento aqui, apenas emitimos o evento.
   */
  @Output() cardClick = new EventEmitter<PokemonCardModel>();
  @Output() toggleFavorite = new EventEmitter<number>();
  @Output() filterType = new EventEmitter<string>();

  // Retorna o tipo primário (ex: 'grass', 'fire') para injetar no CSS
  get primaryType(): string {
    return this.pokemon.types[0] || 'normal';
  }

  onClick(): void {
    this.cardClick.emit(this.pokemon);
  }
}
