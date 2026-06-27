import { Component, OnInit, inject } from '@angular/core';
import { NavMainComponent }   from "../../components/nav-main/nav-main.component";
import { RouterOutlet }       from '@angular/router';
import { FavoritesService }   from '../../core/services/favorites.service';
import { BookingService }     from '../../core/services/booking.service';
import { AuthService }        from '../../core/services/auth.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [NavMainComponent, RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {

  private readonly favoritesService = inject(FavoritesService);
  private readonly bookingService   = inject(BookingService);
  private readonly authService      = inject(AuthService);

  ngOnInit(): void {
    // Sync server state to local cache on every app load (login + page refresh).
    // This is the single place that fixes cross-device inconsistency:
    // each device starts from the server's truth instead of its own localStorage.
    this.favoritesService.syncFromServer();

    const userId = this.authService.getUserId();
    if (userId) {
      // Populates bookingService._bookings signal so my-trip and profile
      // get the correct count from the first render.
      this.bookingService.getByUser(userId).subscribe();
    }
  }
}
