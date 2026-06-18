import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { FavouriteCardComponent } from '../favourite/favourite-card/favourite-card.component';
import { FlightCardComponent }    from './flight-card/flight-card.component';
import { HotelCardComponent }     from './hotel-card/hotel-card.component';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { FavouriteItem }          from '../../models/favourite.models';
import { Flight, Hotel }          from '../../models/my-trip.models';
import { BookingData }            from '../../models/detail.models';
import { HotelService }           from '../../core/services/hotel.service';
import { BookingService }         from '../../core/services/booking.service';
import { NavigationService }      from '../../core/services/navigation.service';
import { ApiBooking, ApiBookingDetails, ApiHotel } from '../../models/api.models';

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

  private readonly hotelService    = inject(HotelService);
  private readonly bookingService  = inject(BookingService);
  private readonly navService      = inject(NavigationService);

  /* ── Active booking from API ─────────────────────────────── */
  readonly bookingDetails = signal<ApiBookingDetails | null>(null);

  readonly activeTab    = signal<Tab>('packages');
  readonly hotelsLoading = signal(true);

  setTab(tab: Tab): void { this.activeTab.set(tab); }

  /* ── Packages (bookings) ────────────────────────────────── */
  readonly packagesLoading = signal(true);
  readonly packages        = signal<FavouriteItem[]>([]);

  private readonly FALLBACK_PACKAGES: FavouriteItem[] = [
    {
      id: 1, itemType: 'packge', name: 'Cinque Terre Magic', location: 'Italy, Manarola',
      image: 'assets/images/place-manarola.jpeg', imageCount: 9, hotelStars: 5,
      amenities: 20, reviewScore: 4.2, reviewLabel: 'Very Good', reviewCount: 54, pricePerNight: 240,
    },
    {
      id: 2, itemType: 'packge', name: 'Berlin City Break', location: 'Germany, Berlin',
      image: 'assets/images/place-berlin.jpeg', imageCount: 9, hotelStars: 5,
      amenities: 20, reviewScore: 4.2, reviewLabel: 'Very Good', reviewCount: 54, pricePerNight: 104,
    },
  ];

  private mapBooking(b: ApiBooking): FavouriteItem {
    return {
      id:            b.id,
      itemType:      b.bookingType ?? 'packge',
      name:          b.packageName ?? b.destinationName ?? `Booking #${b.id}`,
      location:      b.destinationName ?? b.bookingType,
      image:         'assets/images/place-manarola.jpeg',
      imageCount:    5,
      hotelStars:    4,
      amenities:     15,
      reviewScore:   4.0,
      reviewLabel:   b.status,
      reviewCount:   b.numberOfPeople,
      pricePerNight: b.totalPrice,
    };
  }

  onViewPackage(item: FavouriteItem): void {
    this.navService.goToDestination({
      destinationId: item.destinationId ?? item.id,
      name:          item.name,
      image:         item.image,
      pricePerNight: item.pricePerNight,
      location:      item.location,
    });
  }

  onTogglePackageFav(id: number): void {
    // Optimistic remove
    const prev = this.packages();
    this.packages.update(list => list.filter(p => p.id !== id));

    this.bookingService.cancel(id).subscribe(ok => {
      if (!ok) {
        // Revert if API call failed
        this.packages.set(prev);
      }
    });
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

  onViewFlight(flight: Flight): void {
    this.navService.goToFlight({
      id:             flight.id,
      departureCity:  flight.departureCity,
      arrivalCity:    flight.arrivalCity,
      departureTime:  flight.departureTime,
      arrivalTime:    flight.arrivalTime,
      duration:       flight.duration,
      pricePerPerson: flight.pricePerPerson,
    });
  }

  onViewHotel(hotel: Hotel): void {
    this.navService.goToHotel({
      id:            hotel.id,
      name:          hotel.name,
      image:         hotel.image,
      pricePerNight: hotel.pricePerNight,
    });
  }

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
    this.hotelService.getByCity('italy').subscribe(apiData => {
      if (apiData.length > 0) {
        this.hotels.set(apiData.map((h, i) => this.mapToHotel(h, i + 1)));
      } else {
        this.hotels.set(FALLBACK_HOTELS);
      }
      this.hotelsLoading.set(false);
    });

    const userId = this.getUserId();
    if (userId) {
      this.bookingService.getByUser(userId).subscribe(bookings => {
        this.packages.set(
          bookings.length ? bookings.map(b => this.mapBooking(b)) : this.FALLBACK_PACKAGES
        );
        this.packagesLoading.set(false);

        // Derive booking details from the most recent booking instead of a separate API call
        const latest = bookings[0];
        if (latest) {
          this.bookingDetails.set({
            bookingId:    latest.id,
            userId:       latest.userId,
            packageTitle: latest.packageName  ?? undefined,
            destination:  latest.destinationName ?? undefined,
            totalPrice:   latest.totalPrice,
            status:       latest.status,
          });
        }
      });
    } else {
      this.packages.set(this.FALLBACK_PACKAGES);
      this.packagesLoading.set(false);
    }
  }

  private getUserId(): number {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const claim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      return parseInt(payload[claim] ?? '0', 10) || 0;
    } catch { return 0; }
  }

  private mapToHotel(h: ApiHotel, id: number): Hotel {
    const numericPrice = parseFloat(h.price.replace(/[$,]/g, ''));
    return {
      id,
      name:          h.name,
      image:         'assets/images/hotel-water.jpeg',
      pricePerNight: isNaN(numericPrice) ? 0 : numericPrice,
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
