import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isRecording: boolean;
  isPlaying?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser, isRecording, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const isActive = isRecording || isPlaying;

      if (analyser && isRecording) {
        // Real-time audio waveform from AnalyserNode
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2.5;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(0.5, '#14b8a6');
        gradient.addColorStop(1, '#6366f1');
        ctx.strokeStyle = gradient;
        ctx.beginPath();

        const sliceWidth = (width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else if (isActive) {
        // Simulated harmonic soothing sine wave
        phase += 0.05;
        ctx.lineWidth = 2;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#14b8a6');
        gradient.addColorStop(0.5, '#8b5cf6');
        gradient.addColorStop(1, '#06b6d4');
        ctx.strokeStyle = gradient;

        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.03 + phase) * 12 * Math.sin((x / width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // Idle gentle flatline with subtle breathing center
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isRecording, isPlaying]);

  return (
    <div style={{ width: '100%', height: '54px', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={500}
        height={54}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          borderRadius: '8px',
        }}
      />
    </div>
  );
};
