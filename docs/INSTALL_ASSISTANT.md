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

## Advanced networking research & protocol roadmap (consent-based)

This section covers design research for next-gen networking features where all network interfaces are user-owned or explicitly authorized.

### Trusted ecosystem references (high-signal repos)

- `aria2/aria2` — multi-protocol segmented downloading and JSON-RPC control model.
- `transmission/transmission` — mature BitTorrent client architecture and daemon/web control split.
- `yt-dlp/yt-dlp` — battle-tested video/audio extraction and format-selection pipeline.
- `quasarframework/quasar` — Vue 3 UI framework path for advanced settings/flows.
- `element-plus/element-plus`, `vueuse/vueuse`, `vuejs/pinia` — stateful Vue 3 UX/runtime utility baseline.
- `webtorrent/webtorrent` — JS-native torrent/streaming primitives useful for hybrid download orchestration.

### Protocol concept for multi-link load-balancing

The app should not directly hijack system routing. Instead, it should:

1. Detect available **authorized** interfaces (Ethernet/Wi‑Fi hotspot/cellular/VPN).
2. Maintain per-interface health telemetry (latency, packet loss, throughput, metered cost flag).
3. Score interfaces per task type (bulk file, stream, latency-sensitive metadata).
4. Apply routing policy through:
   - per-task proxy binding,
   - interface-aware helper/sidecar service (platform specific),
   - or OS-native route table integration where permissions allow.
5. Continuously re-evaluate and fail over when interface quality drops.

### AI-assisted routing policy (user-controlled)

Recommended controllable policy dimensions:

- prefer speed / prefer stability / prefer privacy / minimize cost
- respect metered interfaces
- protocol-aware hints (e.g., metadata vs payload traffic)
- per-category rules (video, archive, torrents, music)

Implementation note: start with deterministic scoring + heuristics, then add optional AI ranking over the same explicit features.

### Scheduler support

This fork now includes a built-in off-peak scheduler hook in the main process:

- user config key: `download-scheduler`
- supports multiple daily windows (including cross-midnight windows)
- automatically pauses all downloads outside configured windows and resumes inside active windows

Example:

```json
{
  "download-scheduler": {
    "enabled": true,
    "timezone": "local",
    "windows": [
      { "start": "00:30", "end": "06:30" },
      { "start": "13:00", "end": "14:00" }
    ]
  }
}
```

### Multi-interface routing policy support (authorized links)

This fork now includes a runtime routing policy manager that can apply interface scoring and adapt Aria2 proxy preference dynamically.

User config key: `network-routing-policy`

```json
{
  "network-routing-policy": {
    "enabled": true,
    "mode": "balanced",
    "allow-metered": false,
    "latency-weight": 0.45,
    "throughput-weight": 0.45,
    "privacy-weight": 0.10,
    "interfaces": [
      {
        "name": "home-wifi",
        "enabled": true,
        "metered": false,
        "latencyMs": 19,
        "throughputMbps": 280,
        "privacyLevel": 0.85,
        "proxy": ""
      },
      {
        "name": "cellular-hotspot",
        "enabled": true,
        "metered": true,
        "latencyMs": 42,
        "throughputMbps": 95,
        "privacyLevel": 0.92,
        "proxy": "http://127.0.0.1:8787"
      },
      {
        "name": "authorized-neighbor-wifi",
        "enabled": true,
        "metered": false,
        "latencyMs": 34,
        "throughputMbps": 120,
        "privacyLevel": 0.7,
        "proxy": "http://127.0.0.1:8790"
      }
    ]
  }
}
```

Modes currently supported:

- `balanced`
- `speed-first`
- `privacy-first`

### AI-enhanced YouTube workflow (design-level)

A practical/legal implementation path is:

1. Integrate yt-dlp engine adapter (external binary/service with explicit user consent).
2. Provide guided presets:
   - Video best quality
   - Audio extraction (MP3/other formats) on the fly
3. Add recommendation continuation modes (user opt-in):
   - same channel/artist
   - same genre/topic
   - playlist/top-viewed variants
4. Show explicit queue preview before enqueue to avoid unwanted bulk downloads.
