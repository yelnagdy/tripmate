import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RecentlyViewedService } from './recently-viewed.service';

export interface DestinationNavState {
  destinationId: number;
  name:          string;
  image:         string;
  pricePerNight: number;
  location:      string;
}

export interface HotelNavState {
  id:            number;
  name:          string;
  image:         string;
  pricePerNight: number;
}

export interface FlightNavState {
  id:             number;
  departureCity:  string;
  arrivalCity:    string;
  departureTime:  string;
  arrivalTime:    string;
  duration:       string;
  pricePerPerson: number;
}

export type NavState =
  | ({ kind: 'destination' } & DestinationNavState)
  | ({ kind: 'hotel'       } & HotelNavState)
  | ({ kind: 'flight'      } & FlightNavState);

@Injectable({ providedIn: 'root' })
export class NavigationService {

  private readonly router         = inject(Router);
  private readonly recentlyViewed = inject(RecentlyViewedService);

  /** Typed shortcuts — use these whenever the type is known at compile time. */
  goToDestination(state: DestinationNavState): void {
    this.recentlyViewed.add({
      id:       state.destinationId,
      name:     state.name,
      imageUrl: state.image || null,
      price:    state.pricePerNight ?? 0,
      country:  state.location ?? '',
      city:     null,
    });
    this.router.navigate(['/main/destination-detail'], { state });
  }

  goToHotel(state: HotelNavState): void {
    this.recentlyViewed.add({
      id:       state.id,
      name:     state.name,
      imageUrl: state.image || null,
      price:    state.pricePerNight ?? 0,
      country:  'Hotel',
      city:     null,
    });
    this.router.navigate(['/main/hotel-detail'], { state });
  }

  goToFlight(state: FlightNavState): void {
    this.router.navigate(['/main/flight-detail', state.id], { state });
  }

  /**
   * Generic dispatch — use when the item type is only known at runtime
   * (e.g., a mixed list). Still fully type-safe via the NavState union.
   */
  go(state: NavState): void {
    switch (state.kind) {
      case 'destination': return this.goToDestination(state);
      case 'hotel':       return this.goToHotel(state);
      case 'flight':      return this.goToFlight(state);
    }
  }

  back(): void { history.back(); }
}
