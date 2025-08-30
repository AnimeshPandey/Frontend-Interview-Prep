/***********************************************************
 * FRONTEND INTERVIEW HANDBOOK – SENIOR ENGINEER EDITION
 * 
 * Includes:
 * 1. Polyfills (Array, Promise, DOM, etc.)
 * 2. Lodash/Utility Functions
 * 3. Observer, PubSub, EventEmitter
 * 4. Extra Interview-Favorite Questions
 * 5. Complexity Analysis + Performance Notes
 * 
 * Copy this file into `frontend-prep.js` and run in Node or browser.
 ***********************************************************/


/***********************************************************
 * 1. Array.prototype Polyfills
 ***********************************************************/

/**
 * Polyfill for Array.prototype.map
 *
 * What does native map do?
 * - Iterates over an array
 * - Applies a callback to each element
 * - Returns a NEW array with transformed results
 * - Skips "holes" (sparse array behavior)
 *
 * Why implement it this way?
 * - We explicitly check `i in this` to handle sparse arrays correctly.
 * - We use `callback.call(thisArg, ...)` so that map can bind a "this" value if provided.
 * - We return a new array without mutating the original.
 *
 * Time Complexity: O(n) – one iteration over array of length n
 * Space Complexity: O(n) – result array of length n
 *
 * Performance Considerations:
 * - For very large arrays, callback execution dominates cost.
 * - Avoid nested loops inside callback → would turn into O(n*m).
 */
Array.prototype.myMap = function(callback, thisArg) {
  // Defensive check: ensure callback is a function
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  const result = []; // new array to return

  // Loop through "this" array
  for (let i = 0; i < this.length; i++) {
    // Skip holes: `i in this` ensures element exists
    if (i in this) {
      // Apply callback with possible `thisArg` binding
      result.push(callback.call(thisArg, this[i], i, this));
    }
  }

  return result; // return transformed array
};

/**
 * Follow-up Questions (interview twists):
 * - How would you implement a `map` that works lazily (generator-based)?
 * - How would you parallelize map if callback is async?
 * - Why use `call(thisArg, ...)` instead of just `callback(this[i])`?
 * - What happens if you mutate the original array while mapping?
 */



/**
 * Polyfill for Array.prototype.filter
 *
 * What does native filter do?
 * - Iterates over array
 * - Executes callback for each element
 * - Includes element in new array only if callback returns truthy
 * - Skips "holes" in sparse arrays
 *
 * Why implement it this way?
 * - `i in this` ensures holes are skipped.
 * - We create a new array (non-mutating).
 *
 * Time Complexity: O(n) – one pass over array
 * Space Complexity: O(k) – k = number of elements that pass the filter
 *
 * Performance Considerations:
 * - Good for medium arrays.
 * - For streaming/filtering huge data, prefer generator pipelines.
 */
Array.prototype.myFilter = function(callback, thisArg) {
  if (typeof callback !== "function") throw new TypeError(callback + " is not a function");

  const result = [];

  for (let i = 0; i < this.length; i++) {
    // Skip holes and apply callback
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]); // push only if condition true
    }
  }

  return result;
};

/**
 * Follow-up Questions:
 * - How would you optimize filter for very large arrays (lazy eval)?
 * - How would you implement a negated filter (`reject`)?
 * - What if callback is async? (filterAsync with Promise.all)
 */



/**
 * Polyfill for Array.prototype.reduce
 *
 * What does native reduce do?
 * - Executes reducer callback on each element
 * - Accumulates results into a single value
 * - If no initialValue, uses first element as starting accumulator
 *
 * Why implement it this way?
 * - Must handle case where no initialValue is provided
 * - Must throw if array is empty and no initialValue
 * - Accumulator carries across iterations
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1) – constant extra memory
 *
 * Performance Considerations:
 * - Most memory-efficient array aggregator
 * - For large data pipelines, consider streaming reduce
 */
Array.prototype.myReduce = function(callback, initialValue) {
  if (typeof callback !== "function") throw new TypeError(callback + " is not a function");

  let accumulator = initialValue;
  let startIndex = 0;

  // If no initial value provided, use first element
  if (accumulator === undefined) {
    if (this.length === 0) throw new TypeError("Reduce of empty array with no initial value");
    accumulator = this[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      // Call reducer with accumulator and current value
      accumulator = callback(accumulator, this[i], i, this);
    }
  }

  return accumulator;
};

/**
 * Follow-up Questions:
 * - How would you implement reduceRight?
 * - Why is reduce powerful for implementing map/filter?
 * - How to optimize reduce for parallel execution (MapReduce)?
 */


/**
 * Polyfill for Array.prototype.sort
 *
 * What does native sort do?
 * - Sorts array in place
 * - Accepts optional comparator function
 * - Default: converts to string, compares lex order
 *
 * Why implement it this way?
 * - Quicksort is simple to implement
 * - Preserves in-place mutation like native
 *
 * Time Complexity: O(n log n) avg, O(n^2) worst
 * Space Complexity: O(log n) recursion stack
 *
 * Performance Considerations:
 * - V8 uses Timsort (O(n) for nearly sorted arrays)
 * - This version is not stable (relative order of equal elements may change)
 */
Array.prototype.mySort = function(compareFn) {
  function quicksort(arr) {
    if (arr.length <= 1) return arr;

    const pivot = arr[arr.length - 1];
    const left = [], right = [];

    for (let i = 0; i < arr.length - 1; i++) {
      const cmp = compareFn
        ? compareFn(arr[i], pivot)
        : ("" + arr[i]).localeCompare("" + pivot); // default lex compare
      if (cmp < 0) left.push(arr[i]);
      else right.push(arr[i]);
    }

    return [...quicksort(left), pivot, ...quicksort(right)];
  }

  const sorted = quicksort(this);

  // Mutate original array like native sort
  for (let i = 0; i < sorted.length; i++) {
    this[i] = sorted[i];
  }

  return this;
};

/**
 * Follow-up Questions:
 * - How would you implement a stable sort?
 * - Why not use merge sort instead of quicksort?
 * - How does V8 optimize sort for small arrays?
 * - What’s the complexity if compareFn itself is O(m)?
 */