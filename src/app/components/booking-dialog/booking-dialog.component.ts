import {
  Component, ChangeDetectionStrategy,
  signal, computed, input, output, inject,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingData } from '../../models/detail.models';
import { BookingService } from '../../core/services/booking.service';

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
export class BookingDialogComponent {

  readonly data        = input.required<BookingData>();
  readonly closeDialog = output<void>();

  private readonly router          = inject(Router);
  private readonly bookingService  = inject(BookingService);

  /* ── Step state ─────────────────────────────────────────────── */
  readonly currentStep = signal<Step>(1);
  readonly paying      = signal(false);

  /* ── Inline field editing ───────────────────────────────────── */
  // Local overrides applied on top of the immutable input()
  readonly overrides    = signal<Partial<BookingData>>({});
  readonly editingField = signal<EditableField | null>(null);
  readonly editDraft    = signal('');

  // Merged view: input data + any saved overrides
  readonly display = computed(() => ({ ...this.data(), ...this.overrides() }));

  startEdit(field: EditableField): void {
    this.editDraft.set(this.display()[field] as string);
    this.editingField.set(field);
  }

  saveEdit(): void {
    const field = this.editingField();
    if (!field) return;
    const value = this.editDraft().trim();
    if (value) {
      this.overrides.update(o => ({ ...o, [field]: value }));
    }
    this.editingField.set(null);
  }

  cancelEdit(): void {
    this.editingField.set(null);
  }

  /* ── Guests counter ─────────────────────────────────────────── */
  readonly guests = signal(2);
  incrementGuests(): void { this.guests.update(n => n + 1); }
  decrementGuests(): void { this.guests.update(n => Math.max(1, n - 1)); }

  /* ── Total price ────────────────────────────────────────────── */
  readonly total = computed(() => this.guests() * this.data().pricePerPerson);

  /* ── Payment reactive form ──────────────────────────────────── */
  readonly paymentForm = new FormGroup({
    cardNumber: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{16}$/),
    ]),
    expiry: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{2}\/\d{2}$/),
    ]),
    cvv: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{3}$/),
    ]),
    country: new FormControl('', Validators.required),
    zip:     new FormControl('', Validators.required),
  });

  /* ── Navigation ─────────────────────────────────────────────── */
  goBack(): void {
    const s = this.currentStep();
    if (s === 1) {
      this.closeDialog.emit();
    } else {
      this.currentStep.set((s - 1) as Step);
    }
  }

  onContinue(): void {
    this.currentStep.set(2);
  }

  onPay(): void {
    if (!this.paymentForm.valid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const d = this.display();
    this.paying.set(true);

    this.bookingService.create(d.destinationId ?? 1, this.guests()).subscribe(() => {
      this.paying.set(false);
      this.currentStep.set(3);
    });
  }

  backToHome(): void {
    this.closeDialog.emit();
    this.router.navigate(['/main/my-trip']);
  }

  /* ── Field error helper ─────────────────────────────────────── */
  hasError(field: string): boolean {
    const ctrl = this.paymentForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
