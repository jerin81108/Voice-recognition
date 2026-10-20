import type {
  AcousticFeatures,
  EmotionEstimate,
  MicroActivity,
  SupportiveResponse,
  SupportiveTone,
  UserFeedback,
} from '../types';

export class DiagnosticsLogger {
  /**
   * Logs a comprehensive diagnostics and suggestion report directly to the browser console.
   */
  public static logPipelineRun(params: {
    audioBlob: Blob | null;
    transcript: string;
    acoustics?: AcousticFeatures;
    emotionEstimate?: EmotionEstimate;
    response?: SupportiveResponse;
    userFeedback?: UserFeedback;
    selectedTone: SupportiveTone;
    suggestedActivity?: MicroActivity;
  }): void {
    const {
      audioBlob,
      transcript,
      acoustics,
      emotionEstimate,
      response,
      userFeedback,
      selectedTone,
      suggestedActivity,
    } = params;

    console.groupCollapsed(
      `%c🎧 [Aura Intelligence Engine] %cReflection Pipeline Executed %c(${new Date().toLocaleTimeString()})`,
      'color: #14b8a6; font-weight: bold; font-size: 13px;',
      'color: #cbd5e1; font-weight: 600;',
      'color: #94a3b8; font-style: italic;'
    );

    // 1. Raw Input Summary
    console.group('1️⃣ Input Ingestion');
    console.log('🗣️ Transcript:', transcript ? `"${transcript}"` : '(No spoken text transcribed)');
    console.log('🎙️ Audio Blob:', audioBlob ? `${(audioBlob.size / 1024).toFixed(1)} KB, type: ${audioBlob.type}` : 'None (Text mode)');
    console.log('🎭 Selected Tone:', selectedTone);
    console.groupEnd();

    // 2. Comprehensive Acoustic Data Table
    if (acoustics) {
      console.group('2️⃣ Acoustic Audio Analysis (Web Audio Signal Metrics)');
      console.table({
        'Avg Energy (RMS)': { Value: acoustics.avgEnergy, Interpretation: acoustics.avgEnergy < 0.05 ? 'Quiet / Subdued' : acoustics.avgEnergy > 0.12 ? 'High Vocal Force' : 'Moderate' },
        'Peak Energy': { Value: acoustics.peakEnergy, Interpretation: 'Maximum instantaneous dynamic burst' },
        'Energy Variance': { Value: acoustics.energyVariance, Interpretation: acoustics.energyVariance > 0.02 ? 'Dynamic expressiveness' : 'Flat monotone energy' },
        'Estimated Pitch (F0)': { Value: `${acoustics.estimatedPitch} Hz`, Interpretation: acoustics.estimatedPitch > 230 ? 'Elevated pitch' : acoustics.estimatedPitch < 130 ? 'Low pitch' : 'Baseline vocal register' },
        'Pitch Variability (SD)': { Value: `${acoustics.pitchVariability} Hz`, Interpretation: acoustics.pitchVariability > 25 ? 'High emotional modulation' : 'Flat intonation' },
        'Speaking Pace': { Value: `${acoustics.speakingPace} bursts/s`, Interpretation: acoustics.speakingPace > 3.5 ? 'Rapid cadence' : acoustics.speakingPace < 2.0 ? 'Slow / Deliberate' : 'Steady rhythm' },
        'Pause / Silence Ratio': { Value: `${Math.round(acoustics.pauseRatio * 100)}%`, Interpretation: acoustics.pauseRatio > 0.35 ? 'Frequent reflective pauses' : 'Continuous stream' },
        'Spectral Centroid (Brightness)': { Value: `${acoustics.spectralCentroid} Hz`, Interpretation: acoustics.spectralCentroid > 1500 ? 'Bright / Tense frequency profile' : 'Dark / Soft frequency profile' },
        'Zero Crossing Rate (ZCR)': { Value: acoustics.zeroCrossingRate, Interpretation: 'Vocal breathiness and friction' },
        'Vocal Jitter (Tremor)': { Value: `${(acoustics.vocalJitter * 100).toFixed(1)}%`, Interpretation: acoustics.vocalJitter > 0.04 ? 'High pitch instability / Voice tremor' : 'Stable phonation' },
        'Recording Duration': { Value: `${acoustics.durationSeconds}s`, Interpretation: 'Total audio timeframe' },
      });
      console.groupEnd();
    }

    // 3. Linguistic Features Breakdown
    if (emotionEstimate?.linguisticDetails) {
      const ling = emotionEstimate.linguisticDetails;
      console.group('3️⃣ Linguistic & Semantic Text Signals');
      console.log('📊 Word Count:', ling.wordCount);
      console.log('🔍 Matched Sentiment Keywords:', ling.matchedKeywords.length > 0 ? ling.matchedKeywords : 'None detected');
      console.log('🚫 Inverted Negations (e.g. "not fine"):', ling.negations.length > 0 ? ling.negations : 'None');
      console.log('⚡ Intensifiers (e.g. "so", "really"):', ling.intensifiers.length > 0 ? ling.intensifiers : 'None');
      console.log('🧠 Cognitive Overload Indicators:', ling.cognitiveLoadMarkers.length > 0 ? ling.cognitiveLoadMarkers : 'None');
      console.groupEnd();
    }

    // 4. Multimodal Emotion Probability Distribution
    if (emotionEstimate) {
      console.group('4️⃣ Multimodal Fusion Probabilities (All Emotional Profiles)');
      console.table(
        Object.entries(emotionEstimate.allScores).map(([emotion, score]) => ({
          Emotion: emotion.toUpperCase(),
          'Computed Score': (score as number).toFixed(3),
          'Primary Candidate': emotion === emotionEstimate.primaryEmotion ? '⭐ YES' : 'no',
        }))
      );
      console.log(`💡 Tentative Conclusion: "${emotionEstimate.primaryEmotion}" (Tentative Confidence: ~${Math.round(emotionEstimate.confidence * 100)}%)`);
      console.log('📝 Transparent Rationale:', emotionEstimate.rationale);
      console.log('❓ Check-In Prompt Asked:', emotionEstimate.tentativeQuestion);
      console.groupEnd();
    }

    // 5. User Feedback & Overrides
    if (userFeedback && userFeedback.status !== 'pending') {
      console.group('5️⃣ User Feedback & Correction Override');
      console.log('User Status:', userFeedback.status);
      if (userFeedback.correctedEmotion) {
        console.log('🔄 User Overrode Emotion To:', userFeedback.correctedEmotion);
      }
      console.groupEnd();
    }

    // 6. Suggestion Engine & Recommendations
    console.group('6️⃣ Recommendation & Support Output');
    console.log('💬 Generated Response:', response ? response.message : '(Awaiting generation)');
    if (suggestedActivity) {
      console.log(`🧘 Suggested Micro-Activity: "${suggestedActivity.title}" (${suggestedActivity.duration})`);
      console.log('📌 Activity Category:', suggestedActivity.category);
      console.log('🎯 Recommendation Reason:', suggestedActivity.description);
      console.log('👣 Action Steps:', suggestedActivity.steps);
    } else {
      console.log('🧘 Suggested Activity: None (user state did not indicate a need for a micro-activity, or user dismissed)');
    }
    console.groupEnd();

    console.groupEnd();
  }
}
