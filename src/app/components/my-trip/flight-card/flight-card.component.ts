import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Flight } from '../../../models/my-trip.models';

@Component({
  selector: 'app-flight-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './flight-card.component.html',
  styleUrl: './flight-card.component.css',
})
export class FlightCardComponent {
  flight     = input.required<Flight>();
  isSelected = input(false);
  book       = output<Flight>();
  viewPlace  = output<Flight>();
}
