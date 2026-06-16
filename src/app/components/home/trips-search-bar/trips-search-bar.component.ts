import { Component, ChangeDetectionStrategy, output, signal, computed } from '@angular/core';
import { TripFilter } from '../../../models/home.models';

const EMPTY_FILTER: TripFilter = { maxPrice: null, onlyPromotional: false, onlyFavorites: false };

@Component({
  selector: 'app-trips-search-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trips-search-bar.component.html',
  styleUrl: './trips-search-bar.component.css',
})
export class TripsSearchBarComponent {
  search        = output<string>();
  filterChange  = output<TripFilter>();

  readonly query      = signal('');
  readonly panelOpen  = signal(false);

  // draft = what user is editing inside the panel (not yet applied)
  readonly draft  = signal<TripFilter>({ ...EMPTY_FILTER });
  // active = the committed filter sent to parent
  readonly active = signal<TripFilter>({ ...EMPTY_FILTER });

  readonly activeCount = computed(() => {
    const f = this.active();
    return (f.maxPrice !== null ? 1 : 0) + (f.onlyPromotional ? 1 : 0) + (f.onlyFavorites ? 1 : 0);
  });

  readonly priceOptions: { label: string; value: number | null }[] = [
    { label: 'Any price',  value: null },
    { label: 'Under $25',  value: 25   },
    { label: '$25 – $45',  value: 45   },
    { label: 'Over $45',   value: 9999 },
  ];

  // ── search ─────────────────────────────────────────────────
  onInput(value: string): void {
    this.query.set(value);
    this.search.emit(value);
  }

  clearQuery(): void {
    this.query.set('');
    this.search.emit('');
  }

  // ── panel ──────────────────────────────────────────────────
  openPanel(): void {
    // sync draft with currently active filter when opening
    this.draft.set({ ...this.active() });
    this.panelOpen.set(true);
  }

  closePanel(): void { this.panelOpen.set(false); }

  // ── draft mutations ────────────────────────────────────────
  setMaxPrice(value: number | null): void {
    this.draft.update(f => ({ ...f, maxPrice: value }));
  }

  togglePromo(): void {
    this.draft.update(f => ({ ...f, onlyPromotional: !f.onlyPromotional }));
  }

  toggleFavorites(): void {
    this.draft.update(f => ({ ...f, onlyFavorites: !f.onlyFavorites }));
  }

  // ── apply / clear ──────────────────────────────────────────
  applyFilter(): void {
    const committed = { ...this.draft() };
    this.active.set(committed);
    this.filterChange.emit(committed);
    this.panelOpen.set(false);
  }

  clearFilter(): void {
    this.draft.set({ ...EMPTY_FILTER });
    this.active.set({ ...EMPTY_FILTER });
    this.filterChange.emit({ ...EMPTY_FILTER });
    this.panelOpen.set(false);
  }
}
