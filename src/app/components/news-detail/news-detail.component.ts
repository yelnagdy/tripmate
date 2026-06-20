import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Article } from '../../models/home.models';
import { NewsDataService } from '../../core/services/news-data.service';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.css',
})
export class NewsDetailComponent implements OnInit {

  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly newsService = inject(NewsDataService);

  readonly article  = signal<Article | null>(null);
  readonly related  = signal<Article[]>([]);
  readonly copied   = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const found = this.newsService.getById(id);
    this.article.set(found ?? null);
    if (found) {
      this.related.set(this.newsService.getRelated(found.id));
    }
  }

  goBack(): void {
    this.router.navigate(['/main/news']);
  }

  goToArticle(id: number): void {
    this.router.navigate(['/main/news-detail', id]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  shareTwitter(article: Article): void {
    const text  = encodeURIComponent(article.title);
    const url   = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener');
  }

  shareFacebook(): void {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener');
  }

  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  categoryClass(color: string): string {
    return `badge-${color}`;
  }

  stars(n: number): number[] {
    return Array(n).fill(0);
  }
}
