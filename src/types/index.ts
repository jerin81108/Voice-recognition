export type EmotionType =
  | 'calm'
  | 'sadness'
  | 'frustration'
  | 'excitement'
  | 'overwhelmed'
  | 'anxious'
  | 'tired'
  | 'neutral';

export interface AcousticFeatures {
  avgEnergy: number; // 0 - 1 (RMS amplitude)
  peakEnergy: number; // 0 - 1 (Dynamic peak)
  energyVariance: number; // Dynamics spread
  estimatedPitch: number; // Hz (Fundamental frequency F0)
  pitchVariability: number; // Pitch standard deviation / flat vs melodic
  speakingPace: number; // Syllables/bursts per active second
  pauseRatio: number; // 0 - 1 fraction of silence
  spectralCentroid: number; // Hz (Acoustic brightness / frequency center of mass)
  zeroCrossingRate: number; // Vocal friction / breathiness indicator
  vocalJitter: number; // Frame-to-frame pitch instability / tremor
  durationSeconds: number;
}

export interface LinguisticFeatures {
  wordCount: number;
  matchedKeywords: string[];
  negations: string[];
  intensifiers: string[];
  cognitiveLoadMarkers: string[];
}

export interface EmotionEstimate {
  primaryEmotion: EmotionType;
  confidence: number; // 0 - 1 (kept tentative, e.g. 0.40 - 0.72)
  secondaryEmotion?: EmotionType;
  allScores: Record<EmotionType, number>;
  linguisticDetails: LinguisticFeatures;
  tentativeQuestion: string; // e.g. "You may be feeling a little stressed. Does that sound right?"
  rationale: string; // Transparent acoustic and word indicators
  acousticSummary: string;
  isTentative: true;
}

export type FeedbackStatus = 'pending' | 'confirmed' | 'corrected' | 'dismissed';

export interface UserFeedback {
  status: FeedbackStatus;
  correctedEmotion?: string;
  userNotes?: string;
}

export type SupportiveTone = 'gentle' | 'reflective' | 'warm' | 'grounded';

export interface MicroActivity {
  id: string;
  title: string;
  category: 'breathing' | 'grounding' | 'journal' | 'movement' | 'connection';
  duration: string;
  description: string;
  promptQuestion: string;
  steps: string[];
}

export interface SupportiveResponse {
  id: string;
  message: string;
  suggestedActivity?: MicroActivity;
  tone: SupportiveTone;
  isCrisisResponse?: boolean;
}

export interface EmergencyContact {
  name: string;
  number: string;
  description: string;
  url?: string;
}

export interface SafetyEvaluation {
  isCrisis: boolean;
  matchedKeywords: string[];
  crisisMessage?: string;
  emergencyContacts: EmergencyContact[];
}

export interface AppSettings {
  emotionAnalysisEnabled: boolean;
  supportiveTone: SupportiveTone;
  autoReadAloud: boolean;
  storeSessionHistory: boolean;
  preferredRegion: 'US' | 'UK' | 'CA' | 'IN' | 'INTL';
  speechLanguage: string; // e.g. 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'hi-IN', etc.
}

export interface VoiceSessionRecord {
  id: string;
  timestamp: number;
  duration: number;
  audioBlob?: Blob;
  audioUrl?: string;
  transcript: string;
  acoustics?: AcousticFeatures;
  emotionEstimate?: EmotionEstimate;
  userFeedback?: UserFeedback;
  response?: SupportiveResponse;
  safety: SafetyEvaluation;
}
