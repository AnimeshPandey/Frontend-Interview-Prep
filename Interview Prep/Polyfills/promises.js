/***********************************************************
 * 2. Promise Polyfill
 ***********************************************************/

/**
 * Simplified implementation of JavaScript Promise
 *
 * What does native Promise do?
 * - Starts in "pending" state
 * - Can transition to "fulfilled" (resolved) OR "rejected" (failed)
 * - once settled, state is final (immutable)
 * - Stores callbacks registered via `.then()` while pending
 * - Executes those callbacks once resolved/rejected
 *
 * Why implement it this way?
 * - State + value + handler queue are the essential pieces
 * - resolve() and reject() both settle the promise and flush handlers
 * - then() returns a new promise to allow chaining
 *
 * Time Complexity:
 * - then(): O(1) (register callback)
 * - resolve/reject(): O(n) (notify n handlers)
 * Space Complexity: O(n) for handler queue
 *
 * Performance Considerations:
 * - Real Promises use microtask queue (Event Loop); ours executes sync
 * - For interview, focus on "state machine" explanation
 */
class MyPromise {
  constructor(executor) {
    this.state = "pending";  // "pending" | "fulfilled" | "rejected"
    this.value = undefined;  // stores resolved value or rejection reason
    this.handlers = [];      // stores then() callbacks if pending

    const resolve = (value) => {
      if (this.state !== "pending") return; // ignore multiple calls
      this.state = "fulfilled";
      this.value = value;
      this.handlers.forEach(h => h.onFulfilled(value)); // flush queue
    };

    const reject = (error) => {
      if (this.state !== "pending") return;
      this.state = "rejected";
      this.value = error;
      this.handlers.forEach(h => h.onRejected(error));
    };

    // Immediately invoke executor with resolve & reject
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    // Returns a new promise to enable chaining
    return new MyPromise((resolve, reject) => {
      const handle = () => {
        if (this.state === "fulfilled") {
          try {
            resolve(onFulfilled ? onFulfilled(this.value) : this.value);
          } catch (err) {
            reject(err);
          }
        } else if (this.state === "rejected") {
          try {
            reject(onRejected ? onRejected(this.value) : this.value);
          } catch (err) {
            reject(err);
          }
        } else {
          // Still pending: save callbacks for later
          this.handlers.push({
            onFulfilled: val => resolve(onFulfilled ? onFulfilled(val) : val),
            onRejected: err => reject(onRejected ? onRejected(err) : err)
          });
        }
      };
      handle();
    });
  }
}

/**
 * Follow-up Questions:
 * - Why do real Promises run callbacks asynchronously (microtasks)?
 * - How would you add `.catch()` and `.finally()` support?
 * - What happens if resolve() is called twice? Why ignore?
 * - How would you handle "thenables" (objects with a then method)?
 */


/**
 * Promise.all polyfill
 *
 * What does native Promise.all do?
 * - Takes an array of promises (or values)
 * - Resolves when ALL promises resolve
 * - Returns an array of results in order
 * - Rejects immediately if ANY promise rejects
 *
 * Why implement it this way?
 * - Need to track how many have resolved
 * - Preserve result order (by index)
 * - Reject fast on first error
 *
 * Time Complexity: O(n) to register n promises
 * Space Complexity: O(n) for result array
 */
MyPromise.all = function(promises) {
  return new MyPromise((resolve, reject) => {
    const results = [];
    let completed = 0;

    promises.forEach((p, i) => {
      MyPromise.resolve(p).then(val => {
        results[i] = val;   // store result at correct index
        completed++;
        if (completed === promises.length) resolve(results); // all done
      }, reject);           // reject immediately if any fail
    });
  });
};

/**
 * Follow-up Questions:
 * - How does Promise.all differ from Promise.allSettled?
 * - What if array is empty? (should resolve with [])
 * - What if one of the inputs is a non-promise value?
 */


/**
 * Promise.any polyfill
 *
 * What does native Promise.any do?
 * - Resolves with the first successfully resolved promise
 * - If all fail, rejects with AggregateError containing all errors
 *
 * Why implement it this way?
 * - Track number of rejections
 * - Collect errors for final rejection
 * - Resolve as soon as one promise succeeds
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n) for error array
 */
MyPromise.any = function(promises) {
  return new MyPromise((resolve, reject) => {
    let errors = [];
    let rejectedCount = 0;

    promises.forEach((p, i) => {
      MyPromise.resolve(p).then(resolve, err => {
        errors[i] = err;
        rejectedCount++;
        if (rejectedCount === promises.length) {
          reject(new AggregateError(errors, "All promises rejected"));
        }
      });
    });
  });
};

/**
 * Follow-up Questions:
 * - Difference between Promise.race vs Promise.any?
 * - Why does any reject with AggregateError instead of first error?
 * - How would you implement allSettled?
 */


/**
 * MyPromise.race
 *
 * What does native Promise.race do?
 * - Returns a promise that settles (resolve/reject) as soon as ANY input settles
 * - First one to finish decides the result
 *
 * Why implement it this way?
 * - Iterate over input promises
 * - Attach resolve/reject handlers
 * - Whichever settles first resolves the wrapper
 *
 * Time Complexity: O(n) to attach handlers
 * Space Complexity: O(1)
 *
 * Performance Considerations:
 * - Does not cancel the "losing" promises, they still run
 * - In real-world, you might want to abort/cancel pending async ops
 */
MyPromise.race = function(promises) {
  return new MyPromise((resolve, reject) => {
    promises.forEach(p => {
      MyPromise.resolve(p).then(resolve, reject);
    });
  });
};

/**
 * Follow-up Questions:
 * - How does race differ from any?
 *   (race resolves/rejects with first result, any resolves with first success only)
 * - How would you implement race with cancellation of slower promises?
 */


/**
 * MyPromise.allSettled
 *
 * What does native Promise.allSettled do?
 * - Waits for ALL input promises to settle (resolve or reject)
 * - Never short-circuits on reject (unlike all)
 * - Returns array of objects: { status: "fulfilled", value } or { status: "rejected", reason }
 *
 * Why implement it this way?
 * - Track number of completed promises
 * - Push result objects for each
 * - Resolve only when all have settled
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n) for result array
 */
MyPromise.allSettled = function(promises) {
  return new MyPromise((resolve) => {
    const results = [];
    let completed = 0;

    promises.forEach((p, i) => {
      MyPromise.resolve(p).then(val => {
        results[i] = { status: "fulfilled", value: val };
      }).catch(err => {
        results[i] = { status: "rejected", reason: err };
      }).finally(() => {
        completed++;
        if (completed === promises.length) resolve(results);
      });
    });
  });
};

/**
 * Follow-up Questions:
 * - How does allSettled differ from all?
 * - When is allSettled useful in real life? (batch API calls, you want all results even if some fail)
 */


/**
 * MyPromise.prototype.finally
 *
 * What does native Promise.finally do?
 * - Registers a callback to run once promise settles (resolve or reject)
 * - Does not change the value/error of the chain
 *
 * Why implement it this way?
 * - Wrap callback in then()
 * - Re-throw error or return original value after running callback
 *
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */
MyPromise.prototype.finally = function(callback) {
  return this.then(
    value => {
      return MyPromise.resolve(callback()).then(() => value); // preserve value
    },
    reason => {
      return MyPromise.resolve(callback()).then(() => { throw reason }); // rethrow
    }
  );
};

/**
 * Follow-up Questions:
 * - Why is finally useful? (cleanup: closing connections, hiding loaders, etc.)
 * - How does finally differ from then?
 */

/**
 * MyPromise.resolve
 *
 * What does native Promise.resolve do?
 * - Returns a promise resolved with the given value
 * - If input is already a promise, returns it as-is
 * - If input is a thenable (object with then), assimilates it
 */
MyPromise.resolve = function(value) {
  if (value instanceof MyPromise) return value;
  return new MyPromise(resolve => resolve(value));
};

/**
 * MyPromise.reject
 *
 * What does native Promise.reject do?
 * - Returns a promise that is already rejected with the given reason
 */
MyPromise.reject = function(reason) {
  return new MyPromise((_, reject) => reject(reason));
};

/**
 * Follow-up Questions:
 * - Why is resolve needed if you can just write new Promise?
 * - How does resolve handle thenables?
 */
