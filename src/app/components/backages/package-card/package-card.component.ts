import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { Package } from '../../../models/packages.models';

@Component({
  selector: 'app-package-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './package-card.component.html',
  styleUrl: './package-card.component.css',
})
export class PackageCardComponent {
  pkg = input.required<Package>();

  viewMore        = output<Package>();
  toggleFavorite  = output<number>();

  readonly stars: number[] = [1, 2, 3, 4, 5];

  readonly hotelLabel = computed(() => {
    const s = this.pkg().hotelStars;
    return `${s} Star Hotel`;
  });
}
