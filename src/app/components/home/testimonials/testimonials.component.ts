import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';
import { Testimonial } from '../../../models/home.models';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css',
})
export class TestimonialsComponent {
  testimonials = input.required<Testimonial[]>();

  readonly activeIndex = signal(0);

  readonly active = computed(() => {
    const list = this.testimonials();
    if (!list.length) return null;
    return list[this.activeIndex() % list.length];
  });

  readonly stars: number[] = [1, 2, 3, 4, 5];

  prev(): void {
    const len = this.testimonials().length;
    this.activeIndex.update(i => (i - 1 + len) % len);
  }

  next(): void {
    const len = this.testimonials().length;
    this.activeIndex.update(i => (i + 1) % len);
  }
}
