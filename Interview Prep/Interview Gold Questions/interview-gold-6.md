# 🚀 Interview Gold – Batch #6 (Performance & Rendering Optimization)

---

## 1. Reduce Bundle Size (Code Splitting & Tree-Shaking)

**Problem:**

* Large single JS bundle → slow Time-to-Interactive (TTI).
* Users download code for all routes, even those they never visit.

**Solution:**

* **Code Splitting**: Split bundles by route (`import()` in Webpack, dynamic imports in Next.js).
* **Tree Shaking**: Remove unused exports (ESM-only).
* **CDN Caching**: Serve static chunks with cache-busting.

**Detailed Design:**

* Use **Webpack/Rollup/ESBuild** with `mode=production` → tree shaking enabled.
* Dynamic imports for lazy route loading:

```js
const ProductPage = React.lazy(() => import("./ProductPage"));
```

* Split vendor libraries (`react`, `lodash`) into separate chunks → cached longer.
* Prefetch critical bundles for next likely navigation.

**Performance Notes:**

* Reduces initial payload.
* Improves **Largest Contentful Paint (LCP)**.

**Follow-ups:**

* How does tree-shaking differ from dead-code elimination?
* How would you optimize lodash usage? (import `lodash/debounce` instead of whole lib).
* How does HTTP/2 multiplexing affect bundle splitting strategy?

---

## 2. Optimize Time-to-Interactive (TTI)

**Problem:**

* Page looks ready but isn’t interactive (too much JS blocking main thread).

**Solution:**

* **Critical Rendering Path Optimization**:

  * Inline critical CSS for above-the-fold.
  * Load non-critical CSS async (`<link rel="preload">`).
  * Defer non-essential JS.
* **Code splitting**: Load minimal JS upfront.
* **Hydration strategies**: Lazy hydrate below-the-fold React components.

**Detailed Design:**

* Render shell HTML with SSR/SSG.
* Split hydration: e.g. hero component hydrates immediately, footer hydrates later.
* Use Web Vitals (FID, TTI) to measure.

**Performance Notes:**

* TTI is directly impacted by **JS execution cost**.
* Offload heavy work to **Web Workers** if possible.

**Follow-ups:**

* How would you measure TTI? → Lighthouse, Web Vitals.
* How does React 18 concurrent rendering help TTI? → Time slicing, interruptible rendering.
* How to reduce JS execution cost? → Remove polyfills, use lighter libraries.

---

## 3. Image Optimization Pipeline

**Problem:**

* Images often the heaviest assets (\~60% page weight).
* Wrong sizes = wasted bandwidth & layout shifts.

**Solution:**

* **Responsive Images**: `<img srcset>` or `<picture>`.
* **Lazy Loading**: `loading="lazy"` or IntersectionObserver.
* **Compression**: Serve WebP/AVIF where supported, fallback to JPEG/PNG.
* **CDN Transformation**: Resize images at edge (Cloudflare, Imgix).

**Detailed Design:**

```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Example" loading="lazy" width="600" height="400">
</picture>
```

* Always include `width` & `height` to reserve layout box.
* Use `blur-up` placeholders or LQIP (low quality image placeholder).

**Performance Notes:**

* Reduces **CLS** (Cumulative Layout Shift).
* Improves **LCP** significantly.

**Follow-ups:**

* Why is AVIF better than WebP? → Better compression, higher CPU decode cost.
* How to implement responsive images in React? → `next/image`.
* How would you implement image caching offline? → Service Worker + Cache API.

---

## 4. Implement Code Splitting & Lazy Loading (React)

**Problem:**

* SPA bundles grow large → slow first load.

**Solution:**

* Split per route + per component.
* Use `React.lazy` + `Suspense` for dynamic imports.

**Detailed Design:**

```js
const Dashboard = React.lazy(() => import("./Dashboard"));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Dashboard />
    </Suspense>
  );
}
```

* Preload “likely next routes” on hover or idle (React Loadable).
* For SSR (Next.js) → automatically splits by route.

**Performance Notes:**

* Avoid splitting too aggressively (many HTTP requests = overhead).
* Balance **bundle size vs latency**.

**Follow-ups:**

* How does code splitting interact with HTTP/2 multiplexing?
* How would you preload but not block rendering? (`<link rel="prefetch">`)
* How does Next.js handle SSR + code splitting?

---

## 5. Caching Strategy (Frontend + CDN)

**Problem:**

* Redundant API calls.
* Slow global access.

**Solution:**

* **Client-side cache**: React Query/SWR → cache + background refresh.
* **CDN edge caching**: Cache static assets + API responses at edge.
* **Service Worker caching**: Offline-first, cache API + assets in Cache API.

**Detailed Design:**

* Use stale-while-revalidate pattern:

  * Return cached data instantly.
  * Fetch new data in background.
  * Update UI once new data arrives.

```js
import useSWR from "swr";
const { data } = useSWR("/api/user", fetcher, { revalidateOnFocus: true });
```

**Performance Notes:**

* Critical for mobile networks.
* Improves **FCP (First Contentful Paint)**.

**Follow-ups:**

* How does cache invalidation work in SWR?
* How to handle sensitive data caching? (disable caching headers).
* What’s the difference between CDN vs SW caching?

---

## 6. Preload, Prefetch, and Priority Hints

**Problem:**

* Browser loads resources in suboptimal order.

**Solution:**

* `<link rel="preload">` → critical resources (fonts, hero image).
* `<link rel="prefetch">` → next-page resources.
* `<link rel="dns-prefetch">` → external domain lookup.
* `importance=high|low` → priority hints.

**Detailed Design:**

```html
<link rel="preload" as="font" href="/fonts/inter.woff2" crossorigin>
<link rel="prefetch" href="/next-page.js">
<link rel="dns-prefetch" href="//api.example.com">
```

**Performance Notes:**

* Preload too much = wasted bandwidth.
* Prefetch wisely = instant navigation.

**Follow-ups:**

* What’s the difference between preload vs prefetch?
* How do modern frameworks automate this? (Next.js, Gatsby).
* How does Chrome decide request priority without hints?

---

## 7. Minimizing Repaints & Reflows

**Problem:**

* Excessive DOM changes → layout thrashing.

**Solution:**

* Batch DOM updates (requestAnimationFrame).
* Avoid layout reads after writes.
* Use `transform: translate` instead of `top/left`.
* Use CSS classes instead of inline styles for multiple updates.

**Detailed Design:**

```js
requestAnimationFrame(() => {
  el.style.transform = "translateX(100px)";
  el.style.opacity = "0";
});
```

**Performance Notes:**

* Avoids “forced reflow” penalties.
* Improves animation smoothness (target 60fps).

**Follow-ups:**

* What causes layout thrash? (reading offsetWidth after changing styles).
* Why is transform better than top/left for animations?
* How to debug reflows? → Chrome DevTools Performance tab.

---

# 📘 Key Takeaways – Batch #6

* **Bundle size** → code splitting, tree-shaking.
* **TTI** → critical CSS, defer JS, concurrent React.
* **Image pipeline** → responsive, WebP/AVIF, lazy load.
* **Lazy loading** → React.lazy, Suspense, route splitting.
* **Caching** → SWR, stale-while-revalidate, Service Worker.
* **Preload/prefetch** → optimize resource priorities.
* **DOM perf** → avoid reflows, batch updates.

---

# 📑 Quick-Reference (Batch #6)

* **Bundle size**: Split by route, tree-shake, vendor chunk.
* **TTI**: Inline CSS, defer JS, lazy hydrate.
* **Images**: WebP/AVIF, srcset, lazy load.
* **Lazy loading**: React.lazy + Suspense.
* **Caching**: SWR + CDN + Service Worker.
* **Preload/prefetch**: critical vs next-page.
* **Reflows**: batch updates, use transform not top/left.
