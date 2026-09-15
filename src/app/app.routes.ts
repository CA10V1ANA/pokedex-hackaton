import { Routes } from '@angular/router';
import { PokedexPageComponent } from './pages/pokedex/pokedex.component';

export const routes: Routes = [
  { path: '', component: PokedexPageComponent },
  {
    path: 'pokemon/:id',
    loadComponent: () =>
      import('./pages/pokemon-detail/pokemon-detail.component')
        .then(m => m.PokemonDetailComponent)
  },
  {
    path: 'quiz',
    loadComponent: () =>
      import('./pages/quiz/quiz.component')
        .then(m => m.QuizComponent)
  },
  {
    path: 'battle',
    loadComponent: () =>
      import('./pages/battle/battle.component')
        .then(m => m.BattleComponent)
  },
  { path: '**', redirectTo: '' }
];
