'use client';

import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import MicTest from '@/components/MicTest';

export default function SessionPage() {
  return (
    <>
      <SignedIn>
        <section className="p-6">
          <h2 className="text-2xl font-bold">Live Interview Session</h2>
          <p className="mt-2 text-gray-600">You&apos;re signed in and ready.</p>

          <div className="mt-4 h-32 bg-gray-100 rounded-md shadow-inner flex items-center justify-center text-gray-400">
            🎤 Waveform placeholder
          </div>

          <button
            onClick={async () => {
              console.log('Button clicked — sending dummy chunk');

              const dummy = new Uint8Array(8000).buffer; // 8KB chunk

              try {
                const res = await fetch('/api/asr/stream', {
                  method: 'POST',
                  body: dummy,
                  headers: {
                    'Content-Type': 'application/octet-stream',
                  },
                });

                const json = await res.json();
                console.log('✅ ASR Response:', json);
              } catch (err) {
                console.error('❌ ASR Error:', err);
              }
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ▶️ Send Dummy Audio Chunk
          </button>

          {/* Only show mic test in dev */}
          {process.env.NODE_ENV === 'development' && <MicTest />}
        </section>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
