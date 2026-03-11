# Browser Extension Comparison for Motrix-blacklistedEdition

> **Status:** Decision made — `motrix-webextension` is the primary integration. A detailed
> technical enhancement plan (URL-pattern routing, fallback download, context menu, auto
> path routing, side panel) that repurposes code from YAAW-for-Chrome and Aria2 Explorer
> is in **[docs/MOTRIX_WEBEXTENSION_ENHANCEMENT_PLAN.md](./MOTRIX_WEBEXTENSION_ENHANCEMENT_PLAN.md)**.
>
> This document provides the full four-extension comparison that led to that decision.

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
- Does not yet have multiple-RPC-server routing, auto-path routing, context menu, or
  side-panel mode — but all of these are being added by repurposing YAAW-for-Chrome and
  Aria2 Explorer code. See the
  [enhancement plan](./MOTRIX_WEBEXTENSION_ENHANCEMENT_PLAN.md) for full details.
- Requires Motrix to be running — cannot launch it from the extension. (Fallback-to-
  browser-download, which handles this gracefully, is also covered in the plan.)

#### Integration with Motrix-blacklistedEdition and enhancement plan
The only Motrix desktop work needed:
1. Add a "Browser Extension" banner/button in Preferences → Advanced that links to
   the Chrome Web Store and Firefox Add-ons pages.
2. Add a "Copy RPC connection string" button next to the RPC Secret field so users
   can one-click-copy `http://127.0.0.1:16800/jsonrpc` with their token embedded.
3. Update the `rpc-secret-tips` wiki link to point to the motrix-webextension setup guide.

**Extension-side enhancements** (repurposing YAAW-for-Chrome and Aria2 Explorer code):
- URL-pattern routing for multiple RPC servers
- Auto download-path routing by URL pattern
- Fallback to browser download when Motrix is unavailable
- Right-click context menu for any link
- Side panel display mode

Full technical details with code samples for every one of these features are in
**[docs/MOTRIX_WEBEXTENSION_ENHANCEMENT_PLAN.md](./MOTRIX_WEBEXTENSION_ENHANCEMENT_PLAN.md)**.

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

### Current state (before enhancements)

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
| **Auto download-path routing** | ❌ | ❌ | ❌ | ✅ |
| **Cloud sync** | ❌ | ❌ | ❌ | ✅ |
| **Batch page export** | ❌ | ❌ | ❌ | ✅ |
| **Fallback download** | ❌ | ❌ | ❌ | ✅ |
| **Context menu** | ❌ | ❌ | ❌ | ✅ |
| **Inter-extension API** | ❌ | ❌ | ❌ | ✅ |
| **Side panel mode** | ❌ | ❌ | ✅ | ❌ |
| **Built-in UI** | AriaNg (old) | Material-UI | YAAW | AriaNG Enhanced |
| **Design matches Motrix** | ❌ | ✅ | ❌ | ❌ |

### After motrix-webextension enhancements (see [enhancement plan](./MOTRIX_WEBEXTENSION_ENHANCEMENT_PLAN.md))

| Feature | motrix-webextension (enhanced) |
|---------|:------------------------------:|
| **Multiple RPC servers** | ✅ (Feature 1 — from YAAW) |
| **URL-pattern routing** | ✅ (Feature 1 — from YAAW) |
| **Auto download-path routing** | ✅ (Feature 2 — from Aria2 Explorer) |
| **Fallback download** | ✅ (Feature 3 — from Aria2 Explorer) |
| **Context menu** | ✅ (Feature 4 — from Aria2 Explorer) |
| **Side panel mode** | ✅ (Feature 5 — from YAAW) |
| Firefox support | ✅ (retained) |
| Motrix-specific design | ✅✅ (retained) |

---

## Recommendation

### Short Answer
**Use `motrix-webextension` as the primary integration and enhance it** by repurposing
MIT-licensed code from YAAW-for-Chrome and Aria2 Explorer. This gives all the best
features of all three active extensions in a single, Motrix-native, multi-browser package.
Drop Camtd entirely — it is broken in modern Chrome.

The complete technical enhancement plan (with code samples for every feature) is in
**[docs/MOTRIX_WEBEXTENSION_ENHANCEMENT_PLAN.md](./MOTRIX_WEBEXTENSION_ENHANCEMENT_PLAN.md)**.

### Detailed Recommendation

#### ✅✅ PRIMARY: `gautamkrishnar/motrix-webextension` + enhancements
**Why:** The only option designed for Motrix, works on Chrome/Firefox/Edge/Opera, and
actively maintained. With the planned enhancements it also gains every meaningful feature
from YAAW-for-Chrome and Aria2 Explorer, eliminating the need for users to install
multiple separate extensions.

**Features added by the enhancement plan:**

| Feature | Borrowed from |
|---------|--------------|
| URL-pattern routing for multiple RPC servers | YAAW-for-Chrome |
| Auto download-path routing | Aria2 Explorer |
| Fallback to browser download | Aria2 Explorer |
| Right-click context menu | Aria2 Explorer |
| Side panel mode | YAAW-for-Chrome |

#### ⚠️ OPTIONAL REFERENCE: `acgotaku/YAAW-for-Chrome` and `alexhua/Aria2 Explorer`
Both remain good extensions for users who do not use Motrix. They serve as the code
sources for the enhancements above. Their URL-pattern routing and reliability features
are worth documenting as the inspiration for the motrix-webextension improvements.

#### ❌ SKIP: `jae-jae/Camtd`
Non-functional. Manifest v2 was permanently removed from Chrome in June 2024. Camtd has
not been updated since December 2020. There is no point integrating, documenting, or
recommending it.

---

### Why Not Just Use Multiple Separate Extensions?

| Scenario | Old recommendation | New recommendation |
|----------|-------------------|-------------------|
| **Simple — just browser downloads to Motrix** | motrix-webextension only | motrix-webextension (enhanced) |
| **Firefox + Chrome** | motrix-webextension | motrix-webextension (enhanced, both browsers) |
| **Multiple aria2 servers** | YAAW-for-Chrome | motrix-webextension + URL-pattern routing |
| **Fallback when Motrix is off** | Aria2 Explorer | motrix-webextension + fallback feature |
| **Right-click any link** | Aria2 Explorer | motrix-webextension + context menu |
| **Side panel** | YAAW-for-Chrome | motrix-webextension + side panel mode |
| **Camtd** | ❌ Do not use | ❌ Still do not use |

Rather than asking users to install two or three separate extensions (and configure each
separately), enhancing motrix-webextension with these features gives the combined
experience in a single, Motrix-native, properly maintained extension.

---

## Approved Integration Plan

### Motrix desktop changes (UI-only, no backend work)

1. **`src/renderer/components/Preference/Advanced.vue`** — Add a "Browser Extension"
   section below the RPC Secret field with install links and a Copy RPC Connection String
   button.
2. **`src/shared/locales/en-US/preferences.js`** (and other locales) — Add translation
   keys for the new section labels.
3. **`docs/UPGRADE_SUGGESTIONS.md`** — Already updated.

### motrix-webextension changes (upstream contribution)

See [docs/MOTRIX_WEBEXTENSION_ENHANCEMENT_PLAN.md](./MOTRIX_WEBEXTENSION_ENHANCEMENT_PLAN.md)
for the full technical plan, code samples, and recommended implementation order.

---

*Implementation begins immediately upon approval.*
