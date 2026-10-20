export type RecordingState = 'idle' | 'requesting_permission' | 'recording' | 'paused' | 'stopped' | 'error';

export interface RecorderCallbacks {
  onStateChange: (state: RecordingState) => void;
  onAudioDataAvailable?: (blob: Blob) => void;
  onError: (errorMessage: string) => void;
}

export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private state: RecordingState = 'idle';
  private callbacks: RecorderCallbacks;

  constructor(callbacks: RecorderCallbacks) {
    this.callbacks = callbacks;
  }

  public getState(): RecordingState {
    return this.state;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public async startRecording(): Promise<void> {
    try {
      this.setState('requesting_permission');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone recording is not supported in this browser. Please use text input.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.audioStream = stream;
      this.audioChunks = [];

      // Setup Web Audio Analyser for live visualizer
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtxClass();
      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.sourceNode.connect(this.analyserNode);

      // Determine supported mime type
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      let chosenMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          chosenMime = mime;
          break;
        }
      }

      this.mediaRecorder = chosenMime
        ? new MediaRecorder(stream, { mimeType: chosenMime })
        : new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const mime = chosenMime || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mime });
        if (this.callbacks.onAudioDataAvailable) {
          this.callbacks.onAudioDataAvailable(audioBlob);
        }
      };

      this.mediaRecorder.start(200); // 200ms slices
      this.setState('recording');
    } catch (err: unknown) {
      this.setState('error');
      const msg = err instanceof Error ? err.message : 'Failed to access microphone';
      if (msg.includes('Permission denied') || msg.includes('NotAllowedError')) {
        this.callbacks.onError('Microphone access was denied. Please allow microphone permission in your browser or type your message below.');
      } else {
        this.callbacks.onError(`Microphone error: ${msg}`);
      }
    }
  }

  public pauseRecording(): void {
    if (this.mediaRecorder && this.state === 'recording') {
      this.mediaRecorder.pause();
      this.setState('paused');
    }
  }

  public resumeRecording(): void {
    if (this.mediaRecorder && this.state === 'paused') {
      this.mediaRecorder.resume();
      this.setState('recording');
    }
  }

  public stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.state === 'idle') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, {
          type: this.mediaRecorder?.mimeType || 'audio/webm',
        });
        this.cleanupStream();
        this.setState('stopped');
        if (this.callbacks.onAudioDataAvailable) {
          this.callbacks.onAudioDataAvailable(audioBlob);
        }
        resolve(audioBlob);
      };

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    });
  }

  public discardRecording(): void {
    this.cleanupStream();
    this.audioChunks = [];
    this.setState('idle');
  }

  private cleanupStream(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyserNode = null;
    this.sourceNode = null;
  }

  private setState(newState: RecordingState): void {
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }
}
