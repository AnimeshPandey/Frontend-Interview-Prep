# 🚀 Interview Gold – Batch #13 (React & UI Performance Patterns, Super Expanded)

---

## 1. Virtualized List Rendering

**Problem:**

* React re-renders **all list items**, even those offscreen.
* 10,000+ rows = **huge DOM (\~MBs of memory)**, slow diffing, scroll jank.

**Solution:**

* **Windowing / Virtualization** = render only visible items + small buffer.
* Keep container scroll height correct using spacers.
* Libraries: `react-window`, `react-virtualized`, `TanStack Virtual`.

**Detailed Design:**

* Container height = total items × rowHeight.
* Render subset based on scroll position.
* Spacer divs simulate hidden rows.

```js
import { FixedSizeList } from "react-window";

<FixedSizeList
  height={600}       // viewport height
  itemSize={35}      // row height
  itemCount={10000}  // total rows
  width={800}
>
  {({ index, style }) => <div style={style}>Row {index}</div>}
</FixedSizeList>
```

**Performance Notes:**

* DOM nodes reduced from **10k → \~20–40**.
* CPU & memory usage drop significantly.
* **O(1)** render cost for scrolling, instead of **O(n)**.

**Pitfalls / Anti-patterns:**

* Dynamic heights → need `VariableSizeList`, but requires measuring.
* SEO bots won’t “see” all content (solution: SSR snapshot).
* Complex row components must be memoized to avoid wasted re-renders.

**Real-world Example:**

* Slack message history.
* Gmail inbox.
* Facebook comments.

**Follow-ups:**

* How to handle infinite scroll + virtualization together? → Combine pagination + virtualized list.
* Why not just `overflow: scroll`? → DOM still has all elements → slow.
* How would you virtualize a grid? → Use `FixedSizeGrid`.

---

## 2. React.memo, useCallback, useMemo

**Problem:**

* Parent re-renders cascade → children re-render unnecessarily.
* Example: Data table with 500 rows → sorting triggers all cell re-renders.

**Solution:**

* **React.memo(Component)**: memoizes rendering based on props.
* **useCallback(fn, deps)**: stable function reference, prevents child re-renders.
* **useMemo(calc, deps)**: memoize expensive calculations.

**Detailed Design:**

```js
const Child = React.memo(({ value, onClick }) => {
  console.log("rendered");
  return <button onClick={onClick}>{value}</button>;
});

function Parent({ count }) {
  const onClick = useCallback(() => console.log(count), [count]);
  return <Child value={count} onClick={onClick} />;
}
```

**Performance Notes:**

* Cuts unnecessary renders **if props unchanged**.
* `React.memo` uses shallow comparison → objects/arrays cause false positives.

**Pitfalls:**

* Wrapping everything in `React.memo` = overhead (comparison cost).
* `useMemo` itself costs CPU → only useful for **expensive calculations**.
* Passing inline objects/arrays always breaks memoization → must stabilize with `useMemo`.

```js
// Bad: causes re-render
<Child options={{ sort: true }} />

// Good: stable reference
const options = useMemo(() => ({ sort: true }), []);
<Child options={options} />
```

**Real-world Example:**

* Data-heavy dashboards (tables, charts).
* Chat apps where messages rarely change.

**Follow-ups:**

* Why not just memoize everything? → Cost vs benefit.
* How to handle deep props? → Custom comparison function or stable refs.
* Difference between `useMemo` vs `useCallback`? → `useMemo` returns value, `useCallback` returns function.

---

## 3. Concurrent Rendering (React 18+)

**Problem:**

* Large renders **block user input** (e.g., typing freezes while search results load).

**Solution:**

* React 18 introduces **Concurrent Mode** → splits urgent vs non-urgent updates.
* **Urgent** = user typing, clicks.
* **Non-urgent** = background updates, transitions.

**Detailed Design:**

```js
const [isPending, startTransition] = useTransition();

function handleInput(e) {
  const val = e.target.value;
  setQuery(val); // urgent
  startTransition(() => {
    setResults(expensiveSearch(val)); // non-urgent
  });
}
```

* Urgent renders happen immediately.
* Non-urgent can be interrupted/cancelled.

**Performance Notes:**

* Prevents input lag on slower devices.
* Time-slicing ensures smoother UX.

**Pitfalls:**

* Non-urgent updates might appear delayed.
* Devs sometimes misuse transitions for critical updates (bad UX).

**Real-world Example:**

* Facebook search bar → typing never lags, results update async.

**Follow-ups:**

* How is concurrent rendering different from async/await? → React scheduler, not promises.
* Why not just debounce? → Debounce skips updates, transitions schedule them smartly.
* What does `isPending` indicate? → Background update in progress.

---

## 4. Suspense for Data Fetching

**Problem:**

* Async fetching leads to “spinner waterfall.”
* Nested components → each fetch waits for parent → slow.

**Solution:**

* **Suspense** allows components to “suspend” until data is ready.
* React automatically shows fallback until resolved.

**Detailed Design:**

```js
const resource = fetchUser(); // returns { read() }

function User() {
  const user = resource.read(); // throws Promise if pending
  return <div>{user.name}</div>;
}

<Suspense fallback={<Spinner />}>
  <User />
</Suspense>
```

* All child fetches kicked off **in parallel**, instead of waterfall.

**Performance Notes:**

* Reduces TTFB for data.
* Works great with **React Query + Suspense integration**.

**Pitfalls:**

* Requires compatible libraries (Relay, React Query).
* Still experimental for SSR → handled better in Next.js 13+.

**Real-world Example:**

* Next.js `app/` dir → Suspense boundaries for parallel fetches.

**Follow-ups:**

* Difference from `useEffect` fetch? → Suspense integrates with rendering.
* Why Suspense avoids spinners everywhere? → Centralized fallback.
* How does Suspense help concurrent rendering? → Suspends non-ready branches.

---

## 5. State Machines & Statecharts

**Problem:**

* Complex flows → too many `useState` flags → inconsistent states.
* Example: login form: `isLoading`, `isError`, `isSuccess` → can overlap incorrectly.

**Solution:**

* Model UI as **finite state machine** (FSM).
* Each state is explicit, transitions predictable.

**Detailed Design:**

```js
const loginMachine = createMachine({
  id: "login",
  initial: "idle",
  states: {
    idle: { on: { SUBMIT: "loading" } },
    loading: { on: { SUCCESS: "success", FAIL: "error" } },
    success: {},
    error: { on: { RETRY: "loading" } }
  }
});
```

* UI can **never** be in “loading + success” simultaneously.

**Performance Notes:**

* Improves correctness, fewer bugs at scale.
* Makes async flows easier to test.

**Pitfalls:**

* Verbose vs `useState`.
* Overkill for simple components.

**Real-world Example:**

* Payment processing flows (Pay → Pending → Success/Fail).
* Multi-step onboarding flows.

**Follow-ups:**

* Why FSMs scale better? → Prevents invalid state combos.
* XState vs Redux? → XState explicit, Redux generic.
* When is FSM overkill? → For trivial UI.

---

## 6. Signals & Fine-Grained Reactivity

**Problem:**

* Context/global state updates → re-render entire subtree.
* Example: changing theme triggers **all components to re-render**.

**Solution:**

* **Signals** = reactive primitives that update only dependents.
* Used in Solid.js, Angular, Vue; coming to React (Canary).

**Detailed Design:**

```js
import { signal } from "@preact/signals-react";

const count = signal(0);

function Counter() {
  return <button onClick={() => count.value++}>
    {count.value}
  </button>;
}
```

* Only `<button>` re-renders → **O(1)** updates.

**Performance Notes:**

* Eliminates wasted renders.
* Much faster for global state updates.

**Pitfalls:**

* Experimental in React.
* Harder debugging since state updates bypass React scheduler.

**Real-world Example:**

* Solid.js: 10,000 counters update smoothly at 60fps.

**Follow-ups:**

* Difference from `useState`? → `useState` triggers parent re-render, signals update in place.
* Why are signals efficient? → Dependency tracking, no tree traversal.
* Future of React? → React Forget compiler + signals.

---

## 7. Avoiding Repaints/Reflows

**Problem:**

* DOM changes trigger **layout recalculations + paints**.
* E.g., animating `width`, `top` → forces reflow → stutters.

**Solution:**

* Prefer **transform/opacity** (GPU accelerated).
* Use **requestAnimationFrame** for smoothness.
* Batch DOM updates.

**Detailed Design:**

```js
function move(el) {
  requestAnimationFrame(() => {
    el.style.transform = "translateX(100px)"; // no layout calc
  });
}
```

**Performance Notes:**

* `transform/opacity` changes = compositor-only → smooth.
* `top/left/height` = layout recalculation → expensive.

**Pitfalls:**

* Animating layout properties (e.g., `height`) = stutters.
* CSS transitions may still trigger layout if not careful.

**Real-world Example:**

* Facebook’s like button animations.
* Twitter hearts “pop” with transform scaling.

**Follow-ups:**

* Why `transform` faster? → GPU compositing, no layout pass.
* How to profile reflows? → Chrome DevTools Performance tab.
* Why batch updates? → Avoid multiple style recalcs.

---

## 8. Splitting State (Local vs Server)

**Problem:**

* Everything in Redux/global state → bloat, over-rendering.
* Local UI (modal open) doesn’t belong in global store.

**Solution:**

* Split **UI state** (local, ephemeral) vs **Server state** (API data).
* Tools: React Query/SWR for server state, `useState`/`useReducer` for local.

**Detailed Design:**

```js
// Server state
const { data: user } = useQuery("user", fetchUser);

// Local state
const [isModalOpen, setModalOpen] = useState(false);
```

**Performance Notes:**

* Avoids over-fetching, reduces global re-renders.
* Server state libs handle caching, retries, background sync.

**Pitfalls:**

* Mixing UI + server state in Redux leads to complexity.
* Misconfigured caches → stale data bugs.

**Real-world Example:**

* Netflix uses Relay/Falcor for server state, React local state for UI.

**Follow-ups:**

* Why not Redux for server state? → Harder cache invalidation, reinventing React Query.
* When to lift state? → Only if multiple components depend.
* Global UI state (theme, auth)? → Use Context, but keep minimal.

---

# 📘 Key Takeaways – Batch #13 (Super Expanded)

* **Virtualization** → render 30 nodes instead of 10k.
* **Memoization** → optimize renders, avoid prop churn.
* **Concurrent React** → urgent vs non-urgent priorities.
* **Suspense** → async rendering without waterfalls.
* **State Machines** → explicit flows, avoid invalid combos.
* **Signals** → fine-grained updates, future of React.
* **DOM Perf** → prefer transform/opacity, batch updates.
* **State split** → server (React Query) vs local (useState).

---

# 📑 Quick Reference (Batch #13)

* **Lists:** react-window/virtualized.
* **Memoization:** React.memo, useMemo, useCallback.
* **Concurrent:** startTransition, useTransition.
* **Suspense:** async fallback handling.
* **FSM:** XState for complex flows.
* **Signals:** reactive primitives (future).
* **Perf:** transform > layout properties.
* **State:** split UI vs server state.