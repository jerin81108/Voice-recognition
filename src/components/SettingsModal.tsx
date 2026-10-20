import { X, Sliders, Shield, Trash2, Languages } from 'lucide-react';
import type { AppSettings, SupportiveTone } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllData,
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
          maxWidth: '560px',
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
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'rgba(20, 184, 166, 0.15)',
                color: '#2dd4bf',
              }}
            >
              <Sliders size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Settings & Privacy</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Customize how Aura listens, speaks, and handles your data
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
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Setting Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
          {/* Emotion Analysis Toggle */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#f1f5f9', display: 'block' }}>
                Enable Emotion Tone Estimation
              </strong>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                When enabled, analyzes vocal cues (pitch, energy, pace) to offer tentative reflections.
                When disabled, Aura acts as a quiet, non-interpretive voice reflection space.
              </p>
            </div>

            <label
              style={{
                position: 'relative',
                display: 'inline-block',
                width: '46px',
                height: '26px',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={settings.emotionAnalysisEnabled}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, emotionAnalysisEnabled: e.target.checked })
                }
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: settings.emotionAnalysisEnabled ? '#14b8a6' : '#334155',
                  borderRadius: '999px',
                  transition: 'background-color 0.25s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: settings.emotionAnalysisEnabled ? '23px' : '3px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    transition: 'left 0.25s',
                  }}
                />
              </span>
            </label>
          </div>

          {/* Supportive Tone Preference */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <label
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#f1f5f9',
                display: 'block',
                marginBottom: '0.35rem',
              }}
            >
              Default Supportive Tone
            </label>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Choose the emotional flavor of generated responses:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {(['gentle', 'warm', 'reflective', 'grounded'] as SupportiveTone[]).map((tone) => (
                <button
                  key={tone}
                  onClick={() => onUpdateSettings({ ...settings, supportiveTone: tone })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background:
                      settings.supportiveTone === tone
                        ? 'rgba(20, 184, 166, 0.2)'
                        : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${
                      settings.supportiveTone === tone
                        ? 'rgba(20, 184, 166, 0.45)'
                        : 'var(--border-subtle)'
                    }`,
                    color: settings.supportiveTone === tone ? '#2dd4bf' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    textTransform: 'capitalize',
                    fontWeight: settings.supportiveTone === tone ? 600 : 400,
                    textAlign: 'left',
                  }}
                >
                  {tone === 'gentle'
                    ? 'Gentle & Soothing'
                    : tone === 'warm'
                    ? 'Warm & Friendly'
                    : tone === 'reflective'
                    ? 'Reflective'
                    : 'Grounded & Direct'}
                </button>
              ))}
            </div>
          </div>

          {/* Speech Recognition Language */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <Languages size={16} color="#2dd4bf" />
              <label
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#f1f5f9',
                }}
              >
                Spoken Language
              </label>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              Select which language you will speak into the microphone (supports 120+ Web Speech locales):
            </p>

            <select
              value={settings.speechLanguage || 'en-US'}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  speechLanguage: e.target.value,
                })
              }
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(11, 15, 23, 0.8)',
                border: '1px solid var(--border-subtle)',
                color: '#f8fafc',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            >
              <optgroup label="🇮🇳 Indian Languages">
                <option value="ta-IN">தமிழ் — Tamil</option>
                <option value="hi-IN">हिन्दी — Hindi</option>
                <option value="te-IN">తెలుగు — Telugu</option>
                <option value="kn-IN">ಕನ್ನಡ — Kannada</option>
                <option value="ml-IN">മലയാളം — Malayalam</option>
                <option value="mr-IN">मराठी — Marathi</option>
                <option value="bn-IN">বাংলা — Bengali (India)</option>
                <option value="gu-IN">ગુજરાતી — Gujarati</option>
                <option value="pa-IN">ਪੰਜਾਬੀ — Punjabi</option>
                <option value="ur-IN">اردو — Urdu (India)</option>
                <option value="en-IN">English (India)</option>
              </optgroup>
              <optgroup label="🌍 International Languages">
                <option value="en-US">English (United States)</option>
                <option value="en-GB">English (United Kingdom)</option>
                <option value="es-ES">Español (Spanish)</option>
                <option value="fr-FR">Français (French)</option>
                <option value="de-DE">Deutsch (German)</option>
                <option value="zh-CN">中文 (Mandarin Simplified)</option>
                <option value="ja-JP">日本語 (Japanese)</option>
                <option value="pt-BR">Português (Brazil)</option>
                <option value="ar-SA">العربية (Arabic)</option>
                <option value="it-IT">Italiano (Italian)</option>
                <option value="ko-KR">한국어 (Korean)</option>
                <option value="ru-RU">Русский (Russian)</option>
              </optgroup>
            </select>
          </div>

          {/* Preferred Crisis Region */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <label
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#f1f5f9',
                display: 'block',
                marginBottom: '0.35rem',
              }}
            >
              Crisis Emergency Region
            </label>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              Select which regional emergency hotlines should be prioritized:
            </p>

            <select
              value={settings.preferredRegion}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  preferredRegion: e.target.value as 'US' | 'UK' | 'CA' | 'IN' | 'INTL',
                })
              }
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(11, 15, 23, 0.8)',
                border: '1px solid var(--border-subtle)',
                color: '#f8fafc',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            >
              <option value="US">United States (988, 741741, 911)</option>
              <option value="UK">United Kingdom (111, 116 123, 999)</option>
              <option value="CA">Canada (988, 911, Kids Help Phone)</option>
              <option value="IN">India (KIRAN 1800-599-0019, Tele-MANAS, 112)</option>
              <option value="INTL">International / Other (Befrienders Worldwide)</option>
            </select>
          </div>

          {/* Data Privacy & Purge Control */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '14px',
              background: 'rgba(244, 63, 94, 0.06)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Shield size={16} color="#fb7185" />
              <strong style={{ fontSize: '0.88rem', color: '#fecdd3' }}>Zero Retention Guarantee</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#fda4af', marginBottom: '0.85rem', lineHeight: 1.5 }}>
              Aura does not save your audio recordings or send them to any server. You can also completely
              clear any in-memory transcript or session history at any moment.
            </p>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all current session data and reset preferences?')) {
                  onClearAllData();
                  onClose();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                background: 'rgba(244, 63, 94, 0.2)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                color: '#fb7185',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <Trash2 size={14} />
              <span>Clear All Data & Reset Everything</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
