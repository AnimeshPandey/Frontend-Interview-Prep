# 🚀 Interview Gold – Batch #29 (Frontend Observability & Monitoring Gold)

---

## 1. Real User Monitoring (RUM)

**Problem:**

* Synthetic tests (lab benchmarks) don’t reflect **real user conditions**.
* Need visibility into how actual users experience the app.

**Solution:**

* Use **RUM SDKs** (custom or vendor: Datadog, New Relic, Sentry) to capture:

  * Page load (LCP, CLS, FID, TTFB).
  * Errors, slow API calls.
  * Device + network context.

**Detailed Design:**

```js
new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    sendToAnalytics({
      metric: entry.name,
      value: entry.startTime,
      device: navigator.userAgent
    });
  });
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

**Perf/Scaling Notes:**

* Minimal overhead (\~<1%).
* Must batch events to avoid flooding network.

**Pitfalls:**

* PII leakage if logging raw URLs/inputs.
* Sampling needed (not every session).

**Real-world Example:**

* Google uses Chrome User Experience Report (CrUX) for RUM → feeds Core Web Vitals.

**Follow-ups:**

* Why RUM more important than synthetic metrics?
* How to avoid over-collecting sensitive data?
* How to sample efficiently?

---

## 2. Synthetic Monitoring

**Problem:**

* RUM = reactive (after real users suffer).
* Need proactive detection of outages before customers notice.

**Solution:**

* Run **synthetic checks**: bots simulate user journeys (login, checkout).
* Run from multiple geographies + networks.

**Detailed Design:**

* Script with Playwright:

```js
test('checkout flow', async ({ page }) => {
  await page.goto('https://site.com');
  await page.click('#login');
  await page.fill('#user', 'test');
  await page.fill('#pass', '123');
  await page.click('#submit');
  await expect(page).toHaveText('Welcome');
});
```

**Perf/Scaling Notes:**

* Catches global issues (CDN down, DNS issues).
* Complements RUM.

**Pitfalls:**

* Synthetic ≠ real-world variety (device/browser fragmentation).
* High maintenance (tests break with UI changes).

**Real-world Example:**

* Pingdom, Datadog Synthetics → monitor core user flows 24/7.

**Follow-ups:**

* Difference between RUM vs synthetic?
* Why run synthetic from multiple PoPs?
* How to reduce false alarms?

---

## 3. Frontend Logging Best Practices

**Problem:**

* Without structured logs, debugging frontend issues = guessing.
* Raw console.log = noise.

**Solution:**

* Structured JSON logs with **levels + metadata**.
* Capture: timestamp, severity, user/session, component, error.

**Detailed Design:**

```js
function logEvent(level, message, metadata = {}) {
  fetch('/log', {
    method: 'POST',
    body: JSON.stringify({ 
      level, 
      message, 
      metadata, 
      time: Date.now(),
      userId: getUserId() 
    })
  });
}
```

**Perf/Scaling Notes:**

* Must batch logs → send on idle or beacon API.
* Use compression to save bandwidth.

**Pitfalls:**

* Logging sensitive data (passwords, tokens).
* Logging too much → infra cost explosion.

**Real-world Example:**

* Sentry & Datadog auto-capture logs + attach session context.

**Follow-ups:**

* Why JSON > free-text logs?
* How to prevent sensitive info leakage?
* When to sample logs?

---

## 4. Distributed Tracing Across Frontend + Backend

**Problem:**

* User reports “site slow” → is it frontend rendering, API latency, or backend DB?
* Without tracing, root cause unclear.

**Solution:**

* Use **trace IDs** propagated across frontend → backend → DB.

**Detailed Design:**

* Frontend generates request ID:

```js
const traceId = crypto.randomUUID();
fetch('/api/data', { headers: { 'x-trace-id': traceId }});
```

* Backend + logs annotate with same `traceId`.
* Observability tool (Jaeger, Datadog) reconstructs end-to-end path.

**Perf/Scaling Notes:**

* Minimal overhead (UUID).
* Enables **full-stack observability**.

**Pitfalls:**

* If trace IDs not consistently propagated → gaps.
* Extra care needed for GDPR (trace = PII risk).

**Real-world Example:**

* Uber (Jaeger), Twitter, Shopify → distributed tracing for microservices + frontend.

**Follow-ups:**

* Why trace IDs critical for debugging frontend slowness?
* What’s difference between logs vs traces?
* How to avoid PII leakage in trace metadata?

---

## 5. Error Tracking & Session Replay

**Problem:**

* Users report “app broke” but devs can’t reproduce.

**Solution:**

* Use error tracking + session replay tools (Sentry, LogRocket, FullStory).
* Capture: stack trace, user actions, network requests, device info.

**Detailed Design:**

```js
window.onerror = (msg, url, line, col, error) => {
  sendToErrorTracker({
    msg, url, line, col,
    stack: error?.stack,
    user: getUserId(),
    device: navigator.userAgent
  });
};
```

* Session replay stores DOM diffs + events → replay bug later.

**Perf/Scaling Notes:**

* Session replay overhead \~5–10% if batched/compressed.
* Must avoid capturing sensitive input fields.

**Pitfalls:**

* Privacy concerns → mask PII fields.
* Storage costs for replays at scale.

**Real-world Example:**

* Sentry auto-detects unhandled promise rejections in React apps.
* LogRocket → replay exact user session to debug.

**Follow-ups:**

* Why session replay > just stack traces?
* What privacy rules apply (GDPR, CCPA)?
* How do you mask sensitive inputs in replays?

---

## 6. Alerts & SLOs for Frontend

**Problem:**

* Engineers drown in alerts → alert fatigue.
* Business cares about **user impact**, not every error.

**Solution:**

* Define **SLIs (service level indicators)** + **SLOs (objectives)**:

  * Example: “99% of sessions must load within 3s LCP.”
  * Alert only when SLO breached.

**Detailed Design:**

* Example metric in Datadog:

```yaml
alert: "LCP > 3s for >5% users in last 15m"
```

**Perf/Scaling Notes:**

* Reduces noise → actionable alerts only.

**Pitfalls:**

* Wrong SLO thresholds → too lenient or too strict.
* Alert fatigue if tied to noisy metrics.

**Real-world Example:**

* Google SRE → error budgets for frontend latency/availability.

**Follow-ups:**

* What’s difference SLI vs SLO vs SLA?
* Why error budgets matter for frontend teams?
* How to set SLO thresholds?

---

## 7. Monitoring Business KPIs via Frontend

**Problem:**

* Traditional monitoring = errors + latency only.
* But product teams want **KPI-level insights** (checkout success, signup rate).

**Solution:**

* Instrument **business-critical events** in frontend analytics.
* Tie to observability pipeline.

**Detailed Design:**

```js
trackEvent("checkout_complete", {
  orderValue: 125,
  userId: getUserId(),
  traceId
});
```

**Perf/Scaling Notes:**

* Connects **frontend reliability → revenue impact**.
* Helps prioritize fixes.

**Pitfalls:**

* Over-instrumentation = cost overhead.
* Event schema drift = messy dashboards.

**Real-world Example:**

* Amazon → tracks every frontend interaction tied to revenue.
* Netflix → watches engagement metrics tied to video startup time.

**Follow-ups:**

* Why KPIs matter in frontend monitoring?
* How to prevent metric explosion?
* What’s balance: tech metrics vs business metrics?

---

# 📘 Key Takeaways – Batch #29

* **RUM** → real-world metrics (LCP, CLS, FID).
* **Synthetic** → proactive outage detection.
* **Logging** → structured, secure JSON logs.
* **Tracing** → end-to-end with trace IDs.
* **Error tracking + replay** → reproduce user issues.
* **SLOs & alerts** → avoid alert fatigue.
* **Business KPIs** → connect frontend perf → \$\$\$ impact.

---

# 📑 Quick-Reference (Batch #29)

* **RUM**: measure Core Web Vitals in prod.
* **Synthetic**: scripted checks.
* **Logs**: structured JSON.
* **Traces**: propagate UUIDs across stack.
* **Errors**: Sentry/LogRocket.
* **SLOs**: LCP ≤ 3s @ 99%.
* **KPIs**: conversion, retention, revenue.