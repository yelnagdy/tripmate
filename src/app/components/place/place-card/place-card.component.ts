import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Place } from '../../../models/place.models';

@Component({
  selector: 'app-place-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './place-card.component.html',
  styleUrl: './place-card.component.css',
})
export class PlaceCardComponent {
  place           = input.required<Place>();
  viewPlace       = output<Place>();
  toggleFavorite  = output<number>();

  readonly stars: number[] = [1, 2, 3, 4, 5];
}
