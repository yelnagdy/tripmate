import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FavouriteCardComponent } from './favourite-card/favourite-card.component';
import { FavouriteItem } from '../../models/favourite.models';
import { FavoritesService } from '../../core/services/favorites.service';
import { DestinationService } from '../../core/services/destination.service';
import { PackageService } from '../../core/services/package.service';
import { forkJoin, of } from 'rxjs';
import { safeUrl } from '../../core/utils/safe-url';

type Tab = 'packages' | 'places';

function favRatingLabel(r: number): string {
  if (r >= 4.5) return 'Excellent';
  if (r >= 4.0) return 'Very Good';
  if (r >= 3.0) return 'Good';
  if (r >= 2.0) return 'Average';
  if (r >  0)   return 'Poor';
  return 'Good';
}

const FALLBACK_PACKAGES: FavouriteItem[] = [
  {
    id: 1, itemType: 'packge', name: 'Cinque Terre Magic', location: 'Italy, Manarola',
    image: 'assets/images/fav-manarola.jpeg', imageCount: 5, hotelStars: 5,
    amenities: 20, reviewScore: 4.2, reviewLabel: 'Very Good', reviewCount: 54, pricePerNight: 240,
  },
  {
    id: 2, itemType: 'packge', name: 'Berlin City Break', location: 'Germany, Berlin',
    image: 'assets/images/fav-berlin.jpeg', imageCount: 5, hotelStars: 5,
    amenities: 20, reviewScore: 4.2, reviewLabel: 'Very Good', reviewCount: 54, pricePerNight: 104,
  },
];

const FALLBACK_PLACES: FavouriteItem[] = [
  {
    id: 3, itemType: 'destination', name: 'Santorini Cliffside', location: 'Greece, Santorini',
    image: 'assets/images/fav-santorini.jpeg', imageCount: 8, hotelStars: 5,
    amenities: 25, reviewScore: 4.7, reviewLabel: 'Excellent', reviewCount: 112, pricePerNight: 320,
  },
  {
    id: 4, itemType: 'destination', name: 'Paris Luxury Suite', location: 'France, Paris',
    image: 'assets/images/fav-paris.jpeg', imageCount: 6, hotelStars: 5,
    amenities: 30, reviewScore: 4.5, reviewLabel: 'Excellent', reviewCount: 87, pricePerNight: 410,
  },
];

@Component({
  selector: 'app-favourite',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FavouriteCardComponent],
  templateUrl: './favourite.component.html',
  styleUrl: './favourite.component.css',
})
export class FavouriteComponent implements OnInit {

  private readonly router              = inject(Router);
  private readonly favoritesService    = inject(FavoritesService);
  private readonly destinationService  = inject(DestinationService);
  private readonly packageService      = inject(PackageService);

  readonly activeTab = signal<Tab>('packages');
  readonly loading   = signal(true);

  readonly packages = signal<FavouriteItem[]>([]);
  readonly places   = signal<FavouriteItem[]>([]);

  readonly activeItems = computed(() =>
    this.activeTab() === 'packages' ? this.packages() : this.places()
  );
  readonly packagesCount = computed(() => this.packages().length);
  readonly placesCount   = computed(() => this.places().length);

  ngOnInit(): void {
    forkJoin({
      favs:         this.favoritesService.getAll(),
      destinations: this.destinationService.getAll(),
      packages:     this.packageService.getAll(),
    }).subscribe(({ favs, destinations, packages }) => {

      const safeFavs  = favs         ?? [];
      const safeDests = destinations  ?? [];
      const safePkgs  = packages      ?? [];

      const destMap = Object.fromEntries(safeDests.map(d => [d.id, d]));
      const pkgMap  = Object.fromEntries(safePkgs.map(p => [p.id, p]));

      const favPkgs  = safeFavs.filter(f => f.itemType === 'packge');
      const favDests = safeFavs.filter(f => f.itemType === 'destination');

      const mappedPkgs = favPkgs
        .map(f => {
          const p = pkgMap[f.itemId];
          if (!p) return null;
          return {
            id:            f.favoriteId,
            itemType:      'packge',
            name:          p.title,
            location:      'Travel Package',
            image:         safeUrl(p.imageUrl, 'assets/images/fav-manarola.jpeg'),
            imageCount:    5,
            hotelStars:    4,
            amenities:     15,
            reviewScore:   4.0,
            reviewLabel:   'Good',
            reviewCount:   0,
            pricePerNight: p.price,
          } satisfies FavouriteItem;
        })
        .filter((x): x is FavouriteItem => x !== null);

      const mappedPlaces = favDests
        .map((f): FavouriteItem | null => {
          const d = destMap[f.itemId];
          if (!d) return null;
          const safeCity = (d.city && d.city !== 'null' && d.city !== 'undefined') ? d.city.trim() : '';
          const rating   = d.rating || 0;
          return {
            id:            f.favoriteId,
            destinationId: d.id,
            itemType:      'destination',
            name:          d.name,
            location:      safeCity ? `${d.country}, ${safeCity}` : d.country,
            image:         safeUrl(d.imageUrl, 'assets/images/fav-santorini.jpeg'),
            imageCount:    5,
            hotelStars:    Math.min(5, Math.max(1, Math.round(rating))) || 4,
            amenities:     20,
            reviewScore:   rating || 4.0,
            reviewLabel:   favRatingLabel(rating),
            reviewCount:   0,
            pricePerNight: d.price,
          };
        })
        .filter((x): x is FavouriteItem => x !== null);

      this.packages.set(mappedPkgs.length  ? mappedPkgs  : FALLBACK_PACKAGES);
      this.places.set(mappedPlaces.length  ? mappedPlaces : FALLBACK_PLACES);
      this.loading.set(false);
    });
  }

  setTab(tab: Tab): void { this.activeTab.set(tab); }

  onViewPlace(item: FavouriteItem): void {
    const destinationId = item.destinationId ?? item.id;
    this.router.navigate(['/main/destination-detail'], {
      state: { destinationId, name: item.name, image: item.image, pricePerNight: item.pricePerNight, location: item.location }
    });
  }

  onRemove(itemId: number): void {
    if (this.activeTab() === 'packages') {
      this.packages.update(list => list.filter(p => p.id !== itemId));
    } else {
      this.places.update(list => list.filter(p => p.id !== itemId));
    }
  }
}
