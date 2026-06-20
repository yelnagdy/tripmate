import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-nav-main',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-main.component.html',
  styleUrls: ['./nav-main.component.css']
})
export class NavMainComponent {
  constructor(
    private readonly _router: Router,
    private readonly _authService: AuthService,
    private readonly _favoritesService: FavoritesService,
  ) {}

  logout(): void {
    const refreshToken = sessionStorage.getItem('refreshToken') ?? '';

    this._authService.logout(refreshToken).subscribe(() => {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      this._favoritesService.clearStorage();
      this._router.navigate(['/auth/login']);
    });
  }
}


