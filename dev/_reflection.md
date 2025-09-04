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
