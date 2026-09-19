import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-row">
      <span class="stat-label">{{ label }}</span>
      <span class="stat-value">{{ value }}</span>
      <div class="stat-bar-bg">
        <div 
          class="stat-bar-fill" 
          [style.width.%]="percentage"
          [style.backgroundColor]="barColor">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-row {
      display: grid;
      grid-template-columns: 70px 35px 1fr;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      margin-bottom: 8px;
    }
    .stat-label {
      font-weight: 600;
      color: rgba(0,0,0,0.6);
      white-space: nowrap;
    }
    .stat-value {
      font-weight: 700;
      text-align: right;
    }
    .stat-bar-bg {
      height: 8px;
      background: rgba(0,0,0,0.08);
      border-radius: 999px;
      overflow: hidden;
      width: 100%;
    }
    .stat-bar-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.5s ease-out, background-color 0.3s ease;
    }
  `]
})
export class StatRowComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: number;
  @Input() max = 150;

  get percentage(): number {
    return Math.min((this.value / this.max) * 100, 100);
  }

  get barColor(): string {
    if (this.value < 60) return '#f87171';
    if (this.value < 90) return '#60a5fa';
    return '#34d399';
  }
}
