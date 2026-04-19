'use client';

import Link from 'next/link';
import { PidComponent } from '@kit-data-manager/react-pid-component';

export default function Navbar() {
  return (
    <nav style={{ backgroundColor: '#1a1a2e', padding: '16px 32px', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ backgroundColor: '#6366f1', borderRadius: 8, padding: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <Link href="/" style={{ color: 'white', fontSize: 20, fontWeight: 700, textDecoration: 'none' }}>
            ResearchDemo
          </Link>
          <span style={{
            background: '#fbbf24',
            color: '#78350f',
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 12,
          }}>Demo</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/datasets"
                style={{ color: '#a0a0a0', fontSize: 14, textDecoration: 'none', hoverColor: 'white' }}>
            Datasets
          </Link>
          <Link href="/about" style={{ color: '#a0a0a0', fontSize: 14, textDecoration: 'none' }}>
            About
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#a0a0a0', fontSize: 14 }}>Powered by</span>
            <PidComponent value="https://ror.org/04t3en479" hideSubcomponents={true} />
          </div>
        </div>
      </div>
    </nav>
  );
}
