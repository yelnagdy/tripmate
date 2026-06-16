import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { Trip } from '../../../../models/home.models';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trip-card.component.html',
  styleUrl: './trip-card.component.css',
})
export class TripCardComponent {
  trip = input.required<Trip>();

  bookNow        = output<Trip>();
  toggleFavorite = output<number>();

  // ticks every second — drives the countdown computed
  private readonly tick = toSignal(interval(1000), { initialValue: 0 });

  readonly countdown = computed(() => {
    this.tick(); // re-evaluate every second
    const endsAt = this.trip().endsAt;
    if (!endsAt) return null;
    const remaining = Math.max(0, endsAt.getTime() - Date.now());
    const s = Math.floor(remaining / 1000);
    return {
      days:    Math.floor(s / 86400),
      hours:   Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
    };
  });

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  onBookNow(): void {
    this.bookNow.emit(this.trip());
  }

  onToggleFavorite(): void {
    this.toggleFavorite.emit(this.trip().id);
  }
}
