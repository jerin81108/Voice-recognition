import type { EmotionType, MicroActivity } from '../types';

export const MICRO_ACTIVITIES: MicroActivity[] = [
  {
    id: 'box-breathing',
    title: 'Box Breathing (4-4-4-4)',
    category: 'breathing',
    duration: '2 minutes',
    description: 'A gentle, steady rhythmic breathing cycle used to calm the autonomic nervous system.',
    promptQuestion: 'Would you like to try 4 gentle cycles of box breathing with a visual guide?',
    steps: [
      'Inhale softly through your nose for 4 seconds.',
      'Gently hold that breath for 4 seconds without straining.',
      'Exhale slowly through your mouth for 4 seconds.',
      'Pause and rest empty for 4 seconds before the next breath.',
    ],
  },
  {
    id: 'concern-journal',
    title: 'Write Down One Concern',
    category: 'journal',
    duration: '1 minute',
    description: 'Get a heavy thought out of your head onto screen, with the option to dissolve or shred it.',
    promptQuestion: 'Would it help to write down just one specific thought on your mind, then let it go?',
    steps: [
      'Name one specific worry or weight you are holding right now.',
      'Type it in the box below—no need for complete sentences.',
      'Click "Release Thought" to watch it fade away.',
    ],
  },
  {
    id: 'grounding-54321',
    title: '5-4-3-2-1 Grounding',
    category: 'grounding',
    duration: '3 minutes',
    description: 'Anchor yourself in the physical room around you using your immediate senses.',
    promptQuestion: 'Would you be open to noticing a few physical objects around you to feel more grounded?',
    steps: [
      'Acknowledge 5 things you can see around you.',
      'Acknowledge 4 things you can physically touch or feel.',
      'Acknowledge 3 distinct sounds you can hear.',
      'Acknowledge 2 things you can smell or enjoy the scent of.',
      'Acknowledge 1 pleasant thing you can taste or one kind thought toward yourself.',
    ],
  },
  {
    id: 'short-walk',
    title: 'Gentle Walk or Posture Shift',
    category: 'movement',
    duration: '2–5 minutes',
    description: 'A micro-shift in physical space to unfreeze tension and invite fresh circulation.',
    promptQuestion: 'Could a quick 2-minute stroll around the room, or just a shoulder roll, feel manageable?',
    steps: [
      'Unclench your jaw and gently roll your shoulders back twice.',
      'Take a sip of cool water if one is nearby.',
      'Step away from your screen and take a slow stroll across your room or to a window.',
    ],
  },
  {
    id: 'reach-out',
    title: 'Send a Low-Effort Check-in',
    category: 'connection',
    duration: '1 minute',
    description: 'Reach out to a trusted friend or family member without needing to explain everything.',
    promptQuestion: 'Would you like to copy a short, no-pressure text message to send to someone you trust?',
    steps: [
      'Think of one person who feels safe and supportive.',
      'Copy this gentle template: "Hey, feeling a little low/tired today and just thinking of you. No need to reply right away."',
      'Send it when you are ready, or keep it for later.',
    ],
  },
];

export class ActivityService {
  /**
   * Recommends a gentle micro-activity based on the confirmed or estimated state.
   */
  public static getRecommendedActivity(emotion?: EmotionType | string): MicroActivity {
    switch (emotion) {
      case 'anxious':
      case 'frustration':
        return MICRO_ACTIVITIES.find((a) => a.id === 'box-breathing') || MICRO_ACTIVITIES[0];
      case 'overwhelmed':
        return MICRO_ACTIVITIES.find((a) => a.id === 'concern-journal') || MICRO_ACTIVITIES[1];
      case 'sadness':
        return MICRO_ACTIVITIES.find((a) => a.id === 'reach-out') || MICRO_ACTIVITIES[4];
      case 'tired':
        return MICRO_ACTIVITIES.find((a) => a.id === 'short-walk') || MICRO_ACTIVITIES[3];
      default:
        return MICRO_ACTIVITIES.find((a) => a.id === 'box-breathing') || MICRO_ACTIVITIES[0];
    }
  }

  public static getAllActivities(): MicroActivity[] {
    return MICRO_ACTIVITIES;
  }
}
