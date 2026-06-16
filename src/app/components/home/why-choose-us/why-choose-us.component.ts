import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { AppFeature } from '../../../models/home.models';

@Component({
  selector: 'app-why-choose-us',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './why-choose-us.component.html',
  styleUrl: './why-choose-us.component.css',
})
export class WhyChooseUsComponent {
  features = input.required<AppFeature[]>();
}
