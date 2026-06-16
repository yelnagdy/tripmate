import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FlightCardComponent } from '../my-trip/flight-card/flight-card.component';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { Flight } from '../../models/my-trip.models';
import { BookingData } from '../../models/detail.models';
import { FlightService } from '../../core/services/flight.service';
import { ApiFlightResult } from '../../models/api.models';

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

  private readonly route         = inject(ActivatedRoute);
  private readonly flightService = inject(FlightService);

  readonly loading = signal(true);

  /* ── Route param → selected flight ID ──────────────────────── */
  private readonly flightId = toSignal(
    this.route.paramMap.pipe(map(p => +(p.get('id') ?? '1'))),
    { initialValue: 1 }
  );

  /* ── All available flights ──────────────────────────────────── */
  readonly allFlights = signal<Flight[]>([]);

  ngOnInit(): void {
    const from = 'egypt';
    const to   = 'italy';
    this.flightService.search(from, to).subscribe(apiData => {
      if (apiData.length > 0) {
        this.allFlights.set(apiData.map((f, i) => this.mapToFlight(f, i + 1)));
      } else {
        this.allFlights.set(FALLBACK_FLIGHTS);
      }
      this.loading.set(false);
    });
  }

  private mapToFlight(f: ApiFlightResult, id: number): Flight {
    return {
      id,
      onTimePercent: 95,
      departureTime: f.departureTime,
      departureCity: f.from,
      arrivalTime:   f.arrivalTime,
      arrivalCity:   f.to,
      duration:      f.duration,
      pricePerPerson: f.price,
    };
  }

  /* ── Selected flight derived from URL param ─────────────────── */
  readonly selectedFlight = computed(
    () => this.allFlights().find(f => f.id === this.flightId()) ?? this.allFlights()[0]
  );

  readonly fromCity = computed(() => this.selectedFlight().departureCity);
  readonly toCity   = computed(() => this.selectedFlight().arrivalCity);

  isFlightSelected(flight: Flight): boolean {
    return flight.id === this.selectedFlight().id;
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
    this.activeBooking.set({
      date:           `${flight.departureTime} GST`,
      from:           `${flight.departureCity}, BD`,
      to:             `Italy, Manarola`,
      flight:         'Alaska Airlines',
      pricePerPerson: flight.pricePerPerson,
    });
    this.dialogOpen.set(true);
  }

  closeBookingDialog(): void {
    this.dialogOpen.set(false);
  }
}
