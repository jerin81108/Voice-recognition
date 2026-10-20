import type { EmergencyContact, SafetyEvaluation } from '../types';

// Sensitive / Crisis keyword roots to check calmly and independently of emotion modeling
const CRISIS_PATTERNS: RegExp[] = [
  /\b(suicide|suicidal)\b/i,
  /\b(kill myself|end my life|ending it all|want to die|wish i were dead|better off dead)\b/i,
  /\b(self[-\s]?harm|cut myself|hurting myself|hurt myself|harm myself)\b/i,
  /\b(overdose|hang myself|slit my)\b/i,
  /\b(in immediate danger|someone is hurting me|domestic abuse)\b/i,
  /\b(cannot go on anymore|no reason to live)\b/i,
];

export const REGIONAL_EMERGENCY_CONTACTS: Record<string, EmergencyContact[]> = {
  US: [
    {
      name: 'Suicide & Crisis Lifeline',
      number: '988',
      description: 'Free, confidential 24/7 support via call or text.',
      url: 'https://988lifeline.org',
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: 'Connect with a crisis counselor 24/7.',
      url: 'https://www.crisistextline.org',
    },
    {
      name: 'Emergency Services',
      number: '911',
      description: 'For immediate medical or life-threatening emergencies.',
    },
    {
      name: 'The Trevor Project (LGBTQ youth)',
      number: '1-866-488-7386',
      description: 'Call or text START to 678-678.',
      url: 'https://www.thetrevorproject.org',
    },
  ],
  UK: [
    {
      name: 'NHS Urgent Mental Health',
      number: '111',
      description: '24/7 mental health advice and triage.',
      url: 'https://www.nhs.uk/service-search/mental-health/find-an-urgent-mental-health-helpline',
    },
    {
      name: 'Samaritans',
      number: '116 123',
      description: 'Free confidential emotional support 24/7.',
      url: 'https://www.samaritans.org',
    },
    {
      name: 'Emergency Services',
      number: '999',
      description: 'For life-threatening emergencies.',
    },
    {
      name: 'Shout Crisis Text Line',
      number: 'Text SHOUT to 85258',
      description: 'Free 24/7 crisis text service in the UK.',
    },
  ],
  CA: [
    {
      name: 'Suicide Crisis Helpline',
      number: '988',
      description: 'Toll-free 24/7 bilingual support across Canada.',
      url: 'https://988.ca',
    },
    {
      name: 'Emergency Services',
      number: '911',
      description: 'Immediate emergency assistance.',
    },
    {
      name: 'Kids Help Phone',
      number: '1-800-668-6868',
      description: 'Or text CONNECT to 686868.',
      url: 'https://kidshelpphone.ca',
    },
  ],
  IN: [
    {
      name: 'KIRAN National Mental Health Helpline',
      number: '1800-599-0019',
      description: 'Toll-free 24/7 counseling support.',
    },
    {
      name: 'Vandrevala Foundation',
      number: '+91 9999 666 555',
      description: '24/7 free mental health helpline.',
      url: 'https://www.vandrevalafoundation.com',
    },
    {
      name: 'Tele-MANAS',
      number: '14416',
      description: 'Toll-free 24/7 national mental health programme helpline.',
    },
    {
      name: 'National Emergency',
      number: '112',
      description: 'Immediate emergency dispatch.',
    },
  ],
  INTL: [
    {
      name: 'Befrienders Worldwide',
      number: 'Find local helpline online',
      description: 'Global confidential emotional support directory.',
      url: 'https://www.befrienders.org',
    },
    {
      name: 'Find A Helpline',
      number: 'Free & confidential support worldwide',
      description: 'Search support services by country.',
      url: 'https://findahelpline.com',
    },
    {
      name: 'International Emergency Services',
      number: 'Call your local emergency number (112, 911, or 999)',
      description: 'Contact local emergency services immediately.',
    },
  ],
};

export class SafetyService {
  /**
   * Evaluates text for safety concerns independently of audio or emotion estimation.
   */
  public static evaluateText(text: string, region: 'US' | 'UK' | 'CA' | 'IN' | 'INTL' = 'US'): SafetyEvaluation {
    if (!text || text.trim() === '') {
      return {
        isCrisis: false,
        matchedKeywords: [],
        emergencyContacts: REGIONAL_EMERGENCY_CONTACTS[region] || REGIONAL_EMERGENCY_CONTACTS.US,
      };
    }

    const matchedKeywords: string[] = [];

    for (const pattern of CRISIS_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        matchedKeywords.push(match[0].toLowerCase());
      }
    }

    const isCrisis = matchedKeywords.length > 0;
    const contacts = REGIONAL_EMERGENCY_CONTACTS[region] || REGIONAL_EMERGENCY_CONTACTS.US;

    return {
      isCrisis,
      matchedKeywords,
      crisisMessage: isCrisis
        ? 'I am hearing how deeply overwhelming and heavy things feel right now. Your safety and well-being matter more than anything. Because I am an automated support app and cannot provide emergency care or crisis counseling, please reach out to someone who can hold space with you right now.'
        : undefined,
      emergencyContacts: contacts,
    };
  }
}
