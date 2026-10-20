// Web Speech API interface definitions
export interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionEventItem {
  isFinal: boolean;
  [index: number]: SpeechRecognitionResultItem;
}

export interface BrowserSpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionEventItem;
  };
}

export interface BrowserSpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

export interface IBrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): IBrowserSpeechRecognition };
    webkitSpeechRecognition?: { new (): IBrowserSpeechRecognition };
  }
}

export interface TranscriptionCallbacks {
  onInterimText: (text: string) => void;
  onFinalText: (text: string) => void;
  onError: (error: string) => void;
}

export class TranscriptionService {
  private recognition: IBrowserSpeechRecognition | null = null;
  private isListening = false;
  private finalTranscript = '';
  private callbacks: TranscriptionCallbacks;
  private language = 'en-US';

  constructor(callbacks: TranscriptionCallbacks, initialLanguage: string = 'en-US') {
    this.callbacks = callbacks;
    this.language = initialLanguage;
    this.initRecognition();
  }

  public setLanguage(lang: string): void {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  private initRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecClass) return;

    try {
      this.recognition = new SpeechRecClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;

      this.recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            this.finalTranscript += ' ' + item[0].transcript;
            this.callbacks.onFinalText(this.finalTranscript.trim());
          } else {
            interim += item[0].transcript;
          }
        }
        if (interim) {
          this.callbacks.onInterimText(interim.trim());
        }
      };

      this.recognition.onerror = (event: BrowserSpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech') {
          this.callbacks.onError('No clear speech was detected. You can speak louder, hold closer, or type your message.');
        } else if (event.error === 'audio-capture') {
          this.callbacks.onError('No microphone was found or microphone is busy.');
        } else if (event.error !== 'aborted') {
          this.callbacks.onError(`Speech recognition notice: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    } catch {
      this.recognition = null;
    }
  }

  public start(): void {
    if (!this.recognition) {
      this.callbacks.onError('Live speech recognition is not natively supported in this browser. You can still record audio and type or review your notes.');
      return;
    }

    try {
      this.finalTranscript = '';
      this.isListening = true;
      this.recognition.start();
    } catch (err: unknown) {
      this.isListening = false;
      // In case start was called when already active
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('already started')) {
        this.callbacks.onError(`Unable to start speech recognition: ${msg}`);
      }
    }
  }

  public stop(): string {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.isListening = false;
    return this.finalTranscript.trim();
  }

  public reset(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
    }
    this.isListening = false;
    this.finalTranscript = '';
  }
}
