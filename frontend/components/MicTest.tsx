'use client';

import { useEffect, useRef, useState } from 'react';

export default function MicTest() {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const requestMic = async () => {
      setStatus('requesting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setStatus('granted');
      } catch (err) {
        console.error('❌ Mic permission denied', err);
        setStatus('denied');
      }
    };

    requestMic();

    return () => {
      // Clean up stream if user navigates away
      streamRef.current?.getTracks().forEach((track) => track.stop());
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
        >
          Waveform Placeholder
        </canvas>
        <p className="text-xs text-gray-400 mt-1">[Waveform placeholder]</p>
      </div>
    </div>
  );
}
