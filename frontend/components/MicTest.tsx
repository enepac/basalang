'use client';

import { useEffect, useRef, useState } from 'react';

export default function MicTest() {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const requestMic = async () => {
      setStatus('requesting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setStatus('granted');

        // Create audio context
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);

        // ScriptProcessorNode: 4096 buffer size, 1 input, 1 output
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (event) => {
          const inputBuffer = event.inputBuffer.getChannelData(0);
          console.log('🔊 Audio buffer received. Length:', inputBuffer.length);
          // This is where waveform sampling will occur later
        };

        source.connect(processor);
        processor.connect(audioCtx.destination); // required to keep audio pipeline alive

      } catch (err) {
        console.error('❌ Mic permission denied', err);
        setStatus('denied');
      }
    };

    requestMic();

    return () => {
      // Cleanup media stream + audio context
      streamRef.current?.getTracks().forEach((track) => track.stop());
      processorRef.current?.disconnect();
      audioCtxRef.current?.close();
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
