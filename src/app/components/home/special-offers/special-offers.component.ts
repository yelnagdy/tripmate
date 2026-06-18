import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TripCardComponent } from './trip-card/trip-card.component';
import { Trip } from '../../../models/home.models';

@Component({
  selector: 'app-special-offers',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TripCardComponent],
  templateUrl: './special-offers.component.html',
  styleUrl: './special-offers.component.css',
})
export class SpecialOffersComponent {
  trips = input.required<Trip[]>();

  bookNow        = output<Trip>();
  toggleFavorite = output<number>();
  viewTrip       = output<Trip>();

  onBookNow(trip: Trip): void {
    this.bookNow.emit(trip);
  }

  onToggleFavorite(tripId: number): void {
    this.toggleFavorite.emit(tripId);
  }

  onViewTrip(trip: Trip): void {
    this.viewTrip.emit(trip);
  }
}
