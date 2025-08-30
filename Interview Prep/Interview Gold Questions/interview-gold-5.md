# 🚀 Interview Gold – Batch #5 (Frontend System Design & Scalability, Expanded)

---

## 1. **Design YouTube Frontend (Video Streaming App)**

**Requirements:**

* Homepage feed with thumbnails (infinite scroll).
* Video playback with adaptive quality.
* Comments section with pagination.
* Related/recommended videos.

**Detailed Design:**

1. **Homepage Feed**

   * Use **infinite scrolling** (IntersectionObserver).
   * Lazy load thumbnails & video previews.
   * Cache feed results (React Query / SWR) for smooth back-navigation.

2. **Video Playback**

   * Use **HLS (HTTP Live Streaming)** or **MPEG-DASH** for adaptive streaming.
   * Browser `<video>` tag supports `.m3u8` manifests (via MediaSource API).
   * CDN distributes video chunks (low latency).

3. **Comments**

   * Paginated (e.g. load 20 at a time).
   * Virtualize list for very long comment threads.
   * Optimistic posting (show immediately, confirm with server).

4. **Recommendations**

   * Prefetch metadata while current video is playing.
   * Show skeleton loaders for better UX.

5. **Performance Optimizations**

   * **Critical CSS** inline for above-the-fold UI.
   * Preload next likely video’s thumbnail & manifest.
   * Use **service workers** for offline caching (watch later).

**Follow-ups (interviewer twists):**

* *How do you handle slow networks?*
  → Adaptive bitrate streaming (drop to 240p if bandwidth low).
* *How to prevent layout shift when thumbnails load?*
  → Reserve aspect-ratio boxes (16:9) with CSS.
* *Offline downloads?*
  → Store chunks in IndexedDB, allow playback offline.

---

## 2. **Design Twitter-like Infinite Feed**

**Requirements:**

* Endless scrolling timeline.
* Real-time updates (new tweets).
* Post tweet optimistically.
* Insert ads inline.

**Detailed Design:**

1. **Infinite Scroll**

   * Use IntersectionObserver to detect when near bottom.
   * Fetch next batch with cursor-based pagination (not offset, avoids duplicates).

2. **Rendering**

   * Use **virtualized list** (React Window/React Virtualized) → only render visible tweets.
   * Reduces DOM nodes from 10k → \~30 at a time.

3. **Posting Tweets**

   * Optimistic UI: render tweet immediately with “sending…” state.
   * Replace with confirmed tweet when API succeeds.

4. **Real-Time Updates**

   * Use WebSocket or SSE for push notifications.
   * New tweets prepend at top → but batch them to avoid UI jank.

5. **Caching**

   * SWR/React Query to cache feed chunks across navigations.
   * Background refresh for stale data.

**Follow-ups:**

* *How do you prevent re-renders on 100 tweets arriving at once?*
  → Batch updates into intervals (e.g. every 1s).
* *How to support offline posting?*
  → Save to IndexedDB, retry when online.
* *How do you insert ads?*
  → Server sends ad markers, client injects every N items.

---

## 3. **Design Collaborative Doc Editor (Google Docs Lite)**

**Requirements:**

* Multiple users editing simultaneously.
* Real-time syncing of changes.
* Conflict resolution (no overwriting).

**Detailed Design:**

1. **Transport**

   * WebSocket for low-latency bidirectional communication.

2. **Conflict Resolution**

   * Use **Operational Transform (OT)** → apply changes relative to version.
   * Or **CRDTs** (Conflict-free Replicated Data Types) → eventual consistency.

3. **Optimistic Updates**

   * Local changes apply instantly.
   * Send delta to server, server broadcasts to all clients.

4. **Presence**

   * Each client sends cursor position via WS heartbeat.
   * Server rebroadcasts → show colored cursors for collaborators.

5. **Offline Resilience**

   * Cache doc edits in IndexedDB.
   * On reconnect, merge via OT/CRDT algorithm.

**Follow-ups:**

* *How to minimize bandwidth?*
  → Send diffs, not entire doc.
* *How to handle network partition?*
  → CRDT ensures eventual merge.
* *How to show who’s online?*
  → Presence service with WS pings.

---

## 4. **Design Slack/Chat App Frontend**

**Requirements:**

* Real-time messages in channels.
* Infinite scroll for history.
* Presence (online/offline/typing).

**Detailed Design:**

1. **Message Rendering**

   * Virtualized list with **reverse infinite scroll** (older messages load as you scroll up).
   * Store latest N messages in cache for instant back-navigation.

2. **Real-Time Messaging**

   * WebSocket for new message delivery.
   * Retry with exponential backoff on disconnect.

3. **Typing Indicators**

   * Ephemeral WS events (`user X is typing`).
   * Clear after timeout or message sent.

4. **Presence**

   * Clients send periodic heartbeats to server.
   * Server broadcasts who is online.

5. **File Uploads**

   * Pre-signed URLs (AWS S3, GCS) → client uploads directly to storage, not app server.

6. **Offline Mode**

   * Save messages in IndexedDB queue.
   * Sync & mark “delivered” on reconnect.

**Follow-ups:**

* *How do you scale channels with 10k+ users?*
  → Lazy load members, virtualized message list.
* *How to ensure message order?*
  → Server attaches monotonically increasing message IDs.
* *How to secure chat?*
  → End-to-end encryption with local key storage.

---

## 5. **Design E-commerce Product Page (Amazon-like)**

**Requirements:**

* Product info (images, details).
* Reviews.
* Related products.

**Detailed Design:**

1. **Rendering Strategy**

   * Server-Side Rendering (Next.js) → SEO for Google.
   * Hydrate React components client-side.

2. **Images**

   * Use responsive `<img srcset>` or `<picture>` for multiple resolutions.
   * Lazy load below-the-fold images with IntersectionObserver.
   * Reserve aspect ratio boxes to prevent **Cumulative Layout Shift (CLS)**.

3. **Reviews**

   * Paginated API, lazy load on scroll.
   * Optimistic UI when posting review.

4. **Recommendations**

   * Prefetch recommendations API in background.
   * Show skeleton UI while loading.

5. **Internationalization**

   * Use `next-i18next` or ICU message format.
   * Handle currency conversion client-side or server-side.

**Follow-ups:**

* *How to reduce TTI (Time to Interactive)?*
  → Code splitting, defer non-critical JS.
* *How to implement “users also bought”?*
  → Prefetch recommendations after main product loads.
* *How to optimize for mobile?*
  → Responsive images, critical CSS.

---

## 6. **Design Real-time Metrics Dashboard**

**Requirements:**

* Multiple widgets (charts, KPIs).
* Live updating metrics.

**Detailed Design:**

1. **Data Fetching**

   * Prefer WebSockets for push metrics.
   * Fallback to polling if WS fails.
   * Batch updates on server before broadcasting.

2. **Rendering**

   * Use charting libs (Recharts, Chart.js, D3).
   * Update at 1s intervals (use `requestAnimationFrame` for smoothness).

3. **Performance**

   * Throttle updates (aggregate multiple WS events).
   * Virtualize large tables (if metrics include logs).

4. **Customization**

   * Allow drag/drop widgets → save layout in localStorage or DB.
   * Persist user preferences per account.

**Follow-ups:**

* *How to handle 1000+ updates/sec?*
  → Batch updates, throttle rendering to 1 fps if needed.
* *How to support multiple tenants?*
  → Partition WS channels by tenant.
* *How to ensure data integrity?*
  → Show “last updated at…” timestamps.

---

# 📘 Expanded Takeaways – Batch #5

* **YouTube** → streaming (HLS/DASH), CDNs, prefetch, lazy loading.
* **Twitter** → infinite scroll, virtualized list, WS updates, optimistic UI.
* **Docs** → WebSocket, OT/CRDT, presence, offline merge.
* **Slack** → WS messages, reverse infinite scroll, offline queue, pre-signed uploads.
* **E-commerce** → SSR, lazy load, i18n, CLS prevention.
* **Dashboard** → WS/polling, throttling, customization, persistence.

