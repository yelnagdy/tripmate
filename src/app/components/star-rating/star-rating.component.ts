import {
  Component, ChangeDetectionStrategy,
  input, output, signal, computed,
} from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.css',
})
export class StarRatingComponent {

  /* ── Inputs ─────────────────────────────────────────────── */
  rating      = input<number>(0);
  maxStars    = input<number>(5);
  interactive = input<boolean>(true);

  /* ── Output ─────────────────────────────────────────────── */
  ratingChange = output<number>();

  /* ── Internal state ─────────────────────────────────────── */
  readonly hoverRating = signal(0);

  readonly stars = computed(() =>
    Array.from({ length: this.maxStars() }, (_, i) => i + 1)
  );

  isFilled(star: number): boolean {
    return star <= (this.hoverRating() || this.rating());
  }

  onStarClick(star: number): void {
    if (!this.interactive()) return;
    this.ratingChange.emit(star);
  }

  onStarHover(star: number): void {
    if (!this.interactive()) return;
    this.hoverRating.set(star);
  }

  onMouseLeave(): void {
    this.hoverRating.set(0);
  }
}
