import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonApiService } from '../../core/services/pokemon-api.service';
import { PokemonDetailModel } from '../../models/pokemon.models';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [TitleCasePipe, FormsModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {
  private api = inject(PokemonApiService);

  pokemon = signal<PokemonDetailModel | null>(null);
  options = signal<string[]>([]);
  status = signal<'setup' | 'loading' | 'playing' | 'won' | 'lost'>('setup');
  selectedOption = signal<string>('');

  // Setup options
  availableGenerations = signal<{name: string, url: string}[]>([]);
  availableTypes = signal<string[]>([]);
  
  filterMode = signal<'global' | 'generation' | 'type'>('global');
  filterValue = signal<string>('');
  
  poolNames = signal<string[]>([]); // Current pool of allowed pokemon names

  ngOnInit() {
    this.api.getGenerations().subscribe(gens => this.availableGenerations.set(gens));
    this.api.getTypes().subscribe(types => this.availableTypes.set(types));
  }

  confirmSetup() {
    this.status.set('loading');
    
    if (this.filterMode() === 'global') {
      this.api.getAllPokemonNames().subscribe(names => {
        this.poolNames.set(names);
        this.startNewGame();
      });
    } else if (this.filterMode() === 'generation') {
      this.api.getPokemonNamesByGeneration(this.filterValue()).subscribe(names => {
        this.poolNames.set(names);
        this.startNewGame();
      });
    } else if (this.filterMode() === 'type') {
      this.api.getAllPokemonNamesByTypes([this.filterValue()]).subscribe(names => {
        this.poolNames.set(names);
        this.startNewGame();
      });
    }
  }

  backToSetup() {
    this.status.set('setup');
    this.poolNames.set([]);
  }

  startNewGame() {
    const pool = this.poolNames();
    if (pool.length < 4) {
      alert('Não há Pokémons suficientes nesta categoria para o Quiz (mínimo 4).');
      this.status.set('setup');
      return;
    }

    this.status.set('loading');
    this.pokemon.set(null);
    this.selectedOption.set('');
    
    // Pick 4 unique random names
    const selectedNames = new Set<string>();
    while(selectedNames.size < 4) {
      const randomIdx = Math.floor(Math.random() * pool.length);
      selectedNames.add(pool[randomIdx]);
    }
    const namesArray = Array.from(selectedNames);
    const targetName = namesArray[0];

    // Fetch target details
    this.api.getPokemonDetailMapped(targetName).subscribe({
      next: (detail) => {
        this.pokemon.set(detail);
        
        // As the names are already strings, we don't need to fetch the wrong answers' details, 
        // we can just use their names directly for the buttons!
        const allOptions = [detail.name, ...namesArray.slice(1)].sort(() => Math.random() - 0.5);
        this.options.set(allOptions);
        this.status.set('playing');
      },
      error: () => {
        // Fallback in case a specific species form fails to fetch by name
        this.startNewGame();
      }
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
