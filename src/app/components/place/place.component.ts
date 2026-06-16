import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { PlaceCardComponent } from './place-card/place-card.component';
import { Place } from '../../models/place.models';
import { DestinationService } from '../../core/services/destination.service';
import { ApiDestination } from '../../models/api.models';

interface PlaceFilter {
  categories: string[];
  maxPrice: number | null;
  minRating: number | null;
}

const FALLBACK_PLACES: Place[] = [
  { id: 1, name: 'Cinque Terre Magic',   location: 'Italy, Manarola',     image: 'assets/images/place-manarola.jpeg',  imageCount: 5, hotelStars: 5, amenities: 20, reviewScore: 4.2, reviewLabel: 'Very Good', reviewCount: 54, pricePerNight: 240, isFavorite: true },
  { id: 2, name: 'Berlin City Break',    location: 'Germany, Berlin',     image: 'assets/images/place-berlin.jpeg',    imageCount: 9, hotelStars: 5, amenities: 20, reviewScore: 4.2, reviewLabel: 'Very Good', reviewCount: 54, pricePerNight: 104, isFavorite: true },
  { id: 3, name: 'Istanbul Bosphorus',   location: 'Turkey, Istanbul',    image: 'assets/images/place-istanbul.jpeg',  imageCount: 7, hotelStars: 3, amenities: 20, reviewScore: 4.2, reviewLabel: 'Very Good', reviewCount: 64, pricePerNight: 98,  isFavorite: false },
  { id: 4, name: 'New York Explorer',    location: 'USA, New York',       image: 'assets/images/place-newyork.jpeg',   imageCount: 9, hotelStars: 5, amenities: 20, reviewScore: 4.2, reviewLabel: 'Very Good', reviewCount: 34, pricePerNight: 104, isFavorite: false },
  { id: 5, name: 'London Classic Tour',  location: 'England, London',     image: 'assets/images/place-london.jpeg',    imageCount: 7, hotelStars: 4, amenities: 20, reviewScore: 4.2, reviewLabel: 'Very Good', reviewCount: 54, pricePerNight: 104, isFavorite: true },
  { id: 6, name: 'Rome Ancient Wonder',  location: 'Italy, Rome',         image: 'assets/images/place-rome.jpeg',      imageCount: 9, hotelStars: 5, amenities: 30, reviewScore: 4.2, reviewLabel: 'Very Good', reviewCount: 44, pricePerNight: 104, isFavorite: false },
  { id: 7, name: 'Barcelona Sunset',     location: 'Spain, Barcelona',    image: 'assets/images/place-barcelona.jpeg', imageCount: 8, hotelStars: 5, amenities: 40, reviewScore: 4.2, reviewLabel: 'Very Good', reviewCount: 54, pricePerNight: 104, isFavorite: false },
  { id: 8, name: 'Paris City of Light',  location: 'France, Paris',       image: 'assets/images/place-paris.jpeg',     imageCount: 7, hotelStars: 5, amenities: 20, reviewScore: 4.2, reviewLabel: 'Very Good', reviewCount: 54, pricePerNight: 104, isFavorite: false },
];

@Component({
  selector: 'app-place',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlaceCardComponent],
  templateUrl: './place.component.html',
  styleUrl: './place.component.css',
})
export class PlaceComponent implements OnInit {

  private readonly destinationService = inject(DestinationService);

  /* ── State ──────────────────────────────────────────────────── */
  readonly loading      = signal(true);
  readonly searchQuery  = signal('');
  readonly filterOpen   = signal(false);
  readonly activeFilter = signal<PlaceFilter>({ categories: [], maxPrice: null, minRating: null });
  readonly draftFilter  = signal<PlaceFilter>({ categories: [], maxPrice: null, minRating: null });
  readonly places       = signal<Place[]>([]);

  readonly ratingOptions: number[] = [3, 4, 5];

  /* ── Load from API ──────────────────────────────────────────── */
  ngOnInit(): void {
    this.destinationService.getAll().subscribe(apiData => {
      if (apiData.length > 0) {
        this.places.set(apiData.map(d => this.mapToPlace(d)));
      } else {
        this.places.set(FALLBACK_PLACES);
      }
      this.loading.set(false);
    });
  }

  private mapToPlace(d: ApiDestination): Place {
    return {
      id:           d.id,
      name:         d.name,
      location:     `${d.country}, ${d.city}`,
      image:        d.imageUrl || `assets/images/place-${d.city.toLowerCase()}.jpeg`,
      imageCount:   5,
      hotelStars:   Math.min(5, Math.max(1, Math.round(d.rating))),
      amenities:    20,
      reviewScore:  d.rating,
      reviewLabel:  this.ratingLabel(d.rating),
      reviewCount:  0,
      pricePerNight: d.price,
      isFavorite:   false,
    };
  }

  private ratingLabel(r: number): string {
    if (r >= 4.5) return 'Excellent';
    if (r >= 4)   return 'Very Good';
    if (r >= 3)   return 'Good';
    return 'Average';
  }

  /* ── Computed ───────────────────────────────────────────────── */
  readonly allCategories = computed(() =>
    [...new Set(this.places().map(p => p.location.split(',')[0].trim()))]
  );

  readonly activeFilterCount = computed(() => {
    const f = this.activeFilter();
    return (f.categories.length > 0 ? 1 : 0) +
           (f.maxPrice !== null ? 1 : 0) +
           (f.minRating !== null ? 1 : 0);
  });

  readonly filteredPlaces = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const f = this.activeFilter();
    return this.places().filter(p => {
      const country     = p.location.split(',')[0].trim();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
      const matchCat    = f.categories.length === 0 || f.categories.includes(country);
      const matchPrice  = f.maxPrice === null || p.pricePerNight <= f.maxPrice;
      const matchRating = f.minRating === null || p.hotelStars >= f.minRating;
      return matchSearch && matchCat && matchPrice && matchRating;
    });
  });

  /* ── Search & filter actions ────────────────────────────────── */
  onSearch(value: string): void { this.searchQuery.set(value); }
  clearSearch(): void { this.searchQuery.set(''); }

  toggleFilterPanel(): void {
    if (!this.filterOpen()) {
      this.draftFilter.set({ ...this.activeFilter(), categories: [...this.activeFilter().categories] });
    }
    this.filterOpen.update(v => !v);
  }

  toggleDraftCategory(cat: string): void {
    this.draftFilter.update(f => {
      const cats = f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat];
      return { ...f, categories: cats };
    });
  }

  setDraftMaxPrice(val: string): void {
    const n = val === '' ? null : Number(val);
    this.draftFilter.update(f => ({ ...f, maxPrice: (n === null || isNaN(n)) ? null : n }));
  }

  setDraftMinRating(r: number): void {
    const current = this.draftFilter().minRating;
    this.draftFilter.update(f => ({ ...f, minRating: current === r ? null : r }));
  }

  applyFilter(): void {
    this.activeFilter.set({ ...this.draftFilter(), categories: [...this.draftFilter().categories] });
    this.filterOpen.set(false);
  }

  clearFilter(): void {
    const empty: PlaceFilter = { categories: [], maxPrice: null, minRating: null };
    this.activeFilter.set(empty);
    this.draftFilter.set({ ...empty });
    this.filterOpen.set(false);
  }

  removeCategoryChip(cat: string): void {
    this.activeFilter.update(f => ({ ...f, categories: f.categories.filter(c => c !== cat) }));
  }

  removeMaxPriceChip(): void {
    this.activeFilter.update(f => ({ ...f, maxPrice: null }));
  }

  removeRatingChip(): void {
    this.activeFilter.update(f => ({ ...f, minRating: null }));
  }

  onViewPlace(place: Place): void {
    console.log('View place:', place.name);
  }

  onToggleFavorite(placeId: number): void {
    this.places.update(list =>
      list.map(p => p.id === placeId ? { ...p, isFavorite: !p.isFavorite } : p)
    );
  }
}
