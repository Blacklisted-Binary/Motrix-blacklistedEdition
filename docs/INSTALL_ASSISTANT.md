# Motrix Blacklisted Edition Install Assistant

This in-repo install assistant replaces the old external helper workflow and is aligned with this fork's current stack (Vue 3 renderer, updated browser extension guidance, and blacklisted-binary specific packaging changes).

## Who should use this

- Users upgrading from older Motrix releases that cannot auto-update cleanly
- Users migrating from legacy BundleID builds
- Windows users who want a clean reinstall path with current installer artifacts
- Users setting up the updated browser extension workflow

## Quick links

- Latest release artifacts: https://github.com/Blacklisted-Binary/Motrix-blacklistedEdition/releases
- Browser extension guidance: ./BROWSER_EXTENSION_COMPARISON.md
- Extension enhancement plan: ./MOTRIX_WEBEXTENSION_ENHANCEMENT_PLAN.md

## Windows install / upgrade (recommended path)

1. Download the newest `Motrix-Setup-*.exe` from Releases.
2. Close all running Motrix instances.
3. Run the installer and complete installation in the same directory used by your previous install (when upgrading).
4. Launch Motrix and review **Preferences → Advanced → RPC** settings if you use browser extension RPC calls.
5. If extension integration stops working after upgrade, re-check RPC Secret and port, then reconnect extension to `http://127.0.0.1:16800/jsonrpc` (or your custom port).

### Optional package managers

- Chocolatey: `choco upgrade motrix`
- Scoop: `scoop update motrix`

> Package manager indexes may lag behind the latest fork release. Prefer the GitHub Release installer when immediate upgrade is required.

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
