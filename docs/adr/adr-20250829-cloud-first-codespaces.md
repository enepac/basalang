# ADR: Adopt GitHub Codespaces as Default Development Environment

## Status
Accepted

## Context
Previous phases of Basalang development were bootstrapped using a Windows-local environment. As the project advances toward production and team scaling, we require:
- A reproducible, zero-setup dev environment
- Built-in CI compatibility and container isolation
- Fully online access for development, staging, and debugging
- GitHub-native integration and ephemeral prebuild support

## Decision
We adopt **GitHub Codespaces** using the preconfigured `.devcontainer` as the **default development environment** for all engineering tasks.

- All workflows, commands, and environments will assume Codespaces unless explicitly overridden.
- Local development is still supported but **non-default** and must comply with Codespaces parity.
- Devcontainer image will be versioned and published to **GHCR** on merge to `main`.
- Drift detection and prebuilds will validate `.devcontainer/**` consistency.

## Consequences
- Removes dependency on developer OS/environment.
- GitHub Codespaces Prebuilds must be enabled.
- CI will be extended to validate container and devcontainer config hashes.
- Developers must launch Codespaces for the latest, verified baseline.

## Supersedes
- Initial Windows-local dev environment bootstrapped in Stage 0.
- Any documents referencing `C:/Users/...` or local shell workflows.

## References
- [System Directive: Fully Online Production Development](../directives/system_online_development.md)
- [WBS v2.3 — Cloud-first alignment](../wbs_v2.3.md)
- [Devcontainer Manifest](../../.devcontainer/devcontainer.json)
