import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FavouriteCardComponent } from './favourite-card/favourite-card.component';
import { FavouriteItem } from '../../models/favourite.models';
import { FavoritesService } from '../../core/services/favorites.service';
import { DestinationService } from '../../core/services/destination.service';
import { PackageService } from '../../core/services/package.service';
import { catchError, forkJoin, of } from 'rxjs';
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

@Component({
  selector: 'app-favourite',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FavouriteCardComponent],
  templateUrl: './favourite.component.html',
  styleUrl: './favourite.component.css',
})
export class FavouriteComponent implements OnInit {

  private readonly router             = inject(Router);
  private readonly favoritesService   = inject(FavoritesService);
  private readonly destinationService = inject(DestinationService);
  private readonly packageService     = inject(PackageService);

  readonly activeTab = signal<Tab>('packages');
  readonly loading   = signal(true);
  readonly error     = signal(false);

  readonly packages = signal<FavouriteItem[]>([]);
  readonly places   = signal<FavouriteItem[]>([]);

  readonly activeItems    = computed(() => this.activeTab() === 'packages' ? this.packages() : this.places());
  readonly packagesCount  = computed(() => this.packages().length);
  readonly placesCount    = computed(() => this.places().length);

  ngOnInit(): void {
    forkJoin({
      favs:         this.favoritesService.getAll(),
      destinations: this.destinationService.getAll(),
      packages:     this.packageService.getAll(),
    }).pipe(
      catchError(() => of({ favs: [], destinations: [], packages: [] }))
    ).subscribe(({ favs, destinations, packages }) => {

      const safeFavs  = favs         ?? [];
      const safeDests = destinations  ?? [];
      const safePkgs  = packages      ?? [];

      const destMap = Object.fromEntries(safeDests.map(d => [d.id, d]));
      const pkgMap  = Object.fromEntries(safePkgs.map(p  => [p.id, p]));

      // Always show every API favorite — use whatever detail data is available,
      // fall back to placeholder text when the package/destination isn't in the catalog.
      const mappedPkgs: FavouriteItem[] = safeFavs
        .filter(f => f.itemType === 'packge')
        .reduce<FavouriteItem[]>((acc, f) => {
          const p = pkgMap[f.itemId];
          acc.push({
            id:            f.favoriteId,
            destinationId: f.itemId,   // actual package itemId — used by onRemove/navigation
            itemType:      'packge',
            name:          p?.title                                               ?? `Package #${f.itemId}`,
            location:      'Travel Package',
            image:         safeUrl(p?.imageUrl ?? '', 'assets/images/fav-manarola.jpeg'),
            imageCount:    5,
            hotelStars:    4,
            amenities:     15,
            reviewScore:   4.0,
            reviewLabel:   'Good',
            reviewCount:   0,
            pricePerNight: p?.price                                               ?? 0,
          });
          return acc;
        }, []);

      const mappedPlaces: FavouriteItem[] = safeFavs
        .filter(f => f.itemType === 'destination')
        .reduce<FavouriteItem[]>((acc, f) => {
          const d        = destMap[f.itemId];
          const safeCity = (d?.city && d.city !== 'null' && d.city !== 'undefined') ? d.city.trim() : '';
          const rating   = d?.rating || 0;
          acc.push({
            id:            f.favoriteId,
            destinationId: d?.id ?? f.itemId,
            itemType:      'destination',
            name:          d?.name                                                 ?? `Destination #${f.itemId}`,
            location:      d ? (safeCity ? `${d.country}, ${safeCity}` : d.country) : 'Unknown Location',
            image:         safeUrl(d?.imageUrl ?? '', 'assets/images/fav-santorini.jpeg'),
            imageCount:    5,
            hotelStars:    Math.min(5, Math.max(1, Math.round(rating))) || 4,
            amenities:     20,
            reviewScore:   rating || 4.0,
            reviewLabel:   favRatingLabel(rating),
            reviewCount:   0,
            pricePerNight: d?.price ?? 0,
          });
          return acc;
        }, []);

      this.packages.set(mappedPkgs);
      this.places.set(mappedPlaces);
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
    const tab  = this.activeTab();
    const list = tab === 'packages' ? this.packages() : this.places();
    const item = list.find(p => p.id === itemId);
    if (!item) return;

    // Optimistic remove from UI
    if (tab === 'packages') {
      this.packages.update(l => l.filter(p => p.id !== itemId));
    } else {
      this.places.update(l => l.filter(p => p.id !== itemId));
    }

    // Sync to API + localStorage in background
    const apiType  = item.itemType as import('../../core/services/favorites.service').FavoriteItemType;
    const realId   = item.destinationId ?? item.id;
    this.favoritesService.remove(realId, apiType).subscribe();
  }
}
