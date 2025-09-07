'use client';

import { useEffect, useRef, useState } from 'react';

function float32ToWavBlob(chunks: Float32Array[], sampleRate: number): Blob {
  const totalLength = chunks.reduce((sum, arr) => sum + arr.length, 0);
  const merged = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  const pcmData = new DataView(new ArrayBuffer(merged.length * 2));
  for (let i = 0; i < merged.length; i++) {
    const s = Math.max(-1, Math.min(1, merged[i]));
    pcmData.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  const writeStr = (v: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) v.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmData.byteLength, true);
  writeStr(view, 8, 'WAVE');
  writeStr(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(view, 36, 'data');
  view.setUint32(40, pcmData.byteLength, true);

  const wavBuffer = new Uint8Array(44 + pcmData.byteLength);
  wavBuffer.set(new Uint8Array(wavHeader), 0);
  wavBuffer.set(new Uint8Array(pcmData.buffer), 44);

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

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

  const vadStatusRef = useRef<'speaking' | 'silent'>('silent');
  const matchStatusRef = useRef<'match' | 'no-match' | 'unknown'>('unknown');

  const bufferingRef = useRef(false);
  const segmentStartRef = useRef<number | null>(null);
  const segmentQueueRef = useRef<Float32Array[]>([]);
  const vadSilenceDebounceRef = useRef<number | null>(null);
  const segmentSilenceRef = useRef<number | null>(null);
  const segmentCooldownRef = useRef<number>(0);

  const lastVoiceprintLogRef = useRef<number>(0);

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
          waveformDataRef.current = new Float32Array(inputData);
          const now = Date.now();

          const rms = Math.sqrt(inputData.reduce((sum, val) => sum + val * val, 0) / inputData.length);
          const threshold = 0.02;
          const isNowSpeaking = rms > threshold;

          if (isNowSpeaking) {
            if (vadStatusRef.current !== 'speaking') {
              vadStatusRef.current = 'speaking';
              setVadStatus('speaking');
              console.log('🎤 Speaking...');
            }
            vadSilenceDebounceRef.current = null;
          } else {
            if (!vadSilenceDebounceRef.current) vadSilenceDebounceRef.current = now;
            const silentFor = now - vadSilenceDebounceRef.current;
            if (silentFor >= 250 && vadStatusRef.current !== 'silent') {
              vadStatusRef.current = 'silent';
              setVadStatus('silent');
              console.log('🤫 Silent...');
            }
          }

          if (voiceprintRef.current) {
            const N = Math.min(inputData.length, voiceprintRef.current.length);
            let sumDiff = 0;
            for (let i = 0; i < N; i++) sumDiff += Math.abs(inputData[i] - voiceprintRef.current[i]);
            const avgDiff = sumDiff / N;

            if (process.env.NODE_ENV === 'development' && now - lastVoiceprintLogRef.current >= 250) {
              console.log('📏 Voiceprint distance:', avgDiff.toFixed(5));
              lastVoiceprintLogRef.current = now;
            }

            const isMatch = avgDiff < 0.02;
            setMatchStatus(isMatch ? 'match' : 'no-match');
            matchStatusRef.current = isMatch ? 'match' : 'no-match';
            if (!isMatch) return;
          } else {
            setMatchStatus('unknown');
            matchStatusRef.current = 'unknown';
          }

          const SEGMENT_MS = 750;
          const GRACE_SILENCE_MS = 250;
          const COOLDOWN_MS = 500;
          const isSpeaking = vadStatusRef.current === 'speaking';
          const isMatching = matchStatusRef.current === 'match';

          if (isSpeaking && isMatching) {
            if (!bufferingRef.current && now - segmentCooldownRef.current >= COOLDOWN_MS) {
              bufferingRef.current = true;
              segmentStartRef.current = now;
              segmentQueueRef.current = [];
              console.log('🟢 Segment buffering started');
            }

            if (bufferingRef.current) {
              segmentQueueRef.current.push(new Float32Array(inputData));
              const elapsed = now - (segmentStartRef.current ?? 0);
              console.log(`⏱️ Segment buffering: elapsed=${elapsed}ms, chunks=${segmentQueueRef.current.length}`);

              if (elapsed >= SEGMENT_MS) {
                bufferingRef.current = false;
                const chunks = [...segmentQueueRef.current];
                const blob = float32ToWavBlob(chunks, audioCtx.sampleRate);
                console.log('✅ Segment complete → WAV Blob:', blob);
                segmentQueueRef.current = [];
                segmentStartRef.current = null;
                segmentSilenceRef.current = null;
                segmentCooldownRef.current = now;
              }
            }

            segmentSilenceRef.current = null;
          } else {
            if (bufferingRef.current) {
              if (!segmentSilenceRef.current) segmentSilenceRef.current = now;
              const silentFor = now - segmentSilenceRef.current;

              if (silentFor >= GRACE_SILENCE_MS) {
                bufferingRef.current = false;
                console.warn('⚠️ Segment interrupted after silence — discarded');
                segmentQueueRef.current = [];
                segmentStartRef.current = null;
                segmentSilenceRef.current = null;
                segmentCooldownRef.current = now;
              }
            }
          }

          if (isCapturing) {
            capturedChunks.push(new Float32Array(inputData));
            const durationSec = capturedChunks.length * 2048 / audioCtx.sampleRate;
            if (durationSec >= 1) {
              const combined = new Float32Array(capturedChunks.length * 2048);
              capturedChunks.forEach((chunk, i) => combined.set(chunk, i * 2048));
              voiceprintRef.current = combined;
              setIsCapturing(false);
              console.log('🔐 Voiceprint fingerprint stored:', combined.slice(0, 5), '...');
            }
          }
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        const render = () => {
          if (!ctx || !canvas) return;
          const width = canvas.width, height = canvas.height;
          ctx.clearRect(0, 0, width, height);
          const data = waveformDataRef.current, len = data.length;

          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = vadStatusRef.current === 'speaking'
            ? matchStatusRef.current === 'match' ? '#16a34a' : '#dc2626'
            : '#2563eb';

          const sliceWidth = width / len;
          for (let i = 0; i < len; i++) {
            const x = i * sliceWidth;
            const y = (data[i] * 0.5 + 0.5) * height;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
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
      streamRef.current?.getTracks().forEach((t) => t.stop());
      processorRef.current?.disconnect();
      audioCtxRef.current?.close();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isCapturing]);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="mt-4 rounded-lg border border-gray-300 p-4 text-sm shadow-sm">
      <h3 className="mb-2 font-semibold text-gray-800">🎙️ MicTest Component (Dev Only)</h3>
      <p className="text-gray-600">
        Mic status: <strong>{status}</strong>{' | '}
        VAD: <strong>{vadStatus}</strong>{' | '}
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
