import { Component, AfterViewInit } from '@angular/core';

/**
 * Loaded inside the Paymob iframe after the user completes payment.
 * Paymob redirects its iframe to this URL (configured as redirect_url in the backend).
 * We immediately post a message to the parent frame so booking-dialog advances to step 3.
 *
 * Required backend config: set redirect_url = https://<your-domain>/payment-callback
 */
@Component({
  selector: 'app-payment-callback',
  standalone: true,
  template: `
    <div class="wrap">
      <div class="icon">✓</div>
      <p>Payment received — returning to TripMate…</p>
    </div>
  `,
  styles: [`
    .wrap {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 100vh;
      font-family: sans-serif; text-align: center; color: #1a1a2e;
    }
    .icon { font-size: 2.5rem; color: #22c55e; margin-bottom: .75rem; }
    p { font-size: .95rem; color: #6b7280; }
  `],
})
export class PaymentCallbackComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    if (window.self !== window.top) {
      window.parent.postMessage({ type: 'TRIPMATE_PAYMENT_SUCCESS' }, '*');
    }
  }
}
