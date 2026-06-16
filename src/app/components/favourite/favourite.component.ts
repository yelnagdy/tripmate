import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FavouriteCardComponent } from './favourite-card/favourite-card.component';
import { FavouriteItem } from '../../models/favourite.models';

type Tab = 'packages' | 'places';

@Component({
  selector: 'app-favourite',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FavouriteCardComponent],
  templateUrl: './favourite.component.html',
  styleUrl: './favourite.component.css',
})
export class FavouriteComponent {

  readonly activeTab = signal<Tab>('packages');

  /* ── Favourite packages ─────────────────────────────────── */
  readonly packages = signal<FavouriteItem[]>([
    {
      id: 1,
      name: 'Cinque Terre Magic',
      location: 'Italy, Manarola',
      image: 'assets/images/fav-manarola.jpeg',
      imageCount: 5,
      hotelStars: 5,
      amenities: 20,
      reviewScore: 4.2,
      reviewLabel: 'Very Good',
      reviewCount: 54,
      pricePerNight: 240,
    },
    {
      id: 2,
      name: 'Berlin City Break',
      location: 'Germany, Berlin',
      image: 'assets/images/fav-berlin.jpeg',
      imageCount: 5,
      hotelStars: 5,
      amenities: 20,
      reviewScore: 4.2,
      reviewLabel: 'Very Good',
      reviewCount: 54,
      pricePerNight: 104,
    },
  ]);

  /* ── Favourite places ───────────────────────────────────── */
  readonly places = signal<FavouriteItem[]>([
    {
      id: 3,
      name: 'Santorini Cliffside',
      location: 'Greece, Santorini',
      image: 'assets/images/fav-santorini.jpeg',
      imageCount: 8,
      hotelStars: 5,
      amenities: 25,
      reviewScore: 4.7,
      reviewLabel: 'Excellent',
      reviewCount: 112,
      pricePerNight: 320,
    },
    {
      id: 4,
      name: 'Paris Luxury Suite',
      location: 'France, Paris',
      image: 'assets/images/fav-paris.jpeg',
      imageCount: 6,
      hotelStars: 5,
      amenities: 30,
      reviewScore: 4.5,
      reviewLabel: 'Excellent',
      reviewCount: 87,
      pricePerNight: 410,
    },
  ]);

  /* ── Computed active list ───────────────────────────────── */
  readonly activeItems = computed(() =>
    this.activeTab() === 'packages' ? this.packages() : this.places()
  );

  readonly packagesCount = computed(() => this.packages().length);
  readonly placesCount   = computed(() => this.places().length);

  /* ── Actions ────────────────────────────────────────────── */
  setTab(tab: Tab): void { this.activeTab.set(tab); }

  onViewPlace(item: FavouriteItem): void {
    // TODO: navigate to detail page
    console.log('View:', item.name);
  }

  onRemove(itemId: number): void {
    if (this.activeTab() === 'packages') {
      this.packages.update(list => list.filter(p => p.id !== itemId));
    } else {
      this.places.update(list => list.filter(p => p.id !== itemId));
    }
  }
}
