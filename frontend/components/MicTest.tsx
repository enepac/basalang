'use client';

import { useEffect, useState } from 'react';

export default function MicTest() {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  const requestMic = async () => {
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); // Immediately stop mic
      setStatus('granted');
    } catch (err) {
      setStatus('denied');
    }
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="mt-4 rounded-lg border border-gray-300 p-4 text-sm shadow-sm">
      <h3 className="mb-2 font-semibold text-gray-800">🎙️ MicTest Component (Dev Only)</h3>
      <button
        onClick={requestMic}
        className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
      >
        Request Mic Access
      </button>
      <p className="mt-2 text-gray-600">Mic status: <strong>{status}</strong></p>
    </div>
  );
}
