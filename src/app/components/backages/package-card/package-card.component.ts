import { Component, ChangeDetectionStrategy, OnInit, input, output, computed, signal, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Package } from '../../../models/packages.models';
import { RatingService } from '../../../core/services/rating.service';
import { StarRatingComponent } from '../../star-rating/star-rating.component';

@Component({
  selector: 'app-package-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StarRatingComponent],
  templateUrl: './package-card.component.html',
  styleUrl: './package-card.component.css',
})
export class PackageCardComponent implements OnInit {
  pkg = input.required<Package>();

  viewMore        = output<Package>();
  toggleFavorite  = output<number>();

  private readonly ratingService = inject(RatingService);
  private successTimer?: ReturnType<typeof setTimeout>;

  readonly stars: number[] = [1, 2, 3, 4, 5];

  readonly hotelLabel = computed(() => `${this.pkg().hotelStars} Star Hotel`);

  /* ── Live ratings ────────────────────────────────────────── */
  readonly userRating    = signal(0);
  readonly averageRating = signal(0);
  readonly ratingCount   = signal(0);
  readonly ratingSuccess = signal(false);
  readonly ratingError   = signal(false);

  ngOnInit(): void {
    const id = this.pkg().id;
    forkJoin({
      avg:   this.ratingService.getAverage(id, 'packge'),
      count: this.ratingService.getCount(id, 'packge'),
    }).subscribe(({ avg, count }) => {
      this.averageRating.set(avg);
      this.ratingCount.set(count);
    });
  }

  onRatingChange(stars: number): void {
    this.ratingError.set(false);
    const id = this.pkg().id;
    const isToggleOff = stars === this.userRating();
    const action$ = isToggleOff
      ? this.ratingService.remove(id, 'packge')
      : this.ratingService.submit(id, 'packge', stars);

    this.userRating.set(isToggleOff ? 0 : stars);

    action$.subscribe(ok => {
      clearTimeout(this.successTimer);
      if (ok) {
        this.ratingCount.update(n => isToggleOff ? Math.max(0, n - 1) : n + 1);
        this.ratingSuccess.set(true);
        this.successTimer = setTimeout(() => this.ratingSuccess.set(false), 3000);
      } else {
        this.ratingError.set(true);
        this.successTimer = setTimeout(() => this.ratingError.set(false), 3000);
      }
    });
  }

  /* Displayed rating: user's own vote → API avg → static fallback */
  readonly displayRating = computed(() =>
    this.userRating() || this.averageRating() || this.pkg().rating
  );
}
