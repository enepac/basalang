'use client';

import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

export default function SessionPage() {
  return (
    <>
      <SignedIn>
        <section className="p-6">
          <h2 className="text-2xl font-bold">Live Interview Session</h2>
          <p className="mt-2 text-gray-600">You&apos;re signed in and ready.</p>
        </section>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
