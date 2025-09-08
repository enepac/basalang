# _reflection.md — Stage 0 Summary (2025-08-30)

**Goal met:** Cloud-first, SSH-hardened, containerized dev environment with CI and journaling.

**Key decisions:**
- Chose Hetzner CPX11 for best perf/$ and hourly billing.
- OS ended up on Ubuntu 24.04 (OK vs 22.04; Docker + VS Code support fine).
- Dev via Remote-SSH + Dev Containers; keep Docker on host only.

**Incidents & fixes:**
- GitHub SSH auth: required both correct public key in `authorized_keys` and a valid OpenSSH-formatted private key in `~/.ssh/id_rsa`. Added `~/.ssh/config` to force identity. Verified with `ssh -T`.
- Prompt clarity: customized `.bashrc` PS1 to show branch; resolved conflicts with default PS1 lines.
- Devcontainer write perms: fixed via `chown -R ubuntu:ubuntu /workspaces/basalang`.

**Readiness for Stage 1:** ✅ Ready to scaffold Next.js app, Tailwind, and UI shell in `frontend/`.


---

## Phase 1 Kickoff (S1-T01)

Scaffolded the web app using Next.js 14 with Tailwind, ESLint, and App Router under `phase/1`.  
Used `npx create-next-app` with explicit alias and no `src/` nesting.  
Proceeding next to implement the layout shell and route stubs.


---

## S1-T02

Shell structure complete. Clean sidebar + content layout working with route placeholders.  
Ready for health route and production deployment setup next.


---

## S1-T03

Deployment flow took extra time due to Vercel defaulting to `phase/0`.  
Resolved by pushing `phase/1`, updating GitHub default, and removing invalid `vercel.json`.  
Production deploy now operational — clean base for all future testing.


---

## S1-T05A

Clerk added to frontend as auth backbone.  
Install required cleanup after previous OOM crash — resolved by rebuilding lockfile.  
System ready for <ClerkProvider> wrap and middleware config next.

- [S1-T11] Implemented Clerk webhook signature verification using `svix` with a dynamic Next.js API route. Webhook endpoint is now live and secure.

## 2025-09-02 — Git Recovery Reflection

Today, we hit a hard GitHub limit due to `.pnpm-store` being accidentally versioned. Pushes failed due to 100MB+ files. After investigating, we used `git-filter-repo` to surgically delete the store from the entire history. This was risky but necessary. Push succeeded after cleanup.

**Key Learning:**  
Always add `**/.pnpm-store/` and similar to `.gitignore` early. Artifacts should never be committed. Also, know how to safely rewrite history and recover from Git deadlocks.

✅ Crisis resolved. Moving forward smarter.


---

```md
### [S1-T12] Reflection — Clerk Webhook Endpoint Integration

- **Decision Point:** Clerk recommends using `svix` for secure webhook verification.
- **Initial Attempt:** Tried using `@clerk/clerk-sdk-node`, but it was deprecated. Adjusted approach by switching to `svix`.
- **Challenge:** TS errors flagged `evt` as `unknown`. Solved by explicitly asserting `evt` as `Record<string, any>`, since no event typing exists from Clerk.
- **Security Consideration:** Ensured `CLERK_WEBHOOK_SECRET` is never exposed and used only server-side.
- **Verification:** Confirmed production build passed (`pnpm build`) with webhook route `λ /api/webhooks/clerk`.

- **Next Time:** Avoid committing large package manager caches (.pnpm-store) that can exceed GitHub file limits.

## S1-T13D Reflection

- 🧠 Learned that Supabase schema updates can require cache refresh
- 🧪 First end-to-end test from Supabase → Next.js → public web access via ngrok
- 🌐 Hetzner remote DevContainer required DNS patch to resolve `supabase.co`
- 📦 Installed `ngrok` as a temp workaround until proper cloud deploy
- 🚧 Skipped UFW config because container firewall is abstracted

## 🧠 Reflection — 2025-09-05

### Task: `S1-T13: Supabase Integration`

- Encountered real-world constraint: Hetzner container blocks outgoing DNS to Supabase.
- Applied secure fallback using `ngrok` to expose localhost.
- This tested Supabase + frontend round-trip flow in a cloud-agnostic way.
- Entire backend integration pattern can now be replicated for future tables.
- 🔁 Confirmed effectiveness of execution protocol (`Commit → Tag → Push → Journal → Reflect`).

### [S1-T14] Reflection — ASR Scaffold & Server Util

- 👣 Transitioned from static Supabase testing to dynamic streaming foundation.
- 🔐 Clerk-protected route ensures only signed-in users can access ASR tools.
- 🔧 Created `/api/asr/stream` to accept raw binary — prepares for Whisper/FFmpeg.
- 🔄 Live tested from public `ngrok` tunnel → route hit + JSON response verified.
- 🧪 Learned to log and trace binary POSTs across layers (Next.js App Router)
- 🧼 Frontend button handler now includes full error handling and dev console logs.

## 🔁 S2-T01A Reflection — MicTest Component

**What was done:**  
Scaffolded a developer-only `MicTest.tsx` component for browser mic permission testing. Mounted it under `/session` during development mode.

---

### ✅ What Went Well

- TypeScript setup caught early path issues
- Component was isolated and dev-scoped from the start
- Final build runs clean with strict TS, ESLint, and Next.js
- Verified successfully via ngrok public test

---

### ⚠️ What Didn’t Go Smoothly

- Dynamic import using `.tsx` extension broke under `moduleResolution: node16`
- Required multiple refactors (dynamic → static import → alias + config patch)
- TypeScript rejected `.js` imports due to missing declaration files
- ESLint showed errors due to babel parser conflict (Next.js dev keys)

---

### 💡 Lessons & Decisions

- **Use static imports** for internal components unless server/client boundary requires dynamic loading
- Always maintain `.tsx` for components with JSX — renaming to `.js` just to bypass TS is a bad trade
- Stick to `module: NodeNext` and match with `moduleResolution: NodeNext` to avoid conflicts
- Path aliasing (`@/`) is worth setting up early to prevent relative path hell

---

### 🔐 Safeguards Recap

- Snapshots + rollback validated before committing
- Final tag: `S2-T01A`  
- Branch: `phase/2`

## 🔁 S2-T01B Reflection — Auto Mic + Waveform Scaffold

**What was done:**  
Automatically requested microphone permissions in dev-only `MicTest`. Scaffolded a waveform canvas box and tracked status changes.

---

### ✅ What Went Well

- `useEffect()` worked smoothly for auto mic prompt
- Browser permission behavior was predictable and consistent
- Ngrok testing proved stable and reproducible
- UI states (`idle`, `granted`, etc.) visually confirmed live

---

### ⚠️ What Didn’t Go Smoothly

- Canvas currently static — needs future animation logic
- No visual indicator yet for rejected mic access
- Dynamic import path problems carried over from previous task

---

### 💡 Lessons & Decisions

- Use `ref` for managing media streams cleanly on unmount
- Always pair auto-permission logic with visible user feedback
- Mic status display helps debugging before waveform logic is added

---

### 🔐 Safeguards Recap

- Tagged: `S2-T01B`
- Verified live via `ngrok`
- Covered in `journal-2025-09-05.md`

---

## 🔁 S2-T01C Reflection — AudioBuffer Wiring

**What was done:**  
Wired mic input to an `AudioContext` stream using `ScriptProcessorNode`. Captured and logged real-time audio buffer data for future waveform analysis.

---

### ✅ What Went Well

- Real-time audio processing worked without special config
- ScriptProcessorNode simple to wire and validate
- Logs showed constant 4096-length audio buffers
- No bugs, race conditions, or user-side issues

---

### ⚠️ What Didn’t Go Smoothly

- Browser warns `ScriptProcessorNode` is deprecated
- Required connecting to `destination` to stay alive (undocumented edge case)
- No visible waveform yet — placeholder only

---

### 💡 Lessons & Decisions

- Web Audio API provides low-latency, in-browser processing for mic input
- Can defer migrating to `AudioWorklet` until we hit real performance needs
- Logs are helpful but waveform rendering needs to be visual soon
- Buffer size of 4096 is a safe baseline

---

### 🔐 Safeguards Recap

- Tag: `S2-T01C`
- Journaled and committed on `phase/2`
- Live tested via `ngrok` with working console output

---

## 🔁 S2-T01D Reflection — Mic Waveform Animation

**What was done:**  
Implemented live waveform animation inside `MicTest.tsx` by streaming mic data through a `ScriptProcessorNode`, then visualizing it via `canvas` using `requestAnimationFrame()`.

---

### ✅ What Went Well

- Canvas and audio pipeline integrated seamlessly
- Frame rate held steady (smooth rendering)
- Amplitude normalized correctly with visible waveform response
- Worked instantly via `ngrok` with no auth or permission issues

---

### ⚠️ What Didn’t Go Smoothly

- Browser warning for deprecated `ScriptProcessorNode` (known and accepted)
- Hardcoded canvas size (640x80) might need later responsiveness

---

### 💡 Lessons & Decisions

- `ScriptProcessorNode` is sufficient for dev — migration to `AudioWorklet` only if needed
- Canvas gives lightweight control for custom rendering (vs. libraries)
- Animation loop can serve double duty: waveform + VAD (future)
- Start buffering audio data for fingerprinting in parallel

---

### 🔐 Safeguards Recap

- Git Tag: `S2-T01D`
- Journaled in `journal-2025-09-05.md`
- Dev tested and validated via `ngrok`

## 🔁 Reflection — S2-T01E: Voice Activity Detection (VAD)

Adding VAD elevated the MicTest from passive waveform to active input awareness. By mapping volume to RMS and exposing `speaking` vs `silent` states, we now have a dependable signal for deciding when to trigger ASR, visual alerts, or suppress unnecessary processing.

### What went well:
- Visual + programmatic VAD feedback works cleanly
- No perceptible lag between audio and visual feedback
- Code separation (buffer handling vs VAD state) remains modular

### What could be improved:
- RMS-based detection may be sensitive to background hum — consider future filtering or ML-based VAD later
- Currently logs status every transition — might want to debounce in final version

### Key Insight:
This layer forms the foundation of all audio responsiveness — from real-time ASR to live interviewer detection — and should remain observable, testable, and override-friendly even in production builds.

---

### 🪞 Reflection — S2-T01F

Voiceprint capture introduces our first personalization layer for ASR filtering.  
Using a single-sample fingerprint (mean of 1-second buffer) is a simple yet practical starting point.  
The challenge will be differentiating the speaker in multi-speaker sessions — this lays the groundwork.

Color-coded feedback and continuous calibration are possible future enhancements.

---
### S2-T01H Reflection

This task was an important real-time systems challenge. While the goal (buffering voice-matched speech) seemed straightforward, real-world constraints surfaced quickly:

- VAD signal needed smoothing — raw RMS was too noisy
- Buffering and cooldown had to be tightly coordinated to avoid false triggers
- Debugging required deep log visibility across state transitions
- Git push repeatedly failed due to giant `.tar.gz` snapshot files — requiring surgical cleanup of Git history using `git-filter-repo`

The final system now robustly detects and buffers segments based on voice match, duration, silence gaps, and debounce-tuned VAD signals. This creates a strong foundation for Whisper ASR integration in the next step.

### S2-T01I Reflection

This task encapsulated the audio pipeline's transition from raw stream to usable file format. Implementing a robust WAV encoder in-browser proved more reliable than relying on third-party libraries.

Key realizations:
- The WAV header is simple but unforgiving; getting byte offsets right was essential.
- Segment timing and grace periods directly affect how clean the audio Blob is.
- Logs played a crucial role in verifying proper cutoff, match state, and encoding.

This completes the "listen + filter + segment + encode" pipeline, readying audio for Whisper ASR.

### S2-T01J-A Reflection

This task added runtime flexibility to our audio transcription layer. Abstracting the backend via `transcribeWithProvider` ensures we can plug-and-play new providers later. The architecture aligns with our directive-based execution flow and prepares us for low-latency, fail-safe live captioning.
