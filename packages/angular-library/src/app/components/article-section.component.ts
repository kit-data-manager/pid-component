import { AfterViewInit, Component, ElementRef, Input, OnDestroy, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import {
  initPidDetection,
  type PidDetectionConfig,
  type PidDetectionController,
} from '@kit-data-manager/pid-component';

@Component({
  selector: 'app-article-section',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
  ],
  template: `
    <div class="article-section">
      <h2 class="section-title">
        Article Content
        <mat-chip [color]="isInitialized() ? 'accent' : 'warn'" highlighted>
          {{ isInitialized() ? 'Autodetection Active' : 'Autodetection Inactive' }}
        </mat-chip>
      </h2>
      <mat-card #articleCard class="article-card">
        <p class="article-paragraph">
          This research paper investigates the integration of persistent identifiers across distributed
          research infrastructures. The dataset was created as part of the project identified by
          <strong>21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6</strong> and is hosted at
          the <strong>https://ror.org/04t3en479</strong> research institution. The work builds upon
          previous findings published in DOI <strong>10.1109/eScience.2024.1042</strong> and extends
          the methodology to handle Handle System resolutions at scale.
        </p>
        <p class="article-paragraph">
          For questions about this research, please contact the corresponding author
          at <strong>someone@example.com</strong>. The complete analysis framework is available under
          <strong>https://spdx.org/licenses/Apache-2.0</strong> and can be freely reused
          in accordance with the license terms. The research was conducted at the institution
          associated with ROR <strong>https://ror.org/04t3en479</strong>.
        </p>
        <p class="article-paragraph">
          The research has been published in multiple venues including the.Handle System
          <strong>20.1000/100</strong> and DOI <strong>10.1016/j.future.2025.01.004</strong>.
          Related works include ISBN references <strong>978-3-642-54441-6</strong> and
          ISSN <strong>2041-1723</strong> for the journal.
        </p>
        <p class="article-paragraph">
          The Handle identifier <strong>20.1000/100</strong> resolves to the Handle system
          documentation. For more information about persistent identifiers, visit
          <strong>https://www.pidconsortium.eu/</strong>. The research data is archived
          at <strong>https://doi.org/10.5281/zenodo.1234567</strong>.
        </p>
      </mat-card>
    </div>
  `,
  styles: [`
    .article-section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #212121;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .article-card {
      padding: 32px;
    }

    .article-paragraph {
      font-size: 14px;
      line-height: 1.8;
      color: #424242;
      margin-bottom: 16px;
    }

    .article-paragraph:last-child {
      margin-bottom: 0;
    }
  `],
})
export class ArticleSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('articleCard') articleCard!: ElementRef<HTMLElement>;
  @Input() config?: Partial<PidDetectionConfig>;
  @Input() standalone = true;

  isInitialized = signal(false);
  private controller?: PidDetectionController;

  ngAfterViewInit() {
    if (this.articleCard?.nativeElement && this.standalone) {
      this.controller = initPidDetection({
        root: this.articleCard.nativeElement,
        darkMode: 'light',
        emphasizeComponent: false,
        ...this.config,
      });
      this.isInitialized.set(true);
    }
  }

  ngOnDestroy() {
    if (this.controller) {
      this.controller.destroy();
      this.controller = undefined;
    }
  }
}
