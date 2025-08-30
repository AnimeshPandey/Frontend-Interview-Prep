# 🚀 Interview Gold – Batch #21 (Frontend Resilience & Recovery Gold)

---

## 1. Graceful Degradation & Progressive Enhancement

**Problem:**

* Networks may be slow/unreliable.
* Some users have older browsers/devices.
* Without resilience, app may show **blank screens** or **break silently**.

**Solution:**

* **Graceful degradation**: core UX still works even if advanced features fail.
* **Progressive enhancement**: start with minimal functionality, enhance if supported.

**Detailed Design:**

```html
<!-- Base HTML works without JS -->
<form action="/search">
  <input name="q" />
  <button>Search</button>
</form>

<!-- JS enhances UX -->
<script>
  document.querySelector("form").onsubmit = e => {
    e.preventDefault();
    fetch(`/api?q=${input.value}`).then(...);
  };
</script>
```

**Perf/Scaling Notes:**

* Ensures **lowest common denominator always works**.
* Enhancements progressively loaded.

**Pitfalls:**

* Many teams build “JS-only apps” that fail without hydration.
* Testing only on modern browsers hides real issues.

**Real-world Example:**

* GOV.UK → built with progressive enhancement for accessibility & resilience.

**Follow-ups:**

* What’s difference between graceful degradation vs progressive enhancement?
* Why HTML forms as fallback critical?
* How would you test resilience across devices?

---

## 2. Skeleton Screens & Placeholder UIs

**Problem:**

* Slow APIs or large bundle loads → users see blank pages → frustration.

**Solution:**

* Use **skeleton screens** or **loading placeholders** instead of spinners.

**Detailed Design:**

```jsx
function ProfileSkeleton() {
  return (
    <div className="skeleton">
      <div className="avatar"></div>
      <div className="line"></div>
    </div>
  );
}
```

* Load skeleton immediately, replace with real data when ready.

**Perf/Scaling Notes:**

* Skeleton reduces **perceived latency**.
* Works best when shaped like final content.

**Pitfalls:**

* Using generic spinners increases frustration.
* Overly complex skeletons = extra render cost.

**Real-world Example:**

* LinkedIn pioneered skeleton screens → improved user engagement vs spinners.

**Follow-ups:**

* Why skeletons better than spinners? → Aligns mental model with real content.
* How to implement for paginated data? → Show skeleton rows.
* Can skeletons hurt performance? → If over-designed.

---

## 3. Retry Queues & Offline-First UX

**Problem:**

* If user submits actions offline (forms, messages), requests fail silently.
* Users lose data → frustration & churn.

**Solution:**

* Queue failed requests in local storage (IndexedDB).
* Retry automatically when network restored.

**Detailed Design:**

```js
async function sendMessage(msg) {
  try {
    await fetch("/api/send", { method: "POST", body: msg });
  } catch {
    saveToQueue(msg);
  }
}

window.addEventListener("online", processQueue);
```

* Storage = IndexedDB for persistence.
* Service Workers can sync in background (`backgroundSync`).

**Perf/Scaling Notes:**

* Guarantees **eventual delivery**.
* Critical for mobile users with flaky internet.

**Pitfalls:**

* Must handle duplicate submissions after retries.
* Queue growth can consume storage.

**Real-world Example:**

* WhatsApp queues messages offline, delivers instantly when online.

**Follow-ups:**

* How to prevent duplicate submissions? → UUID per request.
* Why IndexedDB instead of localStorage? → Larger, async, structured.
* How to handle partial failures? → Retry policy (exponential backoff).

---

## 4. Error Boundaries & Crash Recovery

**Problem:**

* In React apps, a JS error in one component can crash entire tree.

**Solution:**

* Use **Error Boundaries** to catch & recover gracefully.

**Detailed Design:**

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <FallbackUI />;
    return this.props.children;
  }
}
```

* Wrap risky components:

```jsx
<ErrorBoundary>
  <CheckoutForm />
</ErrorBoundary>
```

**Perf/Scaling Notes:**

* Prevents full crash → isolates failures.
* Minimal overhead at runtime.

**Pitfalls:**

* Boundaries catch render errors, not async ones (need try/catch for promises).
* Over-using boundaries → inconsistent UI states.

**Real-world Example:**

* Facebook React team added Error Boundaries after production crashes.

**Follow-ups:**

* Why async errors not caught? → Error boundaries only catch render lifecycle.
* How to log crashes? → Report to Sentry inside boundary.
* What’s tradeoff: fail silently vs fail visibly? → Depends on criticality.

---

## 5. State Persistence & Recovery

**Problem:**

* App crash or browser refresh = user loses unsaved progress.
* Example: long form, checkout cart, design editor.

**Solution:**

* Persist critical state to local storage (localStorage, IndexedDB).
* On reload, recover & restore.

**Detailed Design:**

```js
function usePersistentState(key, initial) {
  const [val, setVal] = useState(() =>
    JSON.parse(localStorage.getItem(key)) || initial
  );
  useEffect(() => localStorage.setItem(key, JSON.stringify(val)), [val]);
  return [val, setVal];
}
```

**Perf/Scaling Notes:**

* Small state (forms, cart) → localStorage is fine.
* Large state (images, docs) → IndexedDB better.

**Pitfalls:**

* Sensitive state → must encrypt before storing.
* Version mismatches → restoring incompatible state.

**Real-world Example:**

* Google Docs auto-saves every keystroke → crash recovery seamless.

**Follow-ups:**

* Why IndexedDB better than localStorage for large data?
* How to handle schema migrations for persisted state?
* Which states should NOT be persisted? → Tokens, secrets.

---

## 6. Fallback UIs for Partial Failures

**Problem:**

* APIs often fail partially (e.g., recommendations fail but checkout works).
* Without fallback, whole page breaks.

**Solution:**

* Design **degraded-but-usable fallback UIs**.

**Detailed Design:**

```jsx
function Recommendations() {
  const { data, error } = useQuery("recs", fetchRecs);
  if (error) return <div>Recommendations unavailable</div>;
  return <List items={data} />;
}
```

* Non-critical sections degrade → core UX remains.

**Perf/Scaling Notes:**

* Improves robustness without major cost.

**Pitfalls:**

* Must prioritize what’s “critical” vs “optional.”
* Users may miss context without degraded section.

**Real-world Example:**

* Amazon product page → if recs API fails, still shows main product info.

**Follow-ups:**

* How to classify critical vs non-critical features?
* Why fallback text better than spinner forever?
* How do you log partial failures?

---

## 7. Graceful Rollback Strategies

**Problem:**

* Frontend bugs can break workflows for users.
* Full redeploy takes time.

**Solution:**

* Use **rollback strategies**:

  * Feature flags to disable broken flows.
  * Rollback to previous build instantly.
  * Show fallback experience temporarily.

**Detailed Design:**

* Deployment pipeline:

  * Keep **N previous versions live** on CDN.
  * Rollback = switch CDN alias to older build.

**Perf/Scaling Notes:**

* Rollbacks near-instant if pre-hosted builds exist.

**Pitfalls:**

* State incompatibility if schema changed.
* Rollback may still break users with cached assets.

**Real-world Example:**

* Google Chrome Canary uses rollback to stable channel if new builds crash.

**Follow-ups:**

* Why CDN rollback faster than redeploy?
* How to ensure rollback-compatible state?
* What’s difference between rollback vs feature-flag disable?

---

# 📘 Key Takeaways – Batch #21

* **Graceful degradation** → app always usable.
* **Skeleton screens** → reduce perceived latency.
* **Retry queues** → offline-first delivery.
* **Error boundaries** → prevent full crashes.
* **State persistence** → recover from refresh/crash.
* **Fallback UIs** → degrade gracefully on partial API failure.
* **Rollback strategies** → recover from bad deploys instantly.

---

# 📑 Quick-Reference (Batch #21)

* **Degradation vs Enhancement**: fallback vs progressive add-ons.
* **Skeletons > Spinners**: align with content shape.
* **Retry queues**: IndexedDB + background sync.
* **Error boundaries**: React-only render crashes.
* **Persistence**: localStorage small, IndexedDB large.
* **Fallback UIs**: don’t block whole page.
* **Rollback**: feature flags + CDN aliases.