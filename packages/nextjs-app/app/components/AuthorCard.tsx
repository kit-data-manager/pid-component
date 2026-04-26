import { PidComponent } from '@kit-data-manager/react-pid-component';

interface AuthorCardProps {
  orcid: string;
  name: string;
  role: string;
  institution?: string;
}

export default function AuthorCard({ orcid, name, role, institution }: AuthorCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('');

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: '#e0e7ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          fontWeight: 700,
          color: '#4f46e5',
        }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#111827' }}>{name}</h3>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{role}</p>
          {institution && (
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>{institution}</p>
          )}
          <PidComponent value={orcid} />
        </div>
      </div>
    </div>
  );
}