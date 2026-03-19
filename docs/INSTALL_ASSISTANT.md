# Motrix Blacklisted Edition Install Assistant

This in-repo install assistant replaces the old external helper workflow and is aligned with this fork's current stack (Vue 3 renderer, updated browser extension guidance, and blacklisted-binary specific packaging changes).

## Blueprint / design / protocol summary

- **Purpose:** provide a stable, secure upgrade path and post-install validation flow for app + extension users.
- **Concept:** keep install steps simple while ensuring runtime protocol compatibility (Aria2 JSON-RPC + extension RPC wiring).
- **Primary protocol:** Aria2 JSON-RPC endpoint (default `http://127.0.0.1:16800/jsonrpc`) with optional secret token.
- **Design target:** low-friction setup, secure defaults, and predictable recovery when users migrate from older builds.

## Who should use this

- Users upgrading from older Motrix releases that cannot auto-update cleanly
- Users migrating from legacy BundleID builds
- Windows users who want a clean reinstall path with current installer artifacts
- Users setting up the updated browser extension workflow

## Quick links

- Latest release artifacts: https://github.com/Blacklisted-Binary/Motrix-blacklistedEdition/releases
- Browser extension guidance: ./BROWSER_EXTENSION_COMPARISON.md
- Extension enhancement plan: ./MOTRIX_WEBEXTENSION_ENHANCEMENT_PLAN.md

## Vue 3 integration pack (repo-aligned)

The fork now tracks Vue 3-compatible ecosystem additions in package metadata:

- `quasar` (Vue 3 / Quasar v2+)
- `element-plus` (already in use)
- `@vueuse/core`
- `pinia`
- `vue3-apexcharts` + `apexcharts`
- `vuedraggable` (Vue 3 line)
- `webtorrent`
- `notiflix`
- `clipboard`
- `quill`

These are integrated at dependency/protocol level so they can be enabled in feature modules incrementally without breaking the current Vuex-based runtime.

## Windows install / upgrade (recommended path)

1. Download the newest `Motrix-Setup-*.exe` from Releases.
2. Close all running Motrix instances.
3. Run the installer and complete installation in the same directory used by your previous install (when upgrading).
4. Launch Motrix and review **Preferences → Advanced → RPC** settings if you use browser extension RPC calls.
5. If extension integration stops working after upgrade, re-check RPC Secret and port, then reconnect extension to `http://127.0.0.1:16800/jsonrpc` (or your custom port).

### Optional package managers

- Chocolatey: `choco upgrade motrix`
- Scoop: `scoop update motrix`

> Package manager indexes may lag behind the latest fork Release. Prefer the GitHub Release installer when immediate upgrade is required.

## macOS install / upgrade

1. Download the latest `.dmg` from Releases.
2. Replace the app in `/Applications`.
3. Open Motrix once, then confirm Advanced preferences (especially RPC if using extensions).

## Linux install / upgrade

1. Download the latest `.AppImage`, `.deb`, `.rpm`, or `snap` package from Releases.
2. Install using your distribution's normal process.
3. Open Motrix and verify RPC settings if extension integration is enabled.

## Browser extension setup notes

- Recommended baseline extension path is documented in `BROWSER_EXTENSION_COMPARISON.md`.
- Keep RPC secret/port in sync between Motrix and extension settings.
- If extension requests fail, test local RPC endpoint first, then re-authorize in extension settings.

## Aria2 upgrade hardening included in this fork

The install assistant now expects and documents the following Aria2 improvements (applied to bundled configs + system defaults):

1. **RPC exposure reduction:** loopback-only RPC defaults (`rpc-listen-all=false`) to reduce local attack surface.
2. **Cross-origin tightening:** disable wildcard CORS for RPC by default (`rpc-allow-origin-all=false`).
3. **TLS validation enabled:** certificate verification defaulted to on (`check-certificate=true`).
4. **Smarter retry strategy:** bounded retries + shorter wait (`max-tries=8`, `retry-wait=3`) for faster recovery.
5. **Stall handling:** minimum-speed failover (`lowest-speed-limit`) to avoid hanging transfers.
6. **Connection efficiency:** keep-alive + pipelining enabled where supported for better throughput.
7. **Resume resilience:** URI reuse + resume-failure limits for more reliable mirror retry behavior.
