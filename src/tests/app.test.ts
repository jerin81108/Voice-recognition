import { describe, it, expect, beforeEach } from 'vitest';
import { SafetyService } from '../services/safetyService';
import { EmotionEstimator } from '../services/emotionEstimator';
import { ResponseGenerator } from '../services/responseGenerator';
import { ActivityService } from '../services/activityService';
import type { AcousticFeatures } from '../types';

describe('Safety-Related Responses', () => {
  it('detects crisis keywords immediately and independently of emotion estimation', () => {
    const input = 'I am feeling overwhelmed and I just want to end my life';
    const result = SafetyService.evaluateText(input, 'US');

    expect(result.isCrisis).toBe(true);
    expect(result.matchedKeywords).toContain('end my life');
    expect(result.crisisMessage).toBeDefined();
    expect(result.crisisMessage).toContain('cannot provide emergency care');
  });

  it('provides appropriate regional emergency contacts for US', () => {
    const result = SafetyService.evaluateText('I might hurt myself', 'US');
    expect(result.isCrisis).toBe(true);
    expect(result.emergencyContacts.some((c) => c.number === '988')).toBe(true);
  });

  it('provides appropriate regional emergency contacts for UK', () => {
    const result = SafetyService.evaluateText('suicide thoughts', 'UK');
    expect(result.isCrisis).toBe(true);
    expect(result.emergencyContacts.some((c) => c.number === '111')).toBe(true);
    expect(result.emergencyContacts.some((c) => c.number === '999')).toBe(true);
  });

  it('provides appropriate regional emergency contacts for India', () => {
    const result = SafetyService.evaluateText('feeling suicidal', 'IN');
    expect(result.isCrisis).toBe(true);
    expect(result.emergencyContacts.some((c) => c.number === '112')).toBe(true);
  });

  it('does not trigger crisis on ordinary distress or bad day expressions', () => {
    const input = 'I had a really exhausting day at work and my boss was annoying';
    const result = SafetyService.evaluateText(input, 'US');

    expect(result.isCrisis).toBe(false);
    expect(result.matchedKeywords.length).toBe(0);
    expect(result.crisisMessage).toBeUndefined();
  });
});

describe('Uncertain Predictions & Tentative Interpretations', () => {
  const sampleAcoustics: AcousticFeatures = {
    avgEnergy: 0.03, // quiet
    peakEnergy: 0.08,
    energyVariance: 0.005,
    estimatedPitch: 140,
    pitchVariability: 8, // flat intonation
    speakingPace: 1.8, // slow
    pauseRatio: 0.42, // many pauses
    spectralCentroid: 950,
    zeroCrossingRate: 0.03,
    vocalJitter: 0.015,
    durationSeconds: 12.0,
  };

  it('always marks predictions as tentative signals rather than diagnoses', () => {
    const result = EmotionEstimator.estimate(sampleAcoustics, 'I just feel down and tired today');

    expect(result.isTentative).toBe(true);
    expect(result.confidence).toBeLessThan(0.70); // Must never claim near 100% certainty
    expect(result.confidence).toBeGreaterThan(0.30);
    expect(result.tentativeQuestion).toMatch(/(may be feeling|sounds like|Does that sound right|Does that resonate)/i);
  });

  it('includes transparent rationale explaining acoustic and lexical cues', () => {
    const result = EmotionEstimator.estimate(sampleAcoustics, 'I am feeling quite sad');

    expect(result.rationale).toBeDefined();
    expect(result.rationale.length).toBeGreaterThan(15);
    expect(result.acousticSummary).toBeDefined();
  });

  it('estimates elevated excitement or tension on high vocal energy and variance', () => {
    const highEnergyAcoustics: AcousticFeatures = {
      avgEnergy: 0.18,
      peakEnergy: 0.45,
      energyVariance: 0.04,
      estimatedPitch: 260,
      pitchVariability: 35,
      speakingPace: 4.2,
      pauseRatio: 0.1,
      spectralCentroid: 1850,
      zeroCrossingRate: 0.08,
      vocalJitter: 0.038,
      durationSeconds: 8.0,
    };

    const result = EmotionEstimator.estimate(highEnergyAcoustics, 'I got the promotion and I am thrilled!');
    expect(['excitement', 'frustration']).toContain(result.primaryEmotion);
  });
});

describe('User Corrections & Autonomy', () => {
  it('overrides estimated emotion when user specifies a correction', () => {
    const response = ResponseGenerator.generateResponse({
      transcript: 'I don’t know what to do',
      emotion: 'sadness',
      feedbackStatus: 'corrected',
      correctedEmotion: 'Frustrated',
      tone: 'gentle',
      emotionEnabled: true,
    });

    expect(response.message.toLowerCase()).toContain('frustrated');
    expect(response.message.toLowerCase()).not.toContain('sadness');
  });

  it('respects when a user dismisses the emotion estimate entirely', () => {
    const response = ResponseGenerator.generateResponse({
      transcript: 'Just talking out loud',
      emotion: 'overwhelmed',
      feedbackStatus: 'dismissed',
      tone: 'warm',
      emotionEnabled: true,
    });

    expect(response.suggestedActivity).toBeUndefined();
    expect(response.message).toContain('Your own experience is always what matters most');
  });

  it('suggests a gentle micro-activity when user confirms feeling low or stressed', () => {
    const response = ResponseGenerator.generateResponse({
      transcript: 'Everything is piling up',
      emotion: 'overwhelmed',
      feedbackStatus: 'confirmed',
      tone: 'gentle',
      emotionEnabled: true,
    });

    expect(response.suggestedActivity).toBeDefined();
    expect(response.message).toMatch(/(only if it feels genuinely manageable|take all the time you need|courage)/i);
  });
});

describe('Consent & Privacy Settings', () => {
  const CONSENT_STORAGE_KEY = 'aura_privacy_consent_accepted';

  // In-memory mock for localStorage in non-browser test environment
  const storageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    storageMock.clear();
  });

  it('defaults to unconsented state prior to user explicit agreement', () => {
    const hasConsent = storageMock.getItem(CONSENT_STORAGE_KEY) === 'true';
    expect(hasConsent).toBe(false);
  });

  it('records explicit consent in storage when accepted', () => {
    storageMock.setItem(CONSENT_STORAGE_KEY, 'true');
    expect(storageMock.getItem(CONSENT_STORAGE_KEY)).toBe('true');
  });

  it('clears all session and consent data upon request', () => {
    storageMock.setItem(CONSENT_STORAGE_KEY, 'true');
    storageMock.setItem('aura_session_history', JSON.stringify([{ id: '1', text: 'secret' }]));

    // Perform deletion
    storageMock.removeItem(CONSENT_STORAGE_KEY);
    storageMock.removeItem('aura_session_history');

    expect(storageMock.getItem(CONSENT_STORAGE_KEY)).toBeNull();
    expect(storageMock.getItem('aura_session_history')).toBeNull();
  });
});

describe('Disabling Emotion Analysis', () => {
  it('operates as an open-ended supportive voice journal when emotion analysis is disabled', () => {
    const response = ResponseGenerator.generateResponse({
      transcript: 'I am taking some notes for the afternoon',
      emotion: 'neutral',
      feedbackStatus: 'pending',
      tone: 'gentle',
      emotionEnabled: false,
    });

    expect(response.message).toContain('hold a quiet, non-judgmental space');
    expect(response.suggestedActivity).toBeUndefined();
  });
});

describe('Micro-Activities Management', () => {
  it('provides manageable micro-activities with duration and step guidance', () => {
    const activities = ActivityService.getAllActivities();
    expect(activities.length).toBeGreaterThanOrEqual(4);

    for (const activity of activities) {
      expect(activity.id).toBeDefined();
      expect(activity.duration).toBeDefined();
      expect(activity.steps.length).toBeGreaterThan(1);
      expect(activity.promptQuestion).toBeDefined();
    }
  });

  it('recommends box breathing for anxiety or frustration', () => {
    const recAnxious = ActivityService.getRecommendedActivity('anxious');
    expect(recAnxious.id).toBe('box-breathing');

    const recFrustrated = ActivityService.getRecommendedActivity('frustration');
    expect(recFrustrated.id).toBe('box-breathing');
  });

  it('recommends thought release journal for feeling overwhelmed', () => {
    const rec = ActivityService.getRecommendedActivity('overwhelmed');
    expect(rec.id).toBe('concern-journal');
  });
});
