import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-stats-card',
  imports: [LucideAngularModule],
  templateUrl: './stats-card.html',
  styleUrl: './stats-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsCardComponent {
  icon = input.required<LucideIconData>();
  label = input.required<string>();
  value = input.required<number>();
  color = input<string>('primary');
}
