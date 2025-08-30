/**
 * throttle()
 *
 * What does throttle do?
 * - Ensures a function executes at most once every `limit` ms
 * - Example: window scroll event → run expensive callback max once per 100ms
 *
 * Why implement it this way?
 * - Use a flag `inThrottle` to block further calls until timeout ends
 *
 * Time Complexity: O(1) per call
 * Space Complexity: O(1)
 *
 * Performance Considerations:
 * - Good for events where you need steady updates (scroll, resize)
 * - Prevents function spam
 */
function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);        // execute immediately
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit); // reset after delay
    }
  };
}

/**
 * Async version: throttleAsync
 *
 * What changes?
 * - We return a promise that resolves when fn actually runs
 * - Multiple callers during cooldown should be ignored (or queued if you want)
 */
function throttleAsync(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    return new Promise((resolve, reject) => {
      if (!inThrottle) {
        inThrottle = true;
        Promise.resolve(fn.apply(this, args))
          .then(resolve, reject)
          .finally(() => {
            setTimeout(() => inThrottle = false, limit);
          });
      } else {
        // Optionally: reject or return undefined
        reject("Throttled: call ignored");
      }
    });
  };
}

/**
 * Follow-up Questions:
 * - How is throttle different from debounce?
 * - How to implement both leading & trailing throttled calls?
 * - Should throttleAsync queue up missed calls or drop them?
 */

/**
 * cloneDeep()
 *
 * What does cloneDeep do?
 * - Creates a deep copy of an object/array
 * - Handles nested objects
 * - Handles circular references
 *
 * Why implement it this way?
 * - Recursively traverse properties
 * - Use WeakMap to detect cycles (prevents infinite recursion)
 *
 * Time Complexity: O(n) – visits each property once
 * Space Complexity: O(n) – result + recursion stack
 *
 * Performance Considerations:
 * - Expensive for very large objects
 * - Alternatives: structuredClone (native), JSON.parse(JSON.stringify()) [but loses functions/dates/etc.]
 */
function cloneDeep(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj; // primitive → return as-is
  if (map.has(obj)) return map.get(obj); // cycle detected → return cached clone

  const result = Array.isArray(obj) ? [] : {};
  map.set(obj, result); // store reference before recursion

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = cloneDeep(obj[key], map); // recurse
    }
  }

  return result;
}

/**
 * Follow-up Questions:
 * - Why use WeakMap vs Map? (GC safe)
 * - How would you handle special types (Date, RegExp, Map, Set)?
 * - Why does JSON-based deep clone fail for functions/symbols?
 */


/**
 * groupBy()
 *
 * What does groupBy do?
 * - Groups elements of an array into buckets by a key or function result
 * - Example: group users by age, or numbers by even/odd
 *
 * Why implement it this way?
 * - Use reduce to accumulate into an object
 * - If fn is a function, call it. If string, use property lookup
 *
 * Time Complexity: O(n) – single pass
 * Space Complexity: O(n) – object storing groups
 *
 * Performance Considerations:
 * - For large arrays, consider using Map instead of plain object for performance
 */
function groupBy(arr, fn) {
  return arr.reduce((acc, item) => {
    const key = typeof fn === "function" ? fn(item) : item[fn]; // flexible
    (acc[key] = acc[key] || []).push(item); // create array if not exists
    return acc;
  }, {});
}

/**
 * Follow-up Questions:
 * - How to implement multi-level groupBy? (nested grouping)
 * - How would you implement groupByAsync where fn returns a promise?
 */


/**
 * chunk()
 *
 * What does chunk do?
 * - Splits an array into multiple smaller arrays ("chunks")
 * - Each chunk has at most `size` elements
 * - Example: chunk([1,2,3,4,5], 2) → [[1,2],[3,4],[5]]
 *
 * Why implement it this way?
 * - Use a simple for loop, increment by chunk size
 * - Slice array into subarrays of length size
 *
 * Time Complexity: O(n) – each element visited once
 * Space Complexity: O(n) – result array stores all elements again
 *
 * Performance Considerations:
 * - Works well for batching operations (API calls in groups)
 * - For very large arrays, consider using generators to yield chunks lazily
 */
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size)); // slice handles edge case when last chunk < size
  }
  return result;
}

/**
 * Follow-up Questions:
 * - How would you write a lazy chunk (iterator version)?
 * - What if size is larger than array length?
 * - How would you chunk a string instead of array?
 */


/**
 * mapAsync()
 *
 * What does mapAsync do?
 * - Like Array.prototype.map, but works with async functions
 * - Runs all async operations concurrently, returns results when all complete
 *
 * Why implement it this way?
 * - Use Promise.all with arr.map(fn) to execute all promises in parallel
 *
 * Time Complexity: O(n) – creates n promises, resolves them
 * Space Complexity: O(n) – result array + promises
 *
 * Performance Considerations:
 * - Very efficient for I/O bound tasks (parallel API calls)
 * - Not good for rate-limited APIs (may overwhelm server)
 */
async function mapAsync(arr, fn) {
  return Promise.all(arr.map(fn)); // run all in parallel
}

/**
 * Follow-up Questions:
 * - How would you add error handling so one failure doesn’t reject everything?
 * - How to limit concurrency? (→ mapWithChunksAsync)
 * - Difference between sequential vs parallel mapAsync?
 */


/**
 * mapWithChunksAsync()
 *
 * What does mapWithChunksAsync do?
 * - Runs async function on array, but limits concurrency by processing chunks
 * - Example: 1000 API calls, process 10 at a time to avoid overload
 *
 * Why implement it this way?
 * - Use chunk() to split array into batches
 * - Process each batch with Promise.all (concurrent within batch)
 * - Await sequentially to control concurrency
 *
 * Time Complexity: O(n) – visits each element once
 * Space Complexity: O(n) – stores results
 *
 * Performance Considerations:
 * - Prevents overwhelming external APIs
 * - Tradeoff: slower total time vs controlled concurrency
 */
async function mapWithChunksAsync(arr, fn, chunkSize) {
  const chunks = chunk(arr, chunkSize); // split into batches
  const results = [];

  for (const c of chunks) {
    // Run each batch in parallel
    const res = await Promise.all(c.map(fn));
    results.push(...res); // collect batch results
  }

  return results;
}

/**
 * Follow-up Questions:
 * - How would you modify this to run chunks in parallel too?
 * - What if API requires retries on failure?
 * - How to generalize to a pool with max concurrency (like p-limit)?
 */
