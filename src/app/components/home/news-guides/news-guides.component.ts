import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Article } from '../../../models/home.models';

@Component({
  selector: 'app-news-guides',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news-guides.component.html',
  styleUrl: './news-guides.component.css',
})
export class NewsGuidesComponent {
  articles = input.required<Article[]>();
  viewMore  = output<void>();
}
