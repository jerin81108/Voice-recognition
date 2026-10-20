import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ConsentBannerModal } from './components/ConsentBannerModal';
import { AudioRecorderCard } from './components/AudioRecorderCard';
import { EmotionInterpretationCard } from './components/EmotionInterpretationCard';
import { SupportiveResponseCard } from './components/SupportiveResponseCard';
import { MicroActivityWidget } from './components/MicroActivityWidget';
import { CrisisSupportModal } from './components/CrisisSupportModal';
import { ModelLimitationsModal } from './components/ModelLimitationsModal';
import { SettingsModal } from './components/SettingsModal';

import { AudioRecorderService } from './services/audioRecorder';
import type { RecordingState } from './services/audioRecorder';
import { TranscriptionService } from './services/transcriptionService';
import { AcousticAnalyzer } from './services/acousticAnalyzer';
import { EmotionEstimator } from './services/emotionEstimator';
import { ResponseGenerator } from './services/responseGenerator';
import { SafetyService } from './services/safetyService';
import { DiagnosticsLogger } from './services/diagnosticsLogger';
import type {
  AcousticFeatures,
  AppSettings,
  EmotionEstimate,
  MicroActivity,
  SupportiveResponse,
  SupportiveTone,
  UserFeedback,
} from './types';

const DEFAULT_SETTINGS: AppSettings = {
  emotionAnalysisEnabled: true,
  supportiveTone: 'gentle',
  autoReadAloud: false,
  storeSessionHistory: false,
  preferredRegion: 'US',
  speechLanguage: 'en-US',
};

export const App: React.FC = () => {
  // Settings & Consent State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('aura_app_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [hasConsent, setHasConsent] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aura_privacy_consent_accepted') === 'true';
    } catch {
      return false;
    }
  });

  // Modals visibility
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(!hasConsent);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isLimitationsModalOpen, setIsLimitationsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Audio & Recording State
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unclearAudioNotice, setUnclearAudioNotice] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analysis & Reflection State
  const [acoustics, setAcoustics] = useState<AcousticFeatures | undefined>(undefined);
  const [emotionEstimate, setEmotionEstimate] = useState<EmotionEstimate | undefined>(undefined);
  const [userFeedback, setUserFeedback] = useState<UserFeedback>({ status: 'pending' });
  const [response, setResponse] = useState<SupportiveResponse | undefined>(undefined);
  const [activeActivity, setActiveActivity] = useState<MicroActivity | undefined>(undefined);
  const [crisisAlertMessage, setCrisisAlertMessage] = useState<string | undefined>(undefined);

  // Services references
  const recorderRef = useRef<AudioRecorderService | null>(null);
  const transcriberRef = useRef<TranscriptionService | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  // Initialize services
  useEffect(() => {
    recorderRef.current = new AudioRecorderService({
      onStateChange: (state) => {
        setRecordingState(state);
        if (recorderRef.current) {
          setAnalyserNode(recorderRef.current.getAnalyser());
        }
      },
      onAudioDataAvailable: (blob) => {
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      },
      onError: (msg) => {
        setErrorMessage(msg);
      },
    });

    transcriberRef.current = new TranscriptionService(
      {
        onInterimText: (interim) => {
          setTranscript((prev) => {
            const parts = prev.split(' ');
            parts.pop();
            return (parts.join(' ') + ' ' + interim).trim();
          });
        },
        onFinalText: (finalText) => {
          setTranscript(finalText);
        },
        onError: (err) => {
          if (err.includes('no-speech')) {
            setUnclearAudioNotice(true);
          } else {
            setErrorMessage(err);
          }
        },
      },
      settings.speechLanguage || 'en-US'
    );

    return () => {
      if (recorderRef.current) {
        recorderRef.current.discardRecording();
      }
      if (transcriberRef.current) {
        transcriberRef.current.reset();
      }
    };
  }, []);

  // Update transcriber language if user changes speech language in settings
  useEffect(() => {
    if (transcriberRef.current && settings.speechLanguage) {
      transcriberRef.current.setLanguage(settings.speechLanguage);
    }
  }, [settings.speechLanguage]);

  // Save settings when changed
  useEffect(() => {
    try {
      localStorage.setItem('aura_app_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Handle Consent
  const handleAcceptConsent = () => {
    try {
      localStorage.setItem('aura_privacy_consent_accepted', 'true');
    } catch {
      // ignore
    }
    setHasConsent(true);
    setIsConsentModalOpen(false);
  };

  // Recording Controls
  const handleStartRecording = async () => {
    setErrorMessage(null);
    setUnclearAudioNotice(false);
    // Clear previous responses for new recording
    setEmotionEstimate(undefined);
    setResponse(undefined);
    setActiveActivity(undefined);
    setUserFeedback({ status: 'pending' });

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);

    await recorderRef.current?.startRecording();
    transcriberRef.current?.start();
  };

  const handlePauseRecording = () => {
    recorderRef.current?.pauseRecording();
  };

  const handleResumeRecording = () => {
    recorderRef.current?.resumeRecording();
  };

  const handleStopRecording = async () => {
    const finalSpeech = transcriberRef.current?.stop() || '';
    if (finalSpeech && !transcript) {
      setTranscript(finalSpeech);
    }
    const blob = await recorderRef.current?.stopRecording();
    if (blob) {
      analyzeVoiceAndWords(blob, transcript || finalSpeech);
    } else if (transcript || finalSpeech) {
      analyzeVoiceAndWords(null, transcript || finalSpeech);
    }
  };

  const handleDiscardRecording = () => {
    recorderRef.current?.discardRecording();
    transcriberRef.current?.reset();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);
    setTranscript('');
    setErrorMessage(null);
    setUnclearAudioNotice(false);
    setEmotionEstimate(undefined);
    setResponse(undefined);
    setActiveActivity(undefined);
    setUserFeedback({ status: 'pending' });
    setAnalyserNode(null);
  };

  // Main Analysis Pipeline
  const analyzeVoiceAndWords = async (blob: Blob | null, textContent: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      // 1. Safety Check (Evaluated immediately & independently of emotion analysis)
      const safetyEval = SafetyService.evaluateText(textContent, settings.preferredRegion);
      if (safetyEval.isCrisis) {
        setCrisisAlertMessage(safetyEval.crisisMessage);
        setIsCrisisModalOpen(true);
      }

      // 2. Acoustic Feature Extraction (if blob available)
      let acousticMetrics: AcousticFeatures | undefined = undefined;
      if (blob && blob.size > 0) {
        try {
          const audioBuffer = await AcousticAnalyzer.decodeBlobToAudioBuffer(blob);
          acousticMetrics = await AcousticAnalyzer.analyzeAudioBuffer(audioBuffer);
          setAcoustics(acousticMetrics);

          // Check if audio was faint or unintelligible
          if (acousticMetrics.avgEnergy < 0.015 && textContent.trim().length === 0) {
            setUnclearAudioNotice(true);
          }
        } catch {
          // Decoding failed or synthetic test audio
        }
      }

      // 3. Emotion Estimation (Only if enabled in settings)
      let estimate: EmotionEstimate | undefined = undefined;
      if (settings.emotionAnalysisEnabled) {
        estimate = EmotionEstimator.estimate(acousticMetrics, textContent);
        setEmotionEstimate(estimate);
      } else {
        setEmotionEstimate(undefined);
      }

      // 4. Generate Initial Supportive Response
      const initialResponse = ResponseGenerator.generateResponse({
        transcript: textContent,
        emotion: estimate?.primaryEmotion,
        feedbackStatus: 'pending',
        tone: settings.supportiveTone,
        emotionEnabled: settings.emotionAnalysisEnabled,
      });

      setResponse(initialResponse);
      if (initialResponse.suggestedActivity) {
        setActiveActivity(initialResponse.suggestedActivity);
      }

      // Log full suggestion pipeline and data breakdown to browser console
      DiagnosticsLogger.logPipelineRun({
        audioBlob: blob,
        transcript: textContent,
        acoustics: acousticMetrics,
        emotionEstimate: estimate,
        response: initialResponse,
        userFeedback: { status: 'pending' },
        selectedTone: settings.supportiveTone,
        suggestedActivity: initialResponse.suggestedActivity,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error analyzing audio';
      setErrorMessage(`Reflection error: ${msg}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // User Feedback Handlers (Tentative Interpretation Check-in)
  const handleConfirmEmotion = () => {
    const feedback: UserFeedback = { status: 'confirmed' };
    setUserFeedback(feedback);
    if (!emotionEstimate) return;

    const newResponse = ResponseGenerator.generateResponse({
      transcript,
      emotion: emotionEstimate.primaryEmotion,
      feedbackStatus: 'confirmed',
      tone: settings.supportiveTone,
      emotionEnabled: settings.emotionAnalysisEnabled,
    });
    setResponse(newResponse);
    if (newResponse.suggestedActivity) {
      setActiveActivity(newResponse.suggestedActivity);
    }

    DiagnosticsLogger.logPipelineRun({
      audioBlob,
      transcript,
      acoustics,
      emotionEstimate,
      response: newResponse,
      userFeedback: feedback,
      selectedTone: settings.supportiveTone,
      suggestedActivity: newResponse.suggestedActivity,
    });
  };

  const handleCorrectEmotion = (correctedEmotion: string) => {
    const feedback: UserFeedback = { status: 'corrected', correctedEmotion };
    setUserFeedback(feedback);

    const newResponse = ResponseGenerator.generateResponse({
      transcript,
      emotion: emotionEstimate?.primaryEmotion,
      feedbackStatus: 'corrected',
      correctedEmotion,
      tone: settings.supportiveTone,
      emotionEnabled: settings.emotionAnalysisEnabled,
    });
    setResponse(newResponse);
    if (newResponse.suggestedActivity) {
      setActiveActivity(newResponse.suggestedActivity);
    }

    DiagnosticsLogger.logPipelineRun({
      audioBlob,
      transcript,
      acoustics,
      emotionEstimate,
      response: newResponse,
      userFeedback: feedback,
      selectedTone: settings.supportiveTone,
      suggestedActivity: newResponse.suggestedActivity,
    });
  };

  const handleDismissEmotion = () => {
    const feedback: UserFeedback = { status: 'dismissed' };
    setUserFeedback(feedback);
    const newResponse = ResponseGenerator.generateResponse({
      transcript,
      emotion: emotionEstimate?.primaryEmotion,
      feedbackStatus: 'dismissed',
      tone: settings.supportiveTone,
      emotionEnabled: settings.emotionAnalysisEnabled,
    });
    setResponse(newResponse);
    setActiveActivity(undefined);

    DiagnosticsLogger.logPipelineRun({
      audioBlob,
      transcript,
      acoustics,
      emotionEstimate,
      response: newResponse,
      userFeedback: feedback,
      selectedTone: settings.supportiveTone,
      suggestedActivity: undefined,
    });
  };

  // Clear all data
  const handleClearAllData = () => {
    try {
      localStorage.removeItem('aura_app_settings');
      localStorage.removeItem('aura_privacy_consent_accepted');
    } catch {
      // ignore
    }
    handleDiscardRecording();
    setSettings(DEFAULT_SETTINGS);
    setHasConsent(false);
    setIsConsentModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenCrisis={() => setIsCrisisModalOpen(true)}
        onOpenLimitations={() => setIsLimitationsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          maxWidth: '820px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.5rem 4rem',
        }}
      >
        {/* Intro banner */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2.1rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 50%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem',
            }}
          >
            A Gentle Space to Be Heard
          </h1>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto' }}>
            Speak freely in your natural voice. Aura listens gently, reflects tentative cues without judgment,
            and offers manageable support when you need it.
          </p>
        </div>

        {/* Audio Recording & Speech Card */}
        <AudioRecorderCard
          recordingState={recordingState}
          analyser={analyserNode}
          audioBlob={audioBlob}
          audioUrl={audioUrl}
          transcript={transcript}
          errorMessage={errorMessage}
          unclearAudioNotice={unclearAudioNotice}
          onStartRecording={handleStartRecording}
          onPauseRecording={handlePauseRecording}
          onResumeRecording={handleResumeRecording}
          onStopRecording={handleStopRecording}
          onDiscardRecording={handleDiscardRecording}
          onTranscriptChange={setTranscript}
          onAnalyzeAudio={() => analyzeVoiceAndWords(audioBlob, transcript)}
          isAnalyzing={isAnalyzing}
        />

        {/* Tentative Emotion Interpretation Card (Shown only when emotion analysis is enabled) */}
        {settings.emotionAnalysisEnabled && emotionEstimate && (
          <EmotionInterpretationCard
            estimate={emotionEstimate}
            acoustics={acoustics}
            feedback={userFeedback}
            onConfirm={handleConfirmEmotion}
            onCorrect={handleCorrectEmotion}
            onDismiss={handleDismissEmotion}
          />
        )}

        {/* Supportive Response Card */}
        {response && (
          <SupportiveResponseCard
            response={response}
            currentTone={settings.supportiveTone}
            onChangeTone={(tone: SupportiveTone) => {
              setSettings({ ...settings, supportiveTone: tone });
              if (response) {
                const updated = ResponseGenerator.generateResponse({
                  transcript,
                  emotion: emotionEstimate?.primaryEmotion,
                  feedbackStatus: userFeedback.status,
                  correctedEmotion: userFeedback.correctedEmotion,
                  tone,
                  emotionEnabled: settings.emotionAnalysisEnabled,
                });
                setResponse(updated);
              }
            }}
          />
        )}

        {/* Micro-Activity Widget (Suggested when user confirms low or selects an activity) */}
        {activeActivity && (
          <MicroActivityWidget
            activity={activeActivity}
            onSkip={() => setActiveActivity(undefined)}
            onSelectDifferent={(newActivity) => setActiveActivity(newActivity)}
            onClose={() => setActiveActivity(undefined)}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.5rem',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-dim)',
          background: 'rgba(11, 15, 23, 0.5)',
        }}
      >
        <p>
          Aura is an automated supportive companion, not a medical or psychological diagnosis tool. All audio is processed locally on your machine.
        </p>
      </footer>

      {/* Modals */}
      <ConsentBannerModal
        isOpen={isConsentModalOpen}
        onAccept={handleAcceptConsent}
        onOpenSettings={() => {
          setIsConsentModalOpen(false);
          setIsSettingsModalOpen(true);
        }}
      />

      <CrisisSupportModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        selectedRegion={settings.preferredRegion}
        onSelectRegion={(reg) => setSettings({ ...settings, preferredRegion: reg })}
        customCrisisMessage={crisisAlertMessage}
      />

      <ModelLimitationsModal
        isOpen={isLimitationsModalOpen}
        onClose={() => setIsLimitationsModalOpen(false)}
        onDisableEmotionAnalysis={() =>
          setSettings({
            ...settings,
            emotionAnalysisEnabled: !settings.emotionAnalysisEnabled,
          })
        }
        emotionEnabled={settings.emotionAnalysisEnabled}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
};

export default App;
