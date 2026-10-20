/**
 * DatasetService — Persistent, localStorage-backed training dataset.
 *
 * Every time a user confirms or corrects an emotion estimate, a TrainingSample
 * is appended. The stored dataset is then available for on-device ML training
 * via MLModelService.
 */

import type { AcousticFeatures, EmotionEstimate, EmotionType } from '../types';
import type { TrainingSample, DatasetStats } from '../types/dataset';
import { FEATURE_KEYS, EMOTION_LABELS } from '../types/dataset';

const STORAGE_KEY = 'aura_training_dataset_v1';
const META_KEY = 'aura_model_meta_v1';

interface ModelMeta {
  lastTrainedAt: number | null;
  trainedEpochs: number;
  mlModelAccuracy: number | null;
  totalSamplesAtLastTrain: number;
}

const DEFAULT_META: ModelMeta = {
  lastTrainedAt: null,
  trainedEpochs: 0,
  mlModelAccuracy: null,
  totalSamplesAtLastTrain: 0,
};

/** Normalisation ranges estimated from acoustic analysis outputs */
const FEATURE_RANGES: Record<keyof AcousticFeatures, [number, number]> = {
  avgEnergy:        [0, 0.5],
  peakEnergy:       [0, 1.0],
  energyVariance:   [0, 0.1],
  estimatedPitch:   [50, 400],
  pitchVariability: [0, 80],
  speakingPace:     [0, 6],
  pauseRatio:       [0, 1],
  spectralCentroid: [200, 4000],
  zeroCrossingRate: [0, 0.6],
  vocalJitter:      [0, 0.15],
  durationSeconds:  [0, 60],
};

/** Normalise a single feature value to [0, 1] */
function normalise(value: number, key: keyof AcousticFeatures): number {
  const [lo, hi] = FEATURE_RANGES[key];
  if (hi === lo) return 0;
  return Math.max(0, Math.min(1, (value - lo) / (hi - lo)));
}

export function buildFeatureVector(acoustics: AcousticFeatures): number[] {
  return FEATURE_KEYS.map((k) => normalise(acoustics[k], k));
}

export class DatasetService {
  // ── Read ──────────────────────────────────────────────────────────────────

  public static getAll(): TrainingSample[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as TrainingSample[]) : [];
    } catch {
      return [];
    }
  }

  private static getMeta(): ModelMeta {
    try {
      const raw = localStorage.getItem(META_KEY);
      return raw ? { ...DEFAULT_META, ...(JSON.parse(raw) as Partial<ModelMeta>) } : DEFAULT_META;
    } catch {
      return DEFAULT_META;
    }
  }

  private static saveMeta(meta: ModelMeta): void {
    try {
      localStorage.setItem(META_KEY, JSON.stringify(meta));
    } catch { /* ignore quota */ }
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  /**
   * Add a confirmed or corrected sample to the dataset.
   * Call this from App.tsx whenever the user confirms / corrects the emotion.
   */
  public static addSample(params: {
    acoustics: AcousticFeatures;
    transcript: string;
    estimate: EmotionEstimate;
    confirmedLabel: EmotionType;
    language: string;
  }): TrainingSample {
    const { acoustics, transcript, estimate, confirmedLabel, language } = params;

    const sample: TrainingSample = {
      id: `sample-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      features: buildFeatureVector(acoustics),
      acoustics,
      transcript: transcript.slice(0, 400), // cap for storage
      label: confirmedLabel,
      modelPrediction: estimate.primaryEmotion,
      wasCorrect: estimate.primaryEmotion === confirmedLabel,
      ruleBasedConfidence: estimate.confidence,
      language,
    };

    const all = this.getAll();
    all.push(sample);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      // If storage is full, evict the oldest 20 samples
      const trimmed = all.slice(-200);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed)); } catch { /* give up */ }
    }

    console.group('%c[Dataset] New sample added', 'color:#a78bfa;font-weight:bold');
    console.log('Label:', confirmedLabel, '| Was model correct?', sample.wasCorrect);
    console.log('Features:', sample.features.map((v, i) => `${FEATURE_KEYS[i]}=${v.toFixed(3)}`).join(', '));
    console.groupEnd();

    return sample;
  }

  /** Persist training result metadata */
  public static recordTrainingRun(params: {
    epochs: number;
    mlModelAccuracy: number;
    totalSamples: number;
  }): void {
    this.saveMeta({
      lastTrainedAt: Date.now(),
      trainedEpochs: params.epochs,
      mlModelAccuracy: params.mlModelAccuracy,
      totalSamplesAtLastTrain: params.totalSamples,
    });
  }

  /** Remove all samples and reset meta */
  public static clearAll(): void {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    try { localStorage.removeItem(META_KEY); } catch { /* ignore */ }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  public static getStats(): DatasetStats {
    const all = this.getAll();
    const meta = this.getMeta();

    const byEmotion = Object.fromEntries(
      EMOTION_LABELS.map((e) => [e, 0])
    ) as Record<EmotionType, number>;

    let correctCount = 0;
    for (const s of all) {
      byEmotion[s.label] = (byEmotion[s.label] ?? 0) + 1;
      if (s.wasCorrect) correctCount++;
    }

    return {
      total: all.length,
      byEmotion,
      modelAccuracy: all.length > 0 ? correctCount / all.length : 0,
      lastTrainedAt: meta.lastTrainedAt,
      trainedEpochs: meta.trainedEpochs,
      mlModelAccuracy: meta.mlModelAccuracy,
    };
  }

  /** Export the full dataset as a JSON file (downloads in browser) */
  public static exportJSON(): void {
    const data = this.getAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura_dataset_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Export as CSV for use in external tools */
  public static exportCSV(): void {
    const data = this.getAll();
    const header = ['id', 'timestamp', 'label', 'modelPrediction', 'wasCorrect', 'ruleBasedConfidence', 'language', 'transcript', ...FEATURE_KEYS].join(',');
    const rows = data.map((s) =>
      [
        s.id,
        s.timestamp,
        s.label,
        s.modelPrediction,
        s.wasCorrect,
        s.ruleBasedConfidence.toFixed(4),
        s.language,
        `"${s.transcript.replace(/"/g, '""')}"`,
        ...s.features.map((f) => f.toFixed(5)),
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura_dataset_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
