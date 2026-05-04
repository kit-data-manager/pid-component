import { AfterViewInit, Component, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AboutPageComponent,
  ArticleSectionComponent,
  Author,
  AuthorGridComponent,
  Dataset,
  DatasetsPageComponent,
  DatasetTableComponent,
  DoiCardComponent,
  FooterComponent,
  HeroCardComponent,
  LicenseDialogComponent,
  NavigationComponent,
} from './components';
import { initPidDetection, type PidDetectionController } from '@kit-data-manager/pid-component';

@Component({
  selector: 'app-research-demo',
  standalone: true,
  imports: [
    CommonModule,
    NavigationComponent,
    HeroCardComponent,
    DoiCardComponent,
    DatasetTableComponent,
    AuthorGridComponent,
    ArticleSectionComponent,
    LicenseDialogComponent,
    FooterComponent,
    DatasetsPageComponent,
    AboutPageComponent,
  ],
  template: `
    <div class="research-demo-app">
      <app-navigation [activePage]="activePage()" (navigate)="onNavigate($event)" />

      <main class="main-content">
        <div class="container">
          @if (activePage() === 'home') {
            <div class="hero-grid">
              <div class="hero-main">
                <app-hero-card
                  title="Comprehensive Analysis of Persistent Identifier Systems in FAIR Digital Objects"
                  description="This dataset contains the complete analysis of PID systems including Handle, DOI, and ORCID integrations across major research institutions. Published in IEEE eScience 2025."
                />
              </div>
              <div class="hero-doi">
                <app-doi-card
                  value="10.1109/eScience65000.2025.00022"
                  license="https://spdx.org/licenses/Apache-2.0"
                />
              </div>
            </div>

            <app-dataset-table [datasets]="datasets" />

            <app-author-grid [authors]="authors" />

            <div #articleSection>
              <app-article-section [standalone]="false" />
            </div>
          }

          @if (activePage() === 'datasets') {
            <app-datasets-page />
          }

          @if (activePage() === 'about') {
            <app-about-page />
          }

          <app-license-dialog />
        </div>
      </main>

      <app-footer />
    </div>
  `,
  styles: [`
    .research-demo-app {
      min-height: 100vh;
      background: #fafafa;
    }

    .main-content {
      padding: 32px 24px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
  `],
})
export class ResearchDemoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('articleSection') articleSection!: ElementRef<HTMLElement>;

  activePage = signal('home');
  isAutodiscoveryActive = signal(false);
  datasets: Dataset[] = [
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
  authors: Author[] = [
    { orcid: '0009-0005-2800-4833', name: 'Maximilian Inckmann', institution: 'Karlsruhe Institute of Technology' },
    { orcid: '0009-0003-2196-9187', name: 'Christopher Raquet', institution: 'Karlsruhe Institute of Technology' },
    { orcid: '0000-0001-6575-1022', name: 'Andreas Pfeil', institution: 'Karlsruhe Institute of Technology' },
  ];
  private controller?: PidDetectionController;

  ngAfterViewInit() {
    if (this.articleSection?.nativeElement) {
      this.controller = initPidDetection({
        root: this.articleSection.nativeElement,
        darkMode: 'light',
        emphasizeComponent: false,
      });
      this.isAutodiscoveryActive.set(true);
    }
  }

  ngOnDestroy() {
    if (this.controller) {
      this.controller.destroy();
      this.controller = undefined;
    }
  }

  onNavigate(page: string) {
    this.activePage.set(page);
  }
}
