import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <mat-toolbar color="primary" class="footer-toolbar">
      <div class="footer-container">
        <div class="footer-brand">
          <button mat-mini-fab color="accent" disabled>
            <mat-icon>storage</mat-icon>
          </button>
          <span class="brand-text">ResearchDemo</span>
        </div>
        <p class="footer-text">Research Data Portal powered by KIT Data Manager</p>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .footer-toolbar {
      margin-top: 48px;
      background: #212121;
    }

    .footer-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-text {
      font-size: 14px;
      font-weight: 600;
      color: white;
    }

    .footer-text {
      font-size: 14px;
      color: #9e9e9e;
      margin: 0;
    }
  `],
})
export class FooterComponent {
}
