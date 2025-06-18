import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import {
  LucideAngularModule,
  Search,
  Zap,
  Shield,
  Swords,
  Star,
  ArrowBigRight,
  ArrowBigLeft,
  Loader2,
} from 'lucide-angular';

import { IonicModule } from '@ionic/angular';

interface PokemonListResponse {
  count: number;
  results: { name: string; url: string }[];
}

interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };

  types: { type: { name: string } }[];

  stats: { base_stat: number; stat: { name: string } }[];

  abilities: { ability: { name: string }; is_hidden: boolean }[];
}

@Component({
  selector: 'app-pokemon-spa',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HttpClientModule, 
    LucideAngularModule, 
    IonicModule,
  ],
  templateUrl: './pokemon-spa.component.html',
  styleUrls: ['./pokemon-spa.component.scss'],
})
export class PokemonSpaComponent implements OnInit {
  pokemon: Pokemon[] = [];
  loading = true;
  searchTerm = '';
  selectedPokemon: Pokemon | null = null;
  currentPage = 1;
  totalPages = 0;
  readonly pokemonPerPage = 20;

  readonly ArrowBigRight = ArrowBigRight;
  readonly ArrowBigLeft = ArrowBigLeft;

  readonly typeColors: { [key: string]: string } = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-blue-300',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-green-400',
    rock: 'bg-yellow-800',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-700',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300',
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPokemonPage();
  }

  async fetchPokemonPage(): Promise<void> {
    this.loading = true;
    try {
      const offset = (this.currentPage - 1) * this.pokemonPerPage;
      const url = `https://pokeapi.co/api/v2/pokemon?limit=<span class="math-inline">{this.pokemonPerPage}&offset=</span>{offset}`;
      const data = await firstValueFrom(
        this.http.get<PokemonListResponse>(url)
      );

      this.totalPages = Math.ceil(data.count / this.pokemonPerPage);

      const pokemonDetailsPromises = data.results.map((p) =>
        firstValueFrom(this.http.get<Pokemon>(p.url))
      );

      this.pokemon = await Promise.all(pokemonDetailsPromises);
    } catch (error) {
      console.error('Erro ao buscar Pokémon:', error);
    } finally {
      this.loading = false;
    }
  }

  private async fetchPokemonByName(name: string): Promise<Pokemon | null> {
    try {
      const url = `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`;
      return await firstValueFrom(this.http.get<Pokemon>(url));
    } catch (error) {
      console.error('Erro na busca:', error);
      return null;
    }
  }

  async handleSearch(): Promise<void> {
    if (!this.searchTerm.trim()) {
      if (this.pokemon.length !== this.pokemonPerPage) {
        this.currentPage = 1;
        this.fetchPokemonPage();
      }
      return;
    }

    this.loading = true;
    const foundPokemon = await this.fetchPokemonByName(this.searchTerm);
    if (foundPokemon) {
      this.pokemon = [foundPokemon];
      this.totalPages = 1;
    } else {
      this.pokemon = []; 
    }
    this.loading = false;
  }

  openModal(p: Pokemon): void {
    this.selectedPokemon = p;
  }

  closeModal(): void {
    this.selectedPokemon = null;
  }

  get filteredPokemon(): Pokemon[] {
    if (!this.searchTerm.trim()) {
      return this.pokemon;
    }
    return this.pokemon.filter((p) =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchPokemonPage();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchPokemonPage();
    }
  }

  trackById(index: number, p: Pokemon): number {
    return p.id;
  }

  getStatWidth(baseStat: number): number {
    const width = Math.min((baseStat / 200) * 100, 100);
    return width;
  }
}
