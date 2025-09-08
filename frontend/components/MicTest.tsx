'use client';

import { useEffect, useRef, useState } from 'react';

export default function MicTest() {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [vadStatus, setVadStatus] = useState<'speaking' | 'silent'>('silent');
  const [matchStatus, setMatchStatus] = useState<'match' | 'no-match' | 'unknown'>('unknown');
  const [isCapturing, setIsCapturing] = useState(false);
  const voiceprintRef = useRef<Float32Array | null>(null);

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

        const capturedChunks: Float32Array[] = [];

        processor.onaudioprocess = (event) => {
          const inputData = event.inputBuffer.getChannelData(0);

          // === Voiceprint Filtering ===
          if (voiceprintRef.current) {
            const N = Math.min(inputData.length, voiceprintRef.current.length);
            let sumDiff = 0;
            for (let i = 0; i < N; i++) {
              sumDiff += Math.abs(inputData[i] - voiceprintRef.current[i]);
            }
            const avgDiff = sumDiff / N;
            console.log('📏 Voiceprint distance:', avgDiff.toFixed(5));

            const isMatch = avgDiff < 0.02;
            setMatchStatus(isMatch ? 'match' : 'no-match');
            if (!isMatch) return;
          } else {
            setMatchStatus('unknown');
          }

          waveformDataRef.current = new Float32Array(inputData);

          // === VAD detection ===
          const rms = Math.sqrt(inputData.reduce((sum, val) => sum + val * val, 0) / inputData.length);
          const threshold = 0.02;
          const speaking = rms > threshold;

          setVadStatus((prev) => {
            const next = speaking ? 'speaking' : 'silent';
            if (prev !== next) {
              console.log(speaking ? '🎤 Speaking...' : '🤫 Silent...');
            }
            return next;
          });

          // === Voiceprint capture ===
          if (isCapturing) {
            capturedChunks.push(new Float32Array(inputData));
            const durationSec = capturedChunks.length * 2048 / audioCtx.sampleRate;
            if (durationSec >= 1) {
              const combined = new Float32Array(capturedChunks.length * 2048);
              capturedChunks.forEach((chunk, i) => {
                combined.set(chunk, i * 2048);
              });
              voiceprintRef.current = combined;
              setIsCapturing(false);
              console.log('🔐 Voiceprint fingerprint stored:', combined.slice(0, 5), '... (truncated)');
            }
          }
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);

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
          ctx.strokeStyle =
            vadStatus === 'speaking'
              ? matchStatus === 'match'
                ? '#16a34a'
                : '#dc2626'
              : '#2563eb';

          const sliceWidth = width / len;

          for (let i = 0; i < len; i++) {
            const x = i * sliceWidth;
            const y = (data[i] * 0.5 + 0.5) * height;
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

      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch((e) =>
          console.warn('⚠️ Error closing AudioContext:', e)
        );
      }

      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isCapturing, vadStatus, matchStatus]);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="mt-4 rounded-lg border border-gray-300 p-4 text-sm shadow-sm">
      <h3 className="mb-2 font-semibold text-gray-800">🎙️ MicTest Component (Dev Only)</h3>

      <p className="text-gray-600">
        Mic status: <strong>{status}</strong>
        {' | '}
        VAD: <strong>{vadStatus}</strong>
        {' | '}
        Match: <strong className={matchStatus === 'match' ? 'text-green-600' : matchStatus === 'no-match' ? 'text-red-600' : 'text-gray-400'}>
          {matchStatus}
        </strong>
      </p>

      <div className="mt-4">
        <canvas
          ref={canvasRef}
          className="w-full h-20 border border-dashed border-gray-400 rounded bg-gray-50 text-gray-400"
          width={640}
          height={80}
        />
        <p className="text-xs text-gray-400 mt-1">[Live waveform + fingerprint-based filtering]</p>
      </div>

      <button
        onClick={() => {
          if (!isCapturing) {
            setIsCapturing(true);
            console.log('🎙️ Capturing voiceprint… Please speak for 1 second.');
          }
        }}
        className="mt-4 px-4 py-2 rounded text-white bg-amber-600 hover:bg-amber-700"
      >
        🔐 Capture Voiceprint
      </button>
    </div>
  );
}
