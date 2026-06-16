import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './newsletter.component.html',
  styleUrl: './newsletter.component.css',
})
export class NewsletterComponent {
  subscribe = output<string>();

  readonly email = signal('');

  onInput(value: string): void { this.email.set(value); }

  onSubmit(event: Event): void {
    event.preventDefault();
    const e = this.email().trim();
    if (e) {
      this.subscribe.emit(e);
      this.email.set('');
    }
  }
}
