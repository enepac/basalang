import "../styles/globals.css";
import { ClerkProvider, UserButton } from '@clerk/nextjs';

export const metadata = {
  title: "Basalang",
  description: "Stealth AI Interview Copilot",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="flex min-h-screen text-gray-900">
          <aside className="w-60 bg-gray-100 p-4 border-r border-gray-200 flex flex-col justify-between">
            <div>
              <h1 className="font-bold text-xl mb-4">Basalang</h1>
              <nav className="space-y-2">
                <a href="/session" className="block hover:underline">Session</a>
                <a href="/practice" className="block hover:underline">Practice</a>
                <a href="/docs" className="block hover:underline">Docs</a>
              </nav>
            </div>
            <div className="mt-6">
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </aside>
          <main className="flex-1 p-6">
            {children}
            <footer className="mt-10 text-sm text-gray-500 border-t pt-4">
              Status: ASR inactive • Flags: default
            </footer>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
