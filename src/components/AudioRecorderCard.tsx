import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Keyboard,
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import type { RecordingState } from '../services/audioRecorder';

interface AudioRecorderCardProps {
  recordingState: RecordingState;
  analyser: AnalyserNode | null;
  audioBlob: Blob | null;
  audioUrl: string | null;
  transcript: string;
  errorMessage: string | null;
  unclearAudioNotice: boolean;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onStopRecording: () => void;
  onDiscardRecording: () => void;
  onTranscriptChange: (newTranscript: string) => void;
  onAnalyzeAudio: () => void;
  isAnalyzing: boolean;
}

export const AudioRecorderCard: React.FC<AudioRecorderCardProps> = ({
  recordingState,
  analyser,
  audioBlob,
  audioUrl,
  transcript,
  errorMessage,
  unclearAudioNotice,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
  onDiscardRecording,
  onTranscriptChange,
  onAnalyzeAudio,
  isAnalyzing,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTypingMode, setIsTypingMode] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Timer while recording
  useEffect(() => {
    let interval: number | null = null;
    if (recordingState === 'recording') {
      interval = window.setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else if (recordingState === 'idle') {
      setSecondsElapsed(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingState]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTogglePlayAudio = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';
  const isRequesting = recordingState === 'requesting_permission';
  const hasAudioOrTranscript = !!audioBlob || transcript.trim().length > 0;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.75rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Card Header & Mode Switch */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Share Your Voice</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Speak freely or record a short reflection. Your audio stays right on your device.
          </p>
        </div>

        <button
          onClick={() => setIsTypingMode(!isTypingMode)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '6px 12px',
            borderRadius: '8px',
            background: isTypingMode ? 'rgba(20, 184, 166, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${isTypingMode ? 'rgba(20, 184, 166, 0.4)' : 'var(--border-subtle)'}`,
            color: isTypingMode ? '#2dd4bf' : 'var(--text-muted)',
            fontSize: '0.78rem',
            fontWeight: 500,
          }}
          title="Switch between microphone recording and typing text"
        >
          <Keyboard size={14} />
          <span>{isTypingMode ? 'Switch to Voice' : 'Type Instead'}</span>
        </button>
      </div>

      {/* Error or Permission Denied Notification */}
      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            fontSize: '0.82rem',
            marginBottom: '1rem',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Unclear Audio Notice */}
      {unclearAudioNotice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#fbbf24',
            fontSize: '0.82rem',
            marginBottom: '1rem',
          }}
        >
          <HelpCircle size={18} style={{ flexShrink: 0 }} />
          <span>
            The audio was slightly quiet or unclear. You can refine your transcript in the box below or re-record.
          </span>
        </div>
      )}

      {/* Waveform Visualizer & Timer Section */}
      {!isTypingMode && (
        <div
          style={{
            background: 'rgba(11, 15, 23, 0.6)',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: isRecording ? '#2dd4bf' : 'var(--text-muted)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {isRecording && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#f43f5e',
                    display: 'inline-block',
                    animation: 'breathingPulse 1.5s infinite',
                  }}
                />
              )}
              {isRequesting
                ? 'Requesting microphone permission...'
                : isRecording
                ? 'Listening to vocal cadence & tone...'
                : isPaused
                ? 'Recording paused'
                : audioBlob
                ? 'Voice recording captured'
                : 'Ready to listen'}
            </span>

            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: isRecording ? '#2dd4bf' : 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              {formatTime(secondsElapsed)}
            </span>
          </div>

          <AudioVisualizer analyser={analyser} isRecording={isRecording} isPlaying={isPlayingAudio} />
        </div>
      )}

      {/* Controls Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Main Record / Stop Orb Button */}
          {!isRecording && !isPaused ? (
            <button
              onClick={onStartRecording}
              disabled={isRequesting || isTypingMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.88rem',
                boxShadow: '0 4px 18px rgba(20, 184, 166, 0.45)',
              }}
              aria-label="Start recording voice"
            >
              <Mic size={18} />
              <span>{audioBlob ? 'Record Another' : 'Start Speaking'}</span>
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {/* Pause / Resume */}
              <button
                onClick={isPaused ? onResumeRecording : onPauseRecording}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.75rem 1.1rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              {/* Stop & Analyze */}
              <button
                onClick={onStopRecording}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
                }}
                aria-label="Stop recording"
              >
                <Square size={16} fill="white" />
                <span>Stop & Reflect</span>
              </button>
            </div>
          )}

          {/* Replay Audio Button if blob available */}
          {audioBlob && audioUrl && !isRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={handleTogglePlayAudio}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.75rem 1.1rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-subtle)',
                }}
                title="Replay your recorded audio message"
                aria-label={isPlayingAudio ? 'Pause playback' : 'Replay audio'}
              >
                {isPlayingAudio ? <Pause size={15} /> : <Play size={15} />}
                <span>{isPlayingAudio ? 'Pause Audio' : 'Replay Audio'}</span>
              </button>

              <audio
                ref={audioPlayerRef}
                src={audioUrl}
                onEnded={() => setIsPlayingAudio(false)}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>

        {/* Delete / Discard Control */}
        {hasAudioOrTranscript && !isRecording && (
          <button
            onClick={onDiscardRecording}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              background: 'transparent',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: '#fda4af',
              fontSize: '0.82rem',
            }}
            title="Immediately delete audio recording and transcript"
            aria-label="Delete recording"
          >
            <Trash2 size={15} />
            <span>Discard Recording</span>
          </button>
        )}
      </div>

      {/* Transcript Input / Editor Area */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.4rem',
          }}
        >
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {isRecording ? 'Live Speech Transcription (editable)' : 'Your Words (feel free to adjust):'}
          </label>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            {transcript.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder={
            isTypingMode
              ? 'How are you feeling right now? Type what is on your mind...'
              : 'Press "Start Speaking" and your words will appear here. You can also edit them anytime.'
          }
          rows={3}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: 'rgba(11, 15, 23, 0.75)',
            border: '1px solid var(--border-subtle)',
            color: '#f8fafc',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.92rem',
            lineHeight: 1.5,
            resize: 'vertical',
            outline: 'none',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.5)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
        />
      </div>

      {/* Manual "Analyze & Reflect" trigger button when words are entered */}
      {hasAudioOrTranscript && !isRecording && (
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onAnalyzeAudio}
            disabled={isAnalyzing || transcript.trim().length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.4rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Sparkles size={16} />
            <span>{isAnalyzing ? 'Reflecting on Audio...' : 'Generate Supportive Reflection'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
