import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FavouriteItem } from '../../../models/favourite.models';

@Component({
  selector: 'app-favourite-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './favourite-card.component.html',
  styleUrl: './favourite-card.component.css',
})
export class FavouriteCardComponent {
  item      = input.required<FavouriteItem>();
  viewPlace = output<FavouriteItem>();
  remove    = output<number>();

  readonly stars: number[] = [1, 2, 3, 4, 5];
}
