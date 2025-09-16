## Implementation

```js
function debounce(func, wait = 0) {
  let timeoutId = null;

  return function (...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      func.apply(context, args);
    }, wait);
  };
}
```

### How This Works

* **Timer storage:** We declare a `timeoutId` outside the returned function, leveraging a closure to persist it across calls.
* **Resetting the timer:** Each time the debounced function is invoked, `clearTimeout(timeoutId)` cancels any pending execution.
* **Scheduling execution:** A new timer is set with `setTimeout`, delaying the call to `func` by `wait` milliseconds.
* **Preserving `this` and args:** We capture `this` in `context`, and later call `func.apply(context, args)` so both context and arguments of the original call are maintained ([GreatFrontEnd][1], [edvins.io][2], [Stack Overflow][3]).

---

## Why It’s Important

* This pattern is foundational in front‑end development—commonly used in search, resize, scroll events, and any UI-heavy event handling scenario ([GeeksforGeeks][4]).
* Several reputable sources explain this very version: blogs like Edvins, GeeksforGeeks, and tutorials emphasizing closure, `this` binding, and cancellation via `clearTimeout` ([edvins.io][2]).
* Mastery of this pattern signals a solid understanding of JavaScript behavior and is a staple in coding interviews.

---

## Supplement: Add `cancel()` & `flush()` Methods (Debounce II)

Want to level up? Extend this solution to include `cancel()` and `flush()`, as often required in more advanced variants like **Debounce II**:

```js
function debounceWithExtras(func, wait = 0) {
  let timeoutId = null;
  let lastArgs, lastThis;

  const debounced = function (...args) {
    lastArgs = args;
    lastThis = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      func.apply(lastThis, lastArgs);
    }, wait);
  };

  debounced.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = null;
  };

  debounced.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      func.apply(lastThis, lastArgs);
      timeoutId = null;
    }
  };

  return debounced;
}
```

####  How It Works:

- **Delay logic**: Each time `debounced()` is called, it cancels any existing timer and sets a new one for `wait` milliseconds.
- **`cancel()`**: Clears the timer, so the function isn't called.
- **`flush()`**: Immediately invokes the function if there's a pending call, then clears it.

---

###  Usage Example

```js
let count = 0;
function increment() {
  count++;
  console.log("Incremented:", count);
}

const debouncedIncrement = debounceWithCancelAndFlush(increment, 200);

// t = 0
debouncedIncrement();        // schedule
// t = 100
debouncedIncrement();        // reschedule
// t = 250
// => logs "Incremented: 1"

// Now test cancel:
debouncedIncrement();
debouncedIncrement.cancel(); // stopped
// No increment happens

// Now test flush:
debouncedIncrement();
setTimeout(() => {
  debouncedIncrement.flush(); // Immediate execution
}, 50);
// => logs "Incremented: 2"
```

---

###  Why This Matters

Debouncing is essential for front-end performance—especially in scenarios like handling rapid events (scroll, resize, typing). The added methods (`cancel()` and `flush()`) give fine-grained control, which can be critical in real-world UIs or interview tasks citeturn0search6turn0search12.

---

Let’s extend the **Debounce II** pattern with **leading** and **trailing** options.

---

## 🔑 The Idea

* **Trailing (default):** The function runs **after** the wait period has elapsed since the last call.
* **Leading:** The function runs **immediately** on the first call, then ignores subsequent calls until the wait period ends.
* **Both:** Sometimes you want it to run at the start *and* at the end (less common but possible).

---

## 🛠️ Implementation with `leading` + `trailing`

```js
function debounce(func, wait = 0, options = { leading: false, trailing: true }) {
  let timeoutId = null;
  let lastArgs, lastThis;
  let result;

  const invoke = () => {
    result = func.apply(lastThis, lastArgs);
    timeoutId = null;
    lastArgs = lastThis = null;
  };

  const debounced = function (...args) {
    lastArgs = args;
    lastThis = this;

    const shouldCallNow = options.leading && !timeoutId;

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (options.trailing && lastArgs) {
        invoke();
      } else {
        timeoutId = null;
      }
    }, wait);

    if (shouldCallNow) {
      invoke();
    }

    return result;
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = lastThis = null;
  };

  debounced.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      if (lastArgs) invoke();
    }
    return result;
  };

  return debounced;
}
```

---

## ✅ Example Usage

```js
function log(msg) {
  console.log(Date.now(), msg);
}

// Leading only
const leadingDebounce = debounce(log, 300, { leading: true, trailing: false });

// Trailing only (default)
const trailingDebounce = debounce(log, 300);

// Both leading and trailing
const bothDebounce = debounce(log, 300, { leading: true, trailing: true });

// Example: simulate rapid calls
leadingDebounce("Leading");   // executes immediately
trailingDebounce("Trailing"); // executes after wait
bothDebounce("Both");         // executes immediately, then again after wait
```

---

## 🧐 Key Differences in Behavior

| Variant      | Execution Timing                              |
| ------------ | --------------------------------------------- |
| **Trailing** | After user stops triggering events            |
| **Leading**  | Immediately on first call, then ignore bursts |
| **Both**     | Immediately + after quiet period              |

---

👉 This aligns closely with how `_.debounce` from Lodash works (they popularized the API).

---

# 🔄 Debounce vs Throttle

Both are **rate-limiting techniques** for functions (especially useful for scroll, resize, typing, or mousemove events).

---

## 🕒 Debounce

* Waits until the user **stops triggering events** for a given period.
* Think: *“Execute only after I’m done.”*

### Example: Search Autocomplete

```js
const search = debounce(query => {
  console.log("Searching:", query);
}, 300);

// User types: "c", "ca", "cat"
// Only one API call happens after 300ms of no typing.
search("c");
search("ca");
search("cat");
```

✅ Prevents spamming API calls.
❌ User might wait before seeing results.

---

## ⏱️ Throttle

* Ensures a function runs **at most once every X ms**, no matter how many times it’s triggered.
* Think: *“Execute at regular intervals while the user is still triggering.”*

### Example: Window Scroll Handler

```js
function throttle(func, wait) {
  let lastCall = 0;

  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

// Usage
const onScroll = throttle(() => {
  console.log("Scroll position:", window.scrollY);
}, 200);

window.addEventListener("scroll", onScroll);
```

✅ Smooth performance (e.g., scroll tracking, analytics, infinite scroll).
❌ Might skip some events in between.

---

## 📊 Side-by-Side

| Feature           | Debounce                              | Throttle                             |
| ----------------- | ------------------------------------- | ------------------------------------ |
| **When runs**     | After user stops triggering           | At fixed intervals during triggering |
| **Use case**      | Autocomplete, resize, form validation | Scroll, drag, resize, analytics      |
| **Guarantee**     | One call after idle                   | Calls at most once per interval      |
| **Extra options** | Leading/trailing                      | Leading/trailing (like Lodash too)   |

---

## 🎯 Quick Analogy

* **Debounce**: Wait until a friend finishes talking, then reply.
* **Throttle**: Allow your friend to talk but interrupt them every 2 seconds with a “got it.”

---

## Debounce vs Throttle — Visual Timeline

Let’s assume `wait = 300ms` and the user fires events every `100ms`.

---

### **Debounce (300ms)**

```
Events:    | E0----E1----E2----E3----E4----E5
Time (ms): | 0    100   200   300   400   500
Timer:     |----reset----reset----reset----...
Executes:                                [E5] at t=800
```

* Execution happens **once, at the end**, after silence of 300ms.

---

### **Throttle (300ms)**

```
Events:    | E0----E1----E2----E3----E4----E5
Time (ms): | 0    100   200   300   400   500
Executes:  [E0]          [E3]          [E6]...
```

* Execution happens **immediately, then only once every 300ms**.
* Even if multiple events happen inside that window, only one runs.

---

👉 Together:

* Use **debounce** when you want the **final state** (e.g., search after typing stops).
* Use **throttle** when you want **periodic updates** (e.g., scroll position every 300ms).

---

# 🛠 Building a Combined Debounce/Throttle Utility

Now let’s write one **master utility** (inspired by Lodash) that can do both debounce and throttle, depending on options.

---

## Design

```js
function rateLimit(func, wait, options)
```

* `func`: the function to wrap.
* `wait`: delay in ms.
* `options`:

  * `{ mode: "debounce" | "throttle" }` → choose behavior.
  * `{ leading: true/false, trailing: true/false }` → execution style.

---

## Implementation

```js
function rateLimit(func, wait = 0, options = { mode: "debounce", leading: false, trailing: true }) {
  let timeoutId = null;
  let lastCallTime = 0;
  let lastArgs, lastThis;

  const invoke = () => {
    func.apply(lastThis, lastArgs);
    lastArgs = lastThis = null;
  };

  const debounced = function (...args) {
    lastArgs = args;
    lastThis = this;

    if (options.mode === "debounce") {
      // Debounce: reset timer on each call
      clearTimeout(timeoutId);
      if (options.leading && !timeoutId) {
        invoke();
      }
      timeoutId = setTimeout(() => {
        if (options.trailing) invoke();
        timeoutId = null;
      }, wait);
    }

    if (options.mode === "throttle") {
      const now = Date.now();
      const remaining = wait - (now - lastCallTime);

      if (remaining <= 0) {
        // Enough time passed → call immediately
        lastCallTime = now;
        if (options.leading) invoke();
      } else if (options.trailing && !timeoutId) {
        // Schedule trailing call
        timeoutId = setTimeout(() => {
          lastCallTime = Date.now();
          invoke();
          timeoutId = null;
        }, remaining);
      }
    }
  };

  // Expose cancel & flush like Lodash
  debounced.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = null;
    lastArgs = lastThis = null;
  };

  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      invoke();
      timeoutId = null;
    }
  };

  return debounced;
}
```

---

## Usage Examples

### Debounce (trailing only)

```js
const search = rateLimit(apiCall, 300, { mode: "debounce" });
```

### Debounce (leading + trailing)

```js
const search = rateLimit(apiCall, 300, { mode: "debounce", leading: true, trailing: true });
```

### Throttle (leading only)

```js
const logScroll = rateLimit(() => console.log(window.scrollY), 200, { mode: "throttle", leading: true, trailing: false });
```

### Throttle (leading + trailing)

```js
const logScroll = rateLimit(() => console.log(window.scrollY), 200, { mode: "throttle", leading: true, trailing: true });
```

---

# 🎯 Takeaway

* `setTimeout` = **delayed single run**, `setInterval` = **repeated runs**.
* Saving the timer ID (`timeout = setTimeout(...)`) is how we gain control (cancel/flush).
* With just `setTimeout` + `clearTimeout`, we can build **debounce**.
* With timestamp checks (`Date.now()`), we can build **throttle**.
* With a toggle + options, we unify both into one reusable utility.

---

We’ll compare **debounce** and **throttle** behaviors under different options using **timeline diagrams**.  

Assumptions:  
- `wait = 300ms`  
- User fires events every `100ms` → `E0, E1, E2, …`  

---

# ⏳ Debounce

### 1. Debounce (Trailing = true, Leading = false) → **default debounce**
```
Events:     E0----E1----E2----E3----E4
Time (ms):  0    100   200   300   400
Executes:                                [E4] at 700ms
```
- Keeps resetting timer.  
- Only final event executes after quiet period.  

---

### 2. Debounce (Leading = true, Trailing = false) → **instant fire, no trailing**
```
Events:     E0----E1----E2----E3----E4
Time (ms):  0    100   200   300   400
Executes:  [E0]
```
- Fires immediately at the first call.  
- Ignores all subsequent calls until user goes silent.  

---

### 3. Debounce (Leading = true, Trailing = true) → **both ends**
```
Events:     E0----E1----E2----E3----E4
Time (ms):  0    100   200   300   400
Executes:  [E0]                               [E4] at 700ms
```
- Fires right away (leading).  
- Then again after final pause (trailing).  

---

# ⏳ Throttle

### 1. Throttle (Leading = true, Trailing = false) → **classic throttle**
```
Events:     E0----E1----E2----E3----E4----E5----E6
Time (ms):  0    100   200   300   400   500   600
Executes:  [E0]         [E3]          [E6]...
```
- Fires immediately.  
- Next execution can only happen after wait window (300ms).  

---

### 2. Throttle (Leading = false, Trailing = true) → **delayed trailing throttle**
```
Events:     E0----E1----E2----E3----E4----E5----E6
Time (ms):  0    100   200   300   400   500   600
Executes:            [E2]          [E5]          [E7]...
```
- Doesn’t fire at the start.  
- Fires once at the end of each wait window (trailing).  

---

### 3. Throttle (Leading = true, Trailing = true) → **max coverage throttle**
```
Events:     E0----E1----E2----E3----E4----E5----E6
Time (ms):  0    100   200   300   400   500   600
Executes:  [E0]         [E2/E3]       [E5]...
```
- Fires immediately (leading).  
- If more calls happen inside the same wait window, one trailing call will also fire at the end.  

---

# 🧠 Easy Rule of Thumb

- **Debounce** → *“Only once after calm.”*  
- **Throttle** → *“At most once per window.”*  
- `leading` = do it right away.  
- `trailing` = do it at the end.  

---

# 🔄 Debounce Variants

---

### 1. **Debounce (Trailing = true, Leading = false)** → *default debounce*

👉 **Executes only after user stops.**

**Use case:**
🔹 **Search box autocomplete**

* If a user types “c → ca → cat”, you only want to fire the API request after they stop typing.
* Saves bandwidth and reduces server load.
* Trailing ensures the *final state* is captured.

---

### 2. **Debounce (Leading = true, Trailing = false)** → *instant fire*

👉 **Executes immediately, ignores subsequent calls until silence.**

**Use case:**
🔹 **Button click with accidental double-taps**

* Imagine a “Submit Payment” button.
* Leading debounce ensures the very first click executes immediately.
* Trailing = false avoids duplicate calls if the user double-clicks quickly.

---

### 3. **Debounce (Leading = true, Trailing = true)** → *both ends*

👉 **Executes right away, and again after the user stops.**

**Use case:**
🔹 **Text editor autosave**

* Leading call → Save immediately when the user starts typing (fast feedback).
* Trailing call → Save once more when the user pauses, ensuring the final content is captured.

---

# ⏱️ Throttle Variants

---

### 4. **Throttle (Leading = true, Trailing = false)** → *classic throttle*

👉 **Executes at most once per wait window, starting immediately.**

**Use case:**
🔹 **Tracking scroll position for a sticky header**

* Needs *fast, immediate response* when scrolling begins (leading).
* Doesn’t need a trailing event since you’re continuously updating UI at intervals.
* Keeps performance smooth by limiting execution.

---

### 5. **Throttle (Leading = false, Trailing = true)** → *delayed throttle*

👉 **Executes once at the end of each wait window.**

**Use case:**
🔹 **Window resize event**

* User may continuously drag window edges.
* You don’t need updates *during* resizing, only when they pause (to recalc layout).
* Trailing ensures you get the final size after the drag ends.

---

### 6. **Throttle (Leading = true, Trailing = true)** → *max coverage throttle*

👉 **Executes at start of window, then ensures one more at the end if needed.**

**Use case:**
🔹 **Infinite scrolling with analytics logging**

* Leading → Trigger “fetch next page” immediately when user scrolls near bottom.
* Trailing → Ensure if user scrolls quickly past multiple thresholds, the last one is still caught.
* Balances responsiveness with completeness.

---

# 🧠 Recap Table

| Mode     | Leading | Trailing | Real-world example        |
| -------- | ------- | -------- | ------------------------- |
| Debounce | ✖️      | ✔️       | Autocomplete search       |
| Debounce | ✔️      | ✖️       | Prevent double-submit     |
| Debounce | ✔️      | ✔️       | Text editor autosave      |
| Throttle | ✔️      | ✖️       | Sticky header on scroll   |
| Throttle | ✖️      | ✔️       | Window resize reflow      |
| Throttle | ✔️      | ✔️       | Infinite scroll + logging |

---

⚡This way, in an interview, you don’t just say *what* debounce/throttle do — you say *why and when to use each variant*, which is exactly what senior engineers look for.

---
