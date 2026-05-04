import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { PidComponent } from '@kit-data-manager/angular-pid-component';

@Component({
  selector: 'app-datasets-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    PidComponent,
  ],
  template: `
    <div class="mb-8">
      <h2 class="section-title">
        <mat-icon color="primary">database</mat-icon>
        Dataset Overview
        <mat-chip [color]="isActive() ? 'accent' : 'warn'" highlighted>
          {{ isActive() ? 'Scanning Active' : 'Scanning Inactive' }}
        </mat-chip>
      </h2>
      <mat-card class="article-card">
        <table mat-table [dataSource]="datasets" class="w-full">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let item">{{ item.id }}</td>
          </ng-container>
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Title</th>
            <td mat-cell *matCellDef="let item">{{ item.title }}</td>
          </ng-container>
          <ng-container matColumnDef="doi">
            <th mat-header-cell *matHeaderCellDef>DOI</th>
            <td mat-cell *matCellDef="let item">
              <pid-component [value]="item.doi" [openByDefault]="false" />
            </td>
          </ng-container>
          <ng-container matColumnDef="license">
            <th mat-header-cell *matHeaderCellDef>License</th>
            <td mat-cell *matCellDef="let item">
              <pid-component [value]="item.license" [openByDefault]="false" />
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    .mb-8 { margin-bottom: 32px; }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #212121;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .article-card { padding: 32px; }
    .w-full { width: 100%; }
  `],
})
export class DatasetsPageComponent {
  isActive = signal(false);
  displayedColumns = ['id', 'title', 'doi', 'license'];

  datasets = [
    {
      id: '1',
      title: 'KIT Data Metadata Analysis',
      doi: '10.5445/IR/1000185135',
      license: 'https://spdx.org/licenses/MIT',
    },
    {
      id: '2',
      title: 'Research Output Repository Schema',
      doi: '10.5445/IR/1000178054',
      license: 'https://spdx.org/licenses/Apache-2.0',
    },
    {
      id: '3',
      title: 'FDO Implementation Guidelines',
      doi: '10.5445/IR/1000151234',
      license: 'https://spdx.org/licenses/CC-BY-4.0',
    },
  ];
}
