import type { AcousticFeatures, EmotionEstimate, EmotionType, LinguisticFeatures } from '../types';

interface EmotionLexicon {
  sadness: string[];
  frustration: string[];
  excitement: string[];
  calm: string[];
  overwhelmed: string[];
  anxious: string[];
  tired: string[];
}

const EMOTION_KEYWORDS: EmotionLexicon = {
  sadness: [
    // English
    'sad', 'unhappy', 'down', 'crying', 'depressed', 'gloomy', 'lonely', 'heartbroken', 'hopeless',
    'miss', 'lost', 'sorrow', 'hurt', 'hurting', 'empty', 'grief', 'tearful', 'miserable', 'numb',
    // Tamil (transliterated as ASR outputs roman or native script)
    'ଵலி', 'அழுது', 'தனிமை', 'ஜீவிதமே வேண்டாம்', 'ஈருக்கிரென்',
    'vali', 'azhuhu', 'azhugirom', 'dhaniyam illai', 'thanimai', 'varutha', 'vaedhana'
  ],
  frustration: [
    // English
    'frustrated', 'annoyed', 'angry', 'mad', 'irritated', 'fed up', 'hate', 'furious', 'sick of',
    'unfair', 'stuck', 'impatient', 'bothering', 'grr', 'pissed', 'resentful', 'snapped',
    // Tamil
    'கோபமான', 'கேவலமான', 'குழப்பமான', 'எரிச்சலான',
    'kopam', 'kopamana', 'kevalama', 'erichal', 'paithiyam', 'venmana'
  ],
  excitement: [
    // English
    'excited', 'happy', 'great', 'awesome', 'amazing', 'thrilled', 'yay', 'wonderful', 'proud',
    'fantastic', 'celebrate', 'delighted', 'energetic', 'love it', 'joyful', 'pumped', 'hyped',
    // Tamil
    'சந்தோஷமான', 'மகிழ்ச்சி', 'மகிழ்ச்சியான',
    'sandhosham', 'magizchi', 'magilchi', 'nanmai', 'anandham', 'superba', 'arumai'
  ],
  calm: [
    // English
    'calm', 'peaceful', 'relaxed', 'okay', 'fine', 'grounded', 'content', 'quiet', 'rested',
    'steady', 'breathe', 'centered', 'gentle', 'serene', 'tranquil', 'chill', 'soothing',
    // Tamil
    'அமைதியான', 'சீரான', 'ஸமா஧ானமான',
    'amaidhiyana', 'serana', 'samadhanam', 'nimmadhi', 'oray', 'bayamillai'
  ],
  overwhelmed: [
    // English
    'overwhelmed', 'too much', 'swamped', 'drowning', 'cannot handle', 'burden', 'stress', 'stressed',
    'burnout', 'crushed', 'exhausting', 'spinning', 'overload', 'piling up', 'too many things', 'breaking point',
    // Tamil
    'மிகவும் கஷ்டமான', 'செய்ய முடியவில்லை',
    'migavum kashtam', 'seiya mudiyavillai', 'thangala', 'paaram', 'stress aagirean'
  ],
  anxious: [
    // English
    'anxious', 'nervous', 'worried', 'panic', 'scared', 'fear', 'dread', 'tense', 'restless',
    'uneasy', 'frightened', 'overthinking', 'jitters', 'racing thoughts', 'apprehensive', 'on edge',
    // Tamil
    'பயமான', 'பதற்றமான', 'கவலை', 'வெருப்பமான',
    'bayamana', 'padhrama', 'kavalai', 'tension aagirean', 'nerveosa'
  ],
  tired: [
    // English
    'tired', 'exhausted', 'sleepy', 'drained', 'fatigued', 'heavy', 'no energy', 'worn out',
    'sleep', 'rest', 'lethargic', 'sluggish', 'depleted', 'wiped out', 'run down',
    // Tamil
    'களைப்பான', 'தூக்கமான', 'சோர்வான',
    'kalaipu', 'kalappu', 'thugamana', 'sorvana', 'oivu vendam', 'oivu thevaippadugirean'
  ],
};

const NEGATION_WORDS = [
  // English
  'not', "n't", 'never', 'barely', 'hardly', 'no longer', 'cannot', "can't",
  // Tamil transliterated negations
  'illai', 'mudiyavillai', 'vendam', 'inda', 'onnum illai',
];
const INTENSIFIER_WORDS = [
  // English
  'very', 'extremely', 'so', 'really', 'super', 'completely', 'totally', 'deeply', 'terribly',
  // Tamil transliterated intensifiers
  'romba', 'miga', 'migavum', 'muzhuvathum', 'mikka',
];
const COGNITIVE_LOAD_PHRASES = [
  'too much', 'swamped', 'piling up', 'cannot keep up', 'head spinning', 'burnout', 'overload',
  // Tamil
  'seiya mudiyavillai', 'thangala', 'migavum kashtam', 'stress aagirean',
];

export class EmotionEstimator {
  /**
   * Evaluates EVERY provided acoustic metric and linguistic data point
   * to produce a well-calibrated, tentative multimodal estimation.
   */
  public static estimate(
    acoustics?: AcousticFeatures,
    transcript?: string
  ): EmotionEstimate {
    const scores: Record<EmotionType, number> = {
      calm: 0.15,
      sadness: 0.1,
      frustration: 0.1,
      excitement: 0.1,
      overwhelmed: 0.1,
      anxious: 0.1,
      tired: 0.1,
      neutral: 0.15,
    };

    const acousticCuesList: string[] = [];
    const matchedKeywords: string[] = [];
    const detectedNegations: string[] = [];
    const detectedIntensifiers: string[] = [];
    const detectedCognitiveLoad: string[] = [];

    // --- 1. Comprehensive Acoustic Feature Integration ---
    if (acoustics && acoustics.durationSeconds > 0) {
      // 1a. Energy & Dynamics
      if (acoustics.avgEnergy < 0.04) {
        scores.sadness += 0.25;
        scores.tired += 0.28;
        scores.calm += 0.15;
        acousticCuesList.push('softer speaking volume (subdued energy)');
      } else if (acoustics.avgEnergy > 0.12 || acoustics.peakEnergy > 0.35) {
        scores.excitement += 0.25;
        scores.frustration += 0.28;
        scores.anxious += 0.15;
        acousticCuesList.push('elevated vocal intensity and dynamic bursts');
      }

      // 1b. Energy Variance (expressiveness vs flat monotone)
      if (acoustics.energyVariance < 0.003) {
        scores.tired += 0.18;
        scores.sadness += 0.15;
        scores.neutral += 0.12;
        acousticCuesList.push('flat energy contour');
      } else if (acoustics.energyVariance > 0.015) {
        scores.frustration += 0.2;
        scores.excitement += 0.22;
        acousticCuesList.push('dynamic volume fluctuation');
      }

      // 1c. Pitch & Pitch Variability (F0)
      if (acoustics.pitchVariability < 12) {
        scores.tired += 0.2;
        scores.sadness += 0.22;
        scores.neutral += 0.15;
        acousticCuesList.push('subdued, flat pitch variation');
      } else if (acoustics.pitchVariability > 28) {
        scores.excitement += 0.25;
        scores.frustration += 0.22;
        scores.anxious += 0.2;
        acousticCuesList.push('high pitch modulation and expressive range');
      }

      // 1d. Spectral Centroid (Frequency Brightness)
      if (acoustics.spectralCentroid > 1600) {
        scores.anxious += 0.18;
        scores.frustration += 0.18;
        scores.excitement += 0.15;
        acousticCuesList.push('bright / tense vocal timbre');
      } else if (acoustics.spectralCentroid < 1000 && acoustics.spectralCentroid > 0) {
        scores.sadness += 0.18;
        scores.tired += 0.2;
        acousticCuesList.push('somber, lower-frequency acoustic timbre');
      }

      // 1e. Vocal Jitter & Tremor
      if (acoustics.vocalJitter > 0.035) {
        scores.anxious += 0.22;
        scores.overwhelmed += 0.18;
        scores.sadness += 0.15;
        acousticCuesList.push('slight vocal instability / tremor');
      }

      // 1f. Speaking Pace, Cadence & Pause Ratios
      if (acoustics.pauseRatio > 0.35 || acoustics.speakingPace < 2.0) {
        scores.sadness += 0.2;
        scores.tired += 0.22;
        scores.overwhelmed += 0.18;
        acousticCuesList.push('deliberate cadence with frequent reflective pauses');
      } else if (acoustics.speakingPace > 3.6 && acoustics.pauseRatio < 0.2) {
        scores.anxious += 0.24;
        scores.frustration += 0.2;
        scores.excitement += 0.22;
        acousticCuesList.push('rapid, continuous speech tempo');
      }
    }

    // --- 2. Advanced Linguistic & Contextual Analysis ---
    const rawText = transcript || '';
    const words = rawText.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    if (rawText.trim().length > 0) {
      // 2a. Detect Negations (e.g. "not happy", "not doing well")
      for (let w = 0; w < words.length; w++) {
        const word = words[w];
        if (NEGATION_WORDS.some((neg) => word.includes(neg))) {
          const nextWord = words[w + 1] || '';
          detectedNegations.push(`${word} ${nextWord}`.trim());
          // If followed by positive words (calm, happy, fine), shift score to overwhelmed / sadness
          if (['fine', 'okay', 'good', 'happy', 'calm', 'great'].includes(nextWord)) {
            scores.sadness += 0.4;
            scores.overwhelmed += 0.4;
            scores.calm = Math.max(0, scores.calm - 0.3);
          }
        }

        // 2b. Detect Intensifiers (e.g. "so tired", "really anxious")
        if (INTENSIFIER_WORDS.includes(word)) {
          const nextWord = words[w + 1] || '';
          detectedIntensifiers.push(`${word} ${nextWord}`.trim());
        }
      }

      // 2c. Detect Cognitive Overload Phrases
      for (const phrase of COGNITIVE_LOAD_PHRASES) {
        if (rawText.toLowerCase().includes(phrase)) {
          detectedCognitiveLoad.push(phrase);
          scores.overwhelmed += 0.45;
          scores.anxious += 0.25;
        }
      }

      // 2d. Keyword Matching with Semantic Weighting
      for (const [emotion, emotionList] of Object.entries(EMOTION_KEYWORDS)) {
        for (const kw of emotionList) {
          const regex = new RegExp(`\\b${kw}\\b`, 'i');
          if (regex.test(rawText)) {
            matchedKeywords.push(kw);
            // Amplify weight if preceded by an intensifier
            const hasIntensifier = detectedIntensifiers.some((intWord) => intWord.includes(kw));
            const weight = hasIntensifier ? 0.65 : 0.45;
            scores[emotion as EmotionType] += weight;
            break;
          }
        }
      }
    }

    // --- 3. Normalization and Ranking ---
    const sortedEntries = Object.entries(scores) as [EmotionType, number][];
    sortedEntries.sort((a, b) => b[1] - a[1]);

    const primaryEmotion = sortedEntries[0][0];
    const secondaryEmotion = sortedEntries[1] && sortedEntries[1][1] > 0.28 ? sortedEntries[1][0] : undefined;

    // Tentative confidence strictly between 38% and 68%
    const rawDiff = sortedEntries[0][1] - (sortedEntries[1] ? sortedEntries[1][1] : 0);
    const confidence = Math.min(0.68, Math.max(0.38, Number((0.42 + rawDiff * 0.22).toFixed(2))));

    const tentativeQuestion = this.formatTentativeQuestion(primaryEmotion);

    // Build transparent rationale using all integrated factors
    const rationaleParts: string[] = [];
    if (acousticCuesList.length > 0) {
      rationaleParts.push(`Acoustic cues: ${acousticCuesList.join(', ')}`);
    }
    if (matchedKeywords.length > 0) {
      rationaleParts.push(`Word cues: ${matchedKeywords.slice(0, 4).join(', ')}`);
    }
    if (detectedCognitiveLoad.length > 0) {
      rationaleParts.push(`Cognitive strain signals: "${detectedCognitiveLoad.join('", "')}"`);
    }
    if (detectedNegations.length > 0) {
      rationaleParts.push(`Negated expressions: ${detectedNegations.join(', ')}`);
    }
    if (rationaleParts.length === 0) {
      rationaleParts.push('Baseline vocal metrics and steady speech flow');
    }

    const acousticSummary = acousticCuesList.length > 0
      ? acousticCuesList.join(' · ')
      : 'Even tempo and baseline audio level';

    const linguisticDetails: LinguisticFeatures = {
      wordCount,
      matchedKeywords,
      negations: detectedNegations,
      intensifiers: detectedIntensifiers,
      cognitiveLoadMarkers: detectedCognitiveLoad,
    };

    return {
      primaryEmotion,
      confidence,
      secondaryEmotion,
      allScores: scores,
      linguisticDetails,
      tentativeQuestion,
      rationale: rationaleParts.join('. ') + '.',
      acousticSummary,
      isTentative: true,
    };
  }

  private static formatTentativeQuestion(emotion: EmotionType): string {
    switch (emotion) {
      case 'sadness':
        return 'It sounds like you may be feeling a bit down or carrying some heavy feelings. Does that sound right?';
      case 'frustration':
        return 'There might be some tension or frustration in what you’re experiencing. Does that match how you feel?';
      case 'overwhelmed':
        return 'It seems like you might be feeling a little overloaded or stretched thin. Does that resonate with you?';
      case 'anxious':
        return 'You may be feeling slightly uneasy, tense, or worried. Does that sound close to what you are feeling?';
      case 'tired':
        return 'Your voice sounds a little weary or depleted of energy. Does that sound right, or are you feeling fatigued?';
      case 'excitement':
        return 'There feels like some uplifting or energetic momentum in your voice. Does that ring true?';
      case 'calm':
        return 'You sound relatively steady and centered right now. Does that match your current headspace?';
      case 'neutral':
      default:
        return 'Your tone seems fairly balanced or reflective. Does that sound right to you?';
    }
  }
}
