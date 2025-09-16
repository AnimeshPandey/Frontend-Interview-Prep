# Big picture first: Lab (synthetic) vs Field (Real User Monitoring — RUM)

**Lab (synthetic) testing**

* What it is: deterministic, repeatable runs of your page in a controlled environment (tools: Lighthouse, WebPageTest, headless Chrome).
* Strengths: reproducible, useful for debugging, comparing PRs, seeing full filmstrip / trace / waterfall.
* Weaknesses: it *simulates* devices & networks — it can miss real-user variability (different devices, ISPs, locales).
* When to use: regressions in CI, root-cause analysis, waterfall & CPU analysis, validating fixes.

**Field (Real User Monitoring — RUM)**

* What it is: passive instrumentation in real users’ browsers that reports the actual experience back to your backend or a monitoring service.
* Strengths: captures real devices, networks, user flows, geographic diversity — essential for SLOs (Service Level Objectives) and actual business impact.
* Weaknesses: noisy, requires sampling/aggregation and privacy care.
* When to use: to set SLOs/alerts, detect regressions in production segments (e.g., mobile 75th percentile in India), validate synthetic improvements actually matter.

**Integration strategy**: always run both. Synthetic for deterministic debugging + field for trends/SLOs.

---

# The metrics you must *really* understand (with expanded names)

I’ll expand each abbreviation on first use and give *what it measures, how it’s calculated/observed, common causes, and mitigation patterns*.

### 1) LCP — Largest Contentful Paint

* **What it is**: LCP (Largest Contentful Paint) measures the time from navigation start until the browser renders the *largest* image or text block visible in the viewport. It's the loading/perceived-paint metric (how quickly the main content appears). ([web.dev][1])
* **How measured**: browser’s Paint Timing / PerformanceObserver emits a `largest-contentful-paint` entry. RUM collects the timestamp. Lab tools (Lighthouse) estimate via traced page load.
* **Common root causes**:

  * Slow server response / TTFB (Time to First Byte).
  * Large/late-loading hero image or font.
  * Render-blocking CSS or JS delaying painting.
* **Mitigations**:

  * Preload critical hero image or font; use responsive images + modern formats (AVIF/WebP).
  * Move heavy JS off critical path, use SSR/SSG for pages that can be static.
  * Use a CDN and cache HTML where possible.
* **Targets**: Google suggests LCP ≤ 2.5s for a “good” experience in many contexts (use percentiles per SLO). ([Google for Developers][2])

### 2) CLS — Cumulative Layout Shift

* **What it is**: CLS (Cumulative Layout Shift) measures unexpected visual shifts of page elements during the page lifecycle — a visual-stability metric. It’s computed by summing layout shift *scores*. Each layout shift score is `impact fraction × distance fraction` (impact fraction = area of viewport affected; distance fraction = how far elements moved relative to viewport) for that shift. ([web.dev][3])
* **How measured**: PerformanceObserver listens for `layout-shift` entries and aggregates session/windowed scores.
* **Common root causes**:

  * Images without width/height or no aspect-ratio.
  * Ads/iframes injected asynchronously.
  * Late-loading web fonts that change metrics (FOIT/FOUT — Flash of Invisible Text / Flash of Unstyled Text).
* **Mitigations**:

  * Always reserve space (intrinsic sizes / CSS aspect-ratio / skeletons).
  * Use `font-display: swap` or better font-loading strategies.
  * Lazy-load below-the-fold ads or reserve slots.

### 3) INP — Interaction to Next Paint

* **What it is**: INP (Interaction to Next Paint) is a responsiveness metric that measures how quickly the page produces a visual response after user interactions (clicks, taps, key presses). INP looks at *all interactions* during a user’s visit and typically reports the worst (high-latency) interaction observed for that page. INP replaced First Input Delay (FID) as the Core Web Vitals responsiveness metric. ([web.dev][4])
* **How measured**: the browser/PerformanceObserver collects timings for interactions; RUM aggregates interactions per session and reports an INP value (often a long-tail percentile like 98th or a worst-case interaction).
* **Common root causes**:

  * Long tasks on the main thread (>50ms tasks).
  * Heavy parse/compile/execute work early in the session.
* **Mitigations**:

  * Break up long tasks (slice work), offload to web workers, use requestIdleCallback for non-urgent work, defer non-critical JS.
* **Targets**: as a rule of thumb many sources use INP < 200ms as a "good" target; pick percentiles for SLOs (e.g., 75th or 95th depending on product). ([Google for Developers][2])

### 4) FID — First Input Delay (historical)

* **What it is**: First Input Delay measured the delay between a user’s *first* input and the time the browser could begin processing that input. FID was limited because it only captured the *first* interaction (not subsequent ones), which is why INP replaced it. (Keep FID on your radar only for legacy dashboards.)

### 5) TTFB — Time to First Byte

* **What it is**: time from navigation start until the browser receives the first byte from server. It’s primarily a server/caching/CDN metric and strongly affects LCP when SSR/SSR-like pages are used.

### 6) FCP — First Contentful Paint

* **What it is**: time until the browser renders any content (text, image, svg) — an early paint milestone. Useful to measure initial progress.

### 7) TBT — Total Blocking Time

* **What it is**: TBT (Total Blocking Time) sums how long the main thread was blocked by long tasks (>50ms) between FCP and TTI (Time to Interactive). For each long task, you add `task.duration - 50ms` to the TBT. TBT correlates with responsiveness and is a lab metric Lighthouse uses to approximate FID/INP problems in synthetic tests.

### 8) TTI — Time to Interactive

* **What it is**: time at which the page is consistently responsive to user input; lab metric used in Lighthouse. It’s stricter than FCP and sensitive to long main-thread work.

### 9) Long Tasks (Long Tasks API)

* **What it is**: any main-thread task >50ms. These block interactivity and cause poor INP/TBT. Use the Long Tasks API to detect them and attribute them to script/file.

### Percentiles, SLI, SLO — how to set goals

* **SLI (Service Level Indicator)**: a measured value (e.g., 75th-percentile LCP on mobile).
* **SLO (Service Level Objective)**: the target you want that metric to meet over time (e.g., 75th-percentile LCP < 2.5s).
  Pick percentile (50th/75th/95th) based on product tolerances — don’t optimize only for median.

---

# Browser APIs & instrumentation: what to use and sample code

**APIs to know** (first mention expansions):

* `Performance API`, `Navigation Timing` / `Resource Timing` / `Paint Timing` (all part of the Performance APIs).
* `PerformanceObserver` — subscribe to `largest-contentful-paint`, `layout-shift`, `longtask`, `event` / `first-input` entries.
* `Long Tasks API` — reports tasks >50ms.
* `User Timing API` (`performance.mark()` / `performance.measure()`) — for custom instrumentation.
* `navigator.sendBeacon()` — reliable, non-blocking reporting on `pagehide`/`visibilitychange`.

**Practical: use web-vitals (recommended)**
Google’s `web-vitals` library wraps cross-browser quirks and provides stable exports: `getLCP`, `getCLS`, `getINP`, `getFID`, `getTTFB`. Example:

```js
// npm install web-vitals
import {getLCP, getCLS, getINP, getFID, getTTFB} from 'web-vitals';

function sendMetric(metric) {
  navigator.sendBeacon('/rum', JSON.stringify(metric));
}

getLCP(metric => sendMetric({name: metric.name, value: metric.value, id: metric.id}));
getCLS(metric => sendMetric({name: metric.name, value: metric.value, id: metric.id}));
getINP(metric => sendMetric({name: metric.name, value: metric.value, id: metric.id}));
getFID(metric => sendMetric({name: metric.name, value: metric.value, id: metric.id}));
getTTFB(metric => sendMetric({name: metric.name, value: metric.value, id: metric.id}));
```

**If you prefer raw `PerformanceObserver` for LCP/CLS** (simplified):

```js
// LCP (rough)
try {
  const obs = new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      // entry.startTime is LCP time in ms
    }
  });
  obs.observe({type: 'largest-contentful-paint', buffered: true});
} catch(e) { /* not supported */ }
```

**Reporting best practices**:

* Use `navigator.sendBeacon()` on `pagehide` or batch events and send periodically.
* Record context: route, app version, experiment flag, user-agent, network info (`navigator.connection` Client Hints).
* Sample low-traffic pages: you don’t need every user (rate-limit), but sample enough to compute percentiles accurately.
* Avoid sending PII.

---

# Implementing effective RUM practially — architecture & patterns

1. **Client side**:

   * Lightweight script (or include `web-vitals`) that collects Core Web Vitals + custom timings (component render/hydration).
   * Add route and user/session context and tags (A/B tests, feature flags).
   * Buffer/batch and flush at `pagehide` or at intervals using `sendBeacon` or `fetch` with `keepalive`.
2. **Server/Backend**:

   * Ingest endpoint should accept small JSON blobs, deduplicate, and write to timeseries store (e.g., Elasticsearch, BigQuery, Datadog).
   * Pre-aggregate on write to cut down costs (histograms / HDR histograms).
3. **Analysis**:

   * Store stable histograms to compute percentiles (50/75/95). Avoid naive means.
   * Segment by device/UA, connection type, geography, route, app version.
4. **Sampling & Privacy**:

   * Sample deterministically if needed (hash user ID mod N), and respect Do Not Track.
   * Never transmit raw user IDs or PII unless you have consent and secure storage.

---

# How Lighthouse fits & how to use it correctly

* **What Lighthouse is**: a synthetic auditing tool that runs a controlled Chromium instance and produces: score(s), audits, opportunities, trace & waterfall. Use it for lab diagnosis, not as a field-only measure.
* **Throttling matters**: Lighthouse simulates network/CPU throttling (defaults emulate slower mobile). Use consistent throttling across runs; pick a profile that represents your target users (e.g., mid-tier mobile on 4G or slow 4G).
* **Interpret the output**:

  * **Performance score** is an aggregated index — good for quick gating, but don’t optimize the score blindly.
  * **Opportunities** show estimated savings and where the time is spent (e.g., "Eliminate render-blocking resources").
  * **Diagnostics** (main-thread flame chart) show parse/compile/execute times and long tasks.
* **Use cases**:

  * Local dev debugging (run Lighthouse in DevTools).
  * CI gating: use Lighthouse CI to fail a PR if thresholds are breached.
  * Compare PR vs base branch to catch regressions.
* **Lighthouse CI**: run in your CI pipeline (GitHub Actions, GitLab CI) to compare commits/PRs and fail if performance budgets exceed thresholds.

---

# Triage playbook — step-by-step when a metric breaks

1. **Is it field or lab?**

   * If RUM shows a regression in LCP for the 75th percentile on mobile, start by segmenting by route, device, and network.
2. **Reproduce in lab with matching throttle & device** (use Lighthouse or WebPageTest with the same throttling).
3. **Record a trace** (Chrome DevTools Performance trace or WebPageTest trace).
4. **Analyze trace**:

   * Look at main thread: identify long tasks, JS parse/compile times, GC pauses.
   * Waterfall: identify slow resources (large images, fonts, render-blocking CSS/JS).
   * Filmstrip/screenshots: what is painted when? Which resource unlocks painting of LCP element?
5. **Hypothesize & fix**:

   * If LCP is delayed by a large hero image, try preloading it, using `srcset`, or converting to modern format.
   * If TBT/INP issues are caused by a third-party script, gate or lazy-load it.
6. **Verify**: repopulate lab runs and track RUM trends for several days (field is noisier but shows real impact).
7. **Automate**: add tests to CI and a bundle size check.

---

# Next.js (specific) — what to watch and practical code patterns

(Expanding the abbreviations at first mention: `SSG` = Static Site Generation, `SSR` = Server-Side Rendering, `ISR` = Incremental Static Regeneration, `RSC` = React Server Components.)

**Rendering modes & their perf trade-offs**

* **SSG (Static Site Generation)**: pre-build HTML at build time. Great for ultra-fast LCP & caching.
* **ISR (Incremental Static Regeneration)**: combine SSG with background revalidation using `revalidate` on `getStaticProps`. Good for stale-while-revalidate patterns that keep low TTFB.
* **SSR (Server-Side Rendering)**: HTML generated per-request; TTFB matters — choose edge or regionally close servers and aggressive caching.
* **RSC (React Server Components)**: keep non-interactive UI on server to reduce client JS. Use when available — it can dramatically cut hydration work.

**Hydration & client bundle strategies**

* Use `next/dynamic` to lazy-load heavy components:

```js
import dynamic from 'next/dynamic';
const Heavy = dynamic(() => import('../components/Heavy'), { ssr: false, loading: () => <Placeholder/> });
```

* Use `next/script` to control third-party script loading:

```jsx
import Script from 'next/script';
<Script src="https://example.com/widget.js" strategy="afterInteractive" />
```

`strategy` values: `beforeInteractive`, `afterInteractive`, `lazyOnload` — pick based on criticality.

**Images & fonts**

* Use `next/image` — automatic resizing, srcset, lazy loading, and optimization. Mark hero images with `priority` to help LCP:

```jsx
import Image from 'next/image';
<Image src="/hero.jpg" width={1200} height={600} priority alt="hero" />
```

* Use built-in `next/font` or `font-display: swap` to mitigate FOIT/FOUT.

**Example: ISR usage**

```js
export async function getStaticProps() {
  const data = await fetchMyData();
  return { props: { data }, revalidate: 60 }; // revalidate at most once per 60s
}
```

**Hydration optimization patterns**

* Move static markup to server components; hydrate only minimal interactive parts.
* Defer hydration for below-the-fold widgets.
* Consider progressive hydration or streaming SSR if your app needs faster first-paint of meaningful content.

---

# Prevent regressions: budgets & CI

* **Performance budgets**: enforce file-size or timing budgets (bundle size, JS parsed size, LCP/TTI thresholds). Tools: Lighthouse CI, `bundlewatch`, webpack `performance.hints`, `source-map-explorer`.
* **PR gate**: run lightweight Lighthouse CI or a bundle-size check; fail PRs that add >X KB of parsed JS or that decrease performance beyond threshold.
* **Alerting**: set SLOs for percentiles and alert when the SLI breaches for a time window.

---

# Quick checklist (practical, ready-to-run)

* [ ] Add RUM collection for Core Web Vitals (LCP, CLS, INP) and business-critical timings.
* [ ] Segment RUM by route, device, network, and app version.
* [ ] Run Lighthouse in CI on main routes and in PRs (Lighthouse CI).
* [ ] Enforce bundle-size budgets and analyze source maps on PRs.
* [ ] Audit third-party scripts and gate/lazy-load them.
* [ ] Use `next/image`, `next/script`, `next/font` in Next.js; prefer SSG/ISR where possible.
* [ ] Reserve space for images/iframes and fix font loading to reduce CLS.
* [ ] Break long tasks; offload work to web workers where useful.

---

# Common pitfalls and anti-patterns

* Optimizing only Lighthouse score instead of actual user percentiles.
* Ignoring poor percentiles (95th) because median looks fine.
* Relying on a single lab run — synthetic runs vary; run multiple iterations.
* Allowing third-party scripts to run inline and block the main thread.
* Shipping huge shared bundles rather than route-based splits.

---

[1]: https://web.dev/articles/lcp?utm_source=chatgpt.com "Largest Contentful Paint (LCP) | Articles"
[2]: https://developers.google.com/search/docs/appearance/core-web-vitals?utm_source=chatgpt.com "Understanding Core Web Vitals and Google search results"
[3]: https://web.dev/articles/cls?utm_source=chatgpt.com "Cumulative Layout Shift (CLS) | Articles"
[4]: https://web.dev/blog/inp-cwv-launch?utm_source=chatgpt.com "Interaction to Next Paint is officially a Core Web Vital 🚀 | Blog"
