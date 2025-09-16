## 🔹 Common Errors in **JavaScript**

These stem from quirks in the language, type coercion, async behavior, and scoping.

1. **ReferenceError**

   * Using a variable before it is declared (`let`/`const` in the Temporal Dead Zone).
   * Example:

     ```js
     console.log(a); // ReferenceError
     let a = 10;
     ```

2. **TypeError**

   * Calling something that’s not a function, or accessing properties of `null`/`undefined`.
   * Example:

     ```js
     const obj = null;
     console.log(obj.key); // TypeError: Cannot read property 'key' of null
     ```

3. **RangeError**

   * When numbers go beyond limits or recursion gets too deep.
   * Example:

     ```js
     function recurse() { recurse(); }
     recurse(); // RangeError: Maximum call stack size exceeded
     ```

4. **SyntaxError**

   * Invalid JavaScript syntax.
   * Example:

     ```js
     JSON.parse("{name:'John'}"); // SyntaxError (invalid JSON)
     ```

5. **NaN / Coercion pitfalls**

   * Type coercion creates unexpected results.
   * Example:

     ```js
     '5' - 2; // 3
     '5' + 2; // "52"
     ```

6. **Async / Await Mistakes**

   * Forgetting to `await` or misusing promises.
   * Example:

     ```js
     async function fetchData() {
       const data = fetch('/api'); // Returns Promise, not data
     }
     ```

7. **Equality Confusion**

   * `==` vs `===`
   * Example:

     ```js
     0 == false;  // true
     0 === false; // false
     ```

---

## 🔹 Common Errors in **React**

These are usually related to state, props, lifecycle, and rendering.

1. **Invalid Hook Call**

   * Using hooks inside loops, conditions, or nested functions.
   * Example:

     ```js
     if (someCondition) {
       const [state, setState] = useState(0); // ❌ Invalid hook call
     }
     ```

2. **State Updates Not Immediate**

   * Assuming `setState` updates synchronously.
   * Example:

     ```js
     const [count, setCount] = useState(0);
     setCount(count + 1);
     console.log(count); // Still old value!
     ```

3. **Mutating State Directly**

   * Leads to stale renders or bugs.
   * Example:

     ```js
     const [arr, setArr] = useState([1, 2]);
     arr.push(3); // ❌ mutates state
     setArr(arr);
     ```

4. **Key Prop Errors**

   * Missing/duplicate `key` in lists → bad reconciliation.
   * Example:

     ```jsx
     {items.map((item) => <li>{item}</li>)} // ❌ Warning: Each child should have a unique "key"
     ```

5. **Props vs State Confusion**

   * Trying to mutate props directly.
   * Example:

     ```jsx
     function Child({ value }) {
       value = 5; // ❌ React props are read-only
     }
     ```

6. **Too Many Re-renders**

   * Often from calling `setState` in the render body or in useEffect without dependencies.
   * Example:

     ```js
     useEffect(() => {
       setState(x + 1);
     }); // ❌ no dependency array → infinite loop
     ```

7. **Uncontrolled vs Controlled Components**

   * Switching between the two unintentionally.
   * Example:

     ```jsx
     <input value={undefined} onChange={...} /> // React warning
     ```

8. **Stale Closures in Hooks**

   * Using outdated state inside `useEffect` or callbacks.
   * Example:

     ```js
     useEffect(() => {
       setTimeout(() => console.log(count), 1000);
     }, []); // Will always log initial count
     ```

9. **Memory Leaks**

   * Not cleaning up side effects.
   * Example:

     ```js
     useEffect(() => {
       const id = setInterval(...);
       // ❌ forgot to clear interval
     }, []);
     ```

10. **React.StrictMode Double Render Surprise**

    * In dev mode, effects may run twice (to detect side effects).
    * Leads to confusion if you don’t account for it.

---

✅ **Summary for interview use:**

* **JS errors**: `ReferenceError`, `TypeError`, async/promise issues, type coercion.
* **React errors**: invalid hook usage, state mutation, infinite re-renders, missing keys, controlled/uncontrolled mismatch, stale closures, memory leaks.

---

# JavaScript & React — Interview Cheat Sheet

A compact, printable cheat sheet for common errors, quick fixes, and patterns you should mention in interviews. Keep this open while practicing — each item includes a short example, the problem, and the fix.

---

## Quick Reference (at-a-glance)

* **JS**: ReferenceError, TypeError, SyntaxError, RangeError, NaN/coercion, async mistakes, equality pitfalls.
* **React**: Invalid Hook Call, mutating state, missing `key`, stale closures, uncontrolled/controlled inputs, infinite re-renders, memory leaks, improper cleanup.

---

# JavaScript

## 1) ReferenceError — Temporal Dead Zone (TDZ)

**Problem:** Accessing `let`/`const` before declaration.

```js
console.log(a); // ReferenceError
let a = 10;
```

**Fix:** Declare before use, or use `var` only when appropriate (avoid `var` generally).

---

## 2) TypeError — calling or accessing `null`/`undefined`

**Problem:** Accessing properties on `null` or calling non-functions.

```js
const obj = null;
console.log(obj.key); // TypeError
```

**Fix:** Null-checks or optional chaining:

```js
console.log(obj?.key);
```

---

## 3) SyntaxError

**Problem:** Bad JSON or malformed syntax.

```js
JSON.parse("{name:'John'}"); // SyntaxError
```

**Fix:** Use valid JSON or correct syntax.

---

## 4) RangeError

**Problem:** Too-deep recursion / numeric limits.

```js
function f() { f(); }
f(); // RangeError: Maximum call stack size exceeded
```

**Fix:** Avoid unbounded recursion; use iteration or tail recursion when supported.

---

## 5) NaN & Coercion Pitfalls

**Problem:** Unexpected results due to coercion.

```js
'5' - 2; // 3
'5' + 2; // "52"
```

**Fix:** Coerce explicitly when needed: `Number('5') + 2` or use `===`.

---

## 6) Async / Promise Mistakes

**Problem 1:** Forgetting `await` → a Promise instead of value.

```js
async function fetchData() {
  const data = fetch('/api'); // WRONG — data is a Promise
}
```

**Fix:** `const data = await fetch('/api');`

**Problem 2:** Unhandled promise rejections — always `.catch` or try/catch.

```js
async function go() {
  try {
    await risky();
  } catch (e) {
    console.error(e);
  }
}
```

---

## 7) Equality Confusion

**Problem:** `==` performs coercion.

```js
0 == false; // true
0 === false; // false
```

**Fix:** Use `===` unless you explicitly want coercion.

---

# React

## 1) Invalid Hook Call

**Problem:** Calling hooks conditionally / inside loops or nested functions.

```js
if (cond) {
  const [s, setS] = useState(0); // INVALID
}
```

**Fix:** Always call hooks at the top level, in the same order.

---

## 2) State Updates are Asynchronous

**Problem:** Reading state right after `setState` expecting new value.

```js
setCount(count + 1);
console.log(count); // still old
```

**Fix:** Use functional updater or `useEffect` to react to updates:

```js
setCount(c => c + 1);
useEffect(() => console.log(count), [count]);
```

---

## 3) Mutating State Directly

**Problem:** Direct mutation prevents React from detecting changes.

```js
const [arr, setArr] = useState([1,2]);
arr.push(3);
setArr(arr); // BUG: mutated existing array
```

**Fix:** Create new references:

```js
setArr(prev => [...prev, 3]);
```

---

## 4) Missing / Wrong `key` in Lists

**Problem:** Using index or duplicate keys causes reconciliation issues.

```jsx
{items.map((item, i) => <li key={i}>{item.name}</li>)} // fragile
```

**Fix:** Use stable IDs: `key={item.id}`. Avoid index unless list is static.

---

## 5) Too Many Re-renders / Infinite Loops

**Problem:** Calling `setState` unconditionally in render or `useEffect` without correct deps.

```js
useEffect(() => {
  setX(x+1);
}); // runs every render => infinite
```

**Fix:** Provide dependency array or conditionally update:

```js
useEffect(() => {
  setX(prev => prev + 1);
}, []);
```

---

## 6) Controlled vs Uncontrolled Inputs

**Problem:** Switching between controlled (value prop) and uncontrolled (defaultValue) causes warnings.

```jsx
<input value={undefined} onChange={...} /> // warning
```

**Fix:** Ensure value is never `undefined` — use `''` or conditionally render controlled vs uncontrolled consistently.

---

## 7) Stale Closures

**Problem:** Callback or effect captures old state.

```js
useEffect(() => {
  const id = setTimeout(() => console.log(count), 1000);
}, []); // logs initial count always
```

**Fix:** Add `count` to deps or use refs/functional updates:

```js
useEffect(() => {
  const id = setTimeout(() => console.log(count), 1000);
}, [count]);
```

Or:

```js
const countRef = useRef(count);
useEffect(() => { countRef.current = count; }, [count]);
// use countRef.current in callbacks
```

---

## 8) Memory Leaks / Missing Cleanup

**Problem:** Not clearing timers, subscriptions, or event listeners.

```js
useEffect(() => {
  const id = setInterval(...);
  // no cleanup
}, []);
```

**Fix:** Return cleanup in `useEffect`:

```js
useEffect(() => {
  const id = setInterval(...);
  return () => clearInterval(id);
}, []);
```

---

## 9) React.StrictMode Double Effects Surprise

**Note:** In development `StrictMode` intentionally mounts, unmounts and mounts components twice (for detecting side-effects). Mention this in interviews and ensure effects & init code are idempotent.

---

# Debugging Checklist (fast)

* Reproduce minimal example.
* Console errors (stack traces) → line numbers.
* Use `console.log` / `debugger` / browser DevTools.
* For React: React DevTools to inspect props/state and hook state.
* For async: inspect network tab, add `.catch` to promises.
* Check keys when lists render incorrectly.
* Check component render counts (why re-rendering?)

---

# One-liners & Best Practices to Mention in Interviews

* Use `const` by default, `let` if reassigning, avoid `var`.
* Prefer `===`/`!==`.
* Prefer functional state updates: `setX(x => x + 1)`.
* Use `useEffect` cleanup for subscriptions/timers.
* Avoid inline functions passed to many children (use `useCallback` when necessary).
* Avoid deep object mutations — use immutability helpers or produce (Immer).

---

# Example Mini-Fix: Infinite re-render caused by derived state in render

**Bad**:

```js
function Comp({ items }) {
  const filtered = items.filter(i => i.active);
  const [count, setCount] = useState(filtered.length);
  // This setState in render causes issues
  if (count !== filtered.length) setCount(filtered.length);
  return ...;
}
```

**Good**: derive directly or useEffect safely:

```js
function Comp({ items }) {
  const filtered = useMemo(() => items.filter(i => i.active), [items]);
  const [count, setCount] = useState(() => filtered.length);
  useEffect(() => { setCount(filtered.length); }, [filtered]);
  return ...;
}
```

---

# Final quick notes for interviews

* When explaining bugs, state the symptom, root cause, and *one concrete fix*.
* Mention tradeoffs when proposing fixes (performance, memory, readability).
* Show awareness of dev vs prod differences (e.g., StrictMode double-invocation).

---