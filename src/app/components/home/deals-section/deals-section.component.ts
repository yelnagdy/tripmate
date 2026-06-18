import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { PromoDeal } from '../../../models/home.models';

@Component({
  selector: 'app-deals-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deals-section.component.html',
  styleUrl: './deals-section.component.css',
})
export class DealsSectionComponent {
  deals = input.required<PromoDeal[]>();

  bookNow  = output<PromoDeal>();
  viewDeal = output<PromoDeal>();

  onView(deal: PromoDeal): void {
    this.viewDeal.emit(deal);
  }
}
