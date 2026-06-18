import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Hotel } from '../../../models/my-trip.models';

@Component({
  selector: 'app-hotel-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hotel-card.component.html',
  styleUrl: './hotel-card.component.css',
})
export class HotelCardComponent {
  hotel      = input.required<Hotel>();
  book       = output<Hotel>();
  viewPlace  = output<Hotel>();
}
