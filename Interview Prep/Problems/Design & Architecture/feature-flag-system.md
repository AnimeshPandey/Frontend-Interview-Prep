# 🔎 Problem 24: Feature Flag System (Frontend Runtime Toggles)
* Step 1 → Basic on/off flag system.
* Step 2 → Add per-user targeting.
* Step 3 → Add percentage rollout (gradual exposure).
* Step 4 → Add remote config + caching.
* Step 5 → Discuss scaling (A/B testing, kill switches, resilience).
---

## Step 1. Interviewer starts:

*"Implement a simple feature flag system where features can be turned on/off."*

---

### ✅ Basic On/Off Flags

```js
class FeatureFlags {
  constructor(flags = {}) {
    this.flags = flags; // { featureName: true/false }
  }

  isEnabled(feature) {
    return !!this.flags[feature];
  }

  setFlag(feature, value) {
    this.flags[feature] = value;
  }
}

// Example
const ff = new FeatureFlags({ newUI: false });
console.log(ff.isEnabled("newUI")); // false
ff.setFlag("newUI", true);
console.log(ff.isEnabled("newUI")); // true
```

✔ Works, but only global flags.

---

## Step 2. Interviewer adds:

*"Nice. Now support **user targeting** (flag enabled only for specific users)."*

---

### ✅ Per-User Targeting

```js
class FeatureFlags {
  constructor(flags = {}) {
    this.flags = flags; 
    // Example: { newUI: { enabled: true, users: ["alice"] } }
  }

  isEnabled(feature, user) {
    const rule = this.flags[feature];
    if (!rule) return false;
    if (rule.users && !rule.users.includes(user)) return false;
    return rule.enabled;
  }

  setFlag(feature, rule) {
    this.flags[feature] = rule;
  }
}

// Example
const ff = new FeatureFlags({
  newUI: { enabled: true, users: ["alice"] }
});
console.log(ff.isEnabled("newUI", "alice")); // true
console.log(ff.isEnabled("newUI", "bob"));   // false
```

✔ Supports user-based rollouts.

---

## Step 3. Interviewer twists:

*"Good. Now add **percentage rollout** (enable for N% of users)."*

---

### ✅ Percentage-Based Rollouts

```js
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

class FeatureFlags {
  constructor(flags = {}) {
    this.flags = flags;
    // Example: { newUI: { enabled: true, rollout: 50 } } → 50% rollout
  }

  isEnabled(feature, user = "") {
    const rule = this.flags[feature];
    if (!rule || !rule.enabled) return false;

    if (rule.rollout !== undefined) {
      const bucket = hash(user) % 100;
      return bucket < rule.rollout;
    }

    return true;
  }
}

// Example
const ff = new FeatureFlags({
  newUI: { enabled: true, rollout: 50 }
});
console.log(ff.isEnabled("newUI", "alice")); // ~50% chance true
console.log(ff.isEnabled("newUI", "bob"));
```

✔ Simulates gradual rollout (like LaunchDarkly, Optimizely).

---

## Step 4. Interviewer pushes:

*"Great. Now fetch flags from a **remote config service** and cache them in localStorage."*

---

### ✅ Remote Config + Caching

```js
class FeatureFlagsRemote extends FeatureFlags {
  async loadFromServer(url) {
    try {
      const res = await fetch(url);
      this.flags = await res.json();
      localStorage.setItem("featureFlags", JSON.stringify(this.flags));
    } catch (err) {
      console.warn("Failed to load flags, using cached");
      const cached = localStorage.getItem("featureFlags");
      if (cached) this.flags = JSON.parse(cached);
    }
  }
}

// Example (server JSON):
// { "newUI": { "enabled": true, "rollout": 30 } }
```

✔ Now supports **remote updates with offline fallback**.

---

## Step 5. Interviewer final boss:

*"How does this compare to real-world systems? What are the performance tradeoffs?"*

---

### ✅ Performance & Real-World Discussion

* **Our implementation**:

  * Flags stored in memory, optionally remote-fetched.
  * O(1) lookup per `isEnabled`.
  * Works for small apps.

* **Real systems (LaunchDarkly, Unleash, Split.io)**:

  * Feature configs stored in CDN / streaming API.
  * Targeting supports **complex rules**:

    * User attributes (country, device).
    * Segments (beta testers).
  * Gradual rollouts with **consistent hashing** (so users don’t flip randomly).

* **Tradeoffs**:

  * Local evaluation (fast, works offline) vs remote evaluation (centralized, secure).
  * Caching avoids network calls but risks **stale flags**.
  * Flags must be **observable** → React hooks/state integration for live updates.

* **Frontend Use Cases**:

  * Dark mode toggles.
  * Gradual rollout of new UI.
  * Kill switches for buggy features.
  * A/B testing.

---

# 🎯 Final Interview Takeaways (Feature Flags)

* ✅ Step 1: On/off flags.
* ✅ Step 2: Per-user targeting.
* ✅ Step 3: Percentage rollout.
* ✅ Step 4: Remote config + caching.
* ✅ Step 5: Discuss scaling (LaunchDarkly-style, CDN streaming, observability).

