import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FavouriteCardComponent } from '../favourite/favourite-card/favourite-card.component';
import { FlightCardComponent }    from './flight-card/flight-card.component';
import { HotelCardComponent }     from './hotel-card/hotel-card.component';
import { FavouriteItem }          from '../../models/favourite.models';
import { Flight, Hotel }          from '../../models/my-trip.models';

type Tab = 'packages' | 'flights' | 'hotels';

@Component({
  selector: 'app-my-trip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FavouriteCardComponent, FlightCardComponent, HotelCardComponent],
  templateUrl: './my-trip.component.html',
  styleUrl: './my-trip.component.css',
})
export class MyTripComponent {
  private readonly router = inject(Router);

  readonly activeTab = signal<Tab>('packages');

  setTab(tab: Tab): void { this.activeTab.set(tab); }

  /* ── Packages ───────────────────────────────────────────── */
  readonly packages = signal<FavouriteItem[]>([
    {
      id: 1,
      name: 'Cinque Terre Magic',
      location: 'Italy, Manarola',
      image: 'assets/images/place-manarola.jpeg',
      imageCount: 9,
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
      image: 'assets/images/place-berlin.jpeg',
      imageCount: 9,
      hotelStars: 5,
      amenities: 20,
      reviewScore: 4.2,
      reviewLabel: 'Very Good',
      reviewCount: 54,
      pricePerNight: 104,
    },
  ]);

  onViewPackage(item: FavouriteItem): void {
    console.log('View package:', item.name);
  }

  onTogglePackageFav(id: number): void {
    // favourite toggling handled upstream — no-op here
    console.log('Toggle fav for package id:', id);
  }

  /* ── Flights ────────────────────────────────────────────── */
  readonly flights = signal<Flight[]>([
    {
      id: 1,
      onTimePercent: 100,
      departureTime: '7:30 AM',
      departureCity: 'Larkrow',
      arrivalTime: '9:30 AM',
      arrivalCity: 'Goa',
      duration: '2h 40m',
      pricePerPerson: 150,
    },
    {
      id: 2,
      onTimePercent: 90,
      departureTime: '7:30 AM',
      departureCity: 'Larkrow',
      arrivalTime: '9:30 AM',
      arrivalCity: 'Goa',
      duration: '2h 40m',
      pricePerPerson: 150,
    },
  ]);

  onBookFlight(flight: Flight): void {
    this.router.navigate(['/main/flight-detail', flight.id]);
  }

  /* ── Hotels ─────────────────────────────────────────────── */
  readonly hotels = signal<Hotel[]>([
    {
      id: 1,
      name: 'Water Hotel',
      image: 'assets/images/hotel-water.jpeg',
      pricePerNight: 15.99,
    },
    {
      id: 2,
      name: 'Beach Hotel',
      image: 'assets/images/hotel-beach.jpeg',
      pricePerNight: 15.99,
    },
  ]);

  onBookHotel(hotel: Hotel): void {
    const route = hotel.id === 1 ? 'hotel-detail' : 'destination-detail';
    this.router.navigate(['/main', route]);
  }
}
