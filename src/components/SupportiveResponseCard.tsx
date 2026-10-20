import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, Sparkles, Feather, Compass, Sun, Anchor } from 'lucide-react';
import type { SupportiveResponse, SupportiveTone } from '../types';
import { TTSService } from '../services/ttsService';

interface SupportiveResponseCardProps {
  response: SupportiveResponse;
  currentTone: SupportiveTone;
  onChangeTone: (tone: SupportiveTone) => void;
}

const TONES: { id: SupportiveTone; label: string; icon: React.FC<{ size?: number }> }[] = [
  { id: 'gentle', label: 'Gentle & Soothing', icon: Feather },
  { id: 'warm', label: 'Warm & Friendly', icon: Sun },
  { id: 'reflective', label: 'Reflective', icon: Compass },
  { id: 'grounded', label: 'Grounded & Direct', icon: Anchor },
];

export const SupportiveResponseCard: React.FC<SupportiveResponseCardProps> = ({
  response,
  currentTone,
  onChangeTone,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      TTSService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      TTSService.speak(response.message, {
        rate: currentTone === 'gentle' ? 0.82 : 0.9,
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.75rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(20, 184, 166, 0.3)',
        background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.8), rgba(15, 23, 42, 0.85))',
        boxShadow: '0 12px 30px -8px rgba(0, 0, 0, 0.5), 0 0 25px rgba(20, 184, 166, 0.1)',
      }}
    >
      {/* Top action row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#2dd4bf" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>
            Supportive Reflection
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* TTS Listen Button */}
          {TTSService.isSupported() && (
            <button
              onClick={handleToggleSpeak}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '5px 11px',
                borderRadius: '8px',
                background: isSpeaking ? 'rgba(20, 184, 166, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isSpeaking ? 'rgba(20, 184, 166, 0.5)' : 'var(--border-subtle)'}`,
                color: isSpeaking ? '#2dd4bf' : 'var(--text-muted)',
                fontSize: '0.78rem',
              }}
              title="Listen to this response read aloud warmly"
              aria-label={isSpeaking ? 'Stop voice reading' : 'Read response aloud'}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isSpeaking ? 'Stop Voice' : 'Listen Aloud'}</span>
            </button>
          )}

          {/* Copy message button */}
          <button
            onClick={handleCopy}
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Copy reflection to clipboard"
            aria-label="Copy reflection"
          >
            {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Main Message Content */}
      <p
        style={{
          fontSize: '1.02rem',
          lineHeight: 1.7,
          color: '#f8fafc',
          marginBottom: '1.5rem',
          fontWeight: 400,
        }}
      >
        {response.message}
      </p>

      {/* Tone Switcher Selector */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginRight: '0.25rem' }}>
          Tone:
        </span>
        {TONES.map((t) => {
          const Icon = t.icon;
          const isActive = currentTone === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChangeTone(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '4px 10px',
                borderRadius: '8px',
                background: isActive ? 'rgba(20, 184, 166, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isActive ? 'rgba(20, 184, 166, 0.45)' : 'transparent'}`,
                color: isActive ? '#2dd4bf' : 'var(--text-muted)',
                fontSize: '0.76rem',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon size={12} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
