import React, { useState, useEffect } from 'react';
import {
  SkipForward,
  X,
  Play,
  Pause,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import type { MicroActivity } from '../types';
import { ActivityService } from '../services/activityService';

interface MicroActivityWidgetProps {
  activity: MicroActivity;
  onSkip: () => void;
  onSelectDifferent: (activity: MicroActivity) => void;
  onClose: () => void;
}

export const MicroActivityWidget: React.FC<MicroActivityWidgetProps> = ({
  activity,
  onSkip,
  onSelectDifferent,
  onClose,
}) => {
  // Breathing guide state
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(1);

  // Concern journal state
  const [concernText, setConcernText] = useState('');
  const [isShredded, setIsShredded] = useState(false);

  // Grounding state
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);

  // Reach out copy state
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Breathing pacer timer
  useEffect(() => {
    if (!isBreathingActive || activity.id !== 'box-breathing') return;

    const interval = window.setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev <= 1) {
          // Switch phase
          setBreathPhase((currentPhase) => {
            if (currentPhase === 'Inhale') return 'Hold';
            if (currentPhase === 'Hold') return 'Exhale';
            if (currentPhase === 'Exhale') return 'Rest';
            // Completed 1 full cycle
            setCycleCount((c) => c + 1);
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, activity.id]);

  const handleToggleBreathing = () => {
    setIsBreathingActive(!isBreathingActive);
  };

  const handleShredConcern = () => {
    if (!concernText.trim()) return;
    setIsShredded(true);
    setTimeout(() => {
      setConcernText('');
      setIsShredded(false);
    }, 3000);
  };

  const handleToggleGroundingStep = (idx: number) => {
    if (checkedSteps.includes(idx)) {
      setCheckedSteps(checkedSteps.filter((i) => i !== idx));
    } else {
      setCheckedSteps([...checkedSteps, idx]);
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const allActivities = ActivityService.getAllActivities();

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.75rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        background: 'linear-gradient(145deg, rgba(28, 25, 23, 0.75), rgba(15, 23, 42, 0.85))',
        position: 'relative',
      }}
    >
      {/* Top Bar with Badge, Duration & Close */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fbbf24',
              fontSize: '0.74rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Optional Micro-Activity · {activity.duration}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Zero pressure — only if it feels manageable
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            color: 'var(--text-dim)',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Close activity"
          aria-label="Close activity"
        >
          <X size={16} />
        </button>
      </div>

      {/* Title & Description */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.35rem' }}>
        {activity.title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        {activity.description}
      </p>

      {/* --- Interactive Content Specific to Activity --- */}

      {/* 1. Box Breathing Interactive Pacer */}
      {activity.id === 'box-breathing' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            borderRadius: '16px',
            background: 'rgba(11, 15, 23, 0.6)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              background:
                breathPhase === 'Inhale'
                  ? 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, rgba(20, 184, 166, 0.1) 70%)'
                  : breathPhase === 'Hold'
                  ? 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0.1) 70%)'
                  : breathPhase === 'Exhale'
                  ? 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0.1) 70%)'
                  : 'radial-gradient(circle, rgba(148, 163, 184, 0.25) 0%, rgba(148, 163, 184, 0.05) 70%)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 1s ease-in-out',
              transform:
                breathPhase === 'Inhale'
                  ? 'scale(1.2)'
                  : breathPhase === 'Hold'
                  ? 'scale(1.2)'
                  : breathPhase === 'Exhale'
                  ? 'scale(0.9)'
                  : 'scale(1)',
              boxShadow: isBreathingActive
                ? '0 0 35px rgba(20, 184, 166, 0.3)'
                : 'none',
              marginBottom: '1rem',
            }}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              {isBreathingActive ? breathPhase : 'Ready'}
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2dd4bf', marginTop: '2px' }}>
              {isBreathingActive ? breathSeconds : '4s'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={handleToggleBreathing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.3rem',
                borderRadius: '10px',
                background: isBreathingActive
                  ? 'rgba(244, 63, 94, 0.25)'
                  : 'linear-gradient(135deg, #14b8a6, #0d9488)',
                color: isBreathingActive ? '#fb7185' : '#ffffff',
                border: `1px solid ${isBreathingActive ? 'rgba(244, 63, 94, 0.4)' : 'transparent'}`,
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              {isBreathingActive ? <Pause size={15} /> : <Play size={15} />}
              <span>{isBreathingActive ? 'Pause Guide' : 'Begin Breathing Cycle'}</span>
            </button>
            {isBreathingActive && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Cycle {cycleCount} of 4
              </span>
            )}
          </div>
        </div>
      )}

      {/* 2. Concern / Thought Release Shredder */}
      {activity.id === 'concern-journal' && (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            background: 'rgba(11, 15, 23, 0.6)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          {isShredded ? (
            <div
              style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                color: '#34d399',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={32} />
              <strong style={{ fontSize: '1rem' }}>Thought Released</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '380px' }}>
                You do not have to carry everything all at once. Take a slow breath and let your shoulders rest.
              </p>
            </div>
          ) : (
            <div>
              <label
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Write just one heavy thought or worry you are carrying:
              </label>
              <textarea
                value={concernText}
                onChange={(e) => setConcernText(e.target.value)}
                placeholder="e.g., I feel like I'm letting everyone down today..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  outline: 'none',
                  resize: 'none',
                  marginBottom: '0.75rem',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleShredConcern}
                  disabled={!concernText.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 1.15rem',
                    borderRadius: '8px',
                    background: 'rgba(244, 63, 94, 0.2)',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    color: '#fb7185',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <Trash2 size={14} />
                  <span>Release & Let It Go</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. 5-4-3-2-1 Sensory Grounding Checklist */}
      {activity.id === 'grounding-54321' && (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            background: 'rgba(11, 15, 23, 0.6)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {activity.steps.map((step, idx) => {
              const isChecked = checkedSteps.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => handleToggleGroundingStep(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    background: isChecked ? 'rgba(20, 184, 166, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isChecked ? 'rgba(20, 184, 166, 0.35)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: `1.5px solid ${isChecked ? '#2dd4bf' : 'var(--text-dim)'}`,
                      backgroundColor: isChecked ? '#14b8a6' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isChecked && <Check size={12} color="#ffffff" />}
                  </div>
                  <span
                    style={{
                      fontSize: '0.82rem',
                      color: isChecked ? '#f1f5f9' : 'var(--text-muted)',
                      textDecoration: isChecked ? 'line-through' : 'none',
                    }}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Reach Out & Connection Template */}
      {activity.id === 'reach-out' && (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            background: 'rgba(11, 15, 23, 0.6)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
            A ready-to-send check-in message template that requires zero explanation:
          </p>

          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: '#f8fafc',
              fontStyle: 'italic',
              marginBottom: '0.75rem',
              lineHeight: 1.5,
            }}
          >
            “Hey, feeling a little low/tired today and just thinking of you. No need to reply right away, just wanted to say hello.”
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() =>
                handleCopyMessage(
                  'Hey, feeling a little low/tired today and just thinking of you. No need to reply right away, just wanted to say hello.'
                )
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                background: 'rgba(20, 184, 166, 0.2)',
                border: '1px solid rgba(20, 184, 166, 0.4)',
                color: '#2dd4bf',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              {copiedMessage ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedMessage ? 'Message Copied!' : 'Copy Template Message'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Gentle Walk or Movement Nudge */}
      {activity.id === 'short-walk' && (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            background: 'rgba(11, 15, 23, 0.6)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {activity.steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#fbbf24',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Switcher & Skip Action Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {/* Switch to different activity pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Try another:</span>
          {allActivities
            .filter((a) => a.id !== activity.id)
            .map((a) => (
              <button
                key={a.id}
                onClick={() => onSelectDifferent(a)}
                style={{
                  padding: '4px 9px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.74rem',
                }}
              >
                {a.title.split(' ')[0]}
              </button>
            ))}
        </div>

        {/* Skip Activity */}
        <button
          onClick={onSkip}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '5px 11px',
            borderRadius: '8px',
            background: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
          }}
          title="Skip this activity and return"
        >
          <SkipForward size={14} />
          <span>Skip Activity</span>
        </button>
      </div>
    </div>
  );
};
