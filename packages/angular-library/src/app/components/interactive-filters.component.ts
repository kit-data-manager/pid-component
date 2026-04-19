import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

interface Dataset {
  id: number;
  name: string;
  active: boolean;
}

@Component({
  selector: 'app-sortable-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <mat-card class="interactive-card">
      <h3 class="card-title">Sortable Dataset List</h3>
      <p class="card-description">
        This list is fully interactive - sorting works immediately while
        autodetection runs above. DOM tree traversal does not block event handlers.
      </p>
      <mat-list>
        @for (dataset of datasets; track dataset.id) {
          <mat-list-item [class.inactive]="!dataset.active">
            <span matListItemIcon [class]="'dot ' + (dataset.active ? 'active' : 'inactive')"></span>
            <span matListItemTitle>{{ dataset.name }}</span>
            <button mat-button color="primary" matListItemMeta>
              <mat-icon>sort</mat-icon>
              Sort
            </button>
          </mat-list-item>
        }
      </mat-list>
      <p class="card-footer">Active datasets: {{ activeCount }}</p>
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

    mat-list-item {
      margin-bottom: 8px;
      background: #fafafa;
      border-radius: 8px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .dot.active {
      background: #4caf50;
    }

    .dot.inactive {
      background: #bdbdbd;
    }
  `],
})
export class SortableListComponent {
  datasets: Dataset[] = [
    { id: 1, name: 'Dataset A - 1,234 items', active: true },
    { id: 2, name: 'Dataset B - 567 items', active: true },
    { id: 3, name: 'Dataset C - 2,891 items', active: true },
    { id: 4, name: 'Dataset D - 432 items', active: false },
  ];

  get activeCount(): number {
    return this.datasets.filter(d => d.active).length;
  }
}

@Component({
  selector: 'app-filter-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <mat-card class="interactive-card">
      <h3 class="card-title">Dataset Filter</h3>
      <p class="card-description">
        This form is fully functional while autodetection runs above.
        Input events and state updates work immediately.
      </p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Dataset Name</mat-label>
        <input matInput [(ngModel)]="searchQuery" placeholder="Search datasets..." />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Date Range</mat-label>
        <mat-select [(ngModel)]="dateRange">
          <mat-option value="7">Last 7 days</mat-option>
          <mat-option value="30">Last 30 days</mat-option>
          <mat-option value="90">Last 90 days</mat-option>
          <mat-option value="all">All time</mat-option>
        </mat-select>
      </mat-form-field>
      <button mat-flat-button color="primary" (click)="applyFilters()" class="full-width">
        Apply Filters
      </button>
      @if (submitted) {
        <p class="card-footer success">
          Filters applied! Search: "{{ searchQuery }}", Range: {{ dateRangeLabel }}
        </p>
      }
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

    .card-footer.success {
      color: #4caf50;
    }

    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }
  `],
})
export class FilterFormComponent {
  searchQuery = '';
  dateRange = '30';
  submitted = false;

  get dateRangeLabel(): string {
    const labels: Record<string, string> = {
      '7': 'Last 7 days',
      '30': 'Last 30 days',
      '90': 'Last 90 days',
      'all': 'All time',
    };
    return labels[this.dateRange] || this.dateRange;
  }

  applyFilters() {
    this.submitted = true;
  }
}