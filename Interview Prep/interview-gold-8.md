# 🚀 Interview Gold – Batch #8 (Advanced Browser & Networking)

---

## 1. Service Workers (Offline & Caching)

**Problem:**

* Users lose connectivity → app breaks.
* Need offline mode (e.g., Gmail, Twitter Lite).

**Solution:**

* **Service Worker** sits between app & network.
* Intercepts requests → serves from cache (Cache API).

**Detailed Design:**

```js
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("v1").then(cache => cache.addAll(["/", "/index.html", "/styles.css"]))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
```

**Performance Notes:**

* Cache static assets aggressively.
* Use **stale-while-revalidate**: serve cache, update in background.

**Follow-ups:**

* Difference between Service Worker vs localStorage caching?
* How to handle cache invalidation? (cache versioning).
* How to send push notifications with Service Workers?

---

## 2. WebSockets vs Server-Sent Events (SSE) vs Long Polling

**Problem:**

* Need real-time updates (chat, dashboard, notifications).

**Solution:**

* **WebSocket**: full-duplex (both client/server can push).
* **SSE**: server → client one-way, lightweight.
* **Long Polling**: fallback when WS/SSE unavailable.

**Detailed Design:**

* WebSocket example:

```js
const ws = new WebSocket("wss://example.com/socket");
ws.onmessage = e => console.log("Received:", e.data);
```

* SSE example:

```js
const evtSource = new EventSource("/events");
evtSource.onmessage = e => console.log("Message:", e.data);
```

**Performance Notes:**

* WS better for chat/games.
* SSE simpler for notifications.
* Long polling = last resort (inefficient).

**Follow-ups:**

* Why would you pick SSE over WS? → Simpler, works with proxies.
* How to handle reconnection? → Exponential backoff.
* How to secure WebSockets? → WSS + token auth.

---

## 3. WebRTC (Peer-to-Peer Communication)

**Problem:**

* Need low-latency peer-to-peer (video call, file sharing).

**Solution:**

* WebRTC: browser API for P2P audio/video/data.
* Uses STUN/TURN for NAT traversal.

**Detailed Design:**

```js
const pc = new RTCPeerConnection();
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => stream.getTracks().forEach(track => pc.addTrack(track, stream)));
```

**Performance Notes:**

* Avoids routing through server (lower latency).
* TURN server fallback when P2P fails.

**Follow-ups:**

* How does WebRTC differ from WebSocket?
* Why is TURN server expensive? → Relays all traffic.
* How to do screen sharing? → `getDisplayMedia()`.

---

## 4. Caching Headers (HTTP Cache)

**Problem:**

* Users re-download same assets → slow + costly.

**Solution:**

* **Cache-Control**: public, max-age=31536000.
* **ETag**: versioning.
* **Stale-While-Revalidate**: serve cached copy, update async.

**Detailed Design:**

```http
Cache-Control: public, max-age=31536000, immutable
ETag: "abc123"
```

**Performance Notes:**

* Immutable assets (JS/CSS) → long cache with hash in filename.
* HTML → short cache (must update frequently).

**Follow-ups:**

* Difference between strong vs weak ETag?
* Why not cache HTML forever?
* How do CDNs like Cloudflare enhance caching?

---

## 5. HTTP/2 Multiplexing & Push

**Problem:**

* HTTP/1.1 opens many connections → head-of-line blocking.

**Solution:**

* HTTP/2: one TCP connection, multiplex requests.
* Server Push (deprecated in Chrome, but conceptually useful).

**Detailed Design:**

* Browser can request many resources in parallel → no blocking.
* Example: React app loads multiple chunks simultaneously.

**Performance Notes:**

* Improves bundle splitting efficiency.
* Server Push mostly replaced by `<link rel="preload">`.

**Follow-ups:**

* Why is HTTP/2 faster than HTTP/1.1?
* Why was Server Push dropped? → Complexity, cache duplication.
* How does HTTP/3 (QUIC) differ? → Uses UDP, no TCP head-of-line blocking.

---

## 6. HTTP/3 (QUIC)

**Problem:**

* TCP head-of-line blocking still a problem (even in HTTP/2).

**Solution:**

* HTTP/3 over QUIC (UDP-based).
* Multiplexed streams → packet loss doesn’t block everything.

**Detailed Design:**

* Browsers already adopting HTTP/3 for CDNs.
* Client can resume connections faster after network changes.

**Performance Notes:**

* Better for mobile (network changes often).
* Lower latency than TCP handshakes.

**Follow-ups:**

* How does QUIC handle packet loss differently from TCP?
* Why is HTTP/3 better for mobile users?
* How to test if a site uses HTTP/3? → Chrome DevTools → Protocol column.

---

## 7. Prefetching & Preloading (Resource Hints)

**Problem:**

* Browser doesn’t know which resources will be needed soon.

**Solution:**

* `<link rel="prefetch">` → next navigation.
* `<link rel="preload">` → current critical resource.
* `<link rel="dns-prefetch">` → resolve DNS early.

**Detailed Design:**

```html
<link rel="preload" as="script" href="/main.js">
<link rel="prefetch" href="/next-page.js">
<link rel="dns-prefetch" href="//cdn.example.com">
```

**Performance Notes:**

* Preload too much → wasted bandwidth.
* Prefetch = lower priority (idle time).

**Follow-ups:**

* Difference between preload vs prefetch?
* How does Next.js automate this? → `<Link prefetch>`.
* Why is dns-prefetch useful? → Cuts \~100ms DNS time.

---

## 8. Cross-Origin Resource Sharing (CORS)

**Problem:**

* Browser blocks requests to different origins by default.

**Solution:**

* Server must set proper CORS headers.

**Detailed Design:**

```http
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type, Authorization
```

* Preflight (OPTIONS) sent if:

  * Non-simple method (PUT, DELETE).
  * Custom headers (Authorization).

**Performance Notes:**

* CORS is enforced by browser, not server.
* Preflight adds latency.

**Follow-ups:**

* Why does a simple GET work but POST JSON triggers preflight?
* How to reduce preflight overhead? → Use `simple` headers (GET/POST + form data).
* Difference between CORS and CSRF?

---

# 📘 Key Takeaways – Batch #8

* **Service Workers** → offline-first, push, caching.
* **WebSockets/SSE** → real-time communication.
* **WebRTC** → peer-to-peer, low latency.
* **Caching Headers** → ETag, cache-control, immutable.
* **HTTP/2** → multiplexing, no HoL blocking.
* **HTTP/3** → QUIC over UDP, mobile-friendly.
* **Prefetch/Preload** → control browser resource priority.
* **CORS** → cross-origin security model.

---

# 📑 Quick-Reference (Batch #8)

* **SW**: Offline cache + push.
* **WS vs SSE**: Duplex vs one-way.
* **WebRTC**: P2P comms.
* **Cache headers**: Cache-Control, ETag.
* **HTTP/2**: Multiplexing, dropped Server Push.
* **HTTP/3**: UDP QUIC, better for mobile.
* **Prefetch/Preload**: optimize resource load.
* **CORS**: Preflight OPTIONS, server headers.


/////////// More detailed below

# 🚀 Interview Gold – Batch #8 (Advanced Browser & Networking, Super Detailed)

---

## 1. Service Workers (Offline & Caching)

**Problem:**

* A web app (e.g., Gmail, Twitter Lite, Spotify Web) needs to **work offline** or on flaky connections.
* By default, if network is unavailable → fetch fails → app breaks.

**Solution:**

* Use a **Service Worker (SW)** → a script that runs in background, sits between app and network.
* Intercepts `fetch` requests → decide whether to serve cached response or hit network.

**Detailed Design:**

1. **Installation Phase:** Pre-cache critical assets (`index.html`, CSS, logo).
2. **Activation Phase:** Delete old caches, upgrade version.
3. **Fetch Handling:**

   * Cache-first for static assets.
   * Network-first for dynamic content (e.g., /api/tweets).

```js
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("v1").then(cache =>
      cache.addAll(["/", "/index.html", "/styles.css", "/logo.png"])
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
```

**Performance Notes:**

* Use **stale-while-revalidate**: serve cached version instantly, update in background for next time.
* Avoid caching sensitive API responses (like auth tokens).

**Real-World Example:**

* Twitter Lite → 600KB initial load vs 1.5MB full app. Works offline with SW.

**Follow-ups:**

* How do you handle cache invalidation?
  → Version caches (`v1`, `v2`) + delete old on activate.
* How do SWs enable Push Notifications?
  → SW runs in background, can receive push from server.
* How do they differ from localStorage caching?
  → SW is transparent, works for *all requests*, not just manual saves.

---

## 2. WebSockets vs SSE vs Long Polling

**Problem:**

* A chat app, stock ticker, or dashboard needs **real-time updates**.

**Solution:**

* **WebSockets (WS):** Full-duplex → both client & server push messages.
* **SSE (Server-Sent Events):** One-way, server → client only.
* **Long Polling:** Client sends request → server holds until event → responds.

**Detailed Design:**

* **WebSocket:**

  ```js
  const ws = new WebSocket("wss://chat.example.com");
  ws.onopen = () => ws.send("Hello");
  ws.onmessage = e => console.log("New message:", e.data);
  ```
* **SSE:**

  ```js
  const source = new EventSource("/events");
  source.onmessage = e => console.log("Received:", e.data);
  ```
* **Long Polling:**

  ```js
  async function poll() {
    const res = await fetch("/events");
    const data = await res.json();
    handle(data);
    poll(); // recursive
  }
  ```

**Performance Notes:**

* **WS**: Best for chat, games, collaborative editing.
* **SSE**: Best for lightweight updates (notifications, logs).
* **Long Polling**: Fallback if WS/SSE blocked (e.g., corporate firewalls).

**Real-World Example:**

* Slack: Uses WebSockets for real-time chat.
* GitHub Actions: SSE for live build logs.

**Follow-ups:**

* Why SSE over WS? → SSE auto-reconnects, text only, less overhead.
* Why WS over SSE? → Bi-directional needed.
* How do you handle reconnections? → Exponential backoff.
* How do you secure WS? → Use WSS + token auth, rotate keys.

---

## 3. WebRTC (Peer-to-Peer Communication)

**Problem:**

* Need **low-latency real-time** peer-to-peer: video calls, multiplayer games, file sharing.

**Solution:**

* **WebRTC** provides browser-native P2P with encryption.
* Handles **NAT traversal** via **STUN** (discover public IP) and **TURN** (relay if P2P fails).

**Detailed Design:**

```js
const pc = new RTCPeerConnection();
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
  });
```

* Peers exchange **SDP offers/answers** via signaling server (usually WebSocket).
* Once connected → send audio/video/data directly (no server in path).

**Performance Notes:**

* **Pros:** Low latency, end-to-end encryption.
* **Cons:** Doesn’t scale for >10 peers (need SFU/MCU).

**Real-World Example:**

* Google Meet, Zoom, Discord voice chat.

**Follow-ups:**

* Difference from WebSockets? → WS = client-server, WebRTC = P2P.
* Why TURN servers are expensive? → Relay entire stream.
* How to do screen sharing? → `navigator.mediaDevices.getDisplayMedia()`.

---

## 4. Caching Headers (HTTP Cache)

**Problem:**

* Without caching, users re-download unchanged JS/CSS/images → waste bandwidth.

**Solution:**

* Use **HTTP cache headers**:

  * `Cache-Control: public, max-age=31536000, immutable` (long cache for assets).
  * `ETag` (content hash for validation).
  * `Last-Modified` (server timestamp).

**Detailed Design:**

* Assets: Cache aggressively with filename hash (`app.abc123.js`).
* HTML: Short cache (few seconds), always revalidate.

**Performance Notes:**

* Use **immutable** for assets → never re-request.
* Use **stale-while-revalidate** → instant load + background update.

**Real-World Example:**

* Next.js generates hashed JS/CSS → long cache.

**Follow-ups:**

* Strong vs weak ETag? → Weak only checks content equivalence, not exact bytes.
* Why not cache HTML forever? → HTML contains dynamic data (CSRF tokens, user info).
* How do CDNs enhance this? → Layered caching + edge invalidation.

---

## 5. HTTP/2 Multiplexing & Push

**Problem:**

* HTTP/1.1 → 6 parallel connections per domain, head-of-line blocking.

**Solution:**

* **HTTP/2 multiplexing**: All requests share one TCP connection, interleaved.
* **Server Push**: Server can proactively send resources (deprecated in Chrome).

**Detailed Design:**

* React app → multiple JS chunks → HTTP/2 requests in parallel, no blocking.
* Without multiplexing, some chunks wait → slower TTI.

**Performance Notes:**

* Multiplexing + header compression (HPACK) improves performance.
* Push dropped → use `<link rel="preload">` instead.

**Real-World Example:**

* Netflix → optimized startup with HTTP/2.

**Follow-ups:**

* Why HTTP/2 faster than 1.1? → Multiplex, no HoL blocking, header compression.
* Why was Push deprecated? → Cache duplication + complexity.
* How does HTTP/2 handle priorities? → Streams have weights.

---

## 6. HTTP/3 (QUIC over UDP)

**Problem:**

* HTTP/2 still suffers from **TCP head-of-line blocking**.
* If 1 packet lost → whole TCP stream pauses.

**Solution:**

* **HTTP/3 over QUIC (UDP):** Multiplexed streams → independent.
* Packet loss only affects 1 stream.

**Detailed Design:**

* QUIC = transport layer → faster handshakes, built-in TLS.
* Mobile: connections survive network switch (WiFi ↔ LTE).

**Performance Notes:**

* Lower latency than TCP.
* Great for mobile users.

**Real-World Example:**

* Cloudflare, Google, YouTube → already using HTTP/3.

**Follow-ups:**

* Why QUIC better on lossy networks? → Independent streams.
* How to check HTTP/3 usage? → Chrome DevTools → Protocol column.
* Why UDP instead of TCP? → Lower-level control, fewer constraints.

---

## 7. Prefetching & Preloading (Resource Hints)

**Problem:**

* Browser loads resources in default priority order (not always optimal).

**Solution:**

* **Preload:** Force critical resource load now.
* **Prefetch:** Load resource for future navigation (idle).
* **DNS-prefetch:** Pre-resolve domains.

**Detailed Design:**

```html
<link rel="preload" as="font" href="/fonts/inter.woff2" crossorigin>
<link rel="prefetch" href="/dashboard.js">
<link rel="dns-prefetch" href="//cdn.example.com">
```

**Performance Notes:**

* Preload too many = blocks rendering.
* Prefetch helps next-page instant nav.

**Real-World Example:**

* Next.js auto-prefetches linked pages.

**Follow-ups:**

* Difference preload vs prefetch? → Preload = now, Prefetch = later.
* Why dns-prefetch useful? → Saves \~100ms DNS lookup.
* How to decide what to prefetch? → Analytics-driven predictions.

---

## 8. CORS (Cross-Origin Resource Sharing)

**Problem:**

* Browser security → blocks cross-origin requests unless server opts in.

**Solution:**

* Server adds headers to allow access.

**Detailed Design:**

```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: Content-Type, Authorization
```

* Preflight OPTIONS sent for non-simple requests.

**Performance Notes:**

* Preflight adds latency.
* Can reduce with simple requests (GET, POST form).

**Real-World Example:**

* Stripe API requires proper CORS setup.

**Follow-ups:**

* Why does JSON POST trigger preflight? → Not a simple request.
* Difference CORS vs CSRF? → CORS = browser enforcement, CSRF = user tricked.
* How to reduce preflight? → Use same-origin, standard headers.

---

# 📘 Final Takeaways – Batch #8 (Super Detailed)

* **Service Workers**: Offline-first, push notifications, cache invalidation.
* **WebSockets/SSE/Long Polling**: Tradeoffs for real-time apps.
* **WebRTC**: P2P comms, NAT traversal, scaling issues.
* **Caching Headers**: Cache-control, ETag, SWR.
* **HTTP/2**: Multiplexing, header compression, dropped Push.
* **HTTP/3**: QUIC over UDP, mobile-friendly.
* **Prefetch/Preload**: Hints to optimize resource loading.
* **CORS**: Browser-enforced security, preflight cost.
