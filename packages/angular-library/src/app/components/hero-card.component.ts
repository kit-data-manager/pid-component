import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PidComponent } from '@kit-data-manager/angular-pid-component';

@Component({
  selector: 'app-hero-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    PidComponent,
  ],
  template: `
    <mat-card class="hero-card">
      <mat-card-header>
        <mat-chip-set>
          <mat-chip color="primary" highlighted>DOI</mat-chip>
          <mat-chip color="accent" highlighted>Research Data</mat-chip>
        </mat-chip-set>
      </mat-card-header>
      <mat-card-content>
        <h1 class="hero-title">{{ title }}</h1>
        <p class="hero-description">{{ description }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-flat-button color="primary">
          <mat-icon>download</mat-icon>
          Download Dataset
        </button>
        <button mat-stroked-button>
          <mat-icon>open_in_new</mat-icon>
          View Source
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .hero-card {
      padding: 24px;
    }

    .hero-title {
      font-size: 24px;
      font-weight: 700;
      color: #212121;
      margin: 16px 0;
      line-height: 1.3;
    }

    .hero-description {
      font-size: 14px;
      color: #757575;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    mat-card-actions {
      display: flex;
      gap: 12px;
    }
  `],
})
export class HeroCardComponent {
  @Input() title = '';
  @Input() description = '';
}