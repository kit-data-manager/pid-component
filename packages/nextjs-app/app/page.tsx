import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DatasetCard from './components/DatasetCard';
import AuthorCard from './components/AuthorCard';
import { PidComponent } from '@kit-data-manager/react-pid-component';
import { initPidDetection } from '@kit-data-manager/pid-component';
import { useEffect, useRef } from 'react';

function ArticleSection() {
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!articleRef.current) return;
    const ctrl = initPidDetection({ root: articleRef.current, darkMode: 'light' });
    return () => ctrl.destroy();
  }, []);

  return (
    <div ref={articleRef} style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 32,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: 32,
    }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span>Article Content</span>
        <span style={{
          fontSize: 12,
          backgroundColor: '#dcfce7',
          color: '#166534',
          padding: '4px 10px',
          borderRadius: 12,
          fontWeight: 600,
        }}>
          Autodetection Active
        </span>
      </h2>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: '#374151', marginBottom: 16 }}>
        This research paper investigates the integration of persistent identifiers across distributed
        research infrastructures. The dataset was created as part of the project identified by
        <strong> 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6</strong> and is hosted at
        the <strong>https://ror.org/04t3en479</strong> research institution. The work builds upon
        previous findings published in DOI <strong>10.1109/eScience.2024.1042</strong>.
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: '#374151', marginBottom: 16 }}>
        For questions about the dataset, please contact the corresponding author
        at <strong>someone@example.com</strong>. The complete analysis framework is available under
        <strong> https://spdx.org/licenses/Apache-2.0</strong>.
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: '#374151' }}>
        The research team, led by <strong>0009-0005-2800-4833</strong> and including
        contributions from <strong>0009-0003-2196-9187</strong>, has made the dataset
        available through the KIT Data Manager repository.
      </p>
    </div>
  );
}


export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Navbar />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        {/* Hero Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
          <div
            style={{ backgroundColor: 'white', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span style={{
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                padding: '4px 12px',
                borderRadius: 16,
                fontSize: 12,
                fontWeight: 600,
              }}>DOI</span>
              <span style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                padding: '4px 12px',
                borderRadius: 16,
                fontSize: 12,
                fontWeight: 600,
              }}>Research Data</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#111827' }}>
              Comprehensive Analysis of Persistent Identifier Systems in FAIR Digital Objects
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              This dataset contains the complete analysis of PID systems including Handle, DOI, and ORCID
              integrations across major research institutions. Published in IEEE eScience 2025.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{
                backgroundColor: '#6366f1',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                Download Dataset
              </button>
              <button style={{
                backgroundColor: 'white',
                color: '#374151',
                padding: '10px 20px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                View Source
              </button>
            </div>
          </div>

          <div
            style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#6b7280',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              Digital Object Identifier
            </h3>
            <PidComponent value="10.1109/eScience65000.2025.00022" openByDefault={true} />
          </div>
        </div>

        {/* Dataset Cards */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Featured Datasets</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <DatasetCard
              id="1"
              title="KIT Data Metadata Analysis"
              doi="10.5445/IR/1000185135"
              license="https://spdx.org/licenses/MIT"
              authorOrcid="0009-0005-2800-4833"
              description="Comprehensive metadata analysis for KIT's research data repository."
            />
            <DatasetCard
              id="2"
              title="Research Output Repository Schema"
              doi="10.5445/IR/1000178054"
              license="https://spdx.org/licenses/Apache-2.0"
              authorOrcid="0009-0003-2196-9187"
              description="Schema definitions for research output management."
            />
            <DatasetCard
              id="3"
              title="FDO Implementation Guidelines"
              doi="10.5445/IR/1000151234"
              license="https://spdx.org/licenses/CC-BY-4.0"
              authorOrcid="0000-0001-6575-1022"
              description="Implementation guidelines for FAIR Digital Objects."
            />
          </div>
        </div>

        {/* Author Section */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Developers of the pid-component</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <AuthorCard
              orcid="0009-0005-2800-4833"
              name="Maximilian Inckmann"
              institution="Karlsruhe Institute of Technology"
            />
            <AuthorCard
              orcid="0009-0003-2196-9187"
              name="Christopher Raquet"
              institution="Karlsruhe Institute of Technology"
            />
            <AuthorCard
              orcid="0000-0001-6575-1022"
              name="Andreas Pfeil"
              institution="Karlsruhe Institute of Technology"
            />
          </div>
        </div>

        {/* Autodetection Zone */}
        <ArticleSection />


      </main>

      <Footer />
    </div>
  );
}
