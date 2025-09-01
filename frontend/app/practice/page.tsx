'use client';

import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

export default function PracticePage() {
  return (
    <>
      <SignedIn>
        <section className="p-6">
          <h2 className="text-2xl font-bold">Practice Mode</h2>
          <p className="mt-2 text-gray-600">Try mock questions in a safe space.</p>
        </section>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
