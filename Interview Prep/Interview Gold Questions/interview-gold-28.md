# 🚀 Interview Gold – Batch #28 (Frontend Cost & Efficiency Gold)

---

## 1. Performance Budgets (Bytes, JS, Images)

**Problem:**

* Teams add features → bundle size + page weight balloons.
* Every extra KB increases **infra costs** (bandwidth) and **user churn** (slower page).

**Solution:**

* Define **performance budgets**:

  * JS ≤ 200KB gzipped per route.
  * LCP ≤ 2.5s on 75th percentile devices.
  * Max 3 critical CSS/JS requests.

**Detailed Design:**

* Add budget check in CI:

```json
"budgets": [
  { "type": "bundleSize", "maxSize": "200kb" },
  { "type": "timings", "maxDuration": "2.5s" }
]
```

* Tools: Lighthouse CI, webpack-bundle-analyzer.

**Perf/Scaling Notes:**

* Prevents regression creep.
* Forces tradeoffs early.

**Pitfalls:**

* Overly strict budgets → block dev velocity.
* Must balance “business ROI vs perf cost.”

**Real-world Example:**

* Google Search mandates ≤ 150KB JS for homepage.
* Pinterest reduced bundle by 40% → +15% conversions.

**Follow-ups:**

* Why budgets must be per-route, not global?
* How to enforce budgets in CI?
* What’s the tradeoff between strict vs flexible budgets?

---

## 2. Infra Cost Awareness (CDN vs Cloud)

**Problem:**

* Frontend traffic = millions of requests/day.
* Serving assets from **origin servers** costs more and adds latency.

**Solution:**

* Push assets to **CDN/edge**:

  * Images, JS, CSS → cache at PoPs.
  * APIs with SWR → reduce origin hits.

**Detailed Design:**

* Cache headers:

```http
Cache-Control: public, max-age=31536000, immutable
```

* Edge compute: serve **personalized HTML** at CDN layer.

**Perf/Scaling Notes:**

* Reduces infra costs (origin egress).
* Improves latency by 100–300ms.

**Pitfalls:**

* Stale cache → bugs if invalidation hard.
* Edge functions often have runtime limits (50ms, no Node APIs).

**Real-world Example:**

* Netflix streams via CDN (OpenConnect) to cut egress costs.
* Shopify Hydrogen uses Vercel Edge to reduce infra costs globally.

**Follow-ups:**

* Why edge cheaper than cloud for static assets?
* How to balance cache freshness vs cost savings?
* What’s cost of cache misses?

---

## 3. Image/Media Optimization

**Problem:**

* Images = **\~60% of typical page weight**.
* Serving raw images → wasted bandwidth + CDN cost.

**Solution:**

* Use **responsive, compressed, modern formats (WebP, AVIF)**.
* Serve via **image CDN** (Imgix, Cloudinary, Vercel).

**Detailed Design:**

```html
<picture>
  <source srcset="image.avif" type="image/avif" />
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" width="600" alt="example" />
</picture>
```

* Lazy-load offscreen images:

```html
<img src="image.jpg" loading="lazy" />
```

**Perf/Scaling Notes:**

* Reduces bandwidth costs 40–70%.
* Faster FP/LCP → conversion gains.

**Pitfalls:**

* Too aggressive compression → UX harm.
* Browser fallback logic needed.

**Real-world Example:**

* eBay reduced CDN bill by millions via AVIF migration.
* Instagram uses image CDNs for billions of photos.

**Follow-ups:**

* Why AVIF > WebP?
* What’s tradeoff: infra cost vs image quality?
* How lazy loading affects Core Web Vitals?

---

## 4. Reducing JavaScript Execution Cost

**Problem:**

* More JS → not just network cost but **execution cost** (CPU/battery).
* On low-end devices, parsing + eval can be more expensive than downloading.

**Solution:**

* Reduce shipped JS:

  * Tree-shaking + dead code elimination.
  * Code splitting + lazy loading.
  * Move logic server-side (RSC, edge compute).

**Detailed Design:**

```js
// Dynamic import for rarely used admin panel
if (isAdmin) {
  import("./admin").then(initAdmin);
}
```

**Perf/Scaling Notes:**

* Execution cost can be **3–4x higher on low-end devices**.
* Reducing JS saves both infra bandwidth + device CPU/battery.

**Pitfalls:**

* Over-splitting = too many network requests.
* Lazy-loaded code can cause UX delay if poorly predicted.

**Real-world Example:**

* Twitter Lite reduced JS by 80% → huge cost + perf gains.

**Follow-ups:**

* Why execution cost matters more than bundle size?
* How to balance splitting vs UX?
* What’s role of React Server Components in cost efficiency?

---

## 5. Developer Productivity vs Cost

**Problem:**

* Infra cost isn’t just servers → **engineering time = \$\$\$**.
* Slow builds/tests waste thousands of engineer-hours.

**Solution:**

* Optimize developer workflows:

  * Parallel builds (Turborepo, Nx).
  * Remote caching (Bazel, Vite, esbuild).
  * AI-assisted PR reviews (Copilot Chat, CodeQL).

**Detailed Design:**

* Example: CI config caching build:

```yml
cache:
  key: build-cache-${{ hashFiles('package-lock.json') }}
  paths: .turbo
```

**Perf/Scaling Notes:**

* Dev productivity directly impacts feature velocity → cost of delay.

**Pitfalls:**

* Over-optimizing CI/CD may add complexity.
* Remote caching infra requires infra cost itself.

**Real-world Example:**

* Google → Bazel saves **millions of build hours/year**.
* Vercel uses Turborepo to speed monorepo builds.

**Follow-ups:**

* Why dev productivity = cost efficiency?
* How to measure cost of wasted build time?
* Tradeoffs of investing in infra vs features?

---

## 6. Measuring ROI of Frontend Improvements

**Problem:**

* Hard to justify “frontend optimizations” to business stakeholders.
* Need to prove that cost savings or revenue lift is real.

**Solution:**

* Always tie perf/infra savings → **business outcomes**:

  * Lower CDN bills.
  * Higher conversions.
  * Faster iteration velocity.

**Detailed Design:**

* Example calculation:

  * Reducing 200KB JS → saves 1PB/year bandwidth → \$100k infra savings.
  * Faster LCP → +2% conversion → \$20M extra revenue.

**Perf/Scaling Notes:**

* Must capture both **direct infra savings** and **indirect business uplift**.

**Pitfalls:**

* Hard to isolate causation.
* Need controlled experiments (Batch #25 topics).

**Real-world Example:**

* Pinterest: perf improvements → +15% signups.
* Amazon: 100ms slower → 1% sales drop.

**Follow-ups:**

* How to estimate \$\$ impact of perf work?
* Why ROI framing matters for frontend leadership?
* Example ROI calc for reducing API latency.

---

## 7. Cost-Aware API Design (Frontend <-> Backend)

**Problem:**

* Poor API design = extra requests, redundant data transfer → bandwidth waste.

**Solution:**

* Cost-efficient API patterns:

  * GraphQL → fetch exactly what’s needed.
  * Batching → fewer round-trips.
  * Compression (gzip, Brotli).

**Detailed Design:**

```graphql
query {
  user {
    id
    name
    avatar
  }
}
```

vs REST returning full user profile (wasted data).

**Perf/Scaling Notes:**

* Fewer bytes → lower CDN + infra cost.
* Improves TTFB → conversion lift.

**Pitfalls:**

* GraphQL resolvers can be inefficient if not optimized.
* Over-batching → large payloads = slow parse.

**Real-world Example:**

* Facebook → GraphQL to reduce redundant mobile API calls.
* Airbnb → compressed JSON API to cut infra bills.

**Follow-ups:**

* Why GraphQL often more cost-efficient than REST?
* When batching becomes counterproductive?
* What’s tradeoff between payload size vs request count?

---

# 📘 Key Takeaways – Batch #28

* **Perf budgets** prevent regressions, control bundle growth.
* **Edge/CDN infra** reduces origin costs + latency.
* **Image optimization** biggest cost saver at scale.
* **JS execution cost** matters more than bytes for low-end devices.
* **Dev productivity = cost efficiency** (time = money).
* **ROI framing** → ties perf savings to \$\$\$.
* **API design** → fewer bytes, fewer calls.

---

# 📑 Quick-Reference (Batch #28)

* **Budgets**: 200KB JS/route, LCP ≤ 2.5s.
* **Infra**: edge/CDN cheaper than origin.
* **Images**: AVIF/WebP, lazy-load.
* **JS**: reduce execution cost, not just size.
* **Dev time**: optimize builds/tests.
* **ROI**: bandwidth \$ + conversion lift.
* **APIs**: GraphQL, batching, compression.