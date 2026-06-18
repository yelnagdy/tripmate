import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { UniversalItem } from '../../models/universal.models';
import { UniversalNavigationService } from '../../core/services/universal-navigation.service';

@Component({
  selector: 'app-universal-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlicePipe],
  templateUrl: './universal-card.component.html',
  styleUrl: './universal-card.component.css',
})
export class UniversalCardComponent {

  item        = input.required<UniversalItem>();
  buttonLabel = input('View Details');

  private readonly navService = inject(UniversalNavigationService);

  onView(): void {
    this.navService.viewItem(this.item());
  }
}
