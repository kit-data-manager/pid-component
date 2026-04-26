import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { PidComponent } from '@kit-data-manager/angular-pid-component';

@Component({
  selector: 'app-doi-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    PidComponent,
  ],
  template: `
    <mat-card class="doi-card">
      <mat-card-content>
        <h3 class="label">Digital Object Identifier</h3>
        <pid-component [value]="value" [openByDefault]="true" width="100%" />
        @if (license) {
          <mat-divider></mat-divider>
          <h3 class="label" style="margin-top: 16px">License</h3>
          <pid-component [value]="license" width="100%" />
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .doi-card {
      padding: 24px;
      height: 100%;
    }

    .label {
      font-size: 12px;
      font-weight: 600;
      color: #9e9e9e;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
  `],
})
export class DoiCardComponent {
  @Input() value = '';
  @Input() license?: string;
}