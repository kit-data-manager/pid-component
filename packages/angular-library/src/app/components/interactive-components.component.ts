import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-content-toggles',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
  ],
  template: `
    <mat-card class="interactive-card">
      <h3 class="card-title">Content Type Toggles</h3>
      <p class="card-description">
        These toggles maintain state independently of the autodetection
        running above. Angular state is not blocked by DOM tree traversal.
      </p>
      <mat-chip-set>
        @for (type of contentTypes; track type) {
          <mat-chip
            [highlighted]="activeType === type"
            (click)="selectType(type)"
            class="toggle-chip">
            {{ type }}
          </mat-chip>
        }
      </mat-chip-set>
      <p class="card-footer">Selected: {{ activeType }}</p>
    </mat-card>
  `,
  styles: [`
    .interactive-card {
      padding: 20px;
    }

    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: #212121;
      margin: 0 0 4px 0;
    }

    .card-description {
      font-size: 12px;
      color: #9e9e9e;
      margin: 0 0 16px 0;
    }

    .card-footer {
      font-size: 12px;
      color: #9e9e9e;
      margin: 16px 0 0 0;
    }

    .toggle-chip {
      cursor: pointer;
    }
  `],
})
export class ContentTogglesComponent {
  contentTypes = ['Datasets', 'Publications', 'Software', 'Workflows'];
  activeType = 'Datasets';

  selectType(type: string) {
    this.activeType = type;
  }
}

@Component({
  selector: 'app-progress-indicators',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
  ],
  template: `
    <mat-card class="interactive-card">
      <h3 class="card-title">Download Progress</h3>
      <p class="card-description">
        Progress updates work while autodetection runs above.
        requestAnimationFrame is not blocked.
      </p>
      <div class="progress-item">
        <div class="progress-label">
          <span>Dataset download</span>
          <span>73%</span>
        </div>
        <mat-progress-bar mode="determinate" value="73" color="primary"></mat-progress-bar>
      </div>
      <div class="progress-item">
        <div class="progress-label">
          <span>Metadata extraction</span>
          <span>45%</span>
        </div>
        <mat-progress-bar mode="determinate" value="45" color="accent"></mat-progress-bar>
      </div>
      <div class="progress-item">
        <div class="progress-label">
          <span>Validation</span>
          <span>12%</span>
        </div>
        <mat-progress-bar mode="determinate" value="12" color="warn"></mat-progress-bar>
      </div>
    </mat-card>
  `,
  styles: [`
    .interactive-card {
      padding: 20px;
    }

    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: #212121;
      margin: 0 0 4px 0;
    }

    .card-description {
      font-size: 12px;
      color: #9e9e9e;
      margin: 0 0 16px 0;
    }

    .progress-item {
      margin-bottom: 16px;
    }

    .progress-item:last-child {
      margin-bottom: 0;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 12px;
      color: #424242;
    }
  `],
})
export class ProgressIndicatorsComponent {
}
