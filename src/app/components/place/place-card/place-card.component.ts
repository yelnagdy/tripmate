import { Component, ChangeDetectionStrategy, OnInit, input, output, signal, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Place } from '../../../models/place.models';
import { RatingService } from '../../../core/services/rating.service';

@Component({
  selector: 'app-place-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  templateUrl: './place-card.component.html',
  styleUrl: './place-card.component.css',
})
export class PlaceCardComponent implements OnInit {
  place          = input.required<Place>();
  viewPlace      = output<Place>();
  toggleFavorite = output<number>();

  private readonly ratingService = inject(RatingService);

  readonly hotelStars = computed(() =>
    Array.from({ length: 5 }, (_, i) => i + 1)
  );

  readonly averageRating = signal(0);
  readonly ratingCount   = signal(0);

  readonly displayRating = computed(() =>
    this.averageRating() || this.place().reviewScore
  );

  readonly displayCount = computed(() =>
    this.ratingCount() || this.place().reviewCount
  );

  ngOnInit(): void {
    const id = this.place().id;
    forkJoin({
      avg:   this.ratingService.getAverage(id, 'destination'),
      count: this.ratingService.getCount(id, 'destination'),
    }).subscribe(({ avg, count }) => {
      this.averageRating.set(avg);
      this.ratingCount.set(count);
    });
  }
}
