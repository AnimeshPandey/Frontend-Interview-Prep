# 🚀 Interview Gold – Batch #17 (Frontend Reliability & Chaos Engineering Gold)

---

## 1. Feature Flags & Rollbacks

**Problem:**

* Deploying features directly = risky.
* If bug hits prod, rollback may take **30+ min redeploy** → costly outage.

**Solution:**

* **Feature flags**: control features dynamically via config.
* **Instant rollbacks**: disable flag → no redeploy needed.

**Detailed Design:**

* Tools: LaunchDarkly, Unleash, homemade flag service.
* Example flag:

  ```json
  { "feature_checkout_v2": { "enabled": true, "users": ["beta"] } }
  ```
* Client checks flag on render:

  ```js
  if (flags.feature_checkout_v2) return <NewCheckout />;
  return <OldCheckout />;
  ```
* Flags fetched from CDN or config service.

**Performance/Scaling Notes:**

* Rollouts can be **percentage-based** (1% → 100%).
* Flags add branching → slight perf cost.

**Pitfalls:**

* Too many flags → “flag debt.”
* Forgetting to clean old flags → messy code.

**Real-world Example:**

* Facebook does **dark launches**: 1% traffic, rollback instantly if issues.

**Follow-ups:**

* How do you avoid flag debt? → Regular cleanup process.
* What’s difference between feature flag vs A/B test? → Flags = control exposure, A/B = measure impact.
* How to secure flags? → Signed configs, avoid tampering.

---

## 2. Canary Deployments

**Problem:**

* Deploying to all users at once → huge blast radius if broken.

**Solution:**

* **Canary release**: release to small subset (1% users or 1 region).
* Monitor → then roll out gradually.

**Detailed Design:**

* Progressive rollout pipeline:

  * Stage 1: 1% users.
  * Stage 2: 10%.
  * Stage 3: 50%.
  * Stage 4: 100%.
* Config in CDN or feature flag system.

**Performance/Scaling Notes:**

* Reduces risk of mass outages.
* Users may see different versions → need consistency rules.

**Pitfalls:**

* Hard to debug if canary users complain but devs can’t reproduce.
* Rollout stuck if monitoring unclear.

**Real-world Example:**

* Google Search: canaries new ranking algos to 0.1% queries before full rollout.

**Follow-ups:**

* Difference between canary vs blue-green deployment? → Canary = gradual, blue-green = instant switch.
* How do you pick canary population? → Random, or low-risk geography.
* How to ensure consistency in user experience? → Sticky sessions.

---

## 3. Circuit Breakers in Frontend

**Problem:**

* Downstream API is slow/failing.
* Frontend retries aggressively → worsens outage.

**Solution:**

* **Circuit breaker pattern** in frontend:

  * After N failures, “open circuit.”
  * Stop calling API, use cached/fallback data.
  * After timeout, “half-open” → test call.

**Detailed Design:**

```js
class CircuitBreaker {
  constructor(failLimit = 3, resetTime = 5000) {
    this.failCount = 0;
    this.open = false;
    this.resetTime = resetTime;
  }
  async call(fn) {
    if (this.open) return "fallback";
    try {
      const res = await fn();
      this.failCount = 0;
      return res;
    } catch {
      this.failCount++;
      if (this.failCount >= 3) {
        this.open = true;
        setTimeout(() => (this.open = false), this.resetTime);
      }
      return "fallback";
    }
  }
}
```

**Performance/Scaling Notes:**

* Prevents **retry storms**.
* Improves user experience with **cached data**.

**Pitfalls:**

* Over-aggressive breaker → blocks even when service is recovering.
* Requires monitoring to tune thresholds.

**Real-world Example:**

* Netflix frontend → shows cached movie rows if recommendation API fails.

**Follow-ups:**

* Difference between retry + circuit breaker?
* How to show fallback UI gracefully? → Skeleton loaders, last-seen data.
* How to tune thresholds? → Based on SLIs (e.g., 50% error rate).

---

## 4. Chaos Engineering in Frontend

**Problem:**

* Apps may handle happy-path well, but fail badly under chaos.

**Solution:**

* Inject **controlled failures** (chaos tests) into frontend.

**Detailed Design:**

* Simulate:

  * API latency (delay responses).
  * API errors (500s, 429s).
  * Network offline (use DevTools throttling).
* Chaos middleware:

  ```js
  async function fetchChaos(url) {
    if (Math.random() < 0.1) throw new Error("Chaos injected!");
    return fetch(url);
  }
  ```
* Test resilience of UI: retries, fallbacks, offline mode.

**Performance/Scaling Notes:**

* Identifies resilience gaps early.
* Avoids “perfect prod, broken real-world.”

**Pitfalls:**

* Must run chaos tests in staging, not live prod (except controlled A/B).

**Real-world Example:**

* Netflix “Chaos Monkey” kills random services; frontend must survive.

**Follow-ups:**

* How to apply chaos engineering safely in frontend?
* How to simulate flaky mobile networks? → DevTools throttling, Charles Proxy.
* Why chaos improves reliability? → Surfaces hidden coupling.

---

## 5. Failover Strategies (Multi-Region & CDN)

**Problem:**

* CDN or region outage → users can’t load app.

**Solution:**

* **Failover architecture**:

  * Static assets in multiple CDNs.
  * APIs in multiple cloud regions.
  * DNS routing for healthy regions.

**Detailed Design:**

* Multi-CDN config:

  * Primary: Cloudflare.
  * Secondary: Akamai.
  * Route53 health checks redirect on failure.

**Performance/Scaling Notes:**

* Increases cost, but ensures **high availability (99.99%)**.

**Pitfalls:**

* Data consistency issues across regions.
* DNS TTL may delay failover.

**Real-world Example:**

* Slack multi-region failover → AWS us-east outage didn’t kill chat.

**Follow-ups:**

* Difference between active-active vs active-passive failover?
* How to ensure data consistency? → Eventual consistency, CRDTs.
* How to test failover? → Chaos drills.

---

## 6. User Impact Monitoring (SLIs/SLOs)

**Problem:**

* Even with resilient systems, need to **measure user impact**.
* Engineering team may not notice degraded UX.

**Solution:**

* Define **SLIs (Service Level Indicators)** → metrics like:

  * JS error rate (% sessions with uncaught errors).
  * LCP (Largest Contentful Paint).
  * API success rate.
* Define **SLOs (Objectives)** → e.g., 99.9% API success rate.
* Define **Error Budget** = allowed failure % per quarter.

**Detailed Design:**

* Collect RUM metrics from browsers.
* Alert if SLO violated.

**Performance/Scaling Notes:**

* Balances feature velocity with stability.
* Prevents endless chasing of 100% uptime (too expensive).

**Pitfalls:**

* Bad SLIs = useless monitoring.
* Teams may ignore error budget policy.

**Real-world Example:**

* Google SRE pioneered SLOs + error budgets.

**Follow-ups:**

* Why not aim for 100% uptime? → Diminishing returns, too costly.
* How to measure frontend SLIs? → Web Vitals + error logging.
* What do you do if error budget exceeded? → Freeze features, focus on reliability.

---

# 📘 Key Takeaways – Batch #17

* **Feature Flags** → instant rollback, controlled rollout.
* **Canary Deploys** → release gradually, monitor impact.
* **Circuit Breakers** → prevent retry storms, use fallbacks.
* **Chaos Testing** → inject failures to test resilience.
* **Failover** → multi-region, multi-CDN for availability.
* **User Impact Monitoring** → SLIs, SLOs, error budgets.

---

# 📑 Quick-Reference (Batch #17)

* **Flags**: config-based feature control.
* **Canary**: 1% → 10% → 100%.
* **Breaker**: stop retries after failures.
* **Chaos**: simulate latency, errors.
* **Failover**: multi-CDN, DNS routing.
* **SLIs/SLOs**: metrics + objectives.