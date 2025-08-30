# 🚀 Interview Gold – Batch #12 (Data Handling & API Design Gold)

---

## 1. REST vs GraphQL vs gRPC (API Paradigms)

**Problem:**

* Different API paradigms → which to use?
* REST = simple, but often **over-fetching/under-fetching**.
* GraphQL = flexible, but can create **expensive queries**.
* gRPC = efficient binary transport, but less browser-friendly.

**Solution:**

* Use **REST** for simple CRUD/public APIs.
* Use **GraphQL** when clients need flexibility (e.g., multiple teams consuming same API).
* Use **gRPC** for service-to-service or real-time needs.

**Detailed Design:**

* REST:

  ```
  GET /users/123 → { id, name, email, address, posts }
  ```
* GraphQL:

  ```graphql
  query {
    user(id: 123) {
      name
      posts(limit: 5) { title }
    }
  }
  ```
* gRPC:

  * Protobuf-based, efficient binary encoding.
  * Example: streaming stock price updates.

**Performance/Scaling Notes:**

* REST: simpler caching with HTTP/ETag.
* GraphQL: risk of N+1 queries → must use dataloaders/caching.
* gRPC: fastest but needs protobuf tooling + not widely supported in browsers (requires proxy).

**Real-World Example:**

* GitHub API v4 = GraphQL (flexible queries).
* Stripe API = REST (predictable, cacheable).

**Follow-up Qs:**

* When would you NOT use GraphQL? → High caching needs, simple endpoints.
* Why is REST easier to cache? → URLs map to resources.
* How to prevent GraphQL query abuse? → Query cost analysis + depth limits.

---

## 2. API Pagination Strategies

**Problem:**

* Large datasets (millions of items) → cannot return in one response.
* Need efficient, predictable pagination.

**Solution:**

* **Offset-based pagination** (`?page=2&limit=20`) → simple, but breaks with inserts.
* **Cursor-based pagination** (`?after=123`) → stable, resilient to new items.
* **Keyset pagination** → efficient on large DBs (WHERE id > lastSeen).

**Detailed Design:**

* REST:

  ```
  GET /posts?page=2&limit=10
  ```
* Cursor-based (GraphQL style):

  ```graphql
  {
    posts(first: 10, after: "cursor123") {
      edges { node { id, title } }
      pageInfo { hasNextPage }
    }
  }
  ```

**Performance/Scaling Notes:**

* Offset = O(n) scan cost → expensive at high offsets.
* Cursor/Keyset = O(1) → scalable for large data.

**Real-World Example:**

* Twitter timeline → cursor-based.
* MySQL DB queries → keyset pagination for infinite scroll.

**Follow-up Qs:**

* Why offset bad for infinite scroll? → Inconsistent results if new rows inserted.
* How does cursor-based improve UX? → Consistent “next page.”
* How to show “total count” with cursor-based? → Expensive, often approximated.

---

## 3. Optimistic UI Updates

**Problem:**

* API round-trip adds delay → user perceives lag.
* Example: sending a tweet feels instant on Twitter.

**Solution:**

* Use **Optimistic UI**: update frontend immediately, then sync with server response.
* Roll back if request fails.

**Detailed Design:**

```js
function postTweet(text) {
  const optimisticId = Date.now();
  setTweets([{ id: optimisticId, text, pending: true }, ...tweets]);

  fetch("/api/tweet", { method: "POST", body: JSON.stringify({ text }) })
    .then(res => res.json())
    .then(saved => updateTweetId(optimisticId, saved.id))
    .catch(() => rollback(optimisticId));
}
```

**Performance/Scaling Notes:**

* Greatly improves perceived performance.
* Must handle **rollback logic** gracefully.

**Pitfalls:**

* Race conditions: if user refreshes before server confirmation.
* Must handle retries idempotently (unique client IDs).

**Real-World Example:**

* Twitter → shows tweet instantly.
* GitHub Issues → comment appears immediately.

**Follow-up Qs:**

* How to avoid duplicates on retry? → Use client-generated UUIDs.
* How do you reconcile conflicts? → Show “syncing” indicator.
* Why optimistic UI improves UX metrics? → Reduces “input delay perception.”

---

## 4. Edge Caching for APIs

**Problem:**

* APIs deployed in one region → far users have high latency.
* High read traffic → backend bottleneck.

**Solution:**

* Use **edge caching** for GET APIs.
* Cache layer at CDN (Cloudflare Workers, Fastly).
* Use **stale-while-revalidate** for freshness.

**Detailed Design:**

* API response cached by CDN for 30s.
* User gets cached response instantly.
* Worker refreshes response in background.

```http
Cache-Control: public, max-age=30, stale-while-revalidate=60
```

**Performance/Scaling Notes:**

* Cuts latency 200ms → <20ms.
* Reduces backend load dramatically.

**Pitfalls:**

* Don’t cache sensitive data (user profiles).
* Cache invalidation is hard → use versioned keys.

**Real-World Example:**

* GitHub trending repos cached globally.
* Reddit hot feed cached at CDN edge.

**Follow-up Qs:**

* Difference between CDN caching vs SW caching?
* What about POST requests? → Not cacheable (but can be proxied).
* How to handle cache busting? → Versioned query params or purges.

---

## 5. Handling Large Payloads (Streaming & Chunking)

**Problem:**

* Some APIs return huge payloads (logs, analytics, files).
* Returning all at once → slow, memory heavy.

**Solution:**

* **Chunking/Streaming** responses instead of giant JSON.
* Use **HTTP/2 streaming** or **GraphQL @defer**.
* For uploads, split into **multipart chunks**.

**Detailed Design:**

* Server sends NDJSON (newline-delimited JSON):

  ```
  {"id":1,"msg":"log1"}
  {"id":2,"msg":"log2"}
  ```
* Frontend consumes stream incrementally.

```js
const reader = (await fetch("/logs")).body.getReader();
```

* For uploads: send file in 5MB chunks, reassemble on server.

**Performance/Scaling Notes:**

* Reduces time-to-first-byte (TTFB).
* Prevents OOM on frontend.

**Real-World Example:**

* GitHub Actions logs stream live.
* Google Drive uploads in resumable chunks.

**Follow-up Qs:**

* How does streaming improve UX? → User sees first logs immediately.
* Why not just return huge JSON? → Memory blowup, long blocking parse.
* How to resume failed uploads? → Store uploaded chunks, retry missing ones.

---

## 6. Rate Limiting & Backpressure (API Contracts)

**Problem:**

* Client spams API → server crashes.
* Need fairness + backpressure.

**Solution:**

* **Client-side rate limiting**: throttle/debounce requests.
* **Server-side quotas**: `429 Too Many Requests` + `Retry-After`.
* **Exponential backoff retries**.

**Detailed Design:**

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 10
X-RateLimit-Remaining: 0
```

* Client respects headers → backs off.

**Performance/Scaling Notes:**

* Prevents “thundering herd” when clients retry simultaneously.
* Protects DB from overload.

**Real-World Example:**

* GitHub API quotas.
* Twitter API v2: per-endpoint rate limits.

**Follow-up Qs:**

* How do you handle retries gracefully? → Jitter in backoff.
* Why send `Retry-After` header? → Guides client behavior.
* How to communicate limits to frontend? → Progress bar, cooldown timer.

---

## 7. API Versioning Strategies

**Problem:**

* APIs evolve → breaking changes break clients.

**Solution:**

* **Versioned endpoints:** `/v1/users`, `/v2/users`.
* **GraphQL:** evolve schema, deprecate fields, never break.
* **Feature flags:** toggle new behavior per client.

**Detailed Design:**

* REST:

  ```
  GET /v2/users/123
  ```
* GraphQL:

  ```graphql
  type User {
    name: String
    fullName: String @deprecated(reason: "Use name instead")
  }
  ```

**Performance/Scaling Notes:**

* REST: cleaner, but duplicates code.
* GraphQL: avoids breaking, but schema grows.

**Real-World Example:**

* Stripe API guarantees backwards compatibility forever.
* GitHub GraphQL deprecates fields gradually.

**Follow-up Qs:**

* Why prefer additive changes? → Avoid breaking old clients.
* How to sunset old versions? → Announce, then remove after timeline.
* Why GraphQL easier to evolve than REST?

---

## 8. API Error Handling & Contracts

**Problem:**

* Clients often fail silently if APIs return unexpected errors.

**Solution:**

* Consistent error format, clear error codes.
* Avoid leaking stack traces to clients.

**Detailed Design:**

* REST:

  ```json
  { "error": "RATE_LIMIT_EXCEEDED", "message": "Wait 10s before retrying" }
  ```
* GraphQL:

  ```json
  { "errors": [{ "message": "Unauthorized", "path": ["user"] }] }
  ```

**Performance/Scaling Notes:**

* Error responses must be lightweight.
* Avoid spamming logs with identical client errors.

**Real-World Example:**

* Stripe errors = consistent codes (`card_declined`).

**Follow-up Qs:**

* Why not send raw error messages? → Security leak.
* How do you show user-friendly messages? → Map error codes → UI text.
* How to handle flaky networks? → Retry with exponential backoff.

---

# 📘 Key Takeaways – Batch #12

* **REST vs GraphQL vs gRPC** → choose per use case.
* **Pagination** → cursor-based for scale.
* **Optimistic UI** → instant UX, rollback on fail.
* **Edge caching** → reduce latency + load.
* **Large payloads** → stream/chunk uploads & responses.
* **Rate limiting** → client + server side, backoff.
* **API versioning** → backward-compatible, deprecations.
* **Error handling** → consistent formats, no raw leaks.

---

# 📑 Quick-Reference (Batch #12)

* **REST**: simple, cacheable.
* **GraphQL**: flexible, harder to cache.
* **gRPC**: binary, fast, less browser support.
* **Pagination**: cursor > offset for infinite scroll.
* **Optimistic UI**: instant response, rollback.
* **Edge caching**: CDN + stale-while-revalidate.
* **Large payloads**: streaming + resumable uploads.
* **Rate limiting**: 429 + Retry-After.
* **Versioning**: /v1/, GraphQL deprecations.
* **Error contracts**: structured JSON errors.
