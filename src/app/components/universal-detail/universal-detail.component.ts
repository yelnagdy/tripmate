import { Component, ChangeDetectionStrategy, signal, inject, OnInit, computed } from '@angular/core';
import { Location, SlicePipe, UpperCasePipe } from '@angular/common';
import { UniversalItem } from '../../models/universal.models';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { BookingData } from '../../models/detail.models';

type DisplayProp = { label: string; value: string };

const EXCLUDE = new Set(['id', 'name', 'type', 'image', 'rating', 'price', 'description', 'location']);

@Component({
  selector: 'app-universal-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlicePipe, UpperCasePipe, BookingDialogComponent],
  templateUrl: './universal-detail.component.html',
  styleUrl: './universal-detail.component.css',
})
export class UniversalDetailComponent implements OnInit {

  private readonly location = inject(Location);

  readonly item       = signal<UniversalItem | null>(null);
  readonly loading    = signal(true);
  readonly dialogOpen = signal(false);
  readonly booking    = signal<BookingData | null>(null);

  readonly stars = [1, 2, 3, 4, 5];

  readonly extraProps = computed<DisplayProp[]>(() => {
    const it = this.item();
    if (!it) return [];
    return Object.entries(it)
      .filter(([k, v]) => !EXCLUDE.has(k) && v !== null && v !== undefined && typeof v !== 'object')
      .map(([k, v]) => ({
        label: k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(),
        value: String(v),
      }));
  });

  ngOnInit(): void {
    const state = history.state as { item?: UniversalItem };
    if (state?.item) {
      this.item.set(state.item);
      this.loading.set(false);
      return;
    }
    // If landed directly via URL, show empty state
    this.loading.set(false);
  }

  goBack(): void { this.location.back(); }

  openBooking(): void {
    const it = this.item();
    if (!it) return;
    this.booking.set({
      date:           'Today',
      from:           'Your Location',
      to:             it.name,
      flight:         'Direct Booking',
      pricePerPerson: (it.price as number) || 0,
    });
    this.dialogOpen.set(true);
  }

  closeDialog(): void { this.dialogOpen.set(false); }
}
