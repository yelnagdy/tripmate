import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
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
import { LocalBooking } from '../../core/services/booking.service';

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
export class MyTripComponent implements OnInit, OnDestroy {

  private readonly hotelService    = inject(HotelService);
  private readonly bookingService  = inject(BookingService);
  private readonly navService      = inject(NavigationService);

  /* ── Delete flow ────────────────────────────────────────── */
  readonly deletingIds   = signal<Set<number>>(new Set());
  readonly confirmTarget = signal<{ id: number; label: string } | null>(null);
  readonly toast         = signal<{ msg: string; ok: boolean } | null>(null);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  private showToast(msg: string, ok: boolean): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast.set({ msg, ok });
    this.toastTimer = setTimeout(() => this.toast.set(null), 3500);
  }

  onRequestDelete(id: number, label: string): void {
    this.confirmTarget.set({ id, label });
  }

  cancelDelete(): void {
    this.confirmTarget.set(null);
  }

  confirmDelete(): void {
    const target = this.confirmTarget();
    if (!target) return;
    this.confirmTarget.set(null);
    this.onDeleteBooking(target.id);
  }

  onDeleteBooking(id: number): void {
    const localMatch = this.bookingService.localBookings()
      .find(b => this.localNumericId(b) === id);

    if (localMatch) {
      this.bookingService.removeLocal(localMatch.id);
      this.showToast('Booking removed successfully.', true);
      return;
    }

    // API booking: show spinner, call backend, update signal on success
    this.deletingIds.update(s => new Set([...s, id]));

    this.bookingService.cancel(id).subscribe(ok => {
      this.deletingIds.update(s => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });

      if (ok) {
        this.packages.update(list => list.filter(p => p.id !== id));
        this.showToast('Booking cancelled successfully.', true);
      } else {
        this.showToast('Could not cancel booking. Please try again.', false);
        const userId = this.getUserId();
        if (userId) {
          this.bookingService.getByUser(userId).subscribe(bookings => {
            this.packages.set(
              bookings
                .filter(b => !['cancelled', 'deleted'].includes(b.status?.toLowerCase() ?? ''))
                .map(b => this.mapBooking(b))
            );
          });
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  /* ── Active booking from API ─────────────────────────────── */
  readonly bookingDetails = signal<ApiBookingDetails | null>(null);

  readonly activeTab    = signal<Tab>('packages');
  readonly hotelsLoading = signal(true);

  setTab(tab: Tab): void { this.activeTab.set(tab); }

  /* ── Packages (bookings) ────────────────────────────────── */
  readonly packagesLoading = signal(true);

  /** Reactive local bookings — updates instantly when saveLocal() is called anywhere */
  readonly localPackages = computed(() =>
    this.bookingService.localBookings().map(b => this.mapLocalBooking(b))
  );

  /** API bookings (non-reactive, loaded once in ngOnInit) */
  readonly packages = signal<FavouriteItem[]>([]);


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

  private mapLocalBooking(b: LocalBooking): FavouriteItem {
    const guestLabel  = `${b.guests} guest${b.guests !== 1 ? 's' : ''}`;
    const statusLabel = b.status === 'Confirmed' ? 'Confirmed' : 'Pending Payment';
    return {
      id:            parseInt(b.id.replace('local_', ''), 10),
      itemType:      'packge',
      name:          b.destination,
      location:      b.to,
      image:         'assets/images/place-manarola.jpeg',
      imageCount:    5,
      hotelStars:    4,
      amenities:     15,
      reviewScore:   4.0,
      reviewLabel:   `${statusLabel} · ${guestLabel} · ${b.date}`,
      reviewCount:   b.guests,
      pricePerNight: b.totalPrice,
    };
  }

  private localNumericId(b: LocalBooking): number {
    return parseInt(b.id.replace('local_', ''), 10);
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
    const localMatch = this.bookingService.localBookings()
      .find(b => this.localNumericId(b) === id);

    if (localMatch) {
      // Local-only booking: no backend record exists, safe to remove immediately
      this.bookingService.removeLocal(localMatch.id);
      return;
    }

    // API booking: optimistic remove, call backend, revert + reload on failure
    const prev = this.packages();
    this.packages.update(list => list.filter(p => p.id !== id));

    this.bookingService.cancel(id).subscribe(ok => {
      if (ok) return;

      // Revert optimistic remove and reload from server to get fresh state
      this.packages.set(prev);
      const userId = this.getUserId();
      if (userId) {
        this.bookingService.getByUser(userId).subscribe(bookings => {
          this.packages.set(
            bookings
              .filter(b => !['cancelled', 'deleted'].includes(b.status?.toLowerCase() ?? ''))
              .map(b => this.mapBooking(b))
          );
        });
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
  readonly hotels       = signal<Hotel[]>([]);
  readonly hotelCity    = signal('cairo');
  readonly hotelSearch  = signal('cairo');

  private loadHotels(city: string): void {
    this.hotelsLoading.set(true);
    this.hotelService.getByCity(city).subscribe(apiData => {
      if (apiData.length > 0) {
        const seen = new Set<string>();
        const unique = apiData.filter(h => {
          const key = h.name.toLowerCase().trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 6);
        this.hotels.set(unique.map((h, i) => this.mapToHotel(h, i + 1)));
      } else {
        this.hotels.set(FALLBACK_HOTELS);
      }
      this.hotelsLoading.set(false);
    });
  }

  onHotelCityInput(value: string): void { this.hotelSearch.set(value); }

  onHotelCitySearch(): void {
    const city = this.hotelSearch().trim();
    if (!city) return;
    this.hotelCity.set(city);
    this.loadHotels(city);
  }

  ngOnInit(): void {
    this.loadHotels('cairo');

    // localPackages computed already covers localStorage reactively — no manual load needed
    this.packagesLoading.set(false);

    const userId = this.getUserId();
    if (userId) {
      this.bookingService.getByUser(userId).subscribe(bookings => {
        const localNames = new Set(
          this.bookingService.localBookings().map(b => b.destination.toLowerCase())
        );
        // Exclude cancelled/deleted bookings and any already represented by a local entry
        const active = bookings.filter(b =>
          !['cancelled', 'deleted'].includes(b.status?.toLowerCase() ?? '') &&
          !localNames.has((b.packageName ?? b.destinationName ?? '').toLowerCase())
        );
        this.packages.set(active.map(b => this.mapBooking(b)));

        const latest = active[0];
        if (latest) {
          this.bookingDetails.set({
            id:              latest.id,
            bookingId:       latest.id,
            userId:          latest.userId,
            packageTitle:    latest.packageName     ?? undefined,
            destination:     latest.destinationName ?? undefined,
            destinationName: latest.destinationName,
            packageName:     latest.packageName,
            totalPrice:      latest.totalPrice,
            status:          latest.status,
            paymentStatus:   latest.paymentStatus  ?? undefined,
          });
        }
      });
    }
  }

  private getUserId(): number {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const claim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      return parseInt(payload[claim] ?? '0', 10) || 0;
    } catch { return 0; }
  }

  private static readonly HOTEL_IMAGES = [
    'assets/images/hotel-beach.jpeg',
    'assets/images/hotel-water-room.jpeg',
    'assets/images/hotel-water-bath.jpeg',
    'assets/images/hotel-water.jpeg',
  ];

  private mapToHotel(h: ApiHotel, id: number): Hotel {
    const numericPrice = parseFloat(h.price.replace(/[$,]/g, ''));
    const images = MyTripComponent.HOTEL_IMAGES;
    return {
      id,
      name:          h.name,
      image:         images[(id - 1) % images.length],
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
