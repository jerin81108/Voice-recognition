import { Shield, CheckCircle2, AlertTriangle, EyeOff, Lock } from 'lucide-react';

interface ConsentBannerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onOpenSettings: () => void;
}

export const ConsentBannerModal: React.FC<ConsentBannerModalProps> = ({
  isOpen,
  onAccept,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 14, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '2rem',
          borderRadius: '24px',
          border: '1px solid rgba(20, 184, 166, 0.3)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(20, 184, 166, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '14px',
              background: 'rgba(20, 184, 166, 0.15)',
              color: '#2dd4bf',
            }}
          >
            <Shield size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Your Privacy & Safety First</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Transparent consent before using Aura Voice Support
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.85rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Lock size={18} color="#2dd4bf" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#f1f5f9' }}>100% On-Device Processing</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Your audio is processed right inside your browser using the Web Audio API. Audio recordings are
                never sent to remote cloud servers or saved by default.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.85rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <EyeOff size={18} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#f1f5f9' }}>Uncertain Signals, Not Diagnoses</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Acoustic cues (pitch, pace, volume) are tentative approximations—never psychological or medical
                diagnoses. You can always correct or dismiss them, or disable emotion cues entirely.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.85rem',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
            }}
          >
            <AlertTriangle size={18} color="#fb7185" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#fecdd3' }}>Not Therapy or Emergency Care</strong>
              <p style={{ fontSize: '0.8rem', color: '#fda4af', marginTop: '2px' }}>
                Aura offers automated general emotional support and gentle reflection. If you are experiencing
                acute crisis or danger, please contact emergency services (911, 988, 111, or 112) or a trusted human.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onOpenSettings}
            style={{
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            Adjust Settings
          </button>
          <button
            onClick={onAccept}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.4rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(20, 184, 166, 0.4)',
            }}
          >
            <CheckCircle2 size={16} />
            <span>I Understand & Give Consent</span>
          </button>
        </div>
      </div>
    </div>
  );
};
