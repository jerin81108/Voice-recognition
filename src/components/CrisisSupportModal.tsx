import { Phone, ExternalLink, X, ShieldAlert } from 'lucide-react';
import { REGIONAL_EMERGENCY_CONTACTS } from '../services/safetyService';

interface CrisisSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion: 'US' | 'UK' | 'CA' | 'IN' | 'INTL';
  onSelectRegion: (region: 'US' | 'UK' | 'CA' | 'IN' | 'INTL') => void;
  customCrisisMessage?: string;
}

const REGIONS: { id: 'US' | 'UK' | 'CA' | 'IN' | 'INTL'; label: string }[] = [
  { id: 'US', label: 'United States' },
  { id: 'UK', label: 'United Kingdom' },
  { id: 'CA', label: 'Canada' },
  { id: 'IN', label: 'India' },
  { id: 'INTL', label: 'International' },
];

export const CrisisSupportModal: React.FC<CrisisSupportModalProps> = ({
  isOpen,
  onClose,
  selectedRegion,
  onSelectRegion,
  customCrisisMessage,
}) => {
  if (!isOpen) return null;

  const contacts = REGIONAL_EMERGENCY_CONTACTS[selectedRegion] || REGIONAL_EMERGENCY_CONTACTS.US;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 14, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '620px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          borderRadius: '24px',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 45px rgba(244, 63, 94, 0.2)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                padding: '10px',
                borderRadius: '12px',
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#fb7185',
              }}
            >
              <ShieldAlert size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fecdd3' }}>
                You Are Not Alone · Crisis Support
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#fda4af' }}>
                Immediate, free, confidential human support available 24/7
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              color: 'var(--text-dim)',
              padding: '6px',
              borderRadius: '8px',
            }}
            aria-label="Close crisis support"
          >
            <X size={20} />
          </button>
        </div>

        {/* Reassuring Crisis Message */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '14px',
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            marginBottom: '1.5rem',
          }}
        >
          <p style={{ fontSize: '0.88rem', color: '#fecdd3', lineHeight: 1.6 }}>
            {customCrisisMessage ||
              'If you are experiencing overwhelming pain, danger, or thoughts of hurting yourself, please reach out to one of these services right now. Real, compassionate people are ready to listen without judgment.'}
          </p>
        </div>

        {/* Region Selector Pills */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label
            style={{
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              display: 'block',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Select Your Region:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {REGIONS.map((reg) => (
              <button
                key={reg.id}
                onClick={() => onSelectRegion(reg.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  background:
                    selectedRegion === reg.id
                      ? 'rgba(244, 63, 94, 0.25)'
                      : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${
                    selectedRegion === reg.id
                      ? 'rgba(244, 63, 94, 0.5)'
                      : 'var(--border-subtle)'
                  }`,
                  color: selectedRegion === reg.id ? '#fb7185' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: selectedRegion === reg.id ? 600 : 400,
                }}
              >
                {reg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Emergency Contacts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
          {contacts.map((contact, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <strong style={{ fontSize: '0.94rem', color: '#f8fafc', display: 'block' }}>
                  {contact.name}
                </strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {contact.description}
                </p>
                <div style={{ marginTop: '0.4rem', fontSize: '1rem', fontWeight: 700, color: '#fb7185' }}>
                  {contact.number}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {contact.number.match(/^[0-9+ -]+$/) && (
                  <a
                    href={`tel:${contact.number.replace(/\D/g, '')}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(244, 63, 94, 0.2)',
                      border: '1px solid rgba(244, 63, 94, 0.4)',
                      color: '#fb7185',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <Phone size={14} />
                    <span>Call Now</span>
                  </a>
                )}

                {contact.url && (
                  <a
                    href={contact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.76rem',
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                    }}
                  >
                    <span>Website</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Closing Note */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              fontSize: '0.84rem',
              fontWeight: 500,
            }}
          >
            Return to App
          </button>
        </div>
      </div>
    </div>
  );
};
