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
import { FavoritesService }       from '../../core/services/favorites.service';
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
export class MyTripComponent implements OnInit, OnDestroy {

  private readonly hotelService     = inject(HotelService);
  private readonly bookingService   = inject(BookingService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly navService       = inject(NavigationService);

  /* ── Packages — derived from the server-backed signal ────── */
  readonly packagesLoading = signal(true);

  /** Maps active ApiBookings → FavouriteItems for the card component. */
  readonly bookings = computed<FavouriteItem[]>(() =>
    this.bookingService.activeBookings().map(b => this.mapBooking(b))
  );

  /** Banner at the top of the page — always the latest active booking. */
  readonly bookingDetails = computed<ApiBookingDetails | null>(() => {
    const latest = this.bookingService.activeBookings()[0];
    if (!latest) return null;
    return {
      id:              latest.id,
      bookingId:       latest.id,
      userId:          latest.userId,
      packageTitle:    latest.packageName     ?? undefined,
      destination:     latest.destinationName ?? undefined,
      destinationName: latest.destinationName,
      packageName:     latest.packageName,
      totalPrice:      latest.totalPrice,
      status:          latest.status,
      paymentStatus:   latest.paymentStatus   ?? undefined,
    };
  });

  private mapBooking(b: ApiBooking): FavouriteItem {
    return {
      id:            b.id,
      itemType:      b.bookingType ?? 'packge',
      name:          b.packageName ?? b.destinationName ?? `Booking #${b.id}`,
      location:      b.destinationName ?? b.bookingType ?? '',
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

  /* ── Tabs ────────────────────────────────────────────────── */
  readonly activeTab = signal<Tab>('packages');
  setTab(tab: Tab): void { this.activeTab.set(tab); }

  /* ── Delete flow ─────────────────────────────────────────── */
  readonly deletingIds   = signal<Set<number>>(new Set());
  readonly confirmTarget = signal<{ id: number; label: string } | null>(null);
  readonly toast         = signal<{ msg: string; ok: boolean } | null>(null);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  private showToast(msg: string, ok: boolean): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast.set({ msg, ok });
    this.toastTimer = setTimeout(() => this.toast.set(null), 3500);
  }

  onRequestDelete(id: number, label: string): void { this.confirmTarget.set({ id, label }); }
  cancelDelete(): void                             { this.confirmTarget.set(null); }

  confirmDelete(): void {
    const t = this.confirmTarget();
    if (!t) return;
    this.confirmTarget.set(null);
    this.onDeleteBooking(t.id);
  }

  onDeleteBooking(id: number): void {
    this.deletingIds.update(s => new Set([...s, id]));

    this.bookingService.cancel(id).subscribe(ok => {
      this.deletingIds.update(s => { const n = new Set(s); n.delete(id); return n; });

      if (ok) {
        this.showToast('Booking cancelled successfully.', true);
      } else {
        this.showToast('Could not cancel booking. Please try again.', false);
        // Reload from server to restore correct state
        const userId = this.getUserId();
        if (userId) this.bookingService.getByUser(userId).subscribe();
      }
    });
  }

  /* ── Favourites ──────────────────────────────────────────── */
  isFavorite(id: number, itemType: string): boolean {
    return this.favoritesService.isActive(id, itemType);
  }

  removeFavorite(id: number, itemType: string): void {
    this.favoritesService.remove(id, itemType as any).subscribe();
    this.showToast('Removed from favourites.', true);
  }

  /* ── Navigation ──────────────────────────────────────────── */
  onViewPackage(item: FavouriteItem): void {
    this.navService.goToDestination({
      destinationId: item.destinationId ?? item.id,
      name:          item.name,
      image:         item.image,
      pricePerNight: item.pricePerNight,
      location:      item.location,
    });
  }

  /* ── Flights ─────────────────────────────────────────────── */
  readonly flights = signal<Flight[]>([
    { id: 1, onTimePercent: 100, departureTime: '7:30 AM', departureCity: 'Larkrow', arrivalTime: '9:30 AM', arrivalCity: 'Goa', duration: '2h 40m', pricePerPerson: 150 },
    { id: 2, onTimePercent: 90,  departureTime: '7:30 AM', departureCity: 'Larkrow', arrivalTime: '9:30 AM', arrivalCity: 'Goa', duration: '2h 40m', pricePerPerson: 150 },
  ]);

  onViewFlight(flight: Flight): void {
    this.navService.goToFlight({
      id: flight.id, departureCity: flight.departureCity, arrivalCity: flight.arrivalCity,
      departureTime: flight.departureTime, arrivalTime: flight.arrivalTime,
      duration: flight.duration, pricePerPerson: flight.pricePerPerson,
    });
  }

  onBookFlight(flight: Flight): void {
    this.activeBooking.set({
      date: `${flight.departureTime} GST`, from: `${flight.departureCity}, BD`,
      to: flight.arrivalCity, flight: 'Alaska Airlines', pricePerPerson: flight.pricePerPerson,
    });
    this.dialogOpen.set(true);
  }

  /* ── Dialog ──────────────────────────────────────────────── */
  readonly dialogOpen    = signal(false);
  readonly activeBooking = signal<BookingData | null>(null);
  closeDialog(): void { this.dialogOpen.set(false); }

  /* ── Hotels ──────────────────────────────────────────────── */
  readonly hotels      = signal<Hotel[]>([]);
  readonly hotelCity   = signal('cairo');
  readonly hotelSearch = signal('cairo');
  readonly hotelsLoading = signal(true);

  private loadHotels(city: string): void {
    this.hotelsLoading.set(true);
    this.hotelService.getByCity(city).subscribe(apiData => {
      if (apiData.length > 0) {
        const seen = new Set<string>();
        this.hotels.set(
          apiData
            .filter(h => { const k = h.name.toLowerCase().trim(); return seen.has(k) ? false : (seen.add(k), true); })
            .slice(0, 6)
            .map((h, i) => this.mapToHotel(h, i + 1))
        );
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

  onViewHotel(hotel: Hotel): void {
    this.navService.goToHotel({ id: hotel.id, name: hotel.name, image: hotel.image, pricePerNight: hotel.pricePerNight });
  }

  onBookHotel(hotel: Hotel): void {
    this.activeBooking.set({ date: 'Today', from: 'Your Location', to: hotel.name, flight: 'Direct Booking', pricePerPerson: hotel.pricePerNight });
    this.dialogOpen.set(true);
  }

  private static readonly HOTEL_IMAGES = [
    'assets/images/hotel-beach.jpeg', 'assets/images/hotel-water-room.jpeg',
    'assets/images/hotel-water-bath.jpeg', 'assets/images/hotel-water.jpeg',
  ];

  private mapToHotel(h: ApiHotel, id: number): Hotel {
    const p = parseFloat(h.price.replace(/[$,]/g, ''));
    return { id, name: h.name, image: MyTripComponent.HOTEL_IMAGES[(id - 1) % 4], pricePerNight: isNaN(p) ? 0 : p };
  }

  /* ── Lifecycle ───────────────────────────────────────────── */
  ngOnInit(): void {
    this.loadHotels('cairo');

    const userId = this.getUserId();
    if (userId) {
      // Populates bookingService._bookings signal → bookings + bookingDetails update automatically
      this.bookingService.getByUser(userId).subscribe(() => {
        this.packagesLoading.set(false);
      });
    } else {
      this.packagesLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  private getUserId(): number {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? '0', 10) || 0;
    } catch { return 0; }
  }
}
