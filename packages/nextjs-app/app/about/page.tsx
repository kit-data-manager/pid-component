import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthorCard from '../components/AuthorCard';
import { PidComponent } from '@kit-data-manager/react-pid-component';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Navbar />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 48,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: 32,
        }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>About ResearchDemo</h1>
          <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.8, marginBottom: 24 }}>
            ResearchDemo is a demonstration application that showcases the integration of
            Persistent Identifier (PID) systems in FAIR Digital Objects. Our platform showcases how
            modern web components can seamlessly integrate with existing frameworks to provide
            interactive and informative displays of research metadata.
          </p>
          <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.8, marginBottom: 24 }}>
            The portal uses the <strong>pid-component</strong> library to render DOIs, ORCIDs, ROR IDs,
            Handle PIDs, SPDX license references, and more - all with automatic detection and
            resolution from their respective registries.
          </p>
          <div style={{ padding: 24, backgroundColor: '#f9fafb', borderRadius: 8, marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Institution</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 16, color: '#374151' }}>Hosted by</span>
              <PidComponent value="https://ror.org/04t3en479" />
            </div>
          </div>
          <div style={{ padding: 24, backgroundColor: '#f9fafb', borderRadius: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>License</h2>
            <PidComponent value="https://spdx.org/licenses/Apache-2.0" openByDefault={true} />
          </div>
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Core Team</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
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

        <div
          style={{ backgroundColor: 'white', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Contact</h2>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
            For questions or inquiries, please contact the corresponding author:
          </p>
          <p style={{ fontSize: 14 }}>
            <strong>Email:</strong> <PidComponent value="someone@example.com" />
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
