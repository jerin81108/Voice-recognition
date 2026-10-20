/**
 * Dataset types for on-device ML training.
 * Every confirmed/corrected session is stored as a TrainingSample.
 */

import type { AcousticFeatures, EmotionType } from './index';

/** A single training record stored in the dataset */
export interface TrainingSample {
  id: string;
  timestamp: number;
  /** Normalised feature vector (11 acoustic features) */
  features: number[];
  /** Raw acoustic snapshot for human-readable display */
  acoustics: AcousticFeatures;
  /** Transcript at the time of recording */
  transcript: string;
  /** The label the user confirmed or corrected to */
  label: EmotionType;
  /** What the rule-based model initially predicted */
  modelPrediction: EmotionType;
  /** Whether user confirmed (true) or had to correct (false) */
  wasCorrect: boolean;
  /** Confidence the rule-based estimator produced */
  ruleBasedConfidence: number;
  /** Language the session was recorded in */
  language: string;
}

/** Aggregated stats for the dataset viewer */
export interface DatasetStats {
  total: number;
  byEmotion: Record<EmotionType, number>;
  modelAccuracy: number; // fraction of wasCorrect samples
  lastTrainedAt: number | null; // epoch ms, null = never trained
  trainedEpochs: number;
  mlModelAccuracy: number | null; // val accuracy from last training run
}

/** Result returned after a training run */
export interface TrainingResult {
  epochs: number;
  finalLoss: number;
  finalAccuracy: number;
  valLoss: number;
  valAccuracy: number;
  durationMs: number;
}

/** Feature vector order used when building tensors (keep in sync with mlModelService) */
export const FEATURE_KEYS: (keyof AcousticFeatures)[] = [
  'avgEnergy',
  'peakEnergy',
  'energyVariance',
  'estimatedPitch',
  'pitchVariability',
  'speakingPace',
  'pauseRatio',
  'spectralCentroid',
  'zeroCrossingRate',
  'vocalJitter',
  'durationSeconds',
];

export const EMOTION_LABELS: EmotionType[] = [
  'calm',
  'sadness',
  'frustration',
  'excitement',
  'overwhelmed',
  'anxious',
  'tired',
  'neutral',
];
