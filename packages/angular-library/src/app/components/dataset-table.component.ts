import { Component, Input, HostListener } from '@angular/core';
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
        <div class="table-scroll-wrapper">
          <table mat-table [dataSource]="datasets" class="dataset-table">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef [style.width.%]="columnWidths['title']" class="resizable-header">
                Title
                <span class="resize-handle" (mousedown)="onResizeStart($event, 'title')"></span>
              </th>
              <td mat-cell *matCellDef="let dataset" class="cell-overflow">{{ dataset.title }}</td>
            </ng-container>

            <ng-container matColumnDef="doi">
              <th mat-header-cell *matHeaderCellDef [style.width.%]="columnWidths['doi']" class="resizable-header">
                DOI
                <span class="resize-handle" (mousedown)="onResizeStart($event, 'doi')"></span>
              </th>
              <td mat-cell *matCellDef="let dataset" class="cell-overflow">
                <pid-component [value]="dataset.doi" [emphasizeComponent]="false" width="100%" />
              </td>
            </ng-container>

            <ng-container matColumnDef="license">
              <th mat-header-cell *matHeaderCellDef [style.width.%]="columnWidths['license']" class="resizable-header">
                License
                <span class="resize-handle" (mousedown)="onResizeStart($event, 'license')"></span>
              </th>
              <td mat-cell *matCellDef="let dataset" class="cell-overflow">
                <pid-component [value]="dataset.license" [emphasizeComponent]="false" width="100%" />
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef [style.width.%]="columnWidths['actions']" class="resizable-header">
                Actions
                <span class="resize-handle" (mousedown)="onResizeStart($event, 'actions')"></span>
              </th>
              <td mat-cell *matCellDef="let dataset" class="cell-overflow">
                <button mat-button color="primary">View</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .dataset-table-card {
      margin-bottom: 32px;
      overflow: hidden;
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

    .table-scroll-wrapper {
      overflow-x: auto;
    }

    .dataset-table {
      width: 100%;
      table-layout: fixed;
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

    .cell-overflow {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .resizable-header {
      position: relative;
      user-select: none;
    }

    .resize-handle {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      cursor: col-resize;
      background: transparent;
    }

    .resize-handle:hover {
      background: #90caf9;
    }
  `],
})
export class DatasetTableComponent {
  @Input() datasets: Dataset[] = [];
  displayedColumns = ['title', 'doi', 'license', 'actions'];

  columnWidths: Record<string, number> = {
    title: 30,
    doi: 30,
    license: 25,
    actions: 15,
  };

  private resizing: { key: string; startX: number; startWidth: number } | null = null;

  onResizeStart(event: MouseEvent, key: string): void {
    event.preventDefault();
    this.resizing = { key, startX: event.clientX, startWidth: this.columnWidths[key] };
  }

  @HostListener('document:mousemove', ['$event'])
  onResizeMove(event: MouseEvent): void {
    if (!this.resizing) return;
    const table = document.querySelector('.dataset-table') as HTMLElement | null;
    if (!table) return;
    const tableWidth = table.offsetWidth;
    const deltaPercent = ((event.clientX - this.resizing.startX) / tableWidth) * 100;
    const newWidth = Math.max(5, this.resizing.startWidth + deltaPercent);
    this.columnWidths[this.resizing.key] = newWidth;
  }

  @HostListener('document:mouseup')
  onResizeEnd(): void {
    this.resizing = null;
  }
}
