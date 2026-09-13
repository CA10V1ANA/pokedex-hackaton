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
  { path: '**', redirectTo: '' }
];

