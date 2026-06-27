import {
  Component, ChangeDetectionStrategy,
  signal, computed, input, output, inject, OnInit, OnDestroy,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { map, switchMap } from 'rxjs';
import { BookingData } from '../../models/detail.models';
import { BookingService } from '../../core/services/booking.service';
import { PaymentService } from '../../core/services/payment.service';

type EditableField = 'date' | 'from' | 'to' | 'flight';

type Step = 1 | 2 | 3;

@Component({
  selector: 'app-booking-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './booking-dialog.component.html',
  styleUrl: './booking-dialog.component.css',
})
export class BookingDialogComponent implements OnInit, OnDestroy {

  readonly data        = input.required<BookingData>();
  readonly closeDialog = output<void>();

  private readonly router          = inject(Router);
  private readonly bookingService  = inject(BookingService);
  private readonly paymentService  = inject(PaymentService);
  private readonly sanitizer       = inject(DomSanitizer);

  /* ── Step state ─────────────────────────────────────────────── */
  readonly currentStep    = signal<Step>(1);
  readonly paying         = signal(false);
  readonly payError       = signal<string | null>(null);
  readonly confirmedLocal = signal<number | null>(null);

  /** Set after API responds — triggers iframe rendering in step 2 */
  readonly iframeUrl      = signal<SafeResourceUrl | null>(null);

  private paymentMessageHandler?: (ev: MessageEvent) => void;

  /* ── Inline field editing ───────────────────────────────────── */
  readonly overrides    = signal<Partial<BookingData>>({});
  readonly editingField = signal<EditableField | null>(null);
  readonly editDraft    = signal('');

  readonly display = computed(() => ({ ...this.data(), ...this.overrides() }));

  startEdit(field: EditableField): void {
    this.editDraft.set(this.display()[field] as string);
    this.editingField.set(field);
  }

  saveEdit(): void {
    const field = this.editingField();
    if (!field) return;
    const value = this.editDraft().trim();
    if (value) this.overrides.update(o => ({ ...o, [field]: value }));
    this.editingField.set(null);
  }

  cancelEdit(): void { this.editingField.set(null); }

  /* ── Guests counter ─────────────────────────────────────────── */
  readonly guests = signal(2);
  incrementGuests(): void { this.guests.update(n => n + 1); }
  decrementGuests(): void { this.guests.update(n => Math.max(1, n - 1)); }

  /* ── Total price ────────────────────────────────────────────── */
  readonly total = computed(() => this.guests() * this.data().pricePerPerson);

  /* ── Payment form — name/email for Paymob ───────────────────── */
  readonly paymentForm = new FormGroup({
    firstName: new FormControl(this.prefillFirstName(), Validators.required),
    lastName:  new FormControl(this.prefillLastName(),  Validators.required),
    email:     new FormControl(this.prefillEmail(),     [Validators.required, Validators.email]),
  });

  private prefillFirstName(): string {
    const full = localStorage.getItem('userFullName') ?? '';
    return this.paymentService.parseFullName(full).firstName;
  }

  private prefillLastName(): string {
    const full = localStorage.getItem('userFullName') ?? '';
    return this.paymentService.parseFullName(full).lastName;
  }

  private prefillEmail(): string {
    return localStorage.getItem('userEmail') ?? '';
  }

  /* ── Lifecycle ──────────────────────────────────────────────── */
  ngOnInit(): void {
    this.paymentMessageHandler = (event: MessageEvent) => {
      if (event.data?.type === 'TRIPMATE_PAYMENT_SUCCESS') {
        this.currentStep.set(3);
      }
    };
    window.addEventListener('message', this.paymentMessageHandler);
  }

  ngOnDestroy(): void {
    if (this.paymentMessageHandler) {
      window.removeEventListener('message', this.paymentMessageHandler);
    }
  }

  /* ── Navigation ─────────────────────────────────────────────── */
  goBack(): void {
    const s = this.currentStep();
    if (s === 1) {
      this.closeDialog.emit();
    } else if (s === 2 && this.iframeUrl()) {
      // Inside iframe view → go back to billing form
      this.iframeUrl.set(null);
      this.paying.set(false);
    } else {
      this.currentStep.set((s - 1) as Step);
    }
  }

  onContinue(): void {
    this.currentStep.set(2);
    this.payError.set(null);
    this.iframeUrl.set(null);
  }

  onPay(): void {
    if (!this.paymentForm.valid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const d      = this.display();
    const guests = this.guests();
    const total  = this.total();
    const form   = this.paymentForm.value;

    this.paying.set(true);
    this.payError.set(null);

    const userId = this.paymentService.getUserId();

    this.bookingService.create(d.destinationId ?? 1, guests).pipe(
      switchMap(bookingId =>
        this.paymentService.createPayment({
          userId,
          amount:    total,
          email:     form.email     ?? '',
          firstName: form.firstName ?? '',
          lastName:  form.lastName  ?? '',
          bookingId: bookingId ?? 0,
          items: [{
            itemType: 'Destination',
            itemId:   d.destinationId ?? 0,
            price:    d.pricePerPerson,
          }],
        }).pipe(map(url => ({ url, bookingId })))
      )
    ).subscribe(({ url: paymentUrl, bookingId }) => {
      this.paying.set(false);

      if (bookingId) {
        this.bookingService.addOptimistic({
          id:              bookingId,
          destinationId:   d.destinationId ?? 0,
          destinationName: d.to || 'Unknown',
          numberOfPeople:  guests,
          totalPrice:      total,
        });
        this.confirmedLocal.set(bookingId);
      }

      if (paymentUrl) {
        // Embed Paymob inside the dialog — no redirect, no new tab.
        // DomSanitizer is required so Angular trusts the external iframe URL.
        this.iframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(paymentUrl));
      } else {
        this.payError.set('Payment gateway unavailable. Your booking is saved — please retry later.');
      }
    });
  }

  /** Close the Paymob modal without advancing — user can retry or go back. */
  closeIframeModal(): void {
    this.iframeUrl.set(null);
  }

  /** Fallback: user clicks "I've completed payment" after finishing inside the iframe. */
  onPaymentDone(): void {
    this.iframeUrl.set(null);
    this.currentStep.set(3);
  }

  backToHome(): void {
    this.closeDialog.emit();
    this.router.navigate(['/main/my-trip']);
  }

  hasError(field: string): boolean {
    const ctrl = this.paymentForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
