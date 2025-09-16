# 🔹 What is `requestAnimationFrame`?

`requestAnimationFrame(callback)` is a browser API designed specifically for **visual updates** (animations, transitions, canvas drawing, etc.).

It tells the browser:
👉 “Before the next repaint (frame render), please call this function.”

So it synchronizes your code with the browser’s **render loop**.

### Key properties:

* **Frame-synced**: The callback is called just before the next repaint (usually \~16.6ms on 60Hz displays).
* **Optimized**: The browser can batch DOM reads/writes, handle compositing, and avoid unnecessary work.
* **Power-efficient**: If the tab/window is inactive, the browser pauses rAF calls → saves CPU & battery.
* **Jank-free**: Animations look smoother because callbacks align with monitor refresh rate.

---

# 🔹 What is `setTimeout`?

`setTimeout(callback, delay)` schedules a callback **after at least `delay` ms**, but:

* Timing is **not exact** (event loop & task queue delays matter).
* It doesn’t align with repaint cycles → may cause frame drops.
* Keeps running even if the tab is minimized (wasting resources).
* Often used for general-purpose scheduling, not for animations.

---

# 🔹 Comparing `requestAnimationFrame` vs `setTimeout`

| Feature              | `requestAnimationFrame`                                      | `setTimeout`                                      |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| **Primary use**      | Smooth animations, visual updates                            | General-purpose async scheduling                  |
| **Execution timing** | Before next repaint, synced to refresh rate                  | After at least `delay` ms (not synced to repaint) |
| **Accuracy**         | Adaptive (matches display’s refresh rate: 60Hz, 120Hz, etc.) | Inaccurate, subject to event loop delays          |
| **Inactive tabs**    | Paused → saves CPU/battery                                   | Keeps firing unless throttled by browser          |
| **Performance**      | Optimized, avoids unnecessary repaints                       | May cause dropped frames if not aligned           |
| **Code style**       | Recursive callback (`rAF(fn)`) for loops                     | Recursive `setTimeout(fn, delay)` for loops       |
| **Typical use case** | Canvas/game animations, DOM transitions                      | Debouncing, delays, timers, fallbacks             |

---

# 🔹 Example: Animation with `setTimeout`

```js
let start = null;

function step(timestamp) {
  if (!start) start = timestamp;
  let progress = timestamp - start;

  // move an element for 2 seconds
  let box = document.getElementById("box");
  box.style.transform = `translateX(${Math.min(progress / 10, 200)}px)`;

  if (progress < 2000) {
    setTimeout(() => step(performance.now()), 16); // try to mimic 60fps
  }
}

setTimeout(() => step(performance.now()), 16);
```

🔴 Problems:

* If the main thread is busy → `16ms` may become `30ms` or more → stuttering.
* Not synced with refresh rate → dropped frames.

---

# 🔹 Example: Animation with `requestAnimationFrame`

```js
let start = null;

function step(timestamp) {
  if (!start) start = timestamp;
  let progress = timestamp - start;

  // move an element for 2 seconds
  let box = document.getElementById("box");
  box.style.transform = `translateX(${Math.min(progress / 10, 200)}px)`;

  if (progress < 2000) {
    requestAnimationFrame(step);
  }
}

requestAnimationFrame(step);
```

✅ Smoother:

* Browser calls `step()` just before repaint.
* Matches refresh rate automatically.
* Pauses when tab inactive.

---

# 🔹 Performance Note (Why rAF is preferred)

* Modern displays can be 60Hz, 120Hz, 144Hz…
* `setTimeout(..., 16)` assumes 60Hz only. On 120Hz, you’ll still run at 60fps.
* `rAF` adapts automatically → animations look smooth on any monitor.

---

# 🔹 When to Use Which?

* **Animations, Canvas, DOM transitions** → Use `requestAnimationFrame`.
* **Delays, timers, polling, scheduling background work** → Use `setTimeout` / `setInterval`.

---

✅ **Interview Soundbite**:

> "`requestAnimationFrame` is purpose-built for animations. Unlike `setTimeout`, which simply schedules a task after a delay, `rAF` ensures callbacks run right before the browser’s repaint cycle. This makes animations smoother, adaptive to the display refresh rate, power-efficient, and avoids unnecessary computations when the page isn’t visible."

---

# 🔹 Event Loop Basics

The **JavaScript event loop** handles the execution of code, events, and queued tasks.

There are **3 major categories** you should care about here:

1. **Call stack** → Where synchronous code runs.
2. **Task queues (macrotasks & microtasks)** → For async callbacks.
3. **Render steps** → The browser’s rendering pipeline (recalculate styles → layout → paint → composite).

---

# 🔹 Where does `setTimeout` land?

* `setTimeout(fn, delay)` schedules `fn` as a **macrotask**.
* Macrotasks run **after the current call stack is empty**, and **after microtasks**.
* The actual timing is **“at least delay ms”**, not guaranteed.

👉 Example:

```js
console.log("start");

setTimeout(() => console.log("timeout"), 0);

Promise.resolve().then(() => console.log("microtask"));

console.log("end");
```

**Output:**

```
start
end
microtask   // microtasks first
timeout     // then setTimeout (macrotask)
```

---

# 🔹 Where does `requestAnimationFrame` land?

* `requestAnimationFrame(fn)` doesn’t go into the **task queues** like `setTimeout`.
* Instead, it’s put into a **special rendering callback queue**.
* The browser runs these callbacks **right before the next repaint**.

👉 Rough event loop cycle:

1. Run macrotasks (like `setTimeout`).
2. Run all microtasks (like promises).
3. **If it’s time to render a new frame (e.g., \~16ms since last render @60Hz):**

   * Run all `requestAnimationFrame` callbacks.
   * Run rendering pipeline (style → layout → paint → composite).

So `rAF` is more tied to **render timing**, while `setTimeout` is tied to **general async timing**.

---

# 🔹 Visual Timeline

Let’s say we’re aiming for 60fps (\~16.6ms per frame):

```
Frame 1 start (t=0ms)
 ├─ Run macrotasks (setTimeout, etc.)
 ├─ Run microtasks (Promise.then, etc.)
 ├─ Run requestAnimationFrame callbacks
 ├─ Recalculate styles, layout, paint, composite
Frame 1 end (t≈16.6ms)
```

`setTimeout(fn, 16)` might execute:

* **Too early** (between frames, wasting a repaint).
* **Too late** (after 20ms if event loop busy → dropped frame).

`requestAnimationFrame(fn)` executes:

* Exactly **before paint**, perfect for updating DOM/CSS.

---

# 🔹 Example: rAF vs setTimeout under load

```js
// Heavy computation blocking 10ms
function heavyWork() {
  const start = Date.now();
  while (Date.now() - start < 10) {}
}

function animateWithTimeout() {
  setTimeout(() => {
    heavyWork();
    console.log("timeout frame");
    animateWithTimeout();
  }, 16);
}

function animateWithRAF() {
  requestAnimationFrame(() => {
    heavyWork();
    console.log("rAF frame");
    animateWithRAF();
  });
}

// animateWithTimeout(); // try one
// animateWithRAF();     // try the other
```

* With **`setTimeout`**, drift accumulates → frames skip, animation slows.
* With **`requestAnimationFrame`**, browser adjusts → stays aligned with paint.

---

# 🔹 Interview-Grade Answer

If asked **“Where do they sit in the event loop?”**:

> "`setTimeout` puts callbacks in the macrotask queue, which only runs after the current script and microtasks finish. `requestAnimationFrame`, on the other hand, queues callbacks into a dedicated rendering queue, executed right before the browser’s repaint. This ensures frame-synced execution. That’s why `setTimeout` can drift and cause jank, while `requestAnimationFrame` stays smooth and efficient."

---

# 🔹 Why Browsers Throttle Background Tabs?

* Animations/timers in inactive tabs don’t need to run at full speed → waste of CPU/battery.
* Browsers **intentionally throttle timers** in background tabs to conserve resources.
* This affects `setTimeout`, `setInterval`, and `requestAnimationFrame` differently.

---

# 🔹 Behavior of `requestAnimationFrame` in inactive tabs

* `requestAnimationFrame` **pauses entirely** when a tab is not visible.
* No callbacks fire → animations are frozen until the tab is active again.
* When the tab regains focus → the animation resumes from where it left off.

👉 Example:

```js
function tick(timestamp) {
  console.log("rAF:", timestamp);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
```

* On an active tab → logs \~60 times per second (depending on refresh rate).
* Switch tab → logs **stop** completely.
* Switch back → resumes logging instantly.

✅ This is great for animations, since no wasted CPU cycles.

---

# 🔹 Behavior of `setTimeout` / `setInterval` in inactive tabs

Browsers throttle them heavily in background tabs:

* **Chrome, Firefox, Safari** (modern browsers):

  * `setTimeout` / `setInterval` minimum delay becomes **1000ms (1 second)** in background tabs.
  * So even if you wrote `setTimeout(fn, 10)`, it won’t fire more than once per second in a background tab.

👉 Example:

```js
setInterval(() => {
  console.log("interval:", Date.now());
}, 10);
```

* Foreground: \~every 10ms (limited by clamping rules).
* Background: \~every 1000ms.

✅ Good for battery life.
❌ Bad if you were trying to maintain a real-time process across tabs.

---

# 🔹 Practical Consequences

| Feature                 | Foreground                                        | Background (inactive tab)     |
| ----------------------- | ------------------------------------------------- | ----------------------------- |
| `requestAnimationFrame` | Runs \~once per frame (\~60fps on 60Hz monitor)   | Paused completely             |
| `setTimeout(fn, 0/16)`  | Fires at \~4ms minimum (depending on clamp rules) | Throttled to \~1000ms minimum |
| `setInterval(fn, 10)`   | Fires every \~10ms                                | Throttled to \~1000ms minimum |

---

# 🔹 Why does this matter?

* **Animations**: Always use `requestAnimationFrame` → they pause automatically in background tabs.
* **Polling/heartbeat tasks** (e.g., checking server health):

  * If you use `setInterval(fn, 500)` → becomes once per second in background → may miss events.
  * Solution: Use **Web Workers** (they’re less throttled) or **WebSockets/Server-Sent Events**.

---

# 🔹 Interview Soundbite

> "In inactive tabs, browsers throttle timers aggressively. `setTimeout` and `setInterval` get clamped to around 1-second intervals, while `requestAnimationFrame` pauses entirely. That’s actually a feature: animations stop wasting CPU when not visible. For background tasks where you need reliable timing, you’d use Web Workers or push-based APIs like WebSockets instead of relying on timers."

---

# 🔹 Why `setTimeout(fn, 0)` ≠ immediate?

* **Spec rule**: Browsers enforce a *minimum delay clamp* for timers.
* The callback is scheduled as a **macrotask** → it must wait until:

  1. The current call stack is clear, and
  2. All microtasks (Promises, MutationObservers, queueMicrotask, etc.) are done.

So even if you ask for `0ms`, the **earliest possible delay is \~4ms (historically)**.

---

# 🔹 Minimum clamping rules (per HTML spec)

1. **Nested timers** (setTimeout inside setTimeout):

   * Spec says minimum delay must be **≥ 4ms** once nesting level ≥ 5.
   * This prevents abuse where people create tight recursive timers that hog CPU.

2. **Modern browsers**:

   * Chrome, Firefox, Safari enforce **4ms clamp** even for the first few timers.
   * Some environments (like Node.js) can go as low as \~1ms, but still not 0.

👉 So `setTimeout(fn, 0)` usually means:

> "Run after at least \~4ms, and only after current stack + microtasks finish."

---

# 🔹 Example: Demonstrating clamping

```js
console.log("start");

setTimeout(() => console.log("timeout 0"), 0);
setTimeout(() => console.log("timeout 1"), 1);
setTimeout(() => console.log("timeout 2"), 2);

Promise.resolve().then(() => console.log("microtask"));

console.log("end");
```

**Output (typical browser):**

```
start
end
microtask    // microtasks always before macrotasks
timeout 0    // actually after ~4ms
timeout 1
timeout 2
```

Even though we asked for `0`, `1`, `2`, the actual delay will be **≥4ms**.

---

# 🔹 Why this matters

* If you want something to run **as soon as possible after current code**, you shouldn’t use `setTimeout(fn, 0)`.
* Better option: **microtasks**, e.g.:

  * `Promise.resolve().then(fn)`
  * `queueMicrotask(fn)`

Those run **right after the current stack**, before any macrotask timers.

---

# 🔹 Event Loop Priority Recap

Order of execution after the current stack:

1. **Microtasks** → Promise callbacks, queueMicrotask.
2. **Macrotasks** → setTimeout, setInterval, I/O, postMessage.
3. **rAF** → before rendering, if it’s a repaint cycle.
4. **Repaint** → style → layout → paint → composite.

---

# 🔹 Interview Soundbite

> "`setTimeout(fn, 0)` doesn’t mean 'run immediately'. It places the callback in the macrotask queue, which runs only after the current stack and all microtasks finish. On top of that, browsers apply a minimum clamping delay (usually \~4ms), so the callback won’t fire instantly. If you really want 'next-tick immediate execution', you should use microtasks like `Promise.resolve().then(fn)` or `queueMicrotask(fn)`."

---