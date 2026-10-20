import { ShieldCheck, Settings, AlertCircle, Info, Sparkles } from 'lucide-react';
import type { AppSettings } from '../types';

interface HeaderProps {
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenCrisis: () => void;
  onOpenLimitations: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenSettings,
  onOpenCrisis,
  onOpenLimitations,
}) => {
  return (
    <header
      style={{
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(11, 15, 23, 0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand logo & tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(20, 184, 166, 0.35)',
          }}
        >
          <Sparkles size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                background: 'linear-gradient(to right, #ffffff, #cbd5e1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.03em',
              }}
            >
              Aura
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '999px',
                background: settings.emotionAnalysisEnabled
                  ? 'rgba(20, 184, 166, 0.15)'
                  : 'rgba(148, 163, 184, 0.15)',
                color: settings.emotionAnalysisEnabled ? '#2dd4bf' : '#94a3b8',
                border: `1px solid ${
                  settings.emotionAnalysisEnabled ? 'rgba(20, 184, 166, 0.3)' : 'rgba(148, 163, 184, 0.2)'
                }`,
              }}
            >
              {settings.emotionAnalysisEnabled ? 'Emotion Cues Active' : 'Journal Only'}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Emotion-aware voice reflection & manageable micro-support
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Privacy verification badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '5px 11px',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.75rem',
            color: '#34d399',
          }}
          title="Audio is processed locally in your browser. No voice recordings are stored on external servers."
        >
          <ShieldCheck size={14} />
          <span>Private & On-Device</span>
        </div>

        {/* Crisis Support Quick Access */}
        <button
          onClick={onOpenCrisis}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '7px 14px',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#fb7185',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
          aria-label="Open emergency crisis resources"
        >
          <AlertCircle size={15} />
          <span>Crisis Support</span>
        </button>

        {/* Limitations & Ethics */}
        <button
          onClick={onOpenLimitations}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '7px 12px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
          }}
          title="Read about model limits, uncertainty, and non-clinical nature"
        >
          <Info size={15} />
          <span>Limitations</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          style={{
            padding: '8px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Settings, tone preferences, and data controls"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
