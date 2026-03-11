# Browser Extension Comparison for Motrix-blacklistedEdition

> **Status:** Research complete — awaiting user decision before any integration begins.
>
> This document compares four browser extensions that can route browser downloads through aria2,
> evaluates each against Motrix-blacklistedEdition's specific architecture, and provides a clear
> recommendation on which to use (and whether to combine them).

---

## Context: How Motrix-blacklistedEdition Exposes aria2

Motrix spawns a bundled aria2 subprocess with these RPC defaults:

| Setting | Value | Source |
|---------|-------|--------|
| Host | `127.0.0.1` | `src/shared/constants.js → ENGINE_RPC_HOST` |
| Port | `16800` | `src/shared/constants.js → ENGINE_RPC_PORT` |
| RPC path | `/jsonrpc` | JSON-RPC 2.0 protocol |
| Auth | Token-based (`rpc-secret`) | Configurable in Preferences → Advanced |
| Origin | `127.0.0.1` only | No `--rpc-allow-origin-all` by default |

Any browser extension that wants to send downloads to Motrix must connect to
`http://127.0.0.1:16800/jsonrpc` (or `http://localhost:16800/jsonrpc`) with the user's
RPC secret. The existing **Preferences → Advanced** panel already exposes the secret field
and links to the setup wiki.

---

## The Four Candidates

---

### 1. `jae-jae/Camtd` — Chrome Multi-Threaded Download

**Repo:** https://github.com/jae-jae/Camtd  
**License:** MIT  
**Chrome Web Store:** https://chrome.google.com/webstore/detail/camtd-aria2-download-mana/lcfobgbcebdnnppciffalfndpdfeence

#### What it does
Chrome extension that intercepts browser downloads and redirects them to a local aria2
instance via JSON-RPC. Bundles an embedded AriaNg UI, supports token/password auth, and
has blacklist/whitelist rules by domain, extension, and file size.

#### Maintenance status: ⛔ DEAD — Do Not Use
- **Last commit: December 9, 2020** — over 4 years ago, no patches since.
- Built on **Chrome Extension Manifest v2**, which Google permanently removed from Chrome
  in **June 2024**. Camtd will not load in any modern Chrome/Chromium browser.
- No Manifest v3 migration has been done.
- AriaNg version bundled is years out of date.

#### Technical details
- Language: ES2015 via Babel 6 (obsolete toolchain)
- Build: Gulp 3 (EOL)
- No Firefox support
- Manifest v2 only (blocked by Chrome since June 2024)

#### Pros
- Was well-designed when maintained; granular filtering rules.
- FTP/SFTP interception (uncommon in other extensions).

#### Cons (deal-breakers)
- **Does not work in modern Chrome** — Manifest v2 is permanently removed.
- No updates in 4+ years; effectively abandoned.
- Outdated toolchain (Babel 6, Gulp 3, Node 10-era code).
- Chrome-only even when it was working.

#### Recommendation: ❌ **DO NOT USE — Camtd is non-functional on modern Chrome**

---

### 2. `gautamkrishnar/motrix-webextension` — Official Motrix Browser Extension

**Repo:** https://github.com/gautamkrishnar/motrix-webextension  
**License:** MIT  
**Chrome Web Store:** https://chrome.google.com/webstore/detail/motrix-webextension/djlkbfdlljbachafjmfomhaciglnmkgj  
**Firefox Add-ons:** https://addons.mozilla.org/en-US/firefox/addon/motrixwebextension/

#### What it does
The **only browser extension purpose-built for Motrix** (not generic aria2). Intercepts
all browser downloads and routes them to the Motrix desktop app's aria2 RPC endpoint.
Built with React + Material-UI and RxJS reactive streams. Available for Chrome, Firefox,
Edge, and Opera.

#### Maintenance status: ✅ ACTIVE
- **Last major update: July 15, 2025** — full event-driven architecture refactor.
- Active bug fixes, regular version bumps.
- **Version 2.0.1** currently available on both Chrome Web Store and Firefox Add-ons.
- Maintained by @gautamkrishnar (prolific open-source contributor).

#### Technical details
- Language: JavaScript (React 17)
- UI: Material-UI v5 (`@mui/material`) — visually consistent with Motrix design language
- Build: webextension-toolbox v7.1.1 (cross-browser build system)
- State: RxJS reactive streams
- RPC: `aria2` npm package (v4.1.2) — same JSON-RPC as Motrix uses
- Manifest: v3 (Chrome) + compatible manifest for Firefox

#### Browser support
| Browser | Supported | Source |
|---------|-----------|--------|
| Chrome / Chromium | ✅ | Chrome Web Store |
| Firefox | ✅ | Mozilla Add-ons |
| Edge | ✅ | via Chrome Web Store |
| Opera | ✅ | via Chrome Web Store |

#### Key features
- ✅ Intercepts all HTTP/HTTPS browser downloads
- ✅ Configurable RPC host, port, and secret (points directly at Motrix's aria2)
- ✅ Material-UI popup matching Motrix's design
- ✅ Event-driven download queue (since v2)
- ✅ Works out-of-the-box with Motrix's default port 16800

#### Pros
- **Built specifically for Motrix** — zero configuration friction.
- **Firefox support** — the only extension in this comparison that works on Firefox.
- Actively maintained; the developer keeps pace with Motrix itself.
- Clean integration with Motrix's existing Preferences → Advanced → RPC Secret flow.
- Material-UI design matches Motrix's aesthetic.
- Multi-browser with a single codebase.

#### Cons
- Does not have the batch-export or cloud-sync features of Aria2 Explorer.
- No multiple-RPC-server routing (only connects to one Motrix instance).
- Requires Motrix to be running — cannot launch it from the extension.

#### Integration with Motrix-blacklistedEdition (once approved)
The only Motrix-side work needed:
1. Add a "Browser Extension" banner/button in Preferences → Advanced that links to
   the Chrome Web Store and Firefox Add-ons pages.
2. Add a "Copy RPC connection string" button next to the RPC Secret field so users
   can one-click-copy `http://127.0.0.1:16800/jsonrpc` with their token embedded.
3. Update the `rpc-secret-tips` wiki link to point to the motrix-webextension setup guide.

#### Recommendation: ✅✅ **PRIMARY CHOICE — Purpose-built, actively maintained, Firefox support**

---

### 3. `acgotaku/YAAW-for-Chrome` — Yet Another Aria2 Web Frontend

**Repo:** https://github.com/acgotaku/YAAW-for-Chrome  
**License:** MIT  
**Chrome Web Store:** https://chrome.google.com/webstore/detail/yaaw-for-chrome/dennnbdlpgjgbcjfgaohdahloollfgoc

#### What it does
Chrome extension providing a YAAW-based popup dashboard for managing generic aria2
instances. Intercepts browser downloads with whitelist/blacklist rules, supports multiple
RPC server profiles with URL-pattern-based routing, and can display in popup, new tab, new
window, or side-panel mode.

#### Maintenance status: ✅ ACTIVE
- **Last commit: March 23, 2025** (added package bundling).
- Ongoing Vue 3 migration completed in February 2025.
- Active issue tracker.

#### Technical details
- Language: JavaScript + Vue 3
- Build: Gulp + pnpm
- RPC: Custom aria2 JSON-RPC client
- UI: YAAW (Yet Another Aria2 Web) embedded
- Manifest: Modern (Chrome-compatible)

#### Browser support
| Browser | Supported |
|---------|-----------|
| Chrome / Chromium | ✅ |
| Firefox | ❌ |
| Edge | Untested |

#### Key features
- ✅ Download interception with domain/extension/size rules
- ✅ **Multiple RPC server profiles with URL-pattern routing** (unique feature)
- ✅ Multiple display modes: popup, new tab, window, side panel
- ✅ Whitelist/blacklist with pattern matching (e.g., `*.baidu.com`, `github.com`)
- ✅ Real-time download monitoring

#### Unique feature: URL-pattern RPC routing
YAAW can be configured with multiple aria2 servers and will automatically route a download
to the right server based on URL patterns. Example: route all GitHub downloads to one aria2
instance, all video sites to another. This is powerful for advanced users running multiple
aria2 instances.

In the context of Motrix-blacklistedEdition, which runs a single aria2 instance, this
feature adds no immediate value — but it becomes relevant if multi-instance support is
ever added.

#### Pros
- Actively maintained with modern Vue 3 codebase.
- Multiple display modes including side panel (modern Chrome feature).
- URL-pattern routing is a genuinely unique power-user feature.
- Clean, lightweight codebase.

#### Cons
- **Chrome-only** — no Firefox support.
- Not Motrix-specific; users must manually configure port 16800 and RPC secret.
- The URL-pattern routing is overkill for a single-instance Motrix setup.
- No batch export or cloud sync.

#### Recommendation: ⚠️ **SECONDARY OPTION — Good for Chrome power users, but Motrix-specific extension wins**

---

### 4. `alexhua/Aria2-for-Chrome` (Aria2 Explorer)

**Repo:** https://github.com/alexhua/Aria2-for-Chrome  
**License:** MIT  
**Chrome Web Store:** https://chrome.google.com/webstore/detail/mpkodccbngfoacfalldjimigbofkhgjn  
**Edge Add-ons:** https://microsoftedge.microsoft.com/addons/detail/jjfgljkjddpcpfapejfkelkbjbehagbh

#### What it does
The most feature-rich generic aria2 browser extension available. Intercepts browser
downloads, routes them to aria2, and includes batch resource export from pages, cloud
settings synchronization, an enhanced AriaNG UI, inter-extension communication, smart
URL-pattern-based server/path routing, and a fallback to the native browser downloader
if aria2 is unavailable.

#### Maintenance status: ✅ ACTIVE
- Ongoing development with regular feature additions and bug fixes.
- Multiple language support (Chinese, English, French, Japanese, Korean, Russian, and more).

#### Technical details
- Language: JavaScript (vanilla, no heavy framework)
- Build: Webpack
- UI: AriaNG (enhanced version, updated from upstream)
- Architecture: Content script + background service worker + popup
- Manifest: v3 (Chrome) + Edge compatible

#### Browser support
| Browser | Supported |
|---------|-----------|
| Chrome / Chromium | ✅ |
| Edge | ✅ (dedicated Edge Add-ons listing) |
| Firefox | ❌ |

#### Key features
- ✅ Auto-capture browser downloads with toggle shortcut (Alt+A)
- ✅ **Batch export of page resources** (all images, audio, video, magnets from a page)
- ✅ **Cloud sync** of all settings and AriaNG UI state
- ✅ **Enhanced AriaNG** UI (improvements over base AriaNG)
- ✅ Advanced filtering (domain → extension → file-size priority cascade)
- ✅ URL-pattern-based **auto-select download path** (route by URL to different save folders)
- ✅ **Fallback to browser download** if aria2 disconnects
- ✅ **Inter-extension communication** (other extensions can send downloads to Aria2 Explorer)
- ✅ Context menu integration (right-click any link)
- ✅ Keyboard shortcuts (Alt+J download, Alt+S save, etc.)
- ✅ Download status badge on extension icon

#### Unique features not in other extensions
1. **Batch page resource export** — right-click on a page and download all images, all audio,
   all video, or all magnets in one click. Huge productivity feature.
2. **Cloud sync** — settings survive reinstalls and sync across devices.
3. **Fallback download** — if Motrix/aria2 is not running, the download still happens in the
   browser normally. No lost downloads.
4. **Inter-extension messaging** — other Chrome extensions can call into Aria2 Explorer,
   making it the hub for a broader download management ecosystem.
5. **Auto download-path routing** — configure that `*.github.com` downloads go to
   `~/Code/`, while video sites go to `~/Videos/`.

#### Pros
- Most feature-complete extension available for aria2.
- Cloud sync is a genuine quality-of-life feature.
- Fallback-to-browser-download is important for reliability.
- Batch export is a power feature not available elsewhere.
- Enhanced AriaNG UI (improved over what Camtd or YAAW bundle).
- Works with Motrix's port 16800 out of the box.

#### Cons
- **No Firefox support** — Chrome and Edge only.
- Not Motrix-specific; users must configure port 16800 and RPC secret manually.
- More complex to configure for new users vs. the Motrix-dedicated extension.
- Slightly heavier due to cloud sync and richer feature set.

#### Recommendation: ✅ **EXCELLENT for Chrome/Edge power users — best complement to motrix-webextension**

---

## Head-to-Head Comparison

| Feature | Camtd | motrix-webextension | YAAW-for-Chrome | Aria2 Explorer |
|---------|:-----:|:-------------------:|:---------------:|:--------------:|
| **Actively Maintained** | ❌ Dead | ✅ Jul 2025 | ✅ Mar 2025 | ✅ Active |
| **Chrome support** | ❌ MV2 broken | ✅ | ✅ | ✅ |
| **Firefox support** | ❌ | ✅ | ❌ | ❌ |
| **Edge support** | ❌ | ✅ | ❌ | ✅ |
| **Manifest version** | v2 ❌ | v3 ✅ | v3 ✅ | v3 ✅ |
| **Motrix-specific** | ❌ | ✅✅ | ❌ | ❌ |
| **Download interception** | ✅ | ✅ | ✅ | ✅ |
| **Domain/size filtering** | ✅ | ✅ | ✅ | ✅ |
| **Multiple RPC servers** | ❌ | ❌ | ✅ | ✅ |
| **URL-pattern routing** | ❌ | ❌ | ✅ | ✅ |
| **Cloud sync** | ❌ | ❌ | ❌ | ✅ |
| **Batch page export** | ❌ | ❌ | ❌ | ✅ |
| **Fallback download** | ❌ | ❌ | ❌ | ✅ |
| **Inter-extension API** | ❌ | ❌ | ❌ | ✅ |
| **Side panel mode** | ❌ | ❌ | ✅ | ❌ |
| **Built-in UI** | AriaNg (old) | Material-UI | YAAW | AriaNG Enhanced |
| **Design matches Motrix** | ❌ | ✅ | ❌ | ❌ |

---

## Recommendation

### Short Answer
**Use `motrix-webextension` as the primary integration.** It is the only option
that was built specifically for Motrix, supports Firefox, and is actively maintained.
Drop Camtd entirely — it is broken in modern Chrome.

For power users who want extra features (batch export, cloud sync, fallback download),
**also recommend `Aria2 Explorer`** as an optional alternative/complement.

### Detailed Recommendation

#### ✅✅ PRIMARY: `gautamkrishnar/motrix-webextension`
**Why:** The most important integration to add. It is designed for Motrix, requires minimal
configuration (users already know the RPC secret from Preferences → Advanced), works on
Chrome, Firefox, Edge, and Opera, and is actively updated alongside Motrix's own releases.

**Motrix-side work needed (all UI-only, no backend changes):**
1. Add a "Browser Extension" card in **Preferences → Advanced** with:
   - Links to Chrome Web Store + Firefox Add-ons pages.
   - A "Copy RPC URL" button that copies `http://127.0.0.1:16800/jsonrpc` (or with token
     embedded if a secret is configured: `http://token:SECRET@127.0.0.1:16800/jsonrpc`).
2. Update the `rpc-secret-tips` help link to point at the motrix-webextension setup guide.

#### ✅ RECOMMENDED COMPANION: `alexhua/Aria2 Explorer`
**Why:** Complements motrix-webextension for Chrome/Edge users who want batch export,
cloud sync, or fallback-to-browser capability. Mention it as a "power user alternative"
in the setup documentation.

**Motrix-side work needed:** Documentation only — no code changes.

#### ⚠️ OPTIONAL: `acgotaku/YAAW-for-Chrome`
**Why:** Good, actively maintained, and the URL-pattern routing is a genuinely useful
advanced feature. Worth mentioning in documentation for users who run aria2 outside of
Motrix (e.g., a separate home server). Not a priority to document unless explicitly
requested.

#### ❌ SKIP: `jae-jae/Camtd`
**Why:** Non-functional. Manifest v2 was permanently removed from Chrome in June 2024 and
from Edge in 2024. Camtd has not been updated since December 2020 and will never receive a
Manifest v3 upgrade from its current maintainer. There is no point integrating, documenting,
or recommending it.

---

### Why Not Combine All Four?

| Scenario | Recommendation |
|----------|----------------|
| **Simple — just browser downloads to Motrix** | motrix-webextension only |
| **Firefox + Chrome** | motrix-webextension (covers both) |
| **Chrome power user** | motrix-webextension OR Aria2 Explorer |
| **Multiple aria2 servers** | YAAW-for-Chrome |
| **Most features possible** | Aria2 Explorer |
| **Camtd** | ❌ Do not use |

Combining motrix-webextension and Aria2 Explorer makes sense only if you want to offer
both as documented options: the Motrix-native one for most users, and Aria2 Explorer for
power users who want batch export and cloud sync.

---

## Approved Integration Plan (awaiting user go-ahead)

Once approved, the minimal Motrix-side changes for `motrix-webextension` integration are:

1. **`src/renderer/components/Preference/Advanced.vue`** — Add a "Browser Extension"
   section below the RPC Secret field with:
   - Installation links for Chrome and Firefox.
   - A button/display showing the full RPC connection string to paste into the extension.

2. **`src/shared/locales/en-US/preferences.js`** (and other locales) — Add translation
   keys for the new section labels.

3. **`docs/UPGRADE_SUGGESTIONS.md`** — Correct the outdated Camtd entry to reflect its
   Manifest v2 deprecation status.

4. **`README.md`** (optional) — Add a "Browser Integration" section linking to
   `motrix-webextension`.

**No aria2 configuration changes, no new npm packages, no backend changes.**

---

*Reply with which extension(s) to integrate and implementation will begin immediately.*
