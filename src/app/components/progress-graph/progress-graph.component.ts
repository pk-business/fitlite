import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ExerciseProgress } from '../../models';
import { trigger, transition, style, animate } from '@angular/animations';

/**
 * ProgressGraphComponent displays exercise progress as a sparkline
 * Shows mini graph in collapsed view, larger in expanded view
 */
@Component({
  selector: 'app-progress-graph',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './progress-graph.component.html',
  styleUrls: ['./progress-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms 200ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ProgressGraphComponent implements OnChanges {
  @Input() progress?: ExerciseProgress;
  @Input() mode: 'mini' | 'normal' | 'full' = 'mini';
  @Output() graphClicked = new EventEmitter<void>();

  svgPath: string = '';
  viewBox: string = '0 0 100 40';
  minValue: number = 0;
  maxValue: number = 100;
  hasData: boolean = false;

  /**
   * Helper method to parse float (accessible in template)
   */
  parseFloat(value: string): number {
    return parseFloat(value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['progress'] || changes['mode']) {
      this.generatePath();
    }
  }

  /**
   * Generate SVG path for the sparkline
   */
  private generatePath(): void {
    if (!this.progress || this.progress.dataPoints.length === 0) {
      this.hasData = false;
      this.svgPath = '';
      return;
    }

    this.hasData = true;
    const dataPoints = this.progress.dataPoints;
    const values = dataPoints.map(dp => dp.totalVolume);

    // Set dimensions based on mode
    const width = this.mode === 'mini' ? 100 : this.mode === 'normal' ? 200 : 300;
    const height = this.mode === 'mini' ? 40 : this.mode === 'normal' ? 80 : 120;
    this.viewBox = `0 0 ${width} ${height}`;

    // Calculate min and max
    this.minValue = Math.min(...values);
    this.maxValue = Math.max(...values);
    const range = this.maxValue - this.minValue;

    // Handle case where all values are the same
    if (range === 0) {
      const y = height / 2;
      this.svgPath = `M 0,${y} L ${width},${y}`;
      return;
    }

    // Generate path points
    const points: string[] = [];
    const stepX = width / (values.length - 1 || 1);

    values.forEach((value, index) => {
      const x = index * stepX;
      // Invert Y because SVG coordinates are top-down
      const normalizedY = (value - this.minValue) / range;
      const y = height - (normalizedY * (height - 10)) - 5; // Add padding

      const command = index === 0 ? 'M' : 'L';
      points.push(`${command} ${x.toFixed(2)},${y.toFixed(2)}`);
    });

    this.svgPath = points.join(' ');
  }

  /**
   * Get stroke color based on trend
   */
  getStrokeColor(): string {
    if (!this.progress) return '#999';
    
    const colorMap = {
      'improving': '#10b981',     // green
      'maintaining': '#f59e0b',   // yellow
      'declining': '#ef4444',     // red
      'insufficient-data': '#999' // gray
    };

    return colorMap[this.progress.trend];
  }

  /**
   * Get stroke width based on mode
   */
  getStrokeWidth(): number {
    return this.mode === 'mini' ? 2 : this.mode === 'normal' ? 3 : 4;
  }

  /**
   * Handle graph click
   */
  onGraphClick(): void {
    this.graphClicked.emit();
  }

  /**
   * Format insight text for display
   */
  get insightText(): string {
    return this.progress?.insight || 'No data yet';
  }

  /**
   * Get trend icon
   */
  getTrendIcon(): string {
    if (!this.progress) return 'help-circle-outline';
    
    const iconMap = {
      'improving': 'trending-up',
      'maintaining': 'remove',
      'declining': 'trending-down',
      'insufficient-data': 'help-circle-outline'
    };

    return iconMap[this.progress.trend];
  }

  /**
   * Get trend color for Ionic
   */
  getTrendColor(): string {
    if (!this.progress) return 'medium';
    
    const colorMap = {
      'improving': 'success',
      'maintaining': 'warning',
      'declining': 'danger',
      'insufficient-data': 'medium'
    };

    return colorMap[this.progress.trend];
  }

  /**
   * Format PR text
   */
  get prText(): string {
    const pr = this.progress?.personalRecord;
    if (!pr) return '';

    const timeAgo = pr.daysAgo === 0 ? 'today' : 
                    pr.daysAgo === 1 ? 'yesterday' : 
                    `${pr.daysAgo}d ago`;

    return `PR: ${pr.weight}kg × ${pr.reps} (${timeAgo})`;
  }
}
