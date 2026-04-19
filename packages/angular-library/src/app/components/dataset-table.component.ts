import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { PidComponent } from '@kit-data-manager/angular-pid-component';

export interface Dataset {
  id: string;
  title: string;
  doi: string;
  license: string;
}

@Component({
  selector: 'app-dataset-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    PidComponent,
  ],
  template: `
    <mat-card class="dataset-table-card">
      <mat-card-header class="table-header">
        <mat-icon mat-card-avatar>description</mat-icon>
        <mat-card-title>Related Datasets</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <table mat-table [dataSource]="datasets" class="dataset-table">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Title</th>
            <td mat-cell *matCellDef="let dataset">{{ dataset.title }}</td>
          </ng-container>

          <ng-container matColumnDef="doi">
            <th mat-header-cell *matHeaderCellDef>DOI</th>
            <td mat-cell *matCellDef="let dataset">
              <pid-component [value]="dataset.doi" [emphasizeComponent]="false" width="100%" />
            </td>
          </ng-container>

          <ng-container matColumnDef="license">
            <th mat-header-cell *matHeaderCellDef>License</th>
            <td mat-cell *matCellDef="let dataset">
              <pid-component [value]="dataset.license" [emphasizeComponent]="false" width="100%" />
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let dataset">
              <button mat-button color="primary">View</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .dataset-table-card {
      margin-bottom: 32px;
    }

    .table-header {
      display: flex;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .table-header mat-icon {
      margin-right: 12px;
      color: #6366f1;
    }

    .dataset-table {
      width: 100%;
    }

    th.mat-header-cell {
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      color: #9e9e9e;
      background: #fafafa;
    }

    td.mat-cell {
      font-size: 14px;
      color: #424242;
    }
  `],
})
export class DatasetTableComponent {
  @Input() datasets: Dataset[] = [];
  displayedColumns = ['title', 'doi', 'license', 'actions'];
}