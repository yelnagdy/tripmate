import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { HowItWorksStep } from '../../../models/home.models';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.css',
})
export class HowItWorksComponent {
  steps = input.required<HowItWorksStep[]>();
}
