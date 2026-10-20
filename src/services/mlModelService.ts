/**
 * MLModelService — On-device TensorFlow.js emotion classifier.
 *
 * Architecture: 11 acoustic features → Dense(32, relu) → Dropout(0.3)
 *               → Dense(16, relu) → Dense(8, softmax)  [8 emotion classes]
 *
 * The model is trained incrementally on user-labelled data stored by
 * DatasetService. When enough samples exist (≥ 10), training is triggered
 * automatically after each new confirmed label.
 *
 * The trained model is saved to IndexedDB via tf.io.browserLocalStorage so
 * it persists across browser refreshes.
 */

import * as tf from '@tensorflow/tfjs';
import type { AcousticFeatures, EmotionType } from '../types';
import type { TrainingResult } from '../types/dataset';
import { EMOTION_LABELS, FEATURE_KEYS } from '../types/dataset';
import { DatasetService, buildFeatureVector } from './datasetService';

const MODEL_STORAGE_KEY = 'localstorage://aura-emotion-model-v1';
const MIN_SAMPLES_TO_TRAIN = 10;
const NUM_FEATURES = FEATURE_KEYS.length; // 11
const NUM_CLASSES = EMOTION_LABELS.length; // 8

let cachedModel: tf.Sequential | null = null;
let isTraining = false;

// ── Model Builder ─────────────────────────────────────────────────────────────

function buildModel(): tf.Sequential {
  const model = tf.sequential();

  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu',
    inputShape: [NUM_FEATURES],
    kernelInitializer: 'glorotNormal',
  }));

  model.add(tf.layers.dropout({ rate: 0.3 }));

  model.add(tf.layers.dense({
    units: 16,
    activation: 'relu',
    kernelInitializer: 'glorotNormal',
  }));

  model.add(tf.layers.dense({
    units: NUM_CLASSES,
    activation: 'softmax',
  }));

  model.compile({
    optimizer: tf.train.adam(0.003),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
}

// ── One-hot encoding ──────────────────────────────────────────────────────────

function emotionToOneHot(emotion: EmotionType): number[] {
  const idx = EMOTION_LABELS.indexOf(emotion);
  return EMOTION_LABELS.map((_, i) => (i === idx ? 1 : 0));
}

// ── Public API ────────────────────────────────────────────────────────────────

export class MLModelService {
  /**
   * Load saved model from IndexedDB, or build a fresh one.
   */
  public static async loadOrCreateModel(): Promise<tf.Sequential> {
    if (cachedModel) return cachedModel;

    try {
      const loaded = await tf.loadLayersModel(MODEL_STORAGE_KEY);
      loaded.compile({
        optimizer: tf.train.adam(0.003),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
      });
      cachedModel = loaded as tf.Sequential;
      console.log('%c[ML] Loaded saved model from storage', 'color:#34d399;font-weight:bold');
    } catch {
      cachedModel = buildModel();
      console.log('%c[ML] Created fresh model (no saved weights found)', 'color:#fbbf24;font-weight:bold');
    }

    return cachedModel;
  }

  /**
   * Train the model on all stored dataset samples.
   * Returns null if not enough data is available.
   */
  public static async train(
    onEpochEnd?: (epoch: number, logs: tf.Logs) => void
  ): Promise<TrainingResult | null> {
    if (isTraining) {
      console.warn('[ML] Training already in progress, skipping.');
      return null;
    }

    const samples = DatasetService.getAll();
    if (samples.length < MIN_SAMPLES_TO_TRAIN) {
      console.log(`%c[ML] Not enough samples to train (${samples.length}/${MIN_SAMPLES_TO_TRAIN})`, 'color:#f87171');
      return null;
    }

    isTraining = true;
    const startMs = performance.now();

    try {
      const model = await this.loadOrCreateModel();

      // Build feature matrix and label matrix
      const xs = samples.map((s) => s.features);
      const ys = samples.map((s) => emotionToOneHot(s.label));

      const xsTensor = tf.tensor2d(xs, [xs.length, NUM_FEATURES]);
      const ysTensor = tf.tensor2d(ys, [ys.length, NUM_CLASSES]);

      const epochs = Math.min(80, Math.max(20, samples.length * 2));
      const validationSplit = samples.length >= 20 ? 0.2 : 0;

      console.group('%c[ML] Training started', 'color:#a78bfa;font-weight:bold');
      console.log(`Samples: ${samples.length} | Epochs: ${epochs} | ValSplit: ${validationSplit}`);

      const history = await model.fit(xsTensor, ysTensor, {
        epochs,
        batchSize: Math.max(4, Math.min(16, Math.floor(samples.length / 4))),
        validationSplit,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (onEpochEnd && logs) onEpochEnd(epoch, logs);
            if (epoch % 10 === 0 && logs) {
              console.log(`  Epoch ${epoch}: loss=${logs['loss']?.toFixed(4)} acc=${logs['acc']?.toFixed(4)}`);
            }
          },
        },
      });

      // Save trained model
      await model.save(MODEL_STORAGE_KEY);

      tf.dispose([xsTensor, ysTensor]);

      const lastEpoch = history.history;
      const lossArr = lastEpoch['loss'] as number[];
      const accArr = lastEpoch['acc'] as number[];
      const valLossArr = lastEpoch['val_loss'] as number[] | undefined;
      const valAccArr = lastEpoch['val_acc'] as number[] | undefined;

      const result: TrainingResult = {
        epochs,
        finalLoss: lossArr[lossArr.length - 1] ?? 0,
        finalAccuracy: accArr[accArr.length - 1] ?? 0,
        valLoss: valLossArr ? valLossArr[valLossArr.length - 1] : 0,
        valAccuracy: valAccArr ? valAccArr[valAccArr.length - 1] : accArr[accArr.length - 1] ?? 0,
        durationMs: performance.now() - startMs,
      };

      console.log(
        `[ML] Training complete — acc=${(result.finalAccuracy * 100).toFixed(1)}% valAcc=${(result.valAccuracy * 100).toFixed(1)}%`
      );
      console.groupEnd();

      // Persist metadata
      DatasetService.recordTrainingRun({
        epochs,
        mlModelAccuracy: result.valAccuracy,
        totalSamples: samples.length,
      });

      return result;
    } finally {
      isTraining = false;
    }
  }

  /**
   * Run inference on acoustic features. Returns predicted emotion + confidence
   * scores for all 8 classes (sorted by probability).
   */
  public static async predict(acoustics: AcousticFeatures): Promise<{
    emotion: EmotionType;
    confidence: number;
    allScores: Record<EmotionType, number>;
  } | null> {
    try {
      const model = await this.loadOrCreateModel();
      const samples = DatasetService.getAll();
      if (samples.length < MIN_SAMPLES_TO_TRAIN) return null; // not trained yet

      const features = buildFeatureVector(acoustics);
      const input = tf.tensor2d([features], [1, NUM_FEATURES]);
      const output = model.predict(input) as tf.Tensor;
      const scores = await output.data();
      tf.dispose([input, output]);

      const allScores = Object.fromEntries(
        EMOTION_LABELS.map((e, i) => [e, scores[i]])
      ) as Record<EmotionType, number>;

      // Pick top-1
      const bestIdx = Array.from(scores).reduce(
        (maxI, v, i) => (v > scores[maxI] ? i : maxI), 0
      );

      const result = {
        emotion: EMOTION_LABELS[bestIdx],
        confidence: scores[bestIdx],
        allScores,
      };

      console.group('%c[ML] Inference result', 'color:#38bdf8;font-weight:bold');
      console.table(
        Object.entries(allScores)
          .sort(([, a], [, b]) => b - a)
          .map(([emotion, prob]) => ({ emotion, probability: (prob * 100).toFixed(1) + '%' }))
      );
      console.groupEnd();

      return result;
    } catch (err) {
      console.error('[ML] Prediction failed:', err);
      return null;
    }
  }

  /** True once enough samples exist to trigger training */
  public static canTrain(): boolean {
    return DatasetService.getAll().length >= MIN_SAMPLES_TO_TRAIN;
  }

  public static isCurrentlyTraining(): boolean {
    return isTraining;
  }

  /** Delete saved model weights from storage */
  public static async deleteModel(): Promise<void> {
    try {
      await tf.io.removeModel(MODEL_STORAGE_KEY);
      cachedModel = null;
      console.log('[ML] Model deleted from storage.');
    } catch { /* ignore */ }
  }
}
