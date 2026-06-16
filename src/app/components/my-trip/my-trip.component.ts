import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { FavouriteCardComponent } from '../favourite/favourite-card/favourite-card.component';
import { FlightCardComponent }    from './flight-card/flight-card.component';
import { HotelCardComponent }     from './hotel-card/hotel-card.component';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { FavouriteItem }          from '../../models/favourite.models';
import { Flight, Hotel }          from '../../models/my-trip.models';
import { BookingData }            from '../../models/detail.models';
import { HotelService }           from '../../core/services/hotel.service';
import { ApiHotel }               from '../../models/api.models';

type Tab = 'packages' | 'flights' | 'hotels';

const FALLBACK_HOTELS: Hotel[] = [
  { id: 1, name: 'Water Hotel', image: 'assets/images/hotel-water.jpeg', pricePerNight: 15.99 },
  { id: 2, name: 'Beach Hotel', image: 'assets/images/hotel-beach.jpeg', pricePerNight: 15.99 },
];

@Component({
  selector: 'app-my-trip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FavouriteCardComponent, FlightCardComponent, HotelCardComponent, BookingDialogComponent],
  templateUrl: './my-trip.component.html',
  styleUrl: './my-trip.component.css',
})
export class MyTripComponent implements OnInit {

  private readonly hotelService = inject(HotelService);

  readonly activeTab    = signal<Tab>('packages');
  readonly hotelsLoading = signal(true);

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

  /* ── Dialog ────────────────────────────────────────────── */
  readonly dialogOpen    = signal(false);
  readonly activeBooking = signal<BookingData | null>(null);

  closeDialog(): void { this.dialogOpen.set(false); }

  onBookFlight(flight: Flight): void {
    this.activeBooking.set({
      date:           `${flight.departureTime} GST`,
      from:           `${flight.departureCity}, BD`,
      to:             flight.arrivalCity,
      flight:         'Alaska Airlines',
      pricePerPerson: flight.pricePerPerson,
    });
    this.dialogOpen.set(true);
  }

  /* ── Hotels ─────────────────────────────────────────────── */
  readonly hotels = signal<Hotel[]>([]);

  ngOnInit(): void {
    this.hotelService.getByCity('Paris').subscribe(apiData => {
      if (apiData.length > 0) {
        this.hotels.set(apiData.map((h, i) => this.mapToHotel(h, i + 1)));
      } else {
        this.hotels.set(FALLBACK_HOTELS);
      }
      this.hotelsLoading.set(false);
    });
  }

  private mapToHotel(h: ApiHotel, id: number): Hotel {
    return {
      id,
      name:          h.name,
      image:         'assets/images/hotel-water.jpeg',
      pricePerNight: parseFloat(h.price) || 0,
    };
  }

  onBookHotel(hotel: Hotel): void {
    this.activeBooking.set({
      date:           'Today',
      from:           'Your Location',
      to:             hotel.name,
      flight:         'Direct Booking',
      pricePerPerson: hotel.pricePerNight,
    });
    this.dialogOpen.set(true);
  }
}
