# 📘 1. Follow-up Question Playbook (Detailed)

---

## 🔹 Array Polyfills

### `map`

* ❓ *Why check `i in this`?*
  👉 To skip “holes” in sparse arrays (`[, , 3].map()`).
* ❓ *How to make it lazy?*
  👉 Use generators: yield results on demand.
* ❓ *What if callback is async?*
  👉 Use `Promise.all(arr.map(asyncFn))`.

---

### `filter`

* ❓ *Can filter return the same array?*
  👉 No, it always creates a new one (non-mutating).
* ❓ *How to implement `reject`?*
  👉 Invert filter condition.
* ❓ *Async filter?*
  👉 `Promise.all` + filter results based on resolved booleans.

---

### `reduce`

* ❓ *Why throw error when no initialValue on empty array?*
  👉 Native JS does that (must follow spec).
* ❓ *How to implement reduceRight?*
  👉 Iterate backwards.
* ❓ *Why is reduce powerful?*
  👉 Can implement map/filter with reduce.

---

### `sort`

* ❓ *Why use quicksort instead of mergesort?*
  👉 Simpler code, average O(n log n).
* ❓ *Stable vs unstable sort?*
  👉 QuickSort (unstable), MergeSort/Timsort (stable).
* ❓ *What does V8 use?*
  👉 Timsort (O(n) on nearly sorted data).

---

## 🔹 Promises

### `then`

* ❓ *Why do native promises use microtasks?*
  👉 To ensure consistent async behavior (even if already resolved).
* ❓ *How to handle thenables?*
  👉 Detect objects with `.then` and assimilate.
* ❓ *Why return a new promise in then()?*
  👉 To enable chaining.

---

### `all`

* ❓ *What if array empty?*
  👉 Resolves immediately with `[]`.
* ❓ *Non-promises inside array?*
  👉 Auto-wrapped with `Promise.resolve`.
* ❓ *Diff vs allSettled?*
  👉 `all` rejects fast, `allSettled` always resolves.

---

### `any`

* ❓ *Diff vs race?*
  👉 `any`: resolves on first success; `race`: resolves/rejects on first settle.
* ❓ *Why reject with AggregateError?*
  👉 To return all reasons, not just one.

---

### `race`

* ❓ *What happens to “losing” promises?*
  👉 They continue running; JS doesn’t cancel them.
* ❓ *How to add cancellation?*
  👉 Use `AbortController` or custom cancellation.

---

### `allSettled`

* ❓ *When to use?*
  👉 Batch API calls when you need all results, even failures.
* ❓ *Return format?*
  👉 Array of `{ status, value }` or `{ status, reason }`.

---

### `finally`

* ❓ *Diff from then()?*
  👉 finally always runs, but doesn’t affect chain result.
* ❓ *Use case?*
  👉 Cleanup: close DB, hide loaders, release resources.

---

## 🔹 Lodash Utilities

### `debounce`

* ❓ *Diff vs throttle?*
  👉 Debounce delays until quiet; Throttle limits rate.
* ❓ *Leading vs trailing calls?*
  👉 Leading = run immediately, trailing = run after delay.
* ❓ *How to cancel debounce?*
  👉 Keep timer reference, clearTimeout when cancel called.

---

### `throttle`

* ❓ *How to support both leading & trailing?*
  👉 Run immediately + set a final timeout at the end.
* ❓ *Async throttle: queue vs drop?*
  👉 Depends: drop for UI, queue for guaranteed API calls.

---

### `cloneDeep`

* ❓ *Why WeakMap?*
  👉 Prevent infinite loop on cyclic objects + allow GC.
* ❓ *Why not JSON.parse(JSON.stringify())?*
  👉 Loses functions, dates, undefined, regex, symbols.
* ❓ *How to handle special types?*
  👉 Check instance of Date, RegExp, Map, Set.

---

### `groupBy`

* ❓ *How to do multi-level groupBy?*
  👉 Recursively call groupBy inside.
* ❓ *Async groupBy?*
  👉 Await key function results (Promise.all).
* ❓ *When to use Map instead of object?*
  👉 If keys are not strings (e.g., objects, symbols).

---

## 🔹 Async Array Helpers

### `chunk`

* ❓ *What if size > array length?*
  👉 Returns single chunk with entire array.
* ❓ *Lazy version?*
  👉 Generator yielding subarrays.

---

### `mapAsync`

* ❓ *What if one promise fails?*
  👉 Whole call rejects.
* ❓ *Sequential version?*
  👉 Use for loop + await instead of Promise.all.

---

### `mapWithChunksAsync`

* ❓ *Why chunked instead of sequential?*
  👉 Balance between parallelism & API rate limits.
* ❓ *How to add retries?*
  👉 Wrap each batch with retry logic.
* ❓ *How to implement generic concurrency pool?*
  👉 Use a queue with max concurrent workers.

---

## 🔹 Object Key Converters

### `toCamelCase`

* ❓ *Handle kebab-case?*
  👉 Adjust regex: `/-([a-z])/g`.
* ❓ *Handle multiple underscores?*
  👉 Works fine, regex runs globally.

---

### `toSnakeCase`

* ❓ *PascalCase?*
  👉 Works too (detect uppercase).
* ❓ *Handle acronyms (e.g. “HTTPServer”)?*
  👉 Would produce `h_t_t_p_server`; requires smarter regex.

---

### `convertKeys`

* ❓ *How to prevent stack overflow on deep objects?*
  👉 Use iterative DFS/BFS instead of recursion.
* ❓ *How to handle Maps/Sets?*
  👉 Convert separately (Map keys, Set elements).

---

## 🔹 DOM Polyfills + Modern APIs

### `myGetElementsByClassName`

* ❓ *Diff vs querySelectorAll(".class")?*
  👉 querySelectorAll returns static NodeList; className returns live collection.
* ❓ *Which is faster?*
  👉 Native querySelectorAll (C++ optimized).

---

### `myGetElementsByTagName`

* ❓ *Why uppercase?*
  👉 Tag names normalized to uppercase in HTML DOM.
* ❓ *Modern alternative?*
  👉 `document.querySelectorAll("tag")`.

---

### `querySelector` / `closest`

* ❓ *Why use matches/closest?*
  👉 Useful for event delegation.

---

## 🔹 Observer vs EventEmitter vs PubSub

### Observer

* ❓ *Diff from PubSub?*
  👉 Observer: Subject knows observers. PubSub: decoupled via topic.

### EventEmitter

* ❓ *How to implement once()?*
  👉 Wrap listener → remove after first call.

### PubSub

* ❓ *Cross-tab communication?*
  👉 localStorage events, BroadcastChannel, or Service Workers.

---

## 🔹 Extra Favorites

### `once`

* ❓ *How to reset?*
  👉 Add reset method → set called=false.
* ❓ *Async version?*
  👉 Cache promise result.

---

### `memoize`

* ❓ *How to limit size?*
  👉 Implement LRU cache.
* ❓ *TTL?*
  👉 Store timestamp, expire old keys.
* ❓ *Async variant?*
  👉 Cache promises.

---

### `flatten`

* ❓ *Infinite depth?*
  👉 Use depth=Infinity.
* ❓ *Lazy flatten?*
  👉 Generator that yields values recursively.

---

### `deepEqual`

* ❓ *How to handle cycles?*
  👉 Track seen objects with WeakMap.
* ❓ *Special objects?*
  👉 Compare Date.getTime(), RegExp.source, Map/Set size & entries.

---

---

# 📑 2. Quick-Reference Sheet (One-Liners)

---

### Arrays

* `map`: Skips holes, can be lazy with generator.
* `filter`: Truthy check, async = Promise.all.
* `reduce`: Aggregates, can implement map/filter, reduceRight = reverse.
* `sort`: O(n log n), unstable, V8 uses Timsort.

### Promises

* `then`: Always async (microtask).
* `all`: Rejects fast, resolves array.
* `any`: First success, AggregateError if all fail.
* `race`: First settle decides.
* `allSettled`: Wait for all, return {status,value|reason}.
* `finally`: Cleanup, doesn’t change chain.
* `resolve/reject`: Wrap values, errors.

### Lodash Utils

* `debounce`: Delay until quiet.
* `throttle`: Limit calls per time.
* `cloneDeep`: Recursive + WeakMap.
* `groupBy`: Reduce → buckets.

### Async Array Helpers

* `chunk`: Split array.
* `mapAsync`: Run all promises in parallel.
* `mapWithChunksAsync`: Controlled concurrency.

### Object Keys

* `toCamelCase`: snake → camel.
* `toSnakeCase`: camel → snake.
* `convertKeys`: Recursive transform.

### DOM

* `myGetElementsByClassName`: Recursive polyfill, live list.
* `querySelectorAll`: Static NodeList, modern way.
* `matches/closest`: Event delegation.

### Patterns

* **Observer**: Subject notifies observers.
* **EventEmitter**: EventName → listeners\[].
* **PubSub**: Topic-based, decoupled.

### Extras

* `once`: Run only once.
* `memoize`: Cache results, LRU for size limit.
* `flatten`: Depth param, generator for lazy.
* `deepEqual`: Recursively compare, WeakMap for cycles.


