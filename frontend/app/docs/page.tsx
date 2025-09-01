'use client';

import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

export default function DocsPage() {
  return (
    <>
      <SignedIn>
        <section className="p-6">
          <h2 className="text-2xl font-bold">Reference Documents</h2>
          <p className="mt-2 text-gray-600">Here you’ll find your uploaded guides and transcripts.</p>
        </section>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
