# Upgrade & Enhancement Suggestions for Motrix-blacklistedEdition

> **Status:** Research complete — awaiting user approval before any integration work begins.
>
> This document covers browser extension options and **15 additional open-source repositories**
> that could meaningfully upgrade, enhance, and extend Motrix-blacklistedEdition. Each entry
> includes a full description, repurpose plan, pros/cons, and a recommendation.
> **Nothing will be added to the codebase until you choose which repos to integrate.**
>
> ⚠️ **The Camtd section below has been superseded.** See
> [docs/BROWSER_EXTENSION_COMPARISON.md](./BROWSER_EXTENSION_COMPARISON.md) for an
> up-to-date comparison of all four browser extension candidates (Camtd, motrix-webextension,
> YAAW-for-Chrome, Aria2 Explorer) with current maintenance status and a clear recommendation.
> **Short version: Camtd is broken on modern Chrome (Manifest v2 removed June 2024) —
> use `gautamkrishnar/motrix-webextension` instead.**

---

## Current App Summary

**Motrix-blacklistedEdition** is a full-featured desktop download manager built on:
- **Electron 22** (cross-platform desktop shell)
- **Vue.js 2 + Vuex + Element-UI** (frontend)
- **aria2** (download engine, spawned as a subprocess, communicating over WebSocket RPC at port 16800)

Supported protocols: HTTP/HTTPS, FTP, BitTorrent, Magnet links, Thunder.  
Key strengths: multi-connection downloads, selective torrent file download, automatic tracker updates, UPnP/NAT-PMP, 28+ languages, dark mode, system tray.

---

## Browser Extension Integration

> ⚠️ **Full, up-to-date comparison of all four browser extension candidates is in
> [docs/BROWSER_EXTENSION_COMPARISON.md](./BROWSER_EXTENSION_COMPARISON.md).** That
> document covers Camtd, motrix-webextension, YAAW-for-Chrome, and Aria2 Explorer with
> current maintenance status, feature matrices, and a concrete recommendation. Read it
> before making any decision here.

### `jae-jae/Camtd` — ❌ DEPRECATED — Do Not Use

**Repo:** https://github.com/jae-jae/Camtd  
**License:** MIT

> ⛔ **Camtd is non-functional on all modern Chrome/Chromium browsers.** It was built on
> Chrome Extension **Manifest v2**, which Google permanently removed from Chrome in
> **June 2024**. The project has not been updated since **December 2020** and will not
> receive a Manifest v3 upgrade. Attempting to install it will fail with a manifest
> version error.
>
> **Replacement:** Use `gautamkrishnar/motrix-webextension` — it is purpose-built for
> Motrix, works on Chrome, Firefox, Edge, and Opera, and is actively maintained.
> See [docs/BROWSER_EXTENSION_COMPARISON.md](./BROWSER_EXTENSION_COMPARISON.md) for
> the full comparison.

### `gautamkrishnar/motrix-webextension` — ✅ RECOMMENDED PRIMARY

**Repo:** https://github.com/gautamkrishnar/motrix-webextension  
**License:** MIT  
**Last update:** July 2025  
**Browser support:** Chrome, Firefox, Edge, Opera

The only browser extension **purpose-built for Motrix**. Intercepts browser downloads and
sends them to Motrix's aria2 RPC (port 16800). Actively maintained, multi-browser, and
visually consistent with Motrix's design language.

#### How to integrate with Motrix (once approved)
1. Add a "Browser Extension" card in **Preferences → Advanced** with install links for
   Chrome Web Store and Firefox Add-ons.
2. Add a "Copy RPC Connection String" button that copies
   `http://token:SECRET@127.0.0.1:16800/jsonrpc` with the user's current secret token
   pre-populated, ready to paste into the extension settings.
3. Update the `rpc-secret-tips` link to point at the motrix-webextension setup guide.

No aria2 configuration changes, no new npm packages, no backend changes required.

#### Recommendation ✅ **YES — Primary browser extension choice**

---

## 15 Additional Repository Suggestions

---

### 1. `yt-dlp/yt-dlp` — Video & Audio Downloader

**Repo:** https://github.com/yt-dlp/yt-dlp  
**License:** Unlicense  
**Language:** Python  
**Stars:** 85,000+

#### What it does
yt-dlp is a feature-rich fork of youtube-dl that can download video and audio from **1,000+ websites** including YouTube, TikTok, Twitter/X, Twitch VODs, Reddit, Bilibili, NicoNico, SoundCloud, and many more. It supports format selection, subtitle extraction, playlist download, cookies-based auth, rate limiting, and post-processing via FFmpeg.

#### How to repurpose for Motrix
- Bundle the yt-dlp binary (or call the system-installed one) alongside aria2, spawning it as a subprocess for URLs that aria2 cannot handle.
- Detect when a submitted URL matches a streaming/social media domain, and automatically route it to yt-dlp instead of aria2.
- Display yt-dlp downloads in the same task list UI with format/quality selection dialogs before the download starts.
- Implement a "Paste URL from clipboard" smart-detect feature that recognises YouTube/TikTok links.

#### Pros
- Massive site coverage — turns Motrix into a universal media grabber.
- Extremely active development; new site extractors added weekly.
- Format/quality picker would be a standout feature.
- Subtitle, thumbnail, and metadata download support.

#### Cons
- Python dependency (need to bundle a standalone binary or require Python runtime).
- Binary size increases (yt-dlp standalone ~15 MB per platform).
- yt-dlp output must be translated to Motrix's task model (progress parsing from stdout).
- Legal grey area in some jurisdictions depending on the content being downloaded.

#### Recommendation ✅ **YES — Flagship Feature Addition**
yt-dlp integration would be the single most-requested feature for a download manager. It transforms Motrix from a link/torrent downloader into a complete media acquisition tool.

---

### 2. `streamlink/streamlink` — Live Stream Capture Tool

**Repo:** https://github.com/streamlink/streamlink  
**License:** BSD-2-Clause  
**Language:** Python  
**Stars:** 12,000+

#### What it does
Streamlink extracts live video streams from platforms like Twitch, YouTube Live, HLS streams, and 80+ other sites, piping the raw stream data to a local file or a media player. It supports quality selection, segment caching, and authentication via cookies or OAuth.

#### How to repurpose for Motrix
- Add a "Live Stream" download mode that invokes streamlink for `twitch.tv`, `youtube.com/watch`, and `*.m3u8` URLs.
- Unlike yt-dlp (which is better for VODs), streamlink shines on live/in-progress streams.
- Show a live progress bar (bytes/duration) in the task view while the stream is being captured.

#### Pros
- Best-in-class for live streaming (Twitch, YouTube Live, etc.).
- Complements yt-dlp (VOD vs. live).
- Supports quality levels (360p, 720p, 1080p, best, worst).

#### Cons
- Python dependency — same bundling challenge as yt-dlp.
- Streams are unbounded in length; UI needs "stop capture" not just "cancel".
- Some platforms actively block streamlink.

#### Recommendation ⚠️ **CONDITIONAL — Add after yt-dlp**
Very powerful for live streams. Worth adding once yt-dlp integration is solid, since they share the same subprocess/binary model.

---

### 3. `webtorrent/webtorrent` — Streaming BitTorrent Client (Node.js)

**Repo:** https://github.com/webtorrent/webtorrent  
**License:** MIT  
**Language:** JavaScript/Node.js  
**Stars:** 29,000+

#### What it does
WebTorrent is a fully JavaScript-based BitTorrent client that works in both Node.js and the browser. It supports streaming (play while downloading), magnet links, torrent files, selective file download, and DHT/PEX/tracker discovery. It can replace or supplement aria2 for torrents.

#### How to repurpose for Motrix
- Replace or augment the aria2 BitTorrent engine with WebTorrent for richer programmatic control from the Node.js side (no RPC overhead, native events).
- Implement **stream-while-downloading** for video files inside a built-in player.
- Use WebTorrent's event system to display per-file progress, peer count, and piece graphs more granularly than aria2 allows.
- Keep aria2 for HTTP/FTP downloads and use WebTorrent only for torrent/magnet tasks.

#### Pros
- Pure JavaScript — no extra binary to bundle.
- Native streaming support — watch videos while they download.
- Richer API than aria2 RPC for torrent-specific features (piece map, peers list).
- Same author ecosystem as Motrix already uses.

#### Cons
- Switching torrent engines is a significant refactor.
- WebTorrent's performance for large torrents is lower than aria2's C++ implementation.
- Adds ~2 MB to the app bundle.
- Does not replace aria2 for HTTP/FTP — you'd maintain two engines.

#### Recommendation ⚠️ **CONDITIONAL — Consider for streaming feature only**
Running WebTorrent alongside aria2 (aria2 for HTTP, WebTorrent for torrents with streaming) adds real value. A full engine swap away from aria2 is riskier.

---

### 4. `puppeteer/puppeteer` — Headless Chrome Node.js API

**Repo:** https://github.com/puppeteer/puppeteer  
**License:** Apache-2.0  
**Language:** JavaScript/Node.js  
**Stars:** 88,000+

#### What it does
Puppeteer provides a high-level Node.js API for controlling headless Chromium. It can navigate pages, fill forms, take screenshots, intercept network requests, and extract download URLs from pages that require JavaScript rendering or login sessions.

#### How to repurpose for Motrix
- Build a **"Smart URL" parser** — for URLs that redirect through JavaScript or require cookies, Puppeteer can resolve the final download link and pass it to aria2.
- Implement cookie-based download support (e.g., downloading files behind login walls).
- Create a lightweight "browser scraper" tab in Motrix for one-click capture of download links from streaming pages.
- Could partially replace the Camtd extension for more complex interception scenarios.

#### Pros
- Handles JavaScript-heavy pages that aria2/curl cannot scrape.
- Cookie/session support for authenticated downloads.
- Could enable entirely new download sources without user configuring extensions.

#### Cons
- Puppeteer ships with a full Chromium binary (~250 MB) — very large.
- High memory usage when running headless Chrome.
- Significant complexity to implement safely (sandboxing, resource limits).
- Overkill for most Motrix use cases.

#### Recommendation ❌ **NO for now — Too heavy**
The binary size alone is prohibitive for a download manager. Consider only if a "smart URL resolver" feature becomes a specific user request. Puppeteer Lite (`puppeteer-core` + system Chrome) would be a lighter option.

---

### 5. `node-schedule/node-schedule` — Flexible Job Scheduler for Node.js

**Repo:** https://github.com/node-schedule/node-schedule  
**License:** MIT  
**Language:** JavaScript/Node.js  
**Stars:** 9,000+

#### What it does
node-schedule is a cron-like and date-based job scheduler for Node.js. It lets you schedule tasks to run at specific times, on a repeating schedule, or after a delay — all within the Node.js process (no OS cron required).

#### How to repurpose for Motrix
- Add a **"Schedule Download"** feature — users can queue a download to start at a specific time (e.g., 2 AM off-peak hours).
- Implement bandwidth scheduling (full speed overnight, limited speed during work hours).
- Schedule automatic pause/resume of downloads based on time windows.
- Use it for the existing tracker-update logic (replacing the manual `setInterval` used today).

#### Pros
- Tiny library (~50 KB), pure JavaScript, no native dependencies.
- Cron syntax AND JavaScript Date objects both supported.
- Persistent schedule across app restarts when combined with electron-store.
- Very low integration effort.

#### Cons
- No built-in schedule persistence — need to serialize to electron-store manually.
- If the app is not running at scheduled time, downloads won't start (expected, but must be communicated to users).

#### Recommendation ✅ **YES — Easy Win**
Scheduled downloads is a frequently requested feature in download managers. The library is tiny and the integration effort is minimal.

---

### 6. `Stuk/jszip` — ZIP Archive Creation & Extraction in JavaScript

**Repo:** https://github.com/Stuk/jszip  
**License:** MIT / GPLv3  
**Language:** JavaScript  
**Stars:** 9,500+

#### What it does
JSZip lets you create, read, and edit ZIP files entirely in JavaScript — both in the browser (renderer process) and in Node.js (main process).

#### How to repurpose for Motrix
- Add **post-download auto-extraction** — when a `.zip` file finishes downloading, offer to extract it in-place.
- Enable downloading multiple files as a ZIP bundle (zip-on-the-fly for HTTP downloads).
- Implement import/export of download task lists as ZIP archives (task history backup/restore).
- Could be used for bundling multiple torrent files or downloading GitHub release asset sets.

#### Pros
- Pure JavaScript, works in both Electron processes.
- Very well-maintained and widely used (~120M weekly npm downloads).
- Small footprint.

#### Cons
- Slow for very large archives (JavaScript vs. native unzip).
- Does not support `.rar`, `.7z`, or other formats — only ZIP.
- For better performance on large files, a native tool (like `unzipper` or calling system `unzip`) may be preferable.

#### Recommendation ⚠️ **CONDITIONAL — Use for small files; combine with native tools for large ones**
Auto-extract on download completion would be a great UX feature. JSZip is fine for most cases, but large archives (>500 MB) should be delegated to native tools.

---

### 7. `video-dev/hls.js` — HLS (HTTP Live Streaming) Player in JavaScript

**Repo:** https://github.com/video-dev/hls.js  
**License:** Apache-2.0  
**Language:** JavaScript  
**Stars:** 14,000+

#### What it does
hls.js is a JavaScript library that plays HLS (HTTP Live Streaming) streams directly in HTML5 `<video>` elements without requiring Flash or native browser support. It handles adaptive bitrate streaming, segment fetching, and encrypted streams (AES-128).

#### How to repurpose for Motrix
- Add **HLS/M3U8 download support** — detect `.m3u8` URLs and download all segments, then merge them via FFmpeg into a single file.
- Enable **preview of HLS streams** within Motrix's task detail panel before fully downloading.
- Use hls.js to display a live progress preview while downloading HLS content.
- Combine with the streamlink suggestion to handle cases where hls.js can retrieve what streamlink cannot.

#### Pros
- Enables a very common use case that currently requires third-party tools.
- M3U8/HLS is the dominant streaming format used by video CDNs.
- Pure JavaScript, works in Electron's renderer process natively.
- Active development by the Video.js team.

#### Cons
- Downloading HLS requires segment collection + merging (needs FFmpeg or a concat tool for the final file).
- Complex playlist formats (multi-variant, encrypted) add significant implementation complexity.

#### Recommendation ✅ **YES — High Value**
HLS download support is a very common request and opens up a huge range of content that is currently inaccessible. Pairs well with the FFmpeg suggestion (#12).

---

### 8. `videojs/video.js` — Web Video Player

**Repo:** https://github.com/videojs/video.js  
**License:** Apache-2.0  
**Language:** JavaScript  
**Stars:** 37,000+

#### What it does
Video.js is the world's most popular open-source HTML5 video player. It supports MP4, WebM, HLS (via hls.js plugin), DASH, and dozens of other formats. It's highly extensible with a rich plugin ecosystem, and supports subtitles, thumbnails, quality selection, and fullscreen.

#### How to repurpose for Motrix
- Add an **in-app media preview panel** — click a downloading or completed video/audio file to preview it inside Motrix without opening an external player.
- Support seeking within partially downloaded files during active downloads.
- Show download progress as a buffered timeline in the video player.
- Thumbnail generation from video frames for the task list view.

#### Pros
- Industry-standard player, widely supported and well-documented.
- Plugin ecosystem for HLS, DASH, ads-free playback, subtitles.
- Works natively in Electron's Chromium renderer.
- Clean, themeable UI that can be styled to match Motrix's dark mode.

#### Cons
- Adds ~400 KB to the renderer bundle.
- Full media playback is a feature expansion beyond the core "download manager" scope.
- Seeking in partially downloaded files requires careful file handle management.

#### Recommendation ⚠️ **CONDITIONAL — Great feature, scope creep risk**
A preview tab in the task detail panel would make Motrix much more powerful. However, this expands the scope significantly. Recommend as a Phase 2 feature after core improvements.

---

### 9. `tauri-apps/tauri` — Lightweight Electron Alternative (Rust Backend)

**Repo:** https://github.com/tauri-apps/tauri  
**License:** MIT / Apache-2.0  
**Language:** Rust + JavaScript  
**Stars:** 81,000+

#### What it does
Tauri is a framework for building cross-platform desktop apps using web frontend technologies (HTML/CSS/JS/Vue/React) but with a **Rust backend** instead of Node.js/Electron. Apps are dramatically smaller (1–5 MB vs. 100–200 MB for Electron) and use far less RAM because they leverage the OS's native WebView instead of bundling Chromium.

#### How to repurpose for Motrix
- Rebuild the Electron main process in Rust using Tauri as the shell.
- Keep the existing Vue.js + Vuex frontend code nearly unchanged.
- The aria2 subprocess management, IPC, window management, tray, auto-launch, and updater all have Tauri equivalents.
- Result: Motrix drops from ~150 MB install to ~10–20 MB, with lower RAM usage.

#### Pros
- **Massive size and memory reduction** — biggest technical improvement possible.
- Better security model (Rust's memory safety, tighter permissions).
- Faster startup time.
- Tauri has first-class Vue.js support.
- Tauri v2 (stable) has feature parity with most Electron features.

#### Cons
- **This is a full rewrite of the main process** — highest effort of all suggestions.
- Native WebView has rendering differences across macOS/Windows/Linux (Electron's embedded Chromium is consistent everywhere).
- Some Electron-specific APIs (remote module, contextBridge, some IPC patterns) need refactoring.
- Touch Bar (macOS) support in Tauri is limited.
- Team needs to learn Rust for the backend logic.

#### Recommendation ⚠️ **CONDITIONAL — Long-term goal, not short-term**
Tauri migration is the right long-term direction for a modern Electron app. However, it is a substantial project that should be planned as a dedicated major version release, not an incremental improvement.

---

### 10. `vueuse/vueuse` — Vue Composition API Utilities

**Repo:** https://github.com/vueuse/vueuse  
**License:** MIT  
**Language:** TypeScript/JavaScript  
**Stars:** 19,000+

#### What it does
VueUse is a collection of 200+ utility functions for the Vue Composition API (Vue 3). It includes composables for state management, browser APIs, sensors, animations, network, storage, and more — all reactive and tree-shakeable.

#### How to repurpose for Motrix
- As part of a **Vue 2 → Vue 3 migration**, VueUse provides drop-in utilities for localStorage (replacing electron-store in renderer), dark mode detection (`useDark`/`useColorMode`), clipboard (`useClipboard`), network status (`useNetwork`), drag-and-drop (`useDraggable`), and file system access.
- Replace custom utility code in `src/renderer/utils/` with well-tested VueUse composables.
- `useWebSocket` could replace the custom aria2 WebSocket client in the renderer.
- `useSchedule` (or `useIntervalFn`) to clean up the tracker-update timers.

#### Pros
- Reduces custom utility code significantly.
- All utilities are reactive and well-tested.
- Tree-shakeable — only include what you use.
- Excellent documentation and TypeScript support.

#### Cons
- **Requires migrating to Vue 3 first** — Motrix currently uses Vue 2.7. VueUse@10+ is Vue 3 only (VueUse@9 supports Vue 2.7 via the `@vueuse/core` compatibility layer).
- Migration effort is moderate.

#### Recommendation ✅ **YES — as part of Vue 2 → 3 migration**
VueUse v9 supports Vue 2.7 (what Motrix uses) via the bridge package. Start using it now for new composables, and it will already be in place when you migrate to Vue 3.

---

### 11. `sindresorhus/got` — Modern HTTP Client for Node.js

**Repo:** https://github.com/sindresorhus/got  
**License:** MIT  
**Language:** TypeScript/JavaScript  
**Stars:** 14,000+

#### What it does
`got` is a modern, human-friendly HTTP/HTTPS request library for Node.js. It supports streams, promises, retries, redirects, timeouts, pagination, HTTP/2, Unix sockets, progress events, and TypeScript types out of the box. It's an evolved replacement for the deprecated `request` package and is more capable than `axios` in the Node.js main process context.

#### How to repurpose for Motrix
- Replace `axios` calls in the **main process** (tracker list fetching, update checks, metadata fetching) with `got` for better stream support, retries, and timeout handling.
- Implement retry logic for tracker list updates (currently no retry on failure).
- Use `got`'s progress events for a download stream from HTTP (for cases where aria2 is not ideal, like small file pre-flight checks).
- Better proxy support via `got`'s `HttpsProxyAgent` integration.

#### Pros
- HTTP/2 support (faster fetching of tracker lists, metadata).
- Built-in retry with backoff — important for network resilience.
- Streaming API — pipe directly to file without buffering.
- TypeScript types included.
- Actively maintained by a prolific open source developer.

#### Cons
- `got` v12+ is ESM-only, which requires build config changes for the CommonJS Electron main process.
- Axios is already working fine in the renderer process — replacement effort must be justified.
- `got` v11 (CJS-compatible) is older but more compatible.

#### Recommendation ⚠️ **CONDITIONAL — Main process only**
Replacing axios with got in the main process is worth it for better retry/stream support. Keep axios in the renderer where it currently works well. Use got v11 (CJS) to avoid ESM migration headaches.

---

### 12. `fluent-ffmpeg/node-fluent-ffmpeg` — Node.js FFmpeg Wrapper

**Repo:** https://github.com/fluent-ffmpeg/node-fluent-ffmpeg  
**License:** MIT  
**Language:** JavaScript/Node.js  
**Stars:** 7,500+

#### What it does
`fluent-ffmpeg` is a Node.js library that provides a clean, chainable API for calling FFmpeg commands. It handles process spawning, event emission (progress, error, end), input/output format handling, codec selection, and video/audio transcoding.

#### How to repurpose for Motrix
- **Post-download processing**: After an HLS/M3U8 download, automatically merge `.ts` segments into a single `.mp4` using FFmpeg.
- **Format conversion**: Add an "on-complete convert to" option in the task settings (e.g., MKV → MP4, FLAC → MP3).
- **Thumbnail generation**: Extract a thumbnail from downloaded video files to display in the task list.
- **Audio extraction**: "Download audio only" option for video URLs (pairs with yt-dlp).
- Works with yt-dlp's `--external-downloader` and `--merge-output-format` flags.

#### Pros
- Clean, promise-friendly API over raw FFmpeg process.
- Progress events for real-time conversion feedback in the UI.
- FFmpeg binaries can be bundled via `ffmpeg-static` npm package.
- Essential companion to yt-dlp, streamlink, and hls.js integrations.

#### Cons
- Requires FFmpeg binary (bundled via `ffmpeg-static` adds ~60 MB per platform).
- Conversion of large files is CPU-intensive — should run in a worker thread.
- Users expect instant downloads; a conversion step adds time and must be communicated clearly.

#### Recommendation ✅ **YES — if yt-dlp or HLS download is approved**
fluent-ffmpeg is essentially required to complete the yt-dlp and HLS download features. Bundle it together with those integrations.

---

### 13. `d3/d3` — Data Visualization Library

**Repo:** https://github.com/d3/d3  
**License:** ISC  
**Language:** JavaScript  
**Stars:** 108,000+

#### What it does
D3.js is the most powerful data visualization library for JavaScript. It binds data to DOM elements and applies transitions, scales, axes, and shapes to create interactive charts, graphs, and diagrams of any kind.

#### How to repurpose for Motrix
- Build a **Download Analytics dashboard**: total bytes downloaded per day/week, average speeds, peak hours.
- Create a **bandwidth usage chart**: real-time line graph of download speed over time.
- Show a **piece availability map** for torrents (similar to qBittorrent's piece progress chart).
- A **treemap** of downloaded files organized by type or size.
- Replace the current basic `▒▓█` ASCII progress graphic with an SVG progress visualization.

#### Pros
- Unmatched flexibility for custom visualizations.
- Works natively in Electron's renderer.
- Reactive integration with Vue is straightforward.
- Many existing examples can be adapted quickly.

#### Cons
- D3 has a steep learning curve — complex to implement well.
- Full D3 bundle is ~500 KB (use D3's modular packages to import only what you need).
- An analytics dashboard requires storing per-task statistics, which isn't done today (needs schema design).
- May feel feature-heavy for a download manager audience.

#### Recommendation ⚠️ **CONDITIONAL — Start with bandwidth graph only**
A real-time bandwidth graph (speed over time) would be a visually impressive and useful feature. Use only `d3-shape`, `d3-scale`, and `d3-axis` (combined ~100 KB) rather than the full bundle.

---

### 14. `sindresorhus/p-queue` — Promise Queue with Concurrency Control

**Repo:** https://github.com/sindresorhus/p-queue  
**License:** MIT  
**Language:** TypeScript  
**Stars:** 4,200+

#### What it does
`p-queue` is a promise-based job queue with concurrency control, priority levels, pause/resume, and event emitters for queue idle/drain/add events. It is designed for rate-limiting async operations in Node.js.

#### How to repurpose for Motrix
- Replace the manual concurrency logic in the download task management with a proper priority queue.
- Implement **priority downloads** — allow users to mark tasks as "high priority" and they will be scheduled first.
- Add a **request-rate limiter** for HTTP metadata fetching (tracker updates, update checks) to prevent network flooding.
- Control the queue of pending aria2 `addUri` / `addTorrent` RPC calls so they don't overload the engine when batch-adding many tasks.
- Combined with node-schedule, implement a "start at most N downloads per hour" throttle.

#### Pros
- Tiny library (~10 KB), zero dependencies.
- TypeScript support included.
- Priority queue built in (useful for "download this first" UX).
- Very easy to integrate — wrap existing async calls.

#### Cons
- Motrix delegates concurrency management mostly to aria2 already — adding another queue layer may cause confusion.
- The main benefit (priority scheduling) requires UI work to expose it.

#### Recommendation ✅ **YES — Small but meaningful improvement**
Priority downloads is a missing UX feature that users of any download manager want. p-queue makes it easy to implement without rebuilding the scheduler.

---

### 15. `sindresorhus/file-type` — File Type Detection from Buffers

**Repo:** https://github.com/sindresorhus/file-type  
**License:** MIT  
**Language:** TypeScript  
**Stars:** 3,700+

#### What it does
`file-type` detects the true MIME type of a file or buffer by examining its **magic bytes** (binary file signatures), not the file extension. It supports 100+ file types including ZIP, PDF, MP4, MKV, ISO, EXE, APK, DOCX, and many more.

#### How to repurpose for Motrix
- Implement **download type verification** — after a file finishes downloading, verify that the actual binary content matches the expected file extension. Alert the user if a `.mp4` is actually an `.exe` (potential malware).
- Enable **smart file categorization** — automatically move completed downloads to sub-folders (Videos, Audio, Documents, Archives) based on true file type, not just extension.
- Prevent **extension-spoofed malware** from being auto-opened by Motrix's "open after download" feature.
- Use it in the "auto-extract ZIP" feature (suggestion #6) to confirm the file is actually a ZIP before extracting.

#### Pros
- Tiny library, pure JavaScript, no native dependencies.
- Works in both Electron processes.
- Security benefit — prevents extension spoofing attacks.
- Enables smart auto-categorization without user configuration.

#### Cons
- Only checks the first few KB of the file (magic bytes) — does not validate the entire file.
- Does not replace a proper antivirus scanner for security.
- Some file types share magic bytes and can still be misidentified.

#### Recommendation ✅ **YES — Easy Win with Security Benefit**
Extension spoofing is a real risk in any download manager. This library adds meaningful protection with almost zero integration effort. The smart categorization feature is a bonus.

---

## Summary Table

| # | Repo | Category | Effort | Value | Recommend |
|---|------|----------|--------|-------|-----------|
| — | jae-jae/Camtd | Browser Integration | Low | Very High | ✅ Yes |
| 1 | yt-dlp/yt-dlp | Download Sources | Medium | Very High | ✅ Yes |
| 2 | streamlink/streamlink | Download Sources | Medium | High | ⚠️ After #1 |
| 3 | webtorrent/webtorrent | BitTorrent | High | Medium | ⚠️ Partial |
| 4 | puppeteer/puppeteer | Browser Automation | High | Medium | ❌ Too heavy |
| 5 | node-schedule/node-schedule | Scheduling | Low | High | ✅ Yes |
| 6 | Stuk/jszip | File Handling | Low | Medium | ⚠️ Conditional |
| 7 | video-dev/hls.js | Download Sources | Medium | High | ✅ Yes |
| 8 | videojs/video.js | Media Preview | Medium | Medium | ⚠️ Phase 2 |
| 9 | tauri-apps/tauri | App Framework | Very High | Very High | ⚠️ Long-term |
| 10 | vueuse/vueuse | Frontend Utilities | Low | High | ✅ Yes |
| 11 | sindresorhus/got | HTTP Client | Low | Medium | ⚠️ Main only |
| 12 | fluent-ffmpeg/node-fluent-ffmpeg | Media Processing | Medium | High | ✅ With #1/#7 |
| 13 | d3/d3 | Analytics | Medium | Medium | ⚠️ Partial |
| 14 | sindresorhus/p-queue | Queue Management | Low | Medium | ✅ Yes |
| 15 | sindresorhus/file-type | Security/Sorting | Very Low | Medium | ✅ Yes |

---

## Recommended Starting Order (Author's Opinion)

If I had to pick the best short-term set of integrations for maximum impact with minimum effort:

**Phase 1 — Quick Wins (Days to 1–2 weeks each):**
1. **Camtd** — documentation/settings UI only, zero backend work
2. **node-schedule** — Scheduled downloads (highly requested feature)
3. **file-type** — Security + auto-categorize (very low effort)
4. **p-queue** — Priority downloads
5. **vueuse** — Utility cleanup, immediate Vue 3 preparation

**Phase 2 — Major Features (1–4 weeks each):**
6. **yt-dlp** — 1000+ site downloads (killer feature)
7. **hls.js + fluent-ffmpeg** — HLS stream download + segment merging
8. **got** — Better main-process HTTP with retries

**Phase 3 — Large Scope (1–3 months each):**
9. **webtorrent** (streaming only, alongside aria2)
10. **streamlink** (once yt-dlp infra exists)
11. **d3** (bandwidth graph)
12. **video.js** (preview panel)

**Long-term:**
13. **Tauri** (full framework migration — major version release)

---

*Please reply with which repositories you'd like to integrate, and implementation work will begin immediately.*
