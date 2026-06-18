import { Component, ChangeDetectionStrategy, OnInit, input, output, signal, inject, DestroyRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FavouriteItem } from '../../../models/favourite.models';
import { StarRatingComponent } from '../../star-rating/star-rating.component';
import { RatingService } from '../../../core/services/rating.service';

@Component({
  selector: 'app-favourite-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StarRatingComponent],
  templateUrl: './favourite-card.component.html',
  styleUrl: './favourite-card.component.css',
})
export class FavouriteCardComponent implements OnInit {

  item      = input.required<FavouriteItem>();
  viewPlace = output<FavouriteItem>();
  remove    = output<number>();

  private readonly destroyRef    = inject(DestroyRef);
  private readonly ratingService = inject(RatingService);
  private successTimer?: ReturnType<typeof setTimeout>;

  readonly userRating    = signal(0);
  readonly averageRating = signal(0);
  readonly ratingCount   = signal(0);
  readonly ratingSuccess = signal(false);
  readonly ratingError   = signal(false);

  ngOnInit(): void {
    const it       = this.item();
    const itemId   = it.destinationId ?? it.id;
    const itemType = it.itemType ?? 'destination';

    forkJoin({
      avg:   this.ratingService.getAverage(itemId, itemType),
      count: this.ratingService.getCount(itemId, itemType),
    }).subscribe(({ avg, count }) => {
      this.averageRating.set(avg);
      this.ratingCount.set(count);
    });
  }

  onRatingChange(stars: number): void {
    this.ratingError.set(false);

    const it       = this.item();
    const itemId   = it.destinationId ?? it.id;
    const itemType = it.itemType ?? 'destination';

    // Clicking the same star again removes the rating
    const isToggleOff = stars === this.userRating();
    const action$ = isToggleOff
      ? this.ratingService.remove(itemId, itemType)
      : this.ratingService.submit(itemId, itemType, stars);

    this.userRating.set(isToggleOff ? 0 : stars);

    action$.subscribe(ok => {
      clearTimeout(this.successTimer);
      if (ok) {
        if (isToggleOff) {
          this.ratingCount.update(n => Math.max(0, n - 1));
        } else if (this.userRating() === stars) {
          // first time rating this session — count goes up
          this.ratingCount.update(n => n + 1);
        }
        this.ratingSuccess.set(true);
        this.successTimer = setTimeout(() => this.ratingSuccess.set(false), 3000);
      } else {
        this.ratingError.set(true);
        this.successTimer = setTimeout(() => this.ratingError.set(false), 3000);
      }
    });

    this.destroyRef.onDestroy(() => clearTimeout(this.successTimer));
  }
}
