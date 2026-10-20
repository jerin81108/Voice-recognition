import type { EmotionType, FeedbackStatus, MicroActivity, SupportiveResponse, SupportiveTone } from '../types';
import { ActivityService } from './activityService';

export class ResponseGenerator {
  /**
   * Generates a warm, respectful response that avoids presumptions and aligns with the user's tone.
   */
  public static generateResponse(params: {
    transcript: string;
    emotion?: EmotionType;
    feedbackStatus: FeedbackStatus;
    correctedEmotion?: string;
    tone: SupportiveTone;
    emotionEnabled: boolean;
  }): SupportiveResponse {
    const { transcript, emotion, feedbackStatus, correctedEmotion, tone, emotionEnabled } = params;

    // Determine the active emotion signal (user correction takes total precedence)
    const activeEmotion = (correctedEmotion || (emotionEnabled ? emotion : undefined))?.toLowerCase();

    // 1. If emotion analysis is disabled, give open, grounded listening response
    if (!emotionEnabled) {
      return this.buildNonEmotionResponse(transcript, tone);
    }

    // 2. If user dismissed the emotion interpretation
    if (feedbackStatus === 'dismissed') {
      return {
        id: `resp-${Date.now()}`,
        tone,
        message:
          'Thank you for telling me. Your own experience is always what matters most. I am here to listen whenever you want to share more.',
      };
    }

    // 3. User confirmed or corrected emotion
    const isLowOrStressed =
      activeEmotion === 'sadness' ||
      activeEmotion === 'overwhelmed' ||
      activeEmotion === 'anxious' ||
      activeEmotion === 'frustration' ||
      activeEmotion === 'tired' ||
      activeEmotion === 'stress' ||
      activeEmotion === 'depressed';

    let suggestedActivity: MicroActivity | undefined;
    if (isLowOrStressed && (feedbackStatus === 'confirmed' || feedbackStatus === 'corrected')) {
      suggestedActivity = ActivityService.getRecommendedActivity(activeEmotion);
    }

    const message = this.craftEmpathicMessage({
      activeEmotion,
      tone,
      feedbackStatus,
      isLowOrStressed,
    });

    return {
      id: `resp-${Date.now()}`,
      tone,
      message,
      suggestedActivity,
    };
  }

  private static craftEmpathicMessage(params: {
    activeEmotion?: string;
    tone: SupportiveTone;
    feedbackStatus: FeedbackStatus;
    isLowOrStressed: boolean;
  }): string {
    const { activeEmotion, tone, feedbackStatus, isLowOrStressed } = params;

    if (feedbackStatus === 'pending') {
      switch (tone) {
        case 'gentle':
          return 'I am listening closely to what you shared. Take all the time you need, and please let me know if my reflection feels even slightly off.';
        case 'reflective':
          return 'Holding space for your words. Feel free to clarify or adjust how you are feeling in the options below.';
        case 'grounded':
          return 'Received. I have reflected tentative cues above, but only you know what is true for you right now.';
        case 'warm':
        default:
          return 'Thank you for sharing your voice. I’ve offered a tentative reflection above—please feel free to confirm, adjust, or completely disregard it.';
      }
    }

    // When confirmed or corrected
    if (isLowOrStressed) {
      switch (tone) {
        case 'gentle':
          return `Thank you for sharing that with me. It takes real courage to acknowledge feeling ${activeEmotion || 'heavy'}. Remember that you do not have to solve everything in this single moment. If you feel up for it, there is a gentle micro-activity below—only if it feels genuinely manageable.`;
        case 'reflective':
          return `Acknowledged. Carrying ${activeEmotion || 'strain'} requires a lot of silent energy. What matters most right now is going at your own pace without expectations. An optional activity is available if you wish.`;
        case 'grounded':
          return `Understood. When things feel ${activeEmotion || 'tough'}, doing even the smallest thing can help take the edge off. I have placed an optional exercise below. Feel free to engage with it, or skip it entirely.`;
        case 'warm':
        default:
          return `I really appreciate you letting me know you are feeling ${activeEmotion || 'down'}. It makes total sense that you feel this way. Please remember there is no right or wrong way to feel today. Here is one simple, optional step below if you want to try it.`;
      }
    }

    // Positive or calm states
    switch (tone) {
      case 'gentle':
        return `It is wonderful to hear that you are feeling ${activeEmotion || 'centered'}. May that sense of ease stay with you as your day unfolds.`;
      case 'reflective':
        return `Noticed. Savoring moments of ${activeEmotion || 'calmness'} is a quiet gift to oneself.`;
      case 'grounded':
        return `Glad you are feeling ${activeEmotion || 'balanced'}. Enjoy this steady headspace.`;
      case 'warm':
      default:
        return `That is really nice to hear! Glad things are feeling ${activeEmotion || 'peaceful'} for you right now.`;
    }
  }

  private static buildNonEmotionResponse(_transcript: string, tone: SupportiveTone): SupportiveResponse {
    let message = '';
    switch (tone) {
      case 'gentle':
        message =
          'Thank you for speaking. I have transcribed your message above. Whenever you are ready, I am here to hold a quiet, non-judgmental space for whatever you wish to express.';
        break;
      case 'reflective':
        message =
          'Your thoughts are noted. With emotion estimation turned off, you can use this space freely as an open voice journal.';
        break;
      case 'grounded':
        message =
          'Voice message recorded. Take a breath and proceed at your own rhythm.';
        break;
      case 'warm':
      default:
        message =
          'Thank you for sharing your thoughts with me. I am here listening warmly—feel free to record more or take a moment for yourself.';
        break;
    }

    return {
      id: `resp-noemotion-${Date.now()}`,
      tone,
      message,
    };
  }
}
