'use client';

import { useEffect, useRef, useState } from 'react';

export default function MicTest() {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const waveformDataRef = useRef<Float32Array>(new Float32Array(0));

  useEffect(() => {
    const requestMic = async () => {
      setStatus('requesting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setStatus('granted');

        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(2048, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (event) => {
          const input = event.inputBuffer.getChannelData(0);
          waveformDataRef.current = new Float32Array(input);
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);

        // Animation loop
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        const render = () => {
          if (!ctx || !canvas) return;

          const width = canvas.width;
          const height = canvas.height;

          ctx.clearRect(0, 0, width, height);

          const data = waveformDataRef.current;
          const len = data.length;

          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#2563eb'; // blue-600

          const sliceWidth = width / len;

          for (let i = 0; i < len; i++) {
            const x = i * sliceWidth;
            const y = (data[i] * 0.5 + 0.5) * height; // normalize to [0, height]
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          ctx.stroke();
          animationRef.current = requestAnimationFrame(render);
        };

        animationRef.current = requestAnimationFrame(render);
      } catch (err) {
        console.error('❌ Mic permission denied', err);
        setStatus('denied');
      }
    };

    requestMic();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      processorRef.current?.disconnect();
      audioCtxRef.current?.close();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="mt-4 rounded-lg border border-gray-300 p-4 text-sm shadow-sm">
      <h3 className="mb-2 font-semibold text-gray-800">🎙️ MicTest Component (Dev Only)</h3>

      <p className="text-gray-600">
        Mic status: <strong>{status}</strong>
      </p>

      <div className="mt-4">
        <canvas
          ref={canvasRef}
          className="w-full h-20 border border-dashed border-gray-400 rounded bg-gray-50 text-gray-400"
          width={640}
          height={80}
        />
        <p className="text-xs text-gray-400 mt-1">[Live waveform]</p>
      </div>
    </div>
  );
}
