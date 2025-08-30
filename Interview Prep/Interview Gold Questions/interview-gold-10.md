# 🚀 Interview Gold – Batch #10 (Scalability & Reliability, Super Expanded)

---

## 1. Handling Traffic Spikes (1M users hitting at once)

**Problem:**

* Product launch (e.g., iPhone preorder, sneaker drop, ticket sales).
* Sudden surge → frontend JS bundle loads fine from CDN, but API/backend crashes.
* Symptoms: blank UI, errors, long spinners → terrible UX.

**Solution:**

* **Static-first strategy**: Serve all JS/CSS/images from CDN.
* **Server-Side Rendering (SSR) caching** or **Incremental Static Regeneration (ISR)** for pages that don’t change often.
* **Queue UI**: Instead of letting requests fail, place users in “waiting room” when backend is overloaded.
* **Graceful degradation**: show cached results or partial UI if API down.

**Detailed Design:**

1. **Frontend Bundles** → deployed to CDN (immutable hashed filenames).
2. **API Load Shedding**: If traffic > X QPS, backend returns 503 + Retry-After.
3. **Frontend Behavior**:

   * If API fails, show cached data (IndexedDB/Service Worker).
   * If no cached data → show fallback + auto-retry with exponential backoff.
4. **Waiting Room**: Controlled at CDN/edge (Cloudflare Waiting Room).

**Performance Notes:**

* 95% of load is static assets → solved by CDN.
* True bottleneck = API.
* **Mitigation:**

  * Cache GETs at edge.
  * Collapse duplicate requests (dedup fetches on client).

**Pitfalls:**

* If API responses aren’t cacheable, every user hits backend.
* If CDN config wrong (no cache headers), origin gets slammed.

**Real-World Example:**

* Ticketmaster, Nike drops → waiting room UI prevents meltdown.

**Follow-up Qs:**

* How would you ensure fairness? → Randomized queue tokens.
* How do you avoid overloading DB? → Cache at multiple layers (edge + app cache).
* What if real-time stock levels? → Edge workers validate stock before allowing purchase.

---

## 2. CDN Strategy for Global Users

**Problem:**

* Users in India/Europe access server in US → 200–400ms latency.
* API/asset delivery slows down, especially images and video.

**Solution:**

* Use **CDNs (Cloudflare, Akamai, Fastly)** for static content.
* Push static bundles to **edge PoPs** (Points of Presence).
* Cache API responses at edge where possible.
* Use **edge compute** (Cloudflare Workers, Vercel Edge) for lightweight personalization.

**Detailed Design:**

1. **Static Assets**:

   * Served from CDN edge, immutable caching (`max-age=31536000, immutable`).
   * Versioning via filename hashes.
2. **APIs**:

   * Cache non-sensitive data (product catalogs, trending feeds).
   * Use **stale-while-revalidate** for freshness.
3. **Images/Media**:

   * Use CDN-based transformations (resize, compress, WebP/AVIF).
   * Serve right size per device.

**Performance Notes:**

* CDN latency \~20ms vs 200ms from origin.
* Global scale requires **multi-CDN failover** (e.g., fallback from Fastly → Akamai).

**Pitfalls:**

* Don’t cache personalized responses → risk of data leakage.
* Cache invalidation hard → prefer immutable assets.

**Real-World Example:**

* Netflix Open Connect → servers inside ISPs for local video delivery.

**Follow-up Qs:**

* How do you purge CDN cache? → API call to purge or versioned URLs.
* How to handle real-time personalized data (e.g., cart)? → Bypass cache, fetch directly.
* Compare CDN caching vs Service Worker caching.

---

## 3. Graceful Degradation & Offline Mode

**Problem:**

* Users on 2G/3G or airplane mode → fetches fail.
* Without fallback, app looks broken.

**Solution:**

* **Graceful degradation**: core features always work, advanced ones may break.
* **Progressive enhancement**: app designed to add features if browser/network allows.
* **Offline-first**: Service Worker caches assets + data.
* **Request queueing**: API calls stored offline, replayed later.

**Detailed Design:**

1. **Static assets** → cached with Service Worker (App Shell model).
2. **API calls** → stored in IndexedDB if offline.
3. **Sync** → Background Sync API retries when network returns.
4. **UI** → show offline banner, disable non-critical actions.

**Performance Notes:**

* UX improvement → users can “read cached content” offline.
* Battery-friendly: avoid aggressive retry loops.

**Pitfalls:**

* If not careful, duplicate requests when replayed. Use unique request IDs.

**Real-World Example:**

* Twitter Lite (600KB, works offline).
* Gmail caches last emails offline.

**Follow-up Qs:**

* How do you prevent data corruption during replay? → Idempotent APIs.
* Progressive enhancement vs graceful degradation? → Enhancement starts small and builds up, degradation starts big and cuts down.
* How to sync large offline datasets efficiently? → Delta sync instead of full refresh.

---

## 4. Resiliency Patterns (Frontend Fallbacks)

**Problem:**

* Backend might fail or be slow (timeouts, 500 errors).
* UI must not freeze or crash → user retention risk.

**Solution:**

* **Retry with exponential backoff**.
* **Circuit breaker pattern** → stop hitting failing API.
* **Fallback data** → cached data, last known good.
* **UI fallback** → skeleton loaders, error messages.

**Detailed Design:**

```js
async function fetchWithCircuitBreaker(url) {
  if (circuit.isOpen()) return getCached(url);

  try {
    return await fetch(url);
  } catch {
    circuit.recordFailure();
    return getCached(url);
  }
}
```

* Circuit transitions:

  * **Closed**: working.
  * **Open**: failures → short-circuit to fallback.
  * **Half-open**: try again after timeout.

**Performance Notes:**

* Protects backend from “retry storms.”
* User sees degraded UI but not total crash.

**Pitfalls:**

* Too aggressive circuit → false positives.
* Caching must be consistent with stale data handling.

**Real-World Example:**

* Netflix “rows” sometimes show old cached titles if API down.

**Follow-up Qs:**

* How do you show degraded data without confusing users? → Grey out, mark “last updated at…”.
* How to log failures without flooding logs? → Use sampling.
* Difference between retry vs circuit breaker?

---

## 5. API Rate Limiting & Throttling

**Problem:**

* User types fast in search box → 50 API requests/second.
* Backend overloads.

**Solution:**

* **Client-side debounce/throttle** to cut requests.
* **Server-side rate limits** (per-user, per-IP).
* **Backpressure**: respond with `429 Too Many Requests`.

**Detailed Design:**

* Client:

```js
const search = debounce(query => fetch(`/api?q=${query}`), 300);
```

* Server:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 5
```

**Performance Notes:**

* Greatly reduces wasted calls.
* Prevents backend overload.

**Pitfalls:**

* If user behind shared IP (corporate, NAT) → false positives.

**Real-World Example:**

* GitHub API has 5000 requests/hour per token.

**Follow-up Qs:**

* Difference debounce vs throttle? → Debounce = wait until quiet; Throttle = limit to once per interval.
* How to tell user they hit rate limit? → “Please wait…” or retry-after UI.
* How to design APIs for resilience? → Idempotent operations, pagination.

---

## 6. Multi-Region Failover

**Problem:**

* Cloud provider outage in one region → entire app down.

**Solution:**

* Deploy app in **multiple regions** (multi-AZ, multi-region).
* Use **DNS-based failover** (Route53, Cloudflare Load Balancer).
* Store data in replicated DB (eventual consistency).

**Detailed Design:**

* User connects → global DNS sends to nearest healthy region.
* If region unhealthy → DNS reroutes to backup region.
* Static assets → always served via CDN globally.

**Performance Notes:**

* Improves availability (99.99%).
* Latency minimized by routing to closest region.

**Pitfalls:**

* Multi-region DB consistency is hard.
* Expensive to maintain redundant infra.

**Real-World Example:**

* Netflix Chaos Monkey kills regions to test resilience.

**Follow-up Qs:**

* How do you keep user data consistent? → Eventual consistency (Cassandra/Dynamo).
* How to test failover? → Chaos experiments.
* Tradeoff: CAP theorem (Consistency vs Availability).

---

## 7. Error Budgets & SLOs (Site Reliability)

**Problem:**

* Teams push features at cost of stability.
* No agreement on “how reliable is reliable enough?”

**Solution:**

* **SLO (Service Level Objective)**: target reliability, e.g., 99.9% uptime.
* **SLI (Service Level Indicator)**: actual measurement (e.g., error rate <0.1%).
* **Error Budget**: allowable downtime = (100% - SLO).

**Detailed Design:**

* Example: 99.9% uptime = \~40 min downtime/month.
* If budget exceeded → freeze feature rollouts, focus on stability.

**Performance Notes:**

* Balances velocity with reliability.
* Avoids chasing “100% uptime,” which is near-impossible.

**Pitfalls:**

* Badly defined SLIs → meaningless SLOs.
* Teams may game metrics (only measure subset).

**Real-World Example:**

* Google SRE pioneered error budgets.

**Follow-up Qs:**

* Why not 100% uptime? → too costly, diminishing returns.
* How do you measure frontend SLIs? → Apdex score, Web Vitals, JS error rate.
* What happens when error budget is exceeded? → Feature freeze.

---

## 8. Resilient Frontend Logging & Monitoring

**Problem:**

* Without telemetry → silent failures.
* Users see errors but devs don’t know.

**Solution:**

* **Error monitoring**: Sentry, Rollbar, Datadog.
* **Perf monitoring**: Web Vitals (LCP, CLS, FID).
* **Logging with sampling**: avoid flooding servers.

**Detailed Design:**

```js
window.addEventListener("error", e => {
  sendToSentry({ message: e.message, stack: e.error.stack });
});

window.addEventListener("unhandledrejection", e => {
  sendToSentry({ message: e.reason?.toString() });
});
```

* Collect perf metrics with `PerformanceObserver`.
* Sample \~1% of sessions for detailed logging.

**Performance Notes:**

* Errors must be non-blocking (async reporting).
* Scrub sensitive data before sending.

**Pitfalls:**

* Logging PII can break compliance (GDPR).
* Too much logging = high cost.

**Real-World Example:**

* Airbnb samples logs to 1% of sessions → balance cost vs insights.

**Follow-up Qs:**

* How do you monitor frontend performance in prod? → Web Vitals API.
* How to debug minified JS errors? → Upload source maps.
* How to avoid logging sensitive data? → Use allowlist logging.

---

# 📘 Key Takeaways – Batch #10 (Expanded)

* **Traffic spikes:** CDN, ISR, waiting rooms.
* **CDN strategy:** edge caching + edge compute.
* **Offline/degradation:** Service Worker, retries, queue API calls.
* **Resilience:** retries, circuit breakers, fallback UIs.
* **Rate limiting:** debounce/throttle, 429 handling.
* **Multi-region failover:** DNS routing, eventual consistency.
* **Error budgets:** balance reliability vs features.
* **Monitoring:** Sentry + Web Vitals + sampling.

---

# 📑 Quick-Reference (Batch #10)

* **Spikes:** CDN + queues + cache.
* **CDN:** immutable assets, SWR.
* **Offline:** SW + IndexedDB + background sync.
* **Resilience:** retries + circuit breakers.
* **Rate limits:** debounce vs throttle.
* **Failover:** multi-region DNS.
* **SLOs:** measurable uptime goals.
* **Monitoring:** errors + perf + sampling.