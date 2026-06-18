import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FlightCardComponent } from '../my-trip/flight-card/flight-card.component';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { Flight } from '../../models/my-trip.models';
import { BookingData } from '../../models/detail.models';
import { PackageService } from '../../core/services/package.service';
import { FlightNavState } from '../../core/services/navigation.service';
import { ApiDestination, ApiFlightResult, ApiSmartFlight } from '../../models/api.models';

type FlightClass = 'economy' | 'first-class' | 'business-class';

interface ClassOption {
  key: FlightClass;
  label: string;
}

const FALLBACK_FLIGHTS: Flight[] = [
  {
    id: 1,
    onTimePercent: 100,
    departureTime: '7:30 AM',
    departureCity: 'Cairo',
    arrivalTime:   '9:30 AM',
    arrivalCity:   'Rome',
    duration:      '2h 40m',
    pricePerPerson: 150,
  },
  {
    id: 2,
    onTimePercent: 90,
    departureTime: '11:00 AM',
    departureCity: 'Cairo',
    arrivalTime:   '1:30 PM',
    arrivalCity:   'Rome',
    duration:      '2h 30m',
    pricePerPerson: 180,
  },
];

@Component({
  selector: 'app-flight-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FlightCardComponent, RouterLink, BookingDialogComponent],
  templateUrl: './flight-detail.component.html',
  styleUrl: './flight-detail.component.css',
})
export class FlightDetailComponent implements OnInit {

  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);
  private readonly location       = inject(Location);
  private readonly packageService = inject(PackageService);

  readonly loading     = signal(true);
  readonly destination = signal<ApiDestination | null>(null);

  /* ── Route param → selected flight ID ──────────────────────── */
  private readonly flightId = toSignal(
    this.route.paramMap.pipe(map(p => +(p.get('id') ?? '1'))),
    { initialValue: 1 }
  );

  /* ── All available flights ──────────────────────────────────── */
  readonly allFlights = signal<Flight[]>([]);

  ngOnInit(): void {
    // Seed the selected flight immediately from navigation state so the page
    // isn't blank while the API call is in-flight.
    const nav = history.state as Partial<FlightNavState>;
    if (nav?.departureCity) {
      this.allFlights.set([{
        id:             nav.id ?? this.flightId(),
        onTimePercent:  95,
        departureTime:  nav.departureTime  ?? '',
        departureCity:  nav.departureCity  ?? '',
        arrivalTime:    nav.arrivalTime    ?? '',
        arrivalCity:    nav.arrivalCity    ?? '',
        duration:       nav.duration       ?? '',
        pricePerPerson: nav.pricePerPerson ?? 0,
      }]);
      this.loading.set(false);
    }

    this.packageService.getExternal('cairo', 'dubai').subscribe(external => {
      if (external) {
        this.destination.set(external.destination);
      }

      const externalFlights = external?.flights ?? [];

      if (externalFlights.length > 0) {
        this.allFlights.set(externalFlights.map((f, i) => this.mapToFlight(f, i + 1)));
        this.loading.set(false);
      } else {
        this.packageService.getSmart(1, 2000, 'CAI').subscribe(smart => {
          const flights = (smart ?? []).flatMap(p => p.flights ?? []);
          if (flights.length > 0) {
            this.allFlights.set(flights.map((f, i) => this.mapSmartToFlight(f, i + 1)));
            if (!external && smart[0]) {
              this.destination.set(smart[0].destination);
            }
          } else if (!nav?.departureCity) {
            this.allFlights.set(FALLBACK_FLIGHTS);
          }
          this.loading.set(false);
        });
      }
    });
  }

  goBack(): void { this.location.back(); }

  selectFlight(flight: Flight): void {
    this.router.navigate(['/main/flight-detail', flight.id], { replaceUrl: true });
  }

  private mapToFlight(f: ApiFlightResult, id: number): Flight {
    return {
      id,
      onTimePercent:  95,
      departureTime:  f.departureTime,
      departureCity:  f.from,
      arrivalTime:    f.arrivalTime,
      arrivalCity:    f.to,
      duration:       f.duration,
      pricePerPerson: f.price,
    };
  }

  private mapSmartToFlight(f: ApiSmartFlight, id: number): Flight {
    return {
      id,
      onTimePercent:  95,
      departureTime:  '—',
      departureCity:  f.from,
      arrivalTime:    '—',
      arrivalCity:    f.to,
      duration:       f.duration,
      pricePerPerson: parseFloat(f.price) || 0,
    };
  }

  /* ── Selected flight derived from URL param ─────────────────── */
  readonly selectedFlight = computed<Flight | undefined>(
    () => this.allFlights().find(f => f.id === this.flightId()) ?? this.allFlights()[0]
  );

  readonly fromCity = computed(() => this.selectedFlight()?.departureCity ?? '');
  readonly toCity   = computed(() => this.selectedFlight()?.arrivalCity ?? '');

  isFlightSelected(flight: Flight): boolean {
    return flight.id === this.selectedFlight()?.id;
  }

  /* ── Hero image ─────────────────────────────────────────────── */
  readonly heroImage = signal('assets/images/flight-detail-hero.jpeg');

  /* ── Gallery thumbnails ──────────────────────────────────────── */
  readonly galleryImages = signal<string[]>([
    'assets/images/flight-gallery-1.jpeg',
    'assets/images/flight-gallery-2.jpeg',
    'assets/images/flight-gallery-3.jpeg',
    'assets/images/flight-gallery-4.jpeg',
    'assets/images/flight-gallery-5.jpeg',
    'assets/images/flight-gallery-6.jpeg',
    'assets/images/flight-gallery-7.jpeg',
    'assets/images/flight-gallery-8.jpeg',
  ]);

  readonly activeGalleryIndex = signal(0);

  setGalleryImage(index: number): void {
    this.activeGalleryIndex.set(index);
  }

  /* ── Class filter ────────────────────────────────────────────── */
  readonly classOptions: ClassOption[] = [
    { key: 'economy',        label: 'Economy'       },
    { key: 'first-class',    label: 'First Class'   },
    { key: 'business-class', label: 'Business Class'},
  ];

  readonly activeClasses = signal<FlightClass[]>(['economy']);

  isClassActive(key: FlightClass): boolean {
    return this.activeClasses().includes(key);
  }

  toggleClass(key: FlightClass): void {
    this.activeClasses.update(current =>
      current.includes(key)
        ? current.filter(c => c !== key)
        : [...current, key]
    );
  }

  /* ── Booking dialog ─────────────────────────────────────────── */
  readonly dialogOpen    = signal(false);
  readonly activeBooking = signal<BookingData | null>(null);

  onBookFlight(flight: Flight): void {
    const dest = this.destination();
    this.activeBooking.set({
      date:           `${flight.departureTime} GST`,
      from:           flight.departureCity,
      to:             dest ? `${dest.country}, ${dest.city}` : flight.arrivalCity,
      flight:         flight.departureCity + ' → ' + flight.arrivalCity,
      pricePerPerson: flight.pricePerPerson,
      destinationId:  dest?.id,
      durationDays:   dest?.durationDays ?? 4,
    });
    this.dialogOpen.set(true);
  }

  closeBookingDialog(): void {
    this.dialogOpen.set(false);
  }
}
