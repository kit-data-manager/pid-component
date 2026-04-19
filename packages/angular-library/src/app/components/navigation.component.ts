import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PidComponent } from '@kit-data-manager/angular-pid-component';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    PidComponent,
  ],
  template: `
    <mat-toolbar class="navigation-toolbar">
      <div class="nav-container">
        <div class="nav-brand">
          <button mat-mini-fab color="primary" disabled>
            <mat-icon>storage</mat-icon>
          </button>
          <span class="brand-text">ResearchNexus</span>
        </div>

        <div class="nav-links">
          <button mat-button [color]="activePage === 'home' ? 'primary' : undefined" (click)="navigate.emit('home')">
            Home
          </button>
          <button mat-button [color]="activePage === 'datasets' ? 'primary' : undefined" (click)="navigate.emit('datasets')">
            Datasets
          </button>
          <button mat-button [color]="activePage === 'about' ? 'primary' : undefined" (click)="navigate.emit('about')">
            About
          </button>

          <span class="nav-divider">|</span>

          <div class="powered-by">
            <span class="powered-text">Powered by</span>
            <pid-component value="https://ror.org/04t3en479" [emphasizeComponent]="false" />
          </div>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navigation-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid #e0e0e0;
      background: white;
    }

    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-text {
      font-size: 18px;
      font-weight: 600;
      color: #212121;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-divider {
      margin: 0 16px;
      color: #9e9e9e;
    }

    .powered-by {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .powered-text {
      font-size: 14px;
      color: #757575;
    }
  `],
})
export class NavigationComponent {
  @Input() activePage = 'home';
  @Output() navigate = new EventEmitter<string>();
}