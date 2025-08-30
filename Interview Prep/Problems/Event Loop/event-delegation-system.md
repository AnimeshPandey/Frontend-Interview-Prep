# 🔎 Problem 9: Event Delegation System (like React synthetic events)
* Step 1 → Attach one listener per element.
* Step 2 → Switch to event delegation (one root listener).
* Step 3 → Add dynamic delegation for multiple event types.
* Step 4 → Add remove/unsubscribe.
* Step 5 → Discuss perf, edge cases, React comparison.
---

## Step 1. Interviewer starts:

*"Write a function that attaches a click listener to every button inside a container."*

---

### ✅ Naive Approach (inefficient)

```js
function attachListeners(container) {
  const buttons = container.querySelectorAll("button");
  buttons.forEach(btn => {
    btn.addEventListener("click", e => {
      console.log("Button clicked:", e.target.textContent);
    });
  });
}
```

⚠️ Problem: If container has 1000 buttons → 1000 listeners → memory + perf cost.

---

## Step 2. Interviewer says:

*"Instead, use **event delegation** — attach a single listener to the container and handle bubbling."*

---

### ✅ Event Delegation

```js
function delegate(container, selector, type, handler) {
  container.addEventListener(type, event => {
    if (event.target.matches(selector)) {
      handler(event);
    }
  });
}

// Usage
delegate(document.body, "button", "click", e => {
  console.log("Delegated click:", e.target.textContent);
});
```

✔ Only **one listener** needed at container level.

---

## Step 3. Interviewer twists:

*"Nice. Now make it support **multiple event types and selectors dynamically**, like a small event system."*

---

### ✅ Multi-Event Delegation System

```js
class EventDelegator {
  constructor(root = document.body) {
    this.root = root;
    this.handlers = {}; // { click: [{ selector, fn }, ...] }
  }

  on(type, selector, fn) {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
      this.root.addEventListener(type, e => this.dispatch(e));
    }
    this.handlers[type].push({ selector, fn });
  }

  dispatch(event) {
    const list = this.handlers[event.type] || [];
    for (const { selector, fn } of list) {
      if (event.target.closest(selector)) {
        fn(event);
      }
    }
  }
}

// Example usage
const delegator = new EventDelegator(document.body);
delegator.on("click", "button", e => console.log("Button:", e.target.textContent));
delegator.on("input", "input[type=text]", e => console.log("Typing:", e.target.value));
```

✔ One listener per event type, shared across all selectors.

---

## Step 4. Interviewer adds:

*"Cool. Now add **remove/unsubscribe** (`off`) support."*

---

### ✅ Add `off`

```js
class EventDelegator {
  constructor(root = document.body) {
    this.root = root;
    this.handlers = {};
  }

  on(type, selector, fn) {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
      this.root.addEventListener(type, e => this.dispatch(e));
    }
    this.handlers[type].push({ selector, fn });
  }

  off(type, selector, fn) {
    if (!this.handlers[type]) return;
    this.handlers[type] = this.handlers[type].filter(h =>
      h.selector !== selector || h.fn !== fn
    );
  }

  dispatch(event) {
    const list = this.handlers[event.type] || [];
    for (const { selector, fn } of list) {
      if (event.target.closest(selector)) {
        fn(event);
      }
    }
  }
}
```

✔ Now supports `.on()` and `.off()`.

---

## Step 5. Interviewer final boss:

*"How does this compare to React’s synthetic events? What about perf and edge cases?"*

---

### ✅ Performance & Real-World Discussion

* **Naive (Step 1)** → O(n) listeners, memory heavy.
* **Delegation (Step 2-4)** → O(1) listener per event type, much more scalable.
* **React Synthetic Events**:

  * Uses delegation at the root (`document`).
  * Normalizes event differences across browsers.
  * Provides pooling (but in React 17+ pooling removed).
* **Edge Cases**:

  * `event.stopPropagation()` can prevent delegation from firing.
  * Shadow DOM encapsulation → `event.target` might not bubble out.
  * Dynamically detached nodes (listeners auto-removed).
* **Optimizations**:

  * Use `.closest()` instead of `.matches()` for nested elements.
  * Cache handler lookups for hot paths.

---

# 🎯 Final Interview Takeaways (Event Delegation System)

* ✅ Step 1: Show naive listener-per-element.
* ✅ Step 2: Introduce event delegation.
* ✅ Step 3: Extend to multiple events & selectors.
* ✅ Step 4: Add unsubscribe (`off`).
* ✅ Step 5: Discuss React synthetic events + perf tradeoffs.
