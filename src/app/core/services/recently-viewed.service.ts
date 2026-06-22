import { Injectable, signal } from '@angular/core';
import { ApiRecentItem } from '../../models/api.models';

export interface RecentlyViewedItem extends ApiRecentItem {
  viewedAt: number;
}

const STORAGE_KEY = 'tripmate_recently_viewed';
const MAX_ITEMS   = 10;

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {

  private readonly _items = signal<RecentlyViewedItem[]>(this.load());

  readonly items = this._items.asReadonly();

  add(partial: {
    id:       number;
    name:     string;
    country:  string;
    city?:    string | null;
    imageUrl?: string | null;
    price:    number;
    rating?:  number;
  }): void {
    const entry: RecentlyViewedItem = {
      id:           partial.id,
      name:         partial.name,
      country:      partial.country,
      city:         partial.city     ?? null,
      imageUrl:     partial.imageUrl ?? null,
      price:        partial.price,
      rating:       partial.rating   ?? 0,
      description:  null,
      durationDays: null,
      activities:   null,
      airportCode:  null,
      itinerary:    null,
      viewedAt:     Date.now(),
    };

    this._items.update(list => {
      const next = [entry, ...list.filter(i => i.id !== entry.id)].slice(0, MAX_ITEMS);
      this.save(next);
      return next;
    });
  }

  clear(): void {
    this._items.set([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  private load(): RecentlyViewedItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
    } catch { return []; }
  }

  private save(items: RecentlyViewedItem[]): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }
}
