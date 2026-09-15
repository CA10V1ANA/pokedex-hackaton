import { Component, inject, OnInit, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { PokemonApiService } from '../../core/services/pokemon-api.service';
import { PokemonDetailModel } from '../../models/pokemon.models';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {
  private api = inject(PokemonApiService);

  pokemon = signal<PokemonDetailModel | null>(null);
  options = signal<string[]>([]);
  status = signal<'loading' | 'playing' | 'won' | 'lost'>('loading');
  selectedOption = signal<string>('');

  ngOnInit() {
    this.startNewGame();
  }

  startNewGame() {
    this.status.set('loading');
    this.pokemon.set(null);
    this.selectedOption.set('');
    
    // Pick 4 random IDs between 1 and 1025
    const ids = Array.from({length: 4}, () => Math.floor(Math.random() * 1025) + 1);
    const targetId = ids[0];

    // Fetch the target pokemon
    this.api.getPokemonDetailMapped(targetId).subscribe(detail => {
      this.pokemon.set(detail);
      
      // We just need names for the others, but let's fetch details to be safe
      // In a real app we'd just fetch the names from the list, but for simplicity:
      Promise.all(ids.slice(1).map(id => this.api.getPokemonDetailMapped(id).toPromise())).then(others => {
        const wrongNames = others.map(o => o!.name);
        const allOptions = [detail.name, ...wrongNames].sort(() => Math.random() - 0.5);
        this.options.set(allOptions);
        this.status.set('playing');
      });
    });
  }

  selectOption(opt: string) {
    if (this.status() !== 'playing') return;
    
    this.selectedOption.set(opt);
    if (opt === this.pokemon()?.name) {
      this.status.set('won');
    } else {
      this.status.set('lost');
    }
  }
}
