import { ApplicationConfig, APP_INITIALIZER, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { UniversalNavigationService } from './core/services/universal-navigation.service';

function registerItemTypes(nav: UniversalNavigationService) {
  return () => {
    nav.register({ type: 'destination', route: '/main/destination-detail', label: 'Destination', icon: 'fas fa-map-marker-alt' });
    nav.register({ type: 'place',       route: '/main/destination-detail', label: 'Place',       icon: 'fas fa-map-marker-alt' });
    nav.register({ type: 'package',     route: '/main/destination-detail', label: 'Package',     icon: 'fas fa-box' });
    nav.register({ type: 'hotel',       route: '/main/hotel-detail',       label: 'Hotel',       icon: 'fas fa-hotel' });
    nav.register({ type: 'flight',      route: '/main/flight-detail',      label: 'Flight',      icon: 'fas fa-plane', useIdParam: true });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: registerItemTypes,
      deps: [UniversalNavigationService],
      multi: true,
    },
  ]
};
