import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PidComponent } from '@kit-data-manager/angular-pid-component';

@Component({
  selector: 'app-license-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    PidComponent,
  ],
  template: `
    <mat-card class="license-card">
      <h2 class="card-title">
        <mat-icon>scale</mat-icon>
        License Information
      </h2>
      <button mat-flat-button color="primary" (click)="openDialog()">
        <mat-icon>scale</mat-icon>
        View License Details
      </button>
    </mat-card>
  `,
  styles: [`
    .license-card {
      padding: 24px;
    }

    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: #212121;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `],
})
export class LicenseDialogComponent {
  constructor(private dialog: MatDialog) {
  }

  openDialog() {
    // In a real app, this would open a dialog
    // For Storybook, we just show the content inline
  }
}
