import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { PidComponent } from '@kit-data-manager/angular-pid-component';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
    MatIconModule,
    PidComponent,
  ],
  template: `
    <div class="mb-8">
      <h2 class="section-title">
        <mat-icon color="info">information</mat-icon>
        About ResearchDemo
        <mat-chip color="info" highlighted>Demo Application</mat-chip>
      </h2>
      <mat-card class="article-card">
        <p class="article-paragraph">
          This is a demonstration application showcasing the
          <strong>PID Component</strong> library. This component enables
          seamless detection and rendering of Persistent Identifiers (PIDs)
          including DOIs, ORCIDs, Handles, RORs, and more.
        </p>
        <p class="article-paragraph">
          Explore the tabs below to see different PID types in action:
        </p>

        <mat-tab-group>
          <mat-tab label="DOIs">
            <div class="tab-content">
              <pid-component value="10.1109/eScience65000.2025.00022" class="mb-2" />
              <pid-component value="10.5445/IR/1000185135" class="mb-2" />
              <pid-component value="10.1007/978-3-642-15582-6" class="mb-2" />
            </div>
          </mat-tab>
          <mat-tab label="ORCIDs">
            <div class="tab-content">
              <pid-component value="0009-0005-2800-4833" class="mb-2" />
              <pid-component value="0009-0003-2196-9187" class="mb-2" />
              <pid-component value="0000-0001-6575-1022" class="mb-2" />
            </div>
          </mat-tab>
          <mat-tab label="Handles">
            <div class="tab-content">
              <pid-component value="21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6" class="mb-2" />
              <pid-component value="20.1000/100.123456" class="mb-2" />
            </div>
          </mat-tab>
          <mat-tab label="RORs">
            <div class="tab-content">
              <pid-component value="https://ror.org/04t3en479" class="mb-2" />
              <pid-component value="https://ror.org/02aj13c28" class="mb-2" />
            </div>
          </mat-tab>
        </mat-tab-group>
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
    .article-paragraph {
      font-size: 14px;
      line-height: 1.8;
      color: #424242;
      margin-bottom: 16px;
    }
    .article-paragraph:last-child { margin-bottom: 0; }
    .tab-content { padding: 24px 0; display: flex; flex-direction: column; gap: 8px; }
  `],
})
export class AboutPageComponent {
}
