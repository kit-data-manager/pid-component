import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { PidComponent } from '@kit-data-manager/angular-pid-component';

export interface Author {
  orcid: string;
  name: string;
  institution?: string;
}

@Component({
  selector: 'app-author-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    PidComponent,
  ],
  template: `
    <mat-card class="author-card">
      <div class="author-content">
        <div class="avatar-placeholder">
          {{ getInitials(author.name) }}
        </div>
        <div class="author-info">
          <h3 class="author-name">{{ author.name }}</h3>
          @if (author.institution) {
            <p class="author-institution">{{ author.institution }}</p>
          }
          <pid-component [value]="author.orcid" [emphasizeComponent]="false" width="100%" />
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .author-card {
      padding: 20px;
    }

    .author-content {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .avatar-placeholder {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #e8eaf6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 600;
      color: #3f51b5;
    }

    .author-info {
      flex: 1;
    }

    .author-name {
      font-size: 16px;
      font-weight: 600;
      color: #212121;
      margin: 0 0 4px 0;
    }

    .author-role {
      font-size: 13px;
      color: #9e9e9e;
      margin: 0 0 4px 0;
    }

    .author-institution {
      font-size: 12px;
      color: #bdbdbd;
      margin: 0 0 12px 0;
    }
  `],
})
export class AuthorCardComponent {
  @Input() author!: Author;

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }
}

@Component({
  selector: 'app-author-grid',
  standalone: true,
  imports: [CommonModule, AuthorCardComponent],
  template: `
    <div class="author-grid">
      <h2 class="grid-title">Research Team</h2>
      <div class="grid">
        @for (author of authors; track author.orcid) {
          <app-author-card [author]="author" />
        }
      </div>
    </div>
  `,
  styles: [`
    .author-grid {
      margin-bottom: 32px;
    }

    .grid-title {
      font-size: 18px;
      font-weight: 600;
      color: #212121;
      margin-bottom: 16px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
  `],
})
export class AuthorGridComponent {
  @Input() authors: Author[] = [];
}