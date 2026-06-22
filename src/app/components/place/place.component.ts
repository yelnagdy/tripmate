import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { PlaceCardComponent } from './place-card/place-card.component';
import { Place } from '../../models/place.models';
import { DestinationService } from '../../core/services/destination.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { CategoryService } from '../../core/services/category.service';
import { ApiCategory, ApiDestination } from '../../models/api.models';
import { safeUrl } from '../../core/utils/safe-url';

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

  private readonly router              = inject(Router);
  private readonly destinationService  = inject(DestinationService);
  private readonly favoritesService    = inject(FavoritesService);
  private readonly categoryService     = inject(CategoryService);

  /* ── State ──────────────────────────────────────────────────── */
  readonly loading            = signal(true);
  readonly filterLoading      = signal(false);
  readonly searchQuery        = signal('');
  readonly filterOpen         = signal(false);
  readonly activeFilter       = signal<PlaceFilter>({ categories: [], maxPrice: null, minRating: null });
  readonly draftFilter        = signal<PlaceFilter>({ categories: [], maxPrice: null, minRating: null });
  readonly places             = signal<Place[]>([]);
  readonly serverFilterResult = signal<Place[] | null>(null);
  readonly serverSearchResult = signal<Place[] | null>(null);
  readonly smartPlaces        = signal<Place[]>([]);
  readonly apiCategories      = signal<ApiCategory[]>([]);

  readonly ratingOptions: number[] = [3, 4, 5];

  // Backend search — debounced, cancels in-flight requests via switchMap
  private readonly search$ = new Subject<string>();

  /* ── Load from API ──────────────────────────────────────────── */
  ngOnInit(): void {
    const userId = this.getUserId();

    this.destinationService.getAll().subscribe(apiData => {
      const list = apiData.length >= 4 ? apiData.map(d => this.mapToPlace(d)) : FALLBACK_PLACES;
      this.places.set(list);
      this.loading.set(false);

      const ids = list.map(p => p.id);
      this.favoritesService.checkMany(ids, 'destination').subscribe(favMap => {
        this.places.update(ps => ps.map(p => ({ ...p, isFavorite: favMap[p.id] ?? false })));
      });
    });

    if (userId) {
      this.destinationService.getSmartRecommendations(userId, 5000).subscribe(apiData => {
        this.smartPlaces.set(apiData.map(d => this.mapToPlace(d)));
      });
    }

    this.categoryService.getAll().subscribe(cats => this.apiCategories.set(cats));

    // Wire backend search: debounce 350 ms, skip unchanged values, cancel stale requests
    this.search$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(q => q.length >= 2
        ? this.destinationService.search(q)
        : of([])
      ),
    ).subscribe(apiResults => {
      // Use API results if available; null clears so filteredPlaces falls back to client-side
      this.serverSearchResult.set(
        apiResults.length > 0 ? apiResults.map(d => this.mapToPlace(d)) : null
      );
    });
  }

  private getUserId(): number {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const claim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      return parseInt(payload[claim] ?? '0', 10) || 0;
    } catch { return 0; }
  }

  private mapToPlace(d: ApiDestination): Place {
    const safeCity    = (d.city    && d.city    !== 'null' && d.city    !== 'undefined') ? d.city.trim()    : '';
    const safeCountry = (d.country && d.country !== 'null' && d.country !== 'undefined') ? d.country.trim() : '';
    const location    = safeCity ? `${safeCountry || 'Unknown'}, ${safeCity}` : (safeCountry || 'Unknown');
    return {
      id:            d.id,
      name:          d.name,
      location,
      image:         safeUrl(d.imageUrl, 'assets/images/place-manarola.jpeg'),
      imageCount:    5,
      hotelStars:    Math.min(5, Math.max(1, Math.round(d.rating || 0))),
      amenities:     20,
      reviewScore:   d.rating || 0,
      reviewLabel:   this.ratingLabel(d.rating || 0),
      reviewCount:   0,
      pricePerNight: d.price,
      isFavorite:    false,
    };
  }

  private ratingLabel(r: number): string {
    if (r >= 4.5) return 'Excellent';
    if (r >= 4)   return 'Very Good';
    if (r >= 3)   return 'Good';
    return 'Average';
  }

  /* ── Computed ───────────────────────────────────────────────── */
  readonly allCategories = computed(() => {
    const api = this.apiCategories();
    if (api.length) return api.map(c => c.name);
    return [...new Set(this.places().map(p => p.location.split(',')[0].trim()))];
  });

  readonly activeFilterCount = computed(() => {
    const f = this.activeFilter();
    return (f.categories.length > 0 ? 1 : 0) +
           (f.maxPrice !== null ? 1 : 0) +
           (f.minRating !== null ? 1 : 0);
  });

  readonly filteredPlaces = computed(() => {
    const q    = this.searchQuery().toLowerCase().trim();
    const f    = this.activeFilter();

    // Priority: server search > server filter > all places
    const base = this.serverSearchResult() ?? this.serverFilterResult() ?? this.places();

    const apiCats = this.apiCategories();
    const usingTravelTypes = apiCats.length > 0;

    return base.filter(p => {
      const country     = p.location.split(',')[0].trim();
      // Skip client-side text search when server already filtered by query
      const matchSearch = this.serverSearchResult()
                          || !q
                          || p.name.toLowerCase().includes(q)
                          || p.location.toLowerCase().includes(q);
      const matchCat    = this.serverFilterResult()
                          || this.serverSearchResult()
                          || f.categories.length === 0
                          || usingTravelTypes
                          || f.categories.includes(country);
      const matchPrice  = this.serverFilterResult() || this.serverSearchResult() || f.maxPrice === null || p.pricePerNight <= f.maxPrice;
      const matchRating = f.minRating === null || p.hotelStars >= f.minRating;
      return matchSearch && matchCat && matchPrice && matchRating;
    });
  });

  /* ── Search & filter actions ────────────────────────────────── */
  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.search$.next(value.trim());
    if (!value.trim()) this.serverSearchResult.set(null);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.serverSearchResult.set(null);
    this.search$.next('');
  }

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
    const draft = this.draftFilter();
    this.activeFilter.set({ ...draft, categories: [...draft.categories] });
    this.filterOpen.set(false);

    // Only call the server filter when we have country-derived categories
    // (API categories empty) — travel-type categories can't be sent as country names.
    const usingTravelTypes = this.apiCategories().length > 0;
    const hasServerParams  = !usingTravelTypes && (draft.categories.length > 0 || draft.maxPrice !== null);

    if (!hasServerParams) {
      this.serverFilterResult.set(null);
      return;
    }

    this.filterLoading.set(true);
    this.destinationService.filter({
      country: draft.categories[0],
      budget:  draft.maxPrice ?? undefined,
    }).subscribe(apiData => {
      if (apiData.length > 0) {
        this.serverFilterResult.set(apiData.map(d => this.mapToPlace(d)));
      } else {
        this.serverFilterResult.set(null);
      }
      this.filterLoading.set(false);
    });
  }

  clearFilter(): void {
    const empty: PlaceFilter = { categories: [], maxPrice: null, minRating: null };
    this.activeFilter.set(empty);
    this.draftFilter.set({ ...empty });
    this.serverFilterResult.set(null);
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

  scrollRow(el: HTMLElement, dir: 1 | -1): void {
    el?.scrollBy({ left: dir * 180, behavior: 'smooth' });
  }

  onViewPlace(place: Place): void {
    this.router.navigate(['/main/destination-detail'], {
      state: { destinationId: place.id, name: place.name, image: place.image, pricePerNight: place.pricePerNight, location: place.location }
    });
  }

  onToggleFavorite(placeId: number): void {
    const place = this.places().find(p => p.id === placeId);
    if (!place) return;

    const nowFavorite = !place.isFavorite;
    this.places.update(list =>
      list.map(p => p.id === placeId ? { ...p, isFavorite: nowFavorite } : p)
    );

    const call = nowFavorite
      ? this.favoritesService.add(placeId, 'destination')
      : this.favoritesService.remove(placeId, 'destination');

    call.subscribe(ok => {
      if (!ok) {
        this.places.update(list =>
          list.map(p => p.id === placeId ? { ...p, isFavorite: !nowFavorite } : p)
        );
      }
    });
  }
}
