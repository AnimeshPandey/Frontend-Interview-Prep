# 🔎 Problem 18: Polyfill for Fetch with Timeout + Retries
* Step 1 → Basic fetch wrapper.
* Step 2 → Add timeout.
* Step 3 → Add retries.
* Step 4 → Add exponential backoff & jitter.
* Step 5 → Discuss perf, error handling, real-world tradeoffs.
---

## Step 1. Interviewer starts:

*"Wrap fetch in a function that just calls it and returns the response."*

---

### ✅ Basic Fetch Wrapper

```js
async function customFetch(url, options = {}) {
  return fetch(url, options);
}
```

⚠ Too trivial. Next step incoming.

---

## Step 2. Interviewer says:

*"Now add **timeout** support. Cancel fetch if it takes too long."*

👉 Solution: Use `AbortController`.

---

### ✅ Fetch with Timeout

```js
async function fetchWithTimeout(url, { timeout = 5000, ...options } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
```

---

## Step 3. Interviewer twists:

*"Great. Now add **retry logic**: retry N times before failing."*

---

### ✅ Fetch with Retries

```js
async function fetchWithRetries(url, {
  retries = 3,
  timeout = 5000,
  ...options
} = {}) {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await fetchWithTimeout(url, { timeout, ...options });
    } catch (err) {
      if (attempt === retries) throw err;
      attempt++;
      console.warn(`Retrying ${url} (attempt ${attempt})`);
    }
  }
}
```

✔ Retries on error/timeout.

---

## Step 4. Interviewer final twist:

*"Nice. But retries should use **exponential backoff + jitter** to avoid thundering herd."*

---

### ✅ Retry with Exponential Backoff + Jitter

```js
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetries(url, {
  retries = 3,
  timeout = 5000,
  backoff = 500,
  factor = 2,
  jitter = true,
  ...options
} = {}) {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await fetchWithTimeout(url, { timeout, ...options });
    } catch (err) {
      if (attempt === retries) throw err;
      attempt++;
      let delay = backoff * Math.pow(factor, attempt - 1);
      if (jitter) delay *= (0.5 + Math.random()); // add randomness
      console.warn(`Retry ${attempt} after ${delay.toFixed(0)}ms...`);
      await sleep(delay);
    }
  }
}
```

✔ Now retries are spaced: 500ms → 1000ms → 2000ms (+ jitter).

---

## Step 5. Interviewer final boss:

*"Great! How does this scale? What about **real-world tradeoffs**?"*

---

### ✅ Performance & Real-World Discussion

* **Timeout**:

  * Must tune based on API (too small → false aborts, too big → user waits).

* **Retries**:

  * Not all errors should retry → only **network errors or 5xx**, not **4xx**.

* **Exponential backoff + jitter**:

  * Avoids all clients retrying simultaneously after outage.
  * Standard in AWS SDKs, gRPC, etc.

* **Cancellation**:

  * Caller should be able to cancel (pass own `AbortController`).

* **Frontend Use Cases**:

  * Fetching analytics/logging (don’t block UI).
  * Retrying flaky network calls (mobile).
  * Preloading critical assets.

* **Production alternatives**:

  * Use `axios-retry`, `ky`, or wrap in your own API client.

---

# 🎯 Final Interview Takeaways (Fetch Polyfill)

* ✅ Step 1: Basic fetch wrapper.
* ✅ Step 2: Add timeout with `AbortController`.
* ✅ Step 3: Add retries.
* ✅ Step 4: Add exponential backoff + jitter.
* ✅ Step 5: Discuss perf & tradeoffs (which errors retry, mobile flakiness).
