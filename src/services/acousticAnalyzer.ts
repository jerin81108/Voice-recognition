import type { AcousticFeatures } from '../types';

export class AcousticAnalyzer {
  /**
   * Analyzes an AudioBuffer and extracts comprehensive acoustic metrics:
   * - RMS energy, Peak energy & Energy Variance
   * - Pitch estimation (autocorrelation) & Pitch Variability (F0 SD)
   * - Speaking pace & Pause/Silence ratio
   * - Spectral Centroid (acoustic brightness / frequency center of mass)
   * - Zero Crossing Rate (ZCR / breathiness & friction)
   * - Vocal Jitter (short-term pitch perturbation / vocal stability)
   */
  public static async analyzeAudioBuffer(audioBuffer: AudioBuffer): Promise<AcousticFeatures> {
    const rawData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;

    if (rawData.length === 0 || duration === 0) {
      return {
        avgEnergy: 0,
        peakEnergy: 0,
        energyVariance: 0,
        estimatedPitch: 0,
        pitchVariability: 0,
        speakingPace: 0,
        pauseRatio: 1,
        spectralCentroid: 0,
        zeroCrossingRate: 0,
        vocalJitter: 0,
        durationSeconds: 0,
      };
    }

    const frameSize = Math.floor(sampleRate * 0.03); // 30ms frames
    const hopSize = Math.floor(sampleRate * 0.015); // 15ms hop
    const numFrames = Math.floor((rawData.length - frameSize) / hopSize);

    if (numFrames <= 0) {
      return {
        avgEnergy: 0.1,
        peakEnergy: 0.2,
        energyVariance: 0.01,
        estimatedPitch: 180,
        pitchVariability: 10,
        speakingPace: 2.5,
        pauseRatio: 0.2,
        spectralCentroid: 1200,
        zeroCrossingRate: 0.05,
        vocalJitter: 0.02,
        durationSeconds: duration,
      };
    }

    const frameEnergies: number[] = [];
    const pitches: number[] = [];
    const centroids: number[] = [];
    const zcrList: number[] = [];
    let silentFrames = 0;
    let voiceBursts = 0;
    let inVoiceBurst = false;

    for (let i = 0; i < numFrames; i++) {
      const start = i * hopSize;
      let sumSq = 0;
      let zeroCrossings = 0;
      let prevVal = rawData[start];

      for (let j = 0; j < frameSize; j++) {
        const val = rawData[start + j];
        sumSq += val * val;

        // Zero-crossing detection
        if ((val >= 0 && prevVal < 0) || (val < 0 && prevVal >= 0)) {
          zeroCrossings++;
        }
        prevVal = val;
      }

      const rms = Math.sqrt(sumSq / frameSize);
      frameEnergies.push(rms);
      const frameZcr = zeroCrossings / frameSize;
      zcrList.push(frameZcr);

      // Voice activity threshold
      const isVoice = rms > 0.015;
      if (!isVoice) {
        silentFrames++;
        if (inVoiceBurst) {
          inVoiceBurst = false;
        }
      } else {
        if (!inVoiceBurst) {
          inVoiceBurst = true;
          voiceBursts++;
        }

        const frame = rawData.subarray(start, start + frameSize);

        // 1. Estimate pitch
        const pitch = this.estimatePitchAutocorrelation(frame, sampleRate);
        if (pitch > 65 && pitch < 500) {
          pitches.push(pitch);
        }

        // 2. Estimate spectral centroid
        const centroid = this.estimateSpectralCentroid(frame, sampleRate);
        if (centroid > 0) {
          centroids.push(centroid);
        }
      }
    }

    // Energy stats
    const avgEnergy = frameEnergies.reduce((a, b) => a + b, 0) / frameEnergies.length;
    const peakEnergy = Math.max(...frameEnergies, 0);
    const energyVariance =
      frameEnergies.reduce((acc, val) => acc + Math.pow(val - avgEnergy, 2), 0) / frameEnergies.length;

    // Pause ratio
    const pauseRatio = silentFrames / numFrames;

    // Pitch stats & Vocal Jitter
    let avgPitch = 160;
    let pitchVariability = 15;
    let vocalJitter = 0.02;

    if (pitches.length > 3) {
      avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;
      pitchVariability = Math.sqrt(
        pitches.reduce((acc, p) => acc + Math.pow(p - avgPitch, 2), 0) / pitches.length
      );

      // Calculate Jitter (frame-to-frame pitch perturbation)
      let diffSum = 0;
      for (let p = 1; p < pitches.length; p++) {
        diffSum += Math.abs(pitches[p] - pitches[p - 1]);
      }
      vocalJitter = pitches.length > 1 ? diffSum / ((pitches.length - 1) * avgPitch) : 0.02;
    }

    // Average Spectral Centroid & ZCR
    const avgCentroid =
      centroids.length > 0 ? centroids.reduce((a, b) => a + b, 0) / centroids.length : 1200;
    const avgZcr = zcrList.reduce((a, b) => a + b, 0) / zcrList.length;

    // Speaking pace estimate (bursts per active second)
    const activeSeconds = Math.max(0.5, duration * (1 - pauseRatio));
    const speakingPace = Number((voiceBursts / activeSeconds).toFixed(2));

    return {
      avgEnergy: Number(avgEnergy.toFixed(3)),
      peakEnergy: Number(peakEnergy.toFixed(3)),
      energyVariance: Number(energyVariance.toFixed(4)),
      estimatedPitch: Math.round(avgPitch),
      pitchVariability: Math.round(pitchVariability),
      speakingPace,
      pauseRatio: Number(pauseRatio.toFixed(2)),
      spectralCentroid: Math.round(avgCentroid),
      zeroCrossingRate: Number(avgZcr.toFixed(3)),
      vocalJitter: Number(vocalJitter.toFixed(3)),
      durationSeconds: Number(duration.toFixed(1)),
    };
  }

  /**
   * Estimates spectral centroid (brightness/frequency center of mass) via discrete Fourier magnitude.
   */
  private static estimateSpectralCentroid(buffer: Float32Array, sampleRate: number): number {
    const N = Math.min(256, buffer.length);
    let weightedSum = 0;
    let totalMagnitude = 0;

    for (let k = 1; k < N / 2; k++) {
      let real = 0;
      let imag = 0;
      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N;
        real += buffer[n] * Math.cos(angle);
        imag -= buffer[n] * Math.sin(angle);
      }
      const magnitude = Math.sqrt(real * real + imag * imag);
      const frequency = (k * sampleRate) / N;

      weightedSum += frequency * magnitude;
      totalMagnitude += magnitude;
    }

    return totalMagnitude > 1e-4 ? weightedSum / totalMagnitude : 1000;
  }

  /**
   * Fast normalized autocorrelation for fundamental frequency estimation.
   */
  private static estimatePitchAutocorrelation(buffer: Float32Array, sampleRate: number): number {
    const minPeriod = Math.floor(sampleRate / 500); // 500 Hz max
    const maxPeriod = Math.floor(sampleRate / 65); // 65 Hz min
    let bestR = 0;
    let bestPeriod = -1;

    let energy0 = 0;
    for (let i = 0; i < buffer.length; i++) {
      energy0 += buffer[i] * buffer[i];
    }
    if (energy0 < 1e-4) return 0;

    for (let period = minPeriod; period <= maxPeriod; period++) {
      let sum = 0;
      let energyShifted = 0;
      for (let i = 0; i < buffer.length - period; i++) {
        sum += buffer[i] * buffer[i + period];
        energyShifted += buffer[i + period] * buffer[i + period];
      }
      const norm = Math.sqrt(energy0 * energyShifted);
      const r = norm > 0 ? sum / norm : 0;
      if (r > bestR && r > 0.45) {
        bestR = r;
        bestPeriod = period;
      }
    }

    if (bestPeriod > 0) {
      return sampleRate / bestPeriod;
    }
    return 0;
  }

  /**
   * Decodes an audio blob into an AudioBuffer using an AudioContext.
   */
  public static async decodeBlobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    try {
      return await audioCtx.decodeAudioData(arrayBuffer);
    } finally {
      if (audioCtx.state !== 'closed') {
        await audioCtx.close();
      }
    }
  }
}
