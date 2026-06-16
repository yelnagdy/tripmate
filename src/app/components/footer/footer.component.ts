import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
  computed,
  inject,
} from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {

  private readonly cdr = inject(ChangeDetectorRef);

  readonly email      = signal('');
  readonly touched    = signal(false);
  readonly submitting = signal(false);
  readonly success    = signal(false);

  readonly emailError = computed(() => {
    if (!this.touched()) return '';
    const v = this.email().trim();
    if (!v) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      return 'Please enter a valid email address.';
    return '';
  });

  private readonly isValid = computed(() =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email().trim())
  );

  onInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
    this.touched.set(true);
  }

  onBlur(): void {
    this.touched.set(true);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.touched.set(true);

    if (!this.isValid() || this.submitting()) return;

    this.submitting.set(true);

    /* Simulate async API call — replace with real HttpClient call */
    setTimeout(() => {
      this.submitting.set(false);
      this.success.set(true);
      this.email.set('');
      this.touched.set(false);
      /* OnPush + setTimeout: explicitly mark for check so the view updates */
      this.cdr.markForCheck();

      setTimeout(() => {
        this.success.set(false);
        this.cdr.markForCheck();
      }, 4000);
    }, 900);
  }
}
