import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { PackageCardComponent } from './package-card/package-card.component';
import { Package } from '../../models/packages.models';

interface PackageFilter {
  categories: string[];
  maxPrice: number | null;
  minRating: number | null;
}

@Component({
  selector: 'app-backages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PackageCardComponent],
  templateUrl: './backages.component.html',
  styleUrl: './backages.component.css',
})
export class BackagesComponent {

  readonly searchQuery  = signal('');
  readonly filterOpen   = signal(false);
  readonly activeFilter = signal<PackageFilter>({ categories: [], maxPrice: null, minRating: null });
  readonly draftFilter  = signal<PackageFilter>({ categories: [], maxPrice: null, minRating: null });

  readonly ratingOptions: number[] = [3, 4, 5];

  readonly packages = signal<Package[]>([
    {
      id: 1,
      title: 'Romantic Paris Getaway',
      category: 'Travel',
      image: 'assets/images/pkg-paris.jpeg',
      rating: 4,
      reviewCount: 128,
      hotelStars: 3,
      days: 5,
      groupSize: 'Small Group',
      tags: ['Easy Travel', 'Romantic'],
      price: 240,
      originalPrice: 320,
      isFavorite: false,
    },
    {
      id: 2,
      title: 'Greek Islands Cruise',
      category: 'Travel',
      image: 'assets/images/pkg-greece.jpeg',
      rating: 5,
      reviewCount: 95,
      hotelStars: 4,
      days: 7,
      groupSize: 'Group Tour',
      tags: ['Easy Travel', 'Cruise'],
      price: 510,
      originalPrice: 650,
      isFavorite: false,
    },
    {
      id: 3,
      title: 'Santorini Sunset Escape',
      category: 'Cultural',
      image: 'assets/images/pkg-santorini.jpeg',
      rating: 5,
      reviewCount: 204,
      hotelStars: 4,
      days: 4,
      groupSize: 'Couple',
      tags: ['Easy Travel', 'Scenic'],
      price: 380,
      isFavorite: true,
    },
    {
      id: 4,
      title: "Rome's Ancient Wonders",
      category: 'Cultural',
      image: 'assets/images/pkg-rome.jpeg',
      rating: 4,
      reviewCount: 167,
      hotelStars: 3,
      days: 6,
      groupSize: 'Small Group',
      tags: ['Easy Travel', 'History'],
      price: 290,
      originalPrice: 370,
      isFavorite: false,
    },
    {
      id: 5,
      title: 'Milan Fashion & Culture Tour',
      category: 'Cultural',
      image: 'assets/images/pkg-milan.jpeg',
      rating: 4,
      reviewCount: 89,
      hotelStars: 3,
      days: 3,
      groupSize: 'Small Group',
      tags: ['Easy Travel', 'Shopping'],
      price: 195,
      isFavorite: false,
    },
    {
      id: 6,
      title: 'Colosseum & Vatican Discovery',
      category: 'Travel',
      image: 'assets/images/pkg-colosseum.jpeg',
      rating: 5,
      reviewCount: 312,
      hotelStars: 4,
      days: 5,
      groupSize: 'Group Tour',
      tags: ['Easy Travel', 'Adventure'],
      price: 340,
      originalPrice: 420,
      isFavorite: false,
    },
    {
      id: 7,
      title: 'Alpine Mountain Retreat',
      category: 'Adventure',
      image: 'assets/images/pkg-alpine.jpeg',
      rating: 4,
      reviewCount: 73,
      hotelStars: 3,
      days: 4,
      groupSize: 'Small Group',
      tags: ['Easy Travel', 'Nature'],
      price: 275,
      isFavorite: false,
    },
    {
      id: 8,
      title: 'Aegean Coastal Explorer',
      category: 'Travel',
      image: 'assets/images/pkg-aegean.jpeg',
      rating: 5,
      reviewCount: 141,
      hotelStars: 4,
      days: 8,
      groupSize: 'Group Tour',
      tags: ['Easy Travel', 'Beach'],
      price: 590,
      originalPrice: 720,
      isFavorite: false,
    },
  ]);

  readonly allCategories = computed(() =>
    [...new Set(this.packages().map(p => p.category))]
  );

  readonly activeFilterCount = computed(() => {
    const f = this.activeFilter();
    return (f.categories.length > 0 ? 1 : 0) +
           (f.maxPrice !== null ? 1 : 0) +
           (f.minRating !== null ? 1 : 0);
  });

  readonly filteredPackages = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const f = this.activeFilter();
    return this.packages().filter(p => {
      const matchSearch = !q || p.title.toLowerCase().includes(q) ||
                          p.category.toLowerCase().includes(q) ||
                          p.tags.some(t => t.toLowerCase().includes(q));
      const matchCat    = f.categories.length === 0 || f.categories.includes(p.category);
      const matchPrice  = f.maxPrice === null || p.price <= f.maxPrice;
      const matchRating = f.minRating === null || p.rating >= f.minRating;
      return matchSearch && matchCat && matchPrice && matchRating;
    });
  });

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
    const empty: PackageFilter = { categories: [], maxPrice: null, minRating: null };
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

  onViewMore(pkg: Package): void {
    console.log('View package:', pkg.title);
  }

  onToggleFavorite(pkgId: number): void {
    this.packages.update(list =>
      list.map(p => p.id === pkgId ? { ...p, isFavorite: !p.isFavorite } : p)
    );
  }
}
