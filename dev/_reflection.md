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

