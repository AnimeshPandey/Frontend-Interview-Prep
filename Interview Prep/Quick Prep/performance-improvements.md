# Quick process to follow

1. **Measure first** (don’t guess): Lighthouse, Chrome DevTools Performance / Network, React Profiler, webpack-bundle-analyzer, WebPageTest.
2. **Find the hotspots** (largest bundles, slowest frames, long tasks, re-renders).
3. **Apply targeted fixes** from the lists below.
4. **Measure again** and iterate.

---

# 1) Build-time & Webpack optimizations

These reduce bundle size and shipping cost.

**a. Production mode & optimizations**

```js
// webpack.config.js
mode: 'production',
devtool: false, // or 'source-map' for production mapping
optimization: {
  minimize: true,
  usedExports: true,      // tree-shaking
  concatenateModules: true, // scope hoisting / module concatenation
  splitChunks: { chunks: 'all' },
  runtimeChunk: 'single'
}
```

* `mode: 'production'` enables many optimizations automatically.
* `runtimeChunk: 'single'` separates webpack runtime for long-term caching.

**b. Code-splitting**

* **Route-based splitting**: `React.lazy(() => import('./Page'))`.
* **Component-level splitting** for heavy widgets (charts, editors).
* Use dynamic imports with webpack magic comments:

```js
const Chart = React.lazy(() => import(/* webpackChunkName: "chart", webpackPrefetch: true */ './Chart'));
```

* `webpackPrefetch: true` tells browser to prefetch when idle; `webpackPreload` for high priority.

**c. SplitChunks tuning**

* Configure `splitChunks` to extract vendor chunks (node\_modules) and commons.
* Keep chunk sizes reasonable; avoid too many tiny files for HTTP/1.

**d. Tree-shaking & sideEffects**

* Ensure libraries ship ES modules (ESM) so tree-shaking works.
* Add `"sideEffects": false` in `package.json` if safe; otherwise list exceptions.

**e. Minification & compression**

* Use `TerserPlugin` with parallelization.
* Generate compressed assets on the server/build: gzip and Brotli (Brotli preferred for size).
* Serve pre-compressed assets via CDN or server.

**f. Analyze bundles**

* `webpack-bundle-analyzer`, `source-map-explorer` to see which modules are heavy.

```bash
npx webpack-bundle-analyzer dist/stats.json
```

**g. Reduce transpilation work**

* Configure `babel-loader` `include`/`exclude` to avoid node\_modules unless needed.
* Use `cacheDirectory: true` to speed up rebuilds.
* Prefer `@babel/preset-env` targets (browserslist) to avoid unnecessary polyfills.

**h. Use lighter alternatives / optimize dependencies**

* Replace heavy libs (moment -> date-fns / dayjs, lodash -> lodash-es or cherry-pick).
* Import only used functions: `import debounce from 'lodash/debounce'` or `lodash-es` with ESM.

**i. Asset & image optimizations**

* Use `image-webpack-loader` or process images offline to create multiple sizes + WebP/AVIF.
* Inline very small assets (data URI) with `url-loader` limit; otherwise emit files.

**j. Use externals for CDNs (optional)**

* Offload React/ReactDOM to CDN / use `externals` when you control environment (tradeoff: caching across sites).

---

# 2) Caching & CDN strategies

Make repeat loads fast.

* Use **long-term caching**: file names with content hashes (`[contenthash]`) so browsers cache indefinitely.
* Set proper `Cache-Control` headers (immutable + long max-age).
* Use a CDN (edge caching) for static assets.
* Use Service Worker (Workbox) for offline caching & precaching critical assets (careful with cache invalidation).
* Use `stale-while-revalidate` for non-critical resources.

---

# 3) Network & HTTP

Reduce round-trips and payloads.

* **Minimize critical payload**: smaller JS/CSS for first meaningful paint.
* **Critical CSS**: inline only the CSS needed for above-the-fold content.
* **Resource hints**: `<link rel="preconnect">`, `<link rel="preload">` for fonts/critical scripts.
* **HTTP/2 or HTTP/3**: if available, many small files are okay; with HTTP/1 bundle more.
* **Reduce third-party scripts** and load them asynchronously (`defer`/`async`); preconnect to their origins.
* **Compress JSON** on network responses when possible.
* **Avoid blocking synchronous XHR/JS**.

---

# 4) Runtime JS & React performance

Cut runtime CPU, avoid unnecessary work and re-renders.

**a. Avoid unnecessary renders**

* Use `React.memo` for functional components that accept the same props frequently.
* For class components, use `PureComponent` or implement `shouldComponentUpdate`.
* Avoid recreating inline props frequently (functions/objects). Example:

```js
// bad: function recreated each render causes child re-render
<Child onClick={() => setCount(c => c + 1)} />

// better: useCallback
const handleClick = useCallback(() => setCount(c => c + 1), []);
<Child onClick={handleClick} />
```

* **CAVEAT**: `useCallback`/`useMemo` have their own cost — use when they reduce expensive children re-renders.

**b. Memoization**

* `useMemo` to memoize expensive computations.
* Don’t overuse; profile to ensure gains.

**c. State locality**

* Keep state as local as possible to avoid large subtree rerenders.
* Use multiple smaller contexts or separate state slices rather than one big global state.

**d. Avoid frequent object/array allocations**

* Reuse references when possible; avoid creating new props objects each render (e.g., `{ style: {...} }`).

**e. Virtualization / Windowing**

* For long lists, use `react-window` / `react-virtualized` / `tanstack/virtual` to render only visible items.

**f. Batch state updates**

* React batches inside event handlers — in other contexts use `unstable_batchedUpdates` or the automatic batching in React 18.

**g. Expensive rendering**

* Break big components into smaller ones so React can skip subtrees.
* Use lazy loading for heavy UI (charts, editors).

**h. Use transitions for low-priority updates**

* React 18 `startTransition` / `useTransition` to mark non-urgent updates and avoid janky UI.

**i. Suspense for data fetching / code**

* Use `React.Suspense` to defer rendering until a lazy boundary or data is ready. Good for smoother loading UX.

**j. Avoid memory leaks**

* Remove event listeners on unmount, clear intervals/timeouts, cancel subscriptions, clean up refs.

**k. Web Workers**

* Offload heavy CPU tasks to Web Workers to keep the main thread responsive. Use `worker-loader` or native worker bundling.

**l. Debounce / throttle**

* Debounce inputs (search), throttle scroll/resize handlers. Use `requestAnimationFrame` for UI updates.

---

# 5) DOM & rendering optimization (CSS / browser)

Reduce paints, layouts, and expensive reflows.

* Use CSS transforms and `opacity` for animations (GPU compositing) instead of `top/left`.
* Avoid layout thrashing: batch reads vs writes, use `requestAnimationFrame` for DOM writes.
* Use `will-change` sparingly for elements that will animate.
* Use `contain` CSS property (e.g., `contain: layout paint`) to limit layout effects.
* Use `position: fixed` / `transform` judiciously to reduce re-layout cost.
* Use `passive` event listeners for scroll/touch handlers: `{passive: true}`.
* Minimize DOM node count and depth.
* Avoid heavy CSS selectors; keep rules specific and small.

---

# 6) Images, fonts, CSS

Big wins often come here.

**Images**

* Responsive images: `srcset` & `sizes`, serve WebP/AVIF where supported.
* Lazy-load non-critical images: `loading="lazy"` or IntersectionObserver (for older browsers).
* Optimize and compress images; use appropriate dimensions.

**Fonts**

* Only load required font weights and character sets.
* Use `font-display: swap` to avoid FOIT (flash of invisible text).
* Consider system fonts for speed.
* Preload critical fonts with `<link rel="preload" as="font" crossorigin>`.

**CSS**

* Remove unused CSS (PurgeCSS).
* Split critical CSS from the rest.
* Use CSS modules / scoped CSS to reduce overall stylesheet size if app builds large global CSS.

---

# 7) Data fetching & server-side

Reduce time-to-first-content and client work.

* **Server-Side Rendering (SSR)** for first meaningful paint when SEO / initial load matter. Use streaming SSR if possible.
* **Static Site Generation (SSG)** for mostly static pages.
* **Hydration optimization**: reduce JS needed to hydrate (partial hydration / islands architecture).
* **Cache API responses** (HTTP caching, CDN edge caching).
* Use GraphQL query batching / persisted queries to reduce overfetching.
* Use pagination / lazy-loading for large datasets; avoid loading everything at once.

---

# 8) Dev-time & build improvements (developer experience)

Faster iteration also improves productivity.

* Use `webpack` `cache: { type: 'filesystem' }` in dev builds.
* Use `esbuild`/`swc` for faster JS/TS compilation as alternatives to Babel in large projects.
* Use HMR (Hot Module Replacement) for quick feedback loops.

---

# 9) Monitoring & Testing in production

Catch regressions and find hotspots.

* Monitor real-user metrics (RUM): Largest Contentful Paint (LCP), First Input Delay (FID), Time to Interactive (TTI), Cumulative Layout Shift (CLS).
* Tools: Lighthouse CI, WebPageTest, SpeedCurve, Sentry Performance, New Relic Browser, Google Analytics + web vitals.
* Add logs for long tasks, slow renders, and errors.

---

# 10) Concrete webpack snippets & plugins (cheat sheet)

**Split vendor + runtime**

```js
optimization: {
  splitChunks: {
    chunks: 'all',
    maxInitialRequests: 10,
    minSize: 20000,
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all'
      }
    }
  },
  runtimeChunk: 'single'
}
```

**Compression in build (gzip + brotli)**

```js
const CompressionPlugin = require('compression-webpack-plugin');
plugins: [
  new CompressionPlugin({ filename: '[path][base].gz', algorithm: 'gzip', test: /\.(js|css|html)$/ }),
  new CompressionPlugin({ filename: '[path][base].br', algorithm: 'brotliCompress', test: /\.(js|css|html)$/ })
]
```

**Bundle analyzer**

```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
plugins: [ new BundleAnalyzerPlugin() ]
```

---

# 11) Common anti-patterns to avoid

* Shipping large unused libraries or polyfills to modern browsers.
* Heavy per-render calculations not memoized.
* Deep prop object recreation causing child rerenders.
* Excessive context usage for high-frequency state.
* Memory leaks via leftover listeners/intervals.
* Putting everything in global CSS (causes huge CSS payload).
* Blocking the main thread with heavy JSON parsing or synchronous loops.

---

# 12) Prioritized checklist to act on (start here)

1. **Measure**: Lighthouse + React Profiler + bundle analyzer. Identify top offenders.
2. **Remove or lazy-load** big 3rd-party libs.
3. **Code-split** by route and heavy components.
4. **Optimize images & fonts** (responsive, modern formats, lazy).
5. **Long-term caching** + serve compressed assets (Brotli).
6. **Memoize / localize state** and use virtualization for large lists.
7. **Profile & address main-thread tasks** (web workers if needed).
8. **Iterate & measure again**.

---

# 13) Measurement tools (brief)

* **Browser**: Chrome DevTools Performance/Memory, Coverage tab.
* **React**: React DevTools Profiler, use `<Profiler>` API for component-level timings.
* **Build**: `webpack-bundle-analyzer`, `source-map-explorer`.
* **External**: Lighthouse, WebPageTest, SpeedCurve, Sentry Performance, RUM (web-vitals).

---

# Focused checklist for a React SPA

## 0) Measure first (baseline)

* **What:** Capture baseline metrics so you know improvements actually help.
* **Why:** Stop guessing — measure LCP, FCP, TTI, FID, CLS, bundle sizes, hot spots.
* **How:** Run Lighthouse (Chrome DevTools) and React Profiler; save a bundle `stats.json` (`--json --profile`) and open with `webpack-bundle-analyzer`.

  * `npx lighthouse https://your-app --output=json --output-path=lh-report.json`
  * `npx webpack --profile --json > stats.json && npx webpack-bundle-analyzer stats.json`

---

## 1) Minimize critical JS shipped on first load (highest impact)

* **What:** Shrink the JS needed to render first meaningful paint (home/entry page).
* **Why:** Smaller initial JS → faster parse/execute → faster First Contentful Paint (FCP) & Time to Interactive (TTI).
* **How:**

  * Move non-critical code behind dynamic imports:
    `const Heavy = React.lazy(() => import('./Heavy'));`
  * Use route-based splitting (React Router + `React.lazy` + `Suspense`).
  * Make a tiny “shell” bundle that loads quickly; defer heavy features.

---

## 2) Code-splitting & chunking strategy

* **What:** Separate app into logical chunks: vendor, runtime, route chunks, and heavy components.
* **Why:** Allows parallel loading and better caching; users only download needed code.
* **How:**

  * Webpack: `optimization.splitChunks: { chunks: 'all' }, runtimeChunk: 'single'`.
  * Use `webpackPrefetch` for not-critical-but-soon modules and `webpackPreload` for immediately-needed resources.
  * Don’t create hundreds of tiny chunks — balance chunk count and size.

---

## 3) Tree-shaking & remove dead code

* **What:** Ensure unused code and library parts aren’t shipped.
* **Why:** Reduces bundle size.
* **How:**

  * Use ESM modules; prefer `lodash-es` or import single functions: `import debounce from 'lodash/debounce'`.
  * Ensure `package.json` has `"sideEffects": false` (or list exceptions).
  * Replace heavy libs: `moment` → `dayjs`/`date-fns`, big UI libs if partially used.

---

## 4) Optimize big dependencies & vendor code

* **What:** Identify and reduce/replace heavy dependencies.
* **Why:** Single dependency can blow up bundle size.
* **How:**

  * Inspect bundle analyzer for large modules and replace or lazy-load.
  * Consider CDN/externals only if your deployment and caching strategy support it.

---

## 5) Images & media (huge gains often here)

* **What:** Serve properly sized, modern-format images and lazy-load non-critical images.
* **Why:** Images often account for the largest bytes.
* **How:**

  * Use `srcset` + `sizes` and generate multiple sizes; serve WebP/AVIF where possible.
  * Use `loading="lazy"` or IntersectionObserver for below-the-fold images.
  * Preload hero image(s): `<link rel="preload" as="image" href="/hero.avif">`

---

## 6) Fonts & CSS critical path

* **What:** Reduce blocking caused by web fonts and big CSS.
* **Why:** Blocking CSS and fonts delay paint; eliminating unused CSS reduces bytes.
* **How:**

  * Preload critical fonts: `<link rel="preload" as="font" href="/fonts/Inter.woff2" crossorigin>`
  * Use `font-display: swap`.
  * Extract and inline “critical CSS” for above-the-fold; lazy-load rest.
  * Purge unused CSS (PurgeCSS/Tailwind purge).

---

## 7) Long-term caching + compressed assets

* **What:** Configure server/CDN to serve hashed assets and pre-compressed files.
* **Why:** Users get fast repeat loads and smaller transfer sizes.
* **How:**

  * Build filenames with `[contenthash]`.
  * Serve pre-compressed `.br` and `.gz` with proper `Content-Encoding`.
  * Cache-Control: `public, max-age=31536000, immutable` for hashed assets.

---

## 8) Reduce runtime re-renders in React

* **What:** Stop unnecessary renders and expensive reconcilations.
* **Why:** CPU work and layout thrashes produce jank.
* **How:**

  * Use `React.memo` / `useMemo` / `useCallback` judiciously.
  * Localize state (avoid one global state causing whole app rerenders).
  * Avoid recreating inline objects/handlers every render — memoize them where needed.
  * Break large components into smaller pieces so reconcilation can skip subtrees.

Example:

```js
const onInc = useCallback(() => setCount(c => c + 1), []);
<Child onInc={onInc} /> // prevents child re-render if props stable
```

---

## 9) Virtualize long lists

* **What:** Render only visible list items.
* **Why:** Avoids thousands of DOM nodes and huge render cost.
* **How:** Use `react-window` / `react-virtualized` / `@tanstack/virtual`.

---

## 10) Offload heavy CPU tasks

* **What:** Move parsing, compression, or heavy calculation off the main thread.
* **Why:** Keeps UI responsive; avoids dropped frames.
* **How:** Web Workers (e.g., `new Worker('./worker.js')`), or `requestIdleCallback` for low-priority tasks.

---

## 11) Avoid main-thread layout thrashing

* **What:** Batch DOM reads and writes; use transforms/opacities for animation.
* **Why:** Layout/reflow is expensive; repeated reads after writes force reflow.
* **How:**

  * Use `requestAnimationFrame` for DOM writes.
  * Use `transform` and `opacity` instead of `top/left`.
  * Mark scroll listeners `passive: true`.

---

## 12) Network optimizations & resource hints

* **What:** Reduce round trips and prioritize critical resources.
* **Why:** Latency kills perceived speed.
* **How:**

  * Use `<link rel="preconnect" href="https://cdn.example.com">`.
  * Preload fonts/images or critical script: `<link rel="preload" as="script" href="/entry.js">`.
  * Use HTTP/2 or HTTP/3 via CDN.

---

## 13) Hydration & SSR (if applicable)

* **What:** Use Server-Side Rendering or Static Generation for initial route(s).
* **Why:** Faster Time-to-First-Byte and initial paint; better SEO.
* **How:**

  * Use SSR frameworks (Next.js) or render-to-string pipelines.
  * Consider partial hydration / islands if hydration cost is high.

---

## 14) Third-party scripts: audit & isolate

* **What:** Measure and reduce impact of analytics, A/B, chat widgets.
* **Why:** Third-party code is often blocking and unpredictable.
* **How:**

  * Load non-critical third-party scripts `defer`/`async`.
  * Use `iframe` sandbox for heavy widgets.
  * Remove unused ones and aggregate analytics when possible.

---

## 15) Dev/build speed (developer productivity)

* **What:** Improve build and dev cycle to iterate faster.
* **Why:** Faster iteration means you can test changes and ship improvements quicker.
* **How:** Use `cache: { type: 'filesystem' }`, `thread-loader`, or replace Babel with `swc`/`esbuild` for transpilation.

---

## 16) Monitoring & continuous measurement

* **What:** Monitor Real User Metrics (RUM) and regression testing.
* **Why:** Ensure changes actually benefit users and don’t regress performance.
* **How:** Integrate `web-vitals` RUM, Lighthouse CI in CI, and keep `bundle-size` checks in PRs.

---

## 17) Quick priority plan (what to do first — 1 day, 1 week, 1 month)

* **1 day (fast wins):**

  * Add Lighthouse + bundle analyzer; capture baseline.
  * Lazy-load non-critical routes/components.
  * Enable Gzip/Brotli on server or CDN.
  * Add `loading="lazy"` for images.
* **1 week (medium effort):**

  * Split vendor/runtime chunks; optimize `splitChunks`.
  * Replace/trim heavy dependencies.
  * Implement caching headers & push hashed filenames.
  * Add `font-display: swap` and preload critical fonts.
* **1 month (bigger impacts):**

  * Implement SSR/SSG for critical pages or partial hydration.
  * Re-architect big state to reduce cross-app rerenders.
  * Introduce web workers for heavy CPU tasks; optimize image pipeline to AVIF.

---

## 18) Checklist you can paste into a PR template

* [ ] Measure baseline (Lighthouse + bundle analyzer attached)
* [ ] Lazy-load heavy components and route-split
* [ ] Remove/replace heavy deps (list changes)
* [ ] Add content-hashed filenames + caching headers
* [ ] Serve compressed assets (.br/.gz)
* [ ] Optimize images (responsive, AVIF/WebP) and lazy-load
* [ ] Preload critical fonts + `font-display: swap`
* [ ] Add React Profiler checks for top 5 slow components
* [ ] Add RUM web-vitals integration

---