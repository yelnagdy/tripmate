import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css',
})
export class PaymentSuccessComponent {
  private readonly router = inject(Router);

  goToMyTrips(): void {
    this.router.navigate(['/main/my-trip']);
  }
}
