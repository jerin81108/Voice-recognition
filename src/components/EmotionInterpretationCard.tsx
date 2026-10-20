import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  Sliders,
  ChevronDown,
  ChevronUp,
  Activity,
  Volume2,
  Clock,
  Zap,
} from 'lucide-react';
import type { AcousticFeatures, EmotionEstimate, UserFeedback } from '../types';

interface EmotionInterpretationCardProps {
  estimate: EmotionEstimate;
  acoustics?: AcousticFeatures;
  feedback: UserFeedback;
  onConfirm: () => void;
  onCorrect: (correctedEmotion: string) => void;
  onDismiss: () => void;
}

const COMMON_CORRECTION_OPTIONS: { label: string; value: string }[] = [
  { label: 'Calm & Centered', value: 'calm' },
  { label: 'Overwhelmed', value: 'overwhelmed' },
  { label: 'Sad or Down', value: 'sadness' },
  { label: 'Frustrated / Annoyed', value: 'frustration' },
  { label: 'Tired / Depleted', value: 'tired' },
  { label: 'Anxious / Tense', value: 'anxious' },
  { label: 'Excited / Hopeful', value: 'excitement' },
  { label: 'Just Neutral', value: 'neutral' },
];

export const EmotionInterpretationCard: React.FC<EmotionInterpretationCardProps> = ({
  estimate,
  acoustics,
  feedback,
  onConfirm,
  onCorrect,
  onDismiss,
}) => {
  const [showCorrectionPicker, setShowCorrectionPicker] = useState(false);
  const [customCorrection, setCustomCorrection] = useState('');
  const [showAcousticDetails, setShowAcousticDetails] = useState(false);

  const confidencePercent = Math.round(estimate.confidence * 100);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.6rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))',
      }}
    >
      {/* Header & Uncertainty disclaimer */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.6rem',
          marginBottom: '1.1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(99, 102, 241, 0.18)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#a5b4fc',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Tentative Reflection
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ~{confidencePercent}% algorithmic approximation
          </span>
        </div>

        <div
          style={{
            fontSize: '0.74rem',
            color: 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
          title="Vocal analysis is probabilistic and not a clinical diagnosis."
        >
          <HelpCircle size={13} />
          <span>Not a clinical diagnosis</span>
        </div>
      </div>

      {/* Main Tentative Question */}
      <div
        style={{
          padding: '1.1rem 1.25rem',
          borderRadius: '14px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '1.25rem',
        }}
      >
        <p
          style={{
            fontSize: '1.08rem',
            fontWeight: 500,
            lineHeight: 1.6,
            color: '#f8fafc',
            fontStyle: 'italic',
          }}
        >
          “{estimate.tentativeQuestion}”
        </p>

        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginTop: '0.6rem',
          }}
        >
          <strong>Reasoning:</strong> {estimate.rationale}
        </p>
      </div>

      {/* User Response Controls */}
      <div>
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '0.65rem',
            fontWeight: 500,
          }}
        >
          How does this reflection feel to you?
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {/* Confirm */}
          <button
            onClick={onConfirm}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              borderRadius: '10px',
              background:
                feedback.status === 'confirmed'
                  ? 'rgba(16, 185, 129, 0.25)'
                  : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${
                feedback.status === 'confirmed'
                  ? 'rgba(16, 185, 129, 0.5)'
                  : 'var(--border-subtle)'
              }`,
              color: feedback.status === 'confirmed' ? '#34d399' : '#e2e8f0',
              fontSize: '0.84rem',
              fontWeight: 500,
            }}
          >
            <CheckCircle size={15} />
            <span>Yes, that sounds right</span>
          </button>

          {/* Correct */}
          <button
            onClick={() => setShowCorrectionPicker(!showCorrectionPicker)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              borderRadius: '10px',
              background:
                feedback.status === 'corrected'
                  ? 'rgba(20, 184, 166, 0.25)'
                  : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${
                feedback.status === 'corrected'
                  ? 'rgba(20, 184, 166, 0.5)'
                  : 'var(--border-subtle)'
              }`,
              color: feedback.status === 'corrected' ? '#2dd4bf' : '#e2e8f0',
              fontSize: '0.84rem',
              fontWeight: 500,
            }}
          >
            <Sliders size={15} />
            <span>{feedback.correctedEmotion ? `Corrected: ${feedback.correctedEmotion}` : 'Not quite, I feel...'}</span>
          </button>

          {/* Dismiss */}
          <button
            onClick={onDismiss}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '10px',
              background:
                feedback.status === 'dismissed'
                  ? 'rgba(148, 163, 184, 0.2)'
                  : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${
                feedback.status === 'dismissed'
                  ? 'rgba(148, 163, 184, 0.4)'
                  : 'var(--border-subtle)'
              }`,
              color: 'var(--text-muted)',
              fontSize: '0.84rem',
            }}
          >
            <XCircle size={15} />
            <span>Dismiss / Prefer not to say</span>
          </button>
        </div>

        {/* Correction Dropdown / Options Picker */}
        {showCorrectionPicker && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(11, 15, 23, 0.65)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Select what fits best, or type your own word:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
              {COMMON_CORRECTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onCorrect(opt.label);
                    setShowCorrectionPicker(false);
                  }}
                  style={{
                    padding: '5px 11px',
                    borderRadius: '8px',
                    background:
                      feedback.correctedEmotion === opt.label
                        ? 'rgba(20, 184, 166, 0.3)'
                        : 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-subtle)',
                    color: '#f1f5f9',
                    fontSize: '0.78rem',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Or describe in your own words (e.g. restless, nostalgic)..."
                value={customCorrection}
                onChange={(e) => setCustomCorrection(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#f1f5f9',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => {
                  if (customCorrection.trim()) {
                    onCorrect(customCorrection.trim());
                    setShowCorrectionPicker(false);
                  }
                }}
                disabled={!customCorrection.trim()}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: '#14b8a6',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                Set
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Acoustic Metrics Inspector */}
      {acoustics && (
        <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setShowAcousticDetails(!showAcousticDetails)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'none',
              color: 'var(--text-dim)',
              fontSize: '0.75rem',
            }}
          >
            <span>{showAcousticDetails ? 'Hide' : 'Inspect'} detected audio features</span>
            {showAcousticDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showAcousticDetails && (
            <div
              style={{
                marginTop: '0.75rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  <Volume2 size={13} />
                  <span>Avg Volume (RMS)</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '2px', color: '#f1f5f9' }}>
                  {(acoustics.avgEnergy * 100).toFixed(1)}%
                </div>
              </div>

              <div
                style={{
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  <Activity size={13} />
                  <span>Estimated Pitch (F0)</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '2px', color: '#f1f5f9' }}>
                  {acoustics.estimatedPitch > 0 ? `${acoustics.estimatedPitch} Hz` : 'Subdued'}
                </div>
              </div>

              <div
                style={{
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  <Zap size={13} />
                  <span>Cadence / Tempo</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '2px', color: '#f1f5f9' }}>
                  {acoustics.speakingPace} bursts/s
                </div>
              </div>

              <div
                style={{
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  <Clock size={13} />
                  <span>Pause Ratio</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '2px', color: '#f1f5f9' }}>
                  {Math.round(acoustics.pauseRatio * 100)}% silence
                </div>
              </div>

              <div
                style={{
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  <span>Spectral Brightness</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '2px', color: '#f1f5f9' }}>
                  {acoustics.spectralCentroid > 0 ? `${acoustics.spectralCentroid} Hz` : 'N/A'}
                </div>
              </div>

              <div
                style={{
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  <span>Vocal Jitter / Stability</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '2px', color: '#f1f5f9' }}>
                  {(acoustics.vocalJitter * 100).toFixed(1)}% perturbation
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '0.65rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            💡 <em>Tip: Press <strong>F12</strong> (or right-click → Inspect → Console) to view real-time data calculations, acoustic tables, and reasoning suggestions in your browser console!</em>
          </div>
        </div>
      )}
    </div>
  );
};
