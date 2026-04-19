import Link from 'next/link';
import { PidComponent } from '@kit-data-manager/react-pid-component';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#111827', padding: '32px', marginTop: 48 }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ backgroundColor: '#6366f1', borderRadius: 8, padding: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>ResearchNexus</span>
        </div>
        <p style={{ color: '#9ca3af', fontSize: 14 }}>
          Research Data Portal powered by KIT Data Manager
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#9ca3af', fontSize: 14 }}>License:</span>
          <PidComponent value="https://spdx.org/licenses/Apache-2.0" />
        </div>
      </div>
    </footer>
  );
}
