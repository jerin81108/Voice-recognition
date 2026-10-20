import { X, AlertCircle, BookOpen, Mic, Cpu, Globe2 } from 'lucide-react';

interface ModelLimitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisableEmotionAnalysis: () => void;
  emotionEnabled: boolean;
}

export const ModelLimitationsModal: React.FC<ModelLimitationsModalProps> = ({
  isOpen,
  onClose,
  onDisableEmotionAnalysis,
  emotionEnabled,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 14, 0.85)',
        backdropFilter: 'blur(10px)',
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
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
              }}
            >
              <BookOpen size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Model Limitations & Ethics</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Understanding what voice analysis can and cannot do
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              color: 'var(--text-dim)',
              padding: '6px',
            }}
            aria-label="Close limitations modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Core Explanations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Cpu size={16} color="#2dd4bf" />
              <strong style={{ fontSize: '0.88rem', color: '#f1f5f9' }}>
                Probabilistic Acoustic Approximations
              </strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Acoustic estimation uses fundamental frequency (pitch), energy (RMS dynamics), and speaking cadence
              to identify tentative signals. These are correlation patterns, not inner truth. Human emotions are
              far richer and more nuanced than any audio algorithm can capture.
            </p>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Globe2 size={16} color="#818cf8" />
              <strong style={{ fontSize: '0.88rem', color: '#f1f5f9' }}>
                Linguistic, Cultural, & Individual Differences
              </strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Speech melody, volume, and tempo differ dramatically across languages, cultures, neurodivergence,
              and personal speaking styles. What sounds quiet or subdued in one context may simply be calm or standard in another.
            </p>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Mic size={16} color="#fbbf24" />
              <strong style={{ fontSize: '0.88rem', color: '#f1f5f9' }}>
                Hardware & Acoustic Environment
              </strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Laptop microphones, phone headsets, room reverberation, and background hum directly influence
              the recorded audio waveform. A lower quality microphone can cause flat audio readings that have
              nothing to do with how the speaker actually feels.
            </p>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <AlertCircle size={16} color="#fb7185" />
              <strong style={{ fontSize: '0.88rem', color: '#fecdd3' }}>
                No Consequential or Clinical Decisions
              </strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#fda4af', lineHeight: 1.5 }}>
              The output of this app must never be used for hiring, performance evaluation, insurance, medical
              diagnosis, or any consequential decision.
            </p>
          </div>
        </div>

        {/* Emotion toggle option right in limitations modal */}
        <div
          style={{
            padding: '1rem',
            borderRadius: '14px',
            background: 'rgba(20, 184, 166, 0.08)',
            border: '1px solid rgba(20, 184, 166, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#2dd4bf' }}>
              Prefer to use Aura without emotion analysis?
            </strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              You can turn off all emotion estimations and use Aura solely as a private, supportive voice reflection journal.
            </p>
          </div>

          <button
            onClick={onDisableEmotionAnalysis}
            style={{
              flexShrink: 0,
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              background: emotionEnabled ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              border: `1px solid ${emotionEnabled ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
              color: emotionEnabled ? '#fb7185' : '#34d399',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            {emotionEnabled ? 'Disable Emotion Cues' : 'Enable Emotion Cues'}
          </button>
        </div>

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
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
