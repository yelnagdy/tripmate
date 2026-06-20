import {
  Component, ChangeDetectionStrategy, signal, computed,
  ElementRef, viewChild, afterNextRender, OnDestroy, inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NewsDataService } from '../../core/services/news-data.service';
import { Article } from '../../models/home.models';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-news',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.css',
})
export class NewsComponent implements OnDestroy {

  private readonly router      = inject(Router);
  private readonly newsService = inject(NewsDataService);

  private readonly allArticles: Article[] = this.newsService.getAll();

  readonly visibleCount    = signal(PAGE_SIZE);
  readonly visibleArticles = computed(() => this.allArticles.slice(0, this.visibleCount()));
  readonly hasMore         = computed(() => this.visibleCount() < this.allArticles.length);

  private sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      const el = this.sentinel()?.nativeElement;
      if (!el) return;

      this.observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting && this.hasMore()) {
            this.visibleCount.update(n => Math.min(n + PAGE_SIZE, this.allArticles.length));
          }
        },
        { threshold: 0.1 }
      );

      this.observer.observe(el);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  goBack(): void {
    this.router.navigate(['/main/home']);
  }

  goToArticle(id: number): void {
    this.router.navigate(['/main/news-detail', id]);
  }

  categoryClass(color: string): string {
    return `badge-${color}`;
  }
}
