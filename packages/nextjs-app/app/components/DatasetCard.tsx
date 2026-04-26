import { PidComponent } from '@kit-data-manager/react-pid-component';

interface DatasetCardProps {
  id: string;
  title: string;
  doi: string;
  license: string;
  authorOrcid: string;
  description: string;
}

export default function DatasetCard({ id, title, doi, license, authorOrcid, description }: DatasetCardProps) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'box-shadow 0.2s',
    }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <span style={{
          backgroundColor: '#dbeafe',
          color: '#1d4ed8',
          padding: '4px 12px',
          borderRadius: 16,
          fontSize: 12,
          fontWeight: 600,
        }}>
          Dataset
        </span>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#111827' }}>{title}</h3>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>{description}</p>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>DOI</span>
        <div style={{ marginTop: 4 }}>
          <PidComponent value={doi} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Author</span>
        <div style={{ marginTop: 4 }}>
          <PidComponent value={authorOrcid} />
        </div>
      </div>
      <div style={{ paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>License</span>
        <div style={{ marginTop: 4 }}>
          <PidComponent value={license} />
        </div>
      </div>
    </div>
  );
}
