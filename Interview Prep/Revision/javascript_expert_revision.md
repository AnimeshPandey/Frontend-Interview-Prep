# 🟦 JavaScript Expert-Level Revision Handbook

## 📑 Table of Contents

- [Closures, Scope, Hoisting, `this`, Prototypes, Event Loop](#-closures-scope-hoisting-this-prototypes-event-loop)
- [Asynchronous JavaScript](#-asynchronous-javascript)
- [Advanced Objects & Memory](#-advanced-objects--memory)
- [Advanced Functions & ES6+ Features](#-advanced-functions--es6-features)
- [Browser & DOM Fundamentals](#-browser--dom-fundamentals)
- [Performance & Optimization](#-performance--optimization)
- [Advanced Types & Equality](#-advanced-types--equality)
- [Error Handling & Debugging](#-error-handling--debugging)
- [Concurrency & Parallelism](#-concurrency--parallelism)
- [ESNext & Modern Features](#-esnext--modern-features)
- [Patterns & Architecture in JavaScript](#-patterns--architecture-in-javascript)

---

# 🟦 Part 1 

This section covers **Closures, Scope & Hoisting, `this`, Prototypes, and the Event Loop** — the foundation of almost every frontend interview.

---

## 1. 🔒 Closures

**Definition:**
A closure is a function that retains access to its **lexical environment** (scope chain) even after the outer function has finished executing.

### ✅ Key Points

* JavaScript uses **lexical scoping**, not dynamic scoping.
* Closures are formed naturally whenever a function is defined inside another.
* Enable **data privacy, currying, memoization, event handlers**.

### ⚠️ Gotchas

* **Loop with `var`:**

  ```js
  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
  }
  // 3, 3, 3 (same var captured)
  ```

  Fix with `let` (block-scoped) or IIFE.

* **Memory leaks:**
  Closures capturing large objects (like DOM nodes) can prevent garbage collection.

* **Debugging pain:**
  DevTools may show “unexpected” retained variables due to closures.

### 💡 Real-world Bug

```js
function registerHandlers(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].onclick = () => console.log("Clicked:", i);
  }
}
// All handlers print last index!
```

### 🎯 Interview One-Liner

> “A closure is a function with its lexical scope bundled in. It enables encapsulation and callbacks but can cause bugs with loops (`var`) and memory leaks if you capture more than needed.”

---

## 2. 📦 Scope & Hoisting

**Definition:**
Scope defines where variables are accessible. **Hoisting** means declarations are moved to the top of their scope during compilation.

### ✅ Key Points

* `var` → **function-scoped**, hoisted & initialized as `undefined`.
* `let`/`const` → **block-scoped**, hoisted but uninitialized (**Temporal Dead Zone, TDZ**).
* Function declarations → fully hoisted with body.
* Function expressions → behave like variables.

### ⚠️ Gotchas

* **TDZ Example:**

  ```js
  console.log(x); // ReferenceError
  let x = 10;
  ```
* **Function in block scope:**

  ```js
  if (true) {
    function foo() {}
  }
  foo(); // Works differently in strict vs sloppy mode
  ```
* **Shadowing:**

  ```js
  let x = 1;
  {
    let x = 2;
    console.log(x); // 2 (outer x hidden)
  }
  ```

### 🔄 Quick Table

| Keyword  | Scope    | Hoisting        | Default Init |
| -------- | -------- | --------------- | ------------ |
| `var`    | Function | Yes             | `undefined`  |
| `let`    | Block    | Yes             | TDZ (error)  |
| `const`  | Block    | Yes             | TDZ (error)  |
| Function | Function | Yes (with body) | -            |

### 🎯 Interview One-Liner

> “Declarations are hoisted. `var` hoists with `undefined`; `let`/`const` hoist into the TDZ; functions hoist with their body. That’s why accessing a `let` before declaration throws, while `var` gives undefined.”

---

## 3. 🧭 The `this` Keyword

**Definition:**
`this` is determined by the **call site**, not the definition.

### ✅ Rules of `this` Binding (Precedence)

1. **new binding** → `new Foo()`
2. **explicit binding** → `call`, `apply`, `bind`
3. **implicit binding** → `obj.method()`
4. **default binding** → global (window) or `undefined` (strict mode)

### ⚠️ Gotchas

* **Losing context:**

  ```js
  const obj = { x: 10, f() { console.log(this.x); } };
  setTimeout(obj.f, 0); // undefined (lost `this`)
  ```
* **Arrow functions:** capture lexical `this`, cannot be rebound.
* **bind + call combo:**

  ```js
  function f() { console.log(this.x); }
  const bound = f.bind({ x: 1 });
  bound.call({ x: 2 }); // still 1 (bind wins)
  ```

### 🔄 Quick Table

| Call Type              | `this` Value  |
| ---------------------- | ------------- |
| Global fn (non-strict) | `window`      |
| Global fn (strict)     | `undefined`   |
| Method call `obj.fn()` | `obj`         |
| `new Fn()`             | New instance  |
| Bound fn               | Bound object  |
| Arrow fn               | Lexical scope |

### 🎯 Interview One-Liner

> “`this` is set at call time, not definition. Precedence is: `new` > explicit (`bind`) > implicit (object call) > default (global/undefined). Arrow functions inherit `this` lexically.”

---

## 4. 🧩 Prototypes & Inheritance

**Definition:**
Objects inherit properties via the **prototype chain** (`[[Prototype]]`).

### ✅ Key Points

* `Object.create(proto)` → creates object with `proto` as prototype.
* Functions have a `.prototype` used when called with `new`.
* Property lookup climbs prototype chain.

### ⚠️ Gotchas

* Modifying `.prototype` after instances exist → they won’t see changes.
* Shadowing: own property hides prototype property.
* Deep prototype chains slow lookups.

### Code Example

```js
function Animal(name) { this.name = name; }
Animal.prototype.speak = function() { console.log(this.name + " makes noise"); }

const dog = new Animal("Rex");
dog.speak(); // "Rex makes noise"

console.log(dog.__proto__ === Animal.prototype); // true
```

### 🎯 Interview One-Liner

> “Objects inherit via prototypes. If a property isn’t found, JS looks up the chain. Constructors set their `.prototype` as the prototype of new instances.”

---

## 5. ⏳ Event Loop & Concurrency

**Definition:**
The event loop coordinates execution: it runs the **call stack**, then processes the **task queues** (macrotasks and microtasks).

### ✅ Key Points

* **Macrotasks:** setTimeout, setInterval, I/O.
* **Microtasks:** Promises, MutationObserver, queueMicrotask.
* After each macrotask, the loop drains **all microtasks**.

### ⚠️ Gotchas

* `setTimeout(fn, 0)` is **not immediate** — runs after microtasks.
* `Promise.then` always executes before timeouts.
* In Node.js, `process.nextTick` runs before microtasks.
* Nested promises keep chaining microtasks → possible starvation.

### Code Example

```js
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");

// Output: A, D, C, B
```

### 🔄 Execution Order

1. Run **call stack**
2. Drain **microtask queue**
3. Run next **macrotask**
4. Repeat

### 🎯 Interview One-Liner

> “The event loop runs stack → microtasks → macrotasks. That’s why `Promise.then` callbacks run before `setTimeout(fn, 0)`.”

---


# 🟦 Asynchronous JavaScript

---

## 1. ⏱️ Timers (`setTimeout`, `setInterval`)

**Definition:**
`setTimeout(fn, delay)` schedules a function once after delay; `setInterval(fn, delay)` repeats at intervals.

### ✅ Key Points

* Actual delay is **minimum** — not guaranteed exact.
* Nested timers can be throttled by browsers (clamp to ≥4ms after many calls, 1000ms when tab inactive).
* `clearTimeout` / `clearInterval` cancel scheduled tasks.

### ⚠️ Gotchas

* `setTimeout(fn, 0)` runs **after all microtasks** (not immediate).
* Long-running tasks block timers (since JS is single-threaded).
* `setInterval` can drift → better to use recursive `setTimeout` for accuracy.

### Example

```js
setTimeout(() => console.log("timeout"), 0);
Promise.resolve().then(() => console.log("promise"));
// Output: promise, timeout
```

### 🎯 Interview One-Liner

> “Timers schedule macrotasks. `setTimeout(fn, 0)` isn’t immediate — it runs after microtasks. For precise intervals, recursive `setTimeout` is safer than `setInterval`.”

---

## 2. 🔗 Promises

**Definition:**
A Promise is an object representing the eventual result of an async operation.

### ✅ Key Points

* States: **pending → fulfilled** (resolved) / **rejected**.
* `.then` and `.catch` return new promises → enable chaining.
* Handlers are always async (enqueued as **microtasks**).

### ⚠️ Gotchas

* **Unhandled rejection:**

  ```js
  Promise.reject("err");
  // Without .catch → unhandled rejection warning
  ```
* `.then` handlers always async:

  ```js
  Promise.resolve().then(() => console.log("then"));
  console.log("sync");
  // sync, then
  ```
* Multiple `.then` on the same promise all execute independently.
* Returning a promise inside `.then` flattens it (automatic chaining).

### Example

```js
Promise.resolve(1)
  .then(x => x + 1)
  .then(x => Promise.resolve(x + 1))
  .then(console.log); // 3
```

### 🎯 Interview One-Liner

> “Promises represent async results. `.then` handlers are always microtasks, so they run before timers. Returning a promise in `.then` flattens the chain.”

---

## 3. ⚡ `async` / `await`

**Definition:**
Syntactic sugar over promises. `async` functions return promises; `await` pauses until promise settles.

### ✅ Key Points

* `await` only works inside `async` functions (or top-level in modules).
* Execution is split → code after `await` runs in a **microtask**.
* Parallelize with `Promise.all` to avoid serial awaits.

### ⚠️ Gotchas

* `await` inside loops → serial execution (slow).

  ```js
  for (const u of users) {
    await fetch(u); // slow
  }
  await Promise.all(users.map(u => fetch(u))); // fast
  ```
* `try/catch` is needed — `await` throws on rejection.
* Mixing `await` with non-promises just wraps in `Promise.resolve`.

### Example

```js
async function f() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}
f();
console.log("C");

// Output: A, C, B
```

### 🎯 Interview One-Liner

> “`async/await` is syntax sugar over promises. `await` pauses execution and resumes in a microtask. Using it inside loops serializes calls — use `Promise.all` for parallelism.”

---

## 4. 🎛️ Generators & Async Generators

**Definition:**
Generators (`function*`) are functions that can pause and resume using `yield`. Async generators use `for await...of`.

### ✅ Key Points

* Generators return an **iterator** with `.next()`.
* Useful for building custom async workflows (before promises).
* `co` library + generators → pre-`async/await` async management.

### ⚠️ Gotchas

* Generators don’t manage async by themselves; must yield promises and have a runner.
* Async generators (`async function*`) combine promises with iteration.

### Example

```js
function* gen() {
  yield 1;
  yield 2;
}
const g = gen();
console.log(g.next()); // { value: 1, done: false }
```

### 🎯 Interview One-Liner

> “Generators pause with `yield` and resume later. They’re useful for async flow control, but in modern JS, `async/await` replaces most generator use cases.”

---

## 5. ⏳ Debounce & Throttle

**Definition:**
Patterns for rate-limiting function execution.

* **Debounce:** wait until no calls happen for X ms. (Good for search input).
* **Throttle:** allow one call per X ms. (Good for scroll/resize).

### Example

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, delay) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      fn(...args);
      last = now;
    }
  };
}
```

### 🎯 Interview One-Liner

> “Debounce delays execution until events stop; throttle limits execution to once per interval. Debounce is for inputs, throttle for continuous events like scroll.”

---

## 6. 🎨 requestAnimationFrame (rAF)

**Definition:**
`requestAnimationFrame(callback)` schedules a callback before the next repaint (\~16.6ms at 60fps).

### ✅ Key Points

* More efficient than `setTimeout` for animations.
* Pauses when tab is inactive (better for performance).
* Ideal for smooth visual updates.

### ⚠️ Gotchas

* Doesn’t guarantee 60fps — depends on device refresh rate.
* Can be canceled with `cancelAnimationFrame(id)`.

### Example

```js
function animate() {
  // draw frame
  requestAnimationFrame(animate);
}
animate();
```

### 🎯 Interview One-Liner

> “`requestAnimationFrame` runs a callback before the next repaint. It’s optimized for animations and pauses in inactive tabs.”

---

## 7. 🧵 Web Workers

**Definition:**
Web Workers run JS in background threads, off the main event loop.

### ✅ Key Points

* Communicate via `postMessage` (structured clone).
* No DOM access inside workers.
* Good for CPU-heavy tasks.

### ⚠️ Gotchas

* Serialization overhead in `postMessage`.
* SharedArrayBuffer needed for true shared memory.
* Not supported in all contexts (e.g., some cross-origin iframes).

### Example

```js
// worker.js
self.onmessage = e => {
  self.postMessage(e.data * 2);
};

// main.js
const worker = new Worker("worker.js");
worker.onmessage = e => console.log("Result:", e.data);
worker.postMessage(10); // Result: 20
```

### 🎯 Interview One-Liner

> “Web Workers move heavy computation off the main thread. They communicate via messages, but can’t access the DOM.”

---


# 🟦 Advanced Objects & Memory

---

## 1. 🧹 Garbage Collection (GC)

**Definition:**
JavaScript uses **automatic garbage collection** — freeing memory for objects that are no longer reachable.

### ✅ Key Points

* **Reachability** = if an object can be accessed via a reference chain from a root (e.g. `window` or stack).
* Common GC strategy: **Mark & Sweep**.
* Circular references are fine if unreachable from root.

### ⚠️ Gotchas

* **Accidental leaks:**

  * Global variables (`window.leak = obj`).
  * Closures holding large structures.
  * Detached DOM nodes retained in memory.
* **Timers / event listeners:** If not cleared, they keep references alive.

### Example

```js
let el = document.getElementById("btn");
el.onclick = () => console.log("clicked");
// If `el` removed from DOM but reference stays in closure → leak
```

### 🎯 Interview One-Liner

> “GC frees unreachable memory. Leaks usually happen via globals, closures, or dangling DOM references, not because of circular references.”

---

## 2. 🗝️ Symbols

**Definition:**
`Symbol()` creates a **unique primitive identifier**.

### ✅ Key Points

* Never equal to another symbol, even with same description.
* Used for **non-colliding property keys**.
* `Symbol.for(key)` reuses a global registry symbol.
* Built-in symbols customize behavior (`Symbol.iterator`, `Symbol.toStringTag`).

### ⚠️ Gotchas

* `for...in` and `Object.keys` ignore symbols. Must use `Object.getOwnPropertySymbols`.
* JSON.stringify ignores symbols.

### Example

```js
const id = Symbol("id");
const obj = { [id]: 123 };
console.log(Object.keys(obj)); // []
console.log(Object.getOwnPropertySymbols(obj)); // [Symbol(id)]
```

### 🎯 Interview One-Liner

> “Symbols are unique identifiers, often used as hidden object keys or to customize built-in behaviors. They’re ignored by JSON and normal enumeration.”

---

## 3. 🗄️ WeakMap & WeakSet

**Definition:**
Weak collections hold **weak references** to objects — allowing GC when there are no other references.

### ✅ Key Points

* **WeakMap:** keys must be objects, values arbitrary.
* **WeakSet:** stores objects, prevents duplicates.
* Entries are **not enumerable** (no `size`, no iteration).

### ⚠️ Gotchas

* Can’t inspect contents → intentionally opaque.
* Useful for **private data** or **DOM element caching**.

### Example

```js
let wm = new WeakMap();
let obj = {};
wm.set(obj, "secret");

console.log(wm.get(obj)); // "secret"
obj = null; // entry auto-removed when GC runs
```

### 🎯 Interview One-Liner

> “WeakMap/WeakSet hold weak references — objects can be GC’d even if they’re keys. They’re ideal for caching and private data without leaks.”

---

## 4. 📝 Property Descriptors

**Definition:**
Every property has a descriptor object with attributes:

* `value`
* `writable`
* `enumerable`
* `configurable`
  (or `get`/`set` for accessors).

### ✅ Key Points

* `Object.defineProperty` controls property behavior.
* `enumerable` controls visibility in loops.
* `configurable` prevents deletion or redefinition.
* Non-writable prevents assignment.

### ⚠️ Gotchas

* Default attributes: `false` if defined via `defineProperty`.
* Freezing (`Object.freeze`) sets all `writable=false, configurable=false`.

### Example

```js
const obj = {};
Object.defineProperty(obj, "x", {
  value: 42,
  writable: false,
  enumerable: true,
  configurable: false
});
obj.x = 100; // ignored in strict mode → TypeError
```

### 🎯 Interview One-Liner

> “Property descriptors let you control attributes like writable, enumerable, configurable. They’re the foundation of `Object.freeze` and getters/setters.”

---

## 5. 🕵️ Proxy & Reflect

**Definition:**
`Proxy` allows you to intercept operations on objects. `Reflect` provides low-level methods that mirror default behavior.

### ✅ Key Points

* Handlers (traps): `get`, `set`, `has`, `deleteProperty`, `apply`, `construct`.
* `Reflect` ensures correct forwarding (avoids reinventing default behavior).
* Used for logging, validation, virtualization, reactive systems (Vue3 uses Proxy).

### ⚠️ Gotchas

* Proxies can slow performance if overused.
* Can break identity expectations (`obj === proxy` is false).
* Some operations (like private fields) are not trap-able.

### Example

```js
const obj = { a: 1 };
const proxy = new Proxy(obj, {
  get(target, prop) {
    console.log("get", prop);
    return target[prop];
  }
});

console.log(proxy.a); // logs: get a → 1
```

### 🎯 Interview One-Liner

> “Proxies wrap objects with traps for operations like get/set. `Reflect` provides the default behavior to forward calls. Proxies power modern reactivity systems.”

---

## 6. 🧊 Immutability Tricks

**Definition:**
JavaScript objects are mutable by default. Immutability ensures predictable state (important in React/Redux).

### ✅ Key Points

* `Object.freeze` → prevents modifications.
* `Object.seal` → prevents adding/removing props, but can update values.
* `Object.preventExtensions` → prevents new props, but allows edits/deletes.
* Deep immutability requires recursion or libraries (`immer`).

### ⚠️ Gotchas

* Freeze is **shallow** — nested objects still mutable.
* Frozen objects are still extensible by changing prototype unless explicitly blocked.

### Example

```js
const obj = Object.freeze({ x: 1, y: { z: 2 } });
obj.x = 10; // ignored
obj.y.z = 20; // allowed (nested not frozen)
```

### 🎯 Interview One-Liner

> “Objects are mutable by default. `freeze`/`seal`/`preventExtensions` restrict changes, but only shallowly. For deep immutability, you need recursion or libraries like Immer.”

---


# 🟦 Advanced Functions & ES6+ Features

---

## 1. 🏗️ Higher-Order Functions (HOFs)

**Definition:**
Functions that either **take functions as arguments** or **return functions**.

### ✅ Key Points

* Foundation of functional programming.
* Enable: `map`, `filter`, `reduce`, decorators, middleware.
* Encourage immutability + composition.

### ⚠️ Gotchas

* Passing non-functions → runtime errors.
* Excessive nesting → callback hell (before Promises/async).

### Example

```js
function withLogging(fn) {
  return (...args) => {
    console.log("Calling with", args);
    return fn(...args);
  };
}
const sum = (a, b) => a + b;
const loggedSum = withLogging(sum);
loggedSum(2, 3); // logs args → 5
```

### 🎯 Interview One-Liner

> “A higher-order function either takes functions as arguments or returns them. They enable abstractions like map, filter, and middleware.”

---

## 2. 🎨 Currying & Partial Application

**Definition:**

* **Currying:** Transforming a function `f(a, b, c)` into `f(a)(b)(c)`.
* **Partial application:** Pre-filling some arguments, returning a new function.

### ✅ Key Points

* Used in FP libraries like Lodash, Ramda.
* Helps reusability and function composition.

### ⚠️ Gotchas

* Over-currying → unreadable code.
* Currying ≠ partial application (though related).

### Example

```js
const currySum = a => b => c => a + b + c;
currySum(1)(2)(3); // 6

function partial(fn, ...fixed) {
  return (...rest) => fn(...fixed, ...rest);
}
const add = (a, b) => a + b;
const add5 = partial(add, 5);
add5(10); // 15
```

### 🎯 Interview One-Liner

> “Currying breaks a function into unary steps (`f(a)(b)(c)`), while partial application pre-fills arguments. Both improve reusability.”

---

## 3. 📦 Modules (ESM vs CommonJS)

**Definition:**
Modules encapsulate code into reusable files.

### ✅ Key Points

* **CommonJS (CJS):** Node.js legacy (`require`, `module.exports`).
* **ES Modules (ESM):** Modern JS (`import`, `export`).
* ESM is **statically analyzable** → enables tree-shaking.
* Default exports vs named exports.

### ⚠️ Gotchas

* Mixing CJS and ESM leads to quirks (`default` interop).
* ESM is always strict mode.
* Imports are hoisted (run before any other code).

### Example

```js
// utils.js
export function add(a, b) { return a + b; }
export default function subtract(a, b) { return a - b; }

// main.js
import subtract, { add } from "./utils.js";
```

### 🎯 Interview One-Liner

> “CommonJS uses require, ES Modules use import/export. ESM is statically analyzable and supports tree-shaking, which is why modern bundlers prefer it.”

---

## 4. ✨ Destructuring & Spread/Rest

**Definition:**
Syntax for unpacking values into variables.

### ✅ Key Points

* **Array destructuring:** `[a, b] = arr`.
* **Object destructuring:** `{ x, y } = obj`.
* **Rest:** gather leftovers.
* **Spread:** expand arrays/objects.

### ⚠️ Gotchas

* Nested destructuring → `undefined` if property missing.
* Default values only apply when property is `undefined`, not `null`.

### Example

```js
const [a, b = 5] = [1];
console.log(a, b); // 1, 5

const { x, y: z } = { x: 10, y: 20 };
console.log(z); // 20

const arr = [1, 2];
const newArr = [...arr, 3]; // [1,2,3]
```

### 🎯 Interview One-Liner

> “Destructuring unpacks arrays/objects, rest gathers leftovers, spread expands. Defaults only trigger on `undefined`, not `null`.”

---

## 5. 🧾 Default, Rest, and Named Parameters

### ✅ Key Points

* **Default params:**

  ```js
  function f(x = 10) { return x; }
  f(); // 10
  ```
* **Rest params:** collects extra args → array.
* **Named params:** simulated with object destructuring.

### ⚠️ Gotchas

* Default params are evaluated at call time.
* Rest params differ from `arguments` (rest is real array, `arguments` is array-like).

### 🎯 Interview One-Liner

> “Default params evaluate at call time, rest params gather extras as a real array, and named params are simulated via object destructuring.”

---

## 6. 🔄 Iterators & Iterables

**Definition:**
An **iterator** is an object with `.next()`. An **iterable** has `[Symbol.iterator]`.

### ✅ Key Points

* Iterables: arrays, strings, maps, sets.
* `for...of` loops over iterables (not plain objects).
* Custom iterables by implementing `[Symbol.iterator]`.

### ⚠️ Gotchas

* Plain objects aren’t iterable unless you define `[Symbol.iterator]`.
* Spread `...obj` works only if iterable defined.

### Example

```js
const iterable = {
  *[Symbol.iterator]() {
    yield 1; yield 2; yield 3;
  }
};
for (const x of iterable) console.log(x);
```

### 🎯 Interview One-Liner

> “Iterables implement `[Symbol.iterator]`, which returns an iterator with `.next()`. That’s why arrays, maps, and sets work with `for...of` and spread.”

---

## 7. 📚 Map, Set, WeakMap, WeakSet

**Definition:**
Specialized collection types introduced in ES6.

### ✅ Key Points

* **Map:** key-value pairs, keys can be any type.
* **Set:** unique values.
* **WeakMap/WeakSet:** only object keys, weak references (non-enumerable).

### ⚠️ Gotchas

* `NaN` is considered equal to itself in Set.
* Map preserves insertion order.
* WeakMap doesn’t prevent GC.

### Example

```js
const set = new Set([1, 2, 2, 3]);
console.log(set.size); // 3

const map = new Map();
map.set("a", 1).set({}, 2);
```

### 🎯 Interview One-Liner

> “Map and Set are collections with insertion order preserved. WeakMap/WeakSet hold weak object references, useful for caching without memory leaks.”

---

## 8. 🧭 ES6+ Extras (that interviewers test)

### 🔑 Template Literals

```js
const name = "Alex";
console.log(`Hello ${name}`);
```

### 🔑 Tagged Templates

```js
function tag(strings, ...values) {
  return strings[0] + values.map(v => v.toUpperCase()).join("");
}
console.log(tag`Hi ${"alex"} and ${"bob"}`); // "Hi ALEXandBOB"
```

### 🔑 Optional Chaining & Nullish Coalescing

```js
obj?.prop?.nested; // avoids TypeError
val ?? "default";  // only default if null/undefined
```

### 🎯 Interview One-Liner

> “Modern JS adds quality-of-life features like template literals, optional chaining (`?.`), and nullish coalescing (`??`). These avoid common boilerplate and bugs.”

---


# 🟦 Browser & DOM Fundamentals

---

## 1. 🎯 Event Delegation

**Definition:**
Attaching a **single event listener on a parent** to handle events for multiple child elements via **event bubbling**.

### ✅ Key Points

* Uses **event propagation** (capture → target → bubble).
* Reduces memory usage (no per-child listeners).
* Works well for dynamic DOM (children added later).

### ⚠️ Gotchas

* `event.target` vs `event.currentTarget`:

  * `target` = actual clicked element.
  * `currentTarget` = element with listener.
* Some events **don’t bubble** (e.g., `blur`, `focus`).

### Example

```js
document.getElementById("list").addEventListener("click", e => {
  if (e.target.tagName === "LI") {
    console.log("Clicked item:", e.target.textContent);
  }
});
```

### 🎯 Interview One-Liner

> “Event delegation attaches a single listener on a parent and relies on bubbling. It’s efficient for many/dynamic child elements.”

---

## 2. 🖼️ Reflow vs Repaint (Performance)

**Definition:**

* **Reflow (layout):** Browser recalculates element positions & sizes.
* **Repaint:** Browser redraws pixels (e.g., color change).

### ✅ Key Points

* Reflow is more expensive than repaint.
* Causes of reflow: DOM changes, style changes, window resize, font load.
* Batch DOM reads/writes to avoid multiple reflows.

### ⚠️ Gotchas

* Accessing layout properties (`offsetHeight`, `scrollTop`) forces reflow.
* Animating `top/left` triggers layout; animating `transform/opacity` is GPU-optimized.

### Example

```js
const el = document.getElementById("box");
el.style.width = "200px";          // triggers reflow
console.log(el.offsetHeight);      // forces reflow again (expensive)
```

### 🎯 Interview One-Liner

> “Reflow recalculates layout, repaint redraws pixels. Reflow is costly — optimize by batching DOM changes and animating transform/opacity.”

---

## 3. 🌳 DOM Traversal & Manipulation

### ✅ Methods

* `getElementById`, `querySelector`, `querySelectorAll`.
* `parentNode`, `children`, `nextSibling`.
* Creating: `document.createElement`, `appendChild`, `insertBefore`.
* Performance: Use **DocumentFragment** for batch insertions.

### ⚠️ Gotchas

* `innerHTML` is faster for large inserts but unsafe (XSS risk).
* `NodeList` vs `HTMLCollection`:

  * `NodeList` can be static or live.
  * `HTMLCollection` is always live.

### 🎯 Interview One-Liner

> “DOM traversal uses APIs like querySelector, parentNode, and siblings. For performance, batch inserts with DocumentFragment instead of repeated appendChild.”

---

## 4. 💾 Storage APIs

### ✅ Key Points

* **Cookies:**

  * 4KB limit.
  * Sent with every HTTP request.
  * Expiration & domain/path scoped.
* **localStorage:**

  * 5–10MB.
  * Synchronous API.
  * Persistent until cleared.
* **sessionStorage:**

  * Per-tab/session.
* **IndexedDB:**

  * Async, NoSQL DB in browser.
  * Large storage, structured queries.

### ⚠️ Gotchas

* localStorage is **blocking** → avoid heavy writes in main thread.
* Cookies hurt performance since they’re sent on every request.
* IndexedDB APIs are clunky (usually use wrapper libraries).

### 🎯 Interview One-Liner

> “Cookies are for server comms (small, auto-sent), localStorage/sessionStorage for small client-only data, and IndexedDB for large structured storage.”

---

## 5. 🔒 Browser Security (CORS, CSRF, XSS)

### ✅ CORS (Cross-Origin Resource Sharing)

* Controls cross-domain requests.
* Server sets `Access-Control-Allow-Origin`.

### ✅ CSRF (Cross-Site Request Forgery)

* Malicious site tricks user’s browser into sending authenticated request.
* Prevented with **CSRF tokens** or **SameSite cookies**.

### ✅ XSS (Cross-Site Scripting)

* Injected scripts executed in victim’s browser.
* Prevented with **escaping, CSP (Content Security Policy)**.

### 🎯 Interview One-Liner

> “CORS controls which origins can access resources, CSRF tricks users into sending unwanted requests, and XSS injects malicious scripts. Fix with headers, tokens, and sanitization.”

---

## 6. ⚡ Service Workers

**Definition:**
Background scripts that intercept network requests → enable **offline caching, push notifications, background sync**.

### ✅ Key Points

* Use **Cache API** for offline storage.
* Run in their own thread (no DOM access).
* Lifecycle: install → activate → fetch.

### ⚠️ Gotchas

* Require HTTPS.
* Debugging can be tricky (stale workers → need manual refresh).
* Misuse can cause cache-bloat or stale responses.

### Example

```js
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
```

### 🎯 Interview One-Liner

> “Service workers are background scripts that enable offline caching and network interception. They power PWAs but must be carefully managed to avoid stale caches.”

---

## 7. 🌐 Critical Rendering Path (CRP)

**Definition:**
Steps the browser takes to convert HTML/CSS/JS into pixels.

### ✅ Stages

1. Parse HTML → DOM
2. Parse CSS → CSSOM
3. Combine → Render Tree
4. Layout (Reflow)
5. Paint (Repaint)
6. Composite layers

### ⚠️ Gotchas

* **Render-blocking:** CSS blocks rendering, JS blocks parsing unless `defer/async`.
* **Fonts:** FOUT/FOIT issues (Flash of Unstyled/Invisible Text).

### 🎯 Interview One-Liner

> “The CRP is DOM + CSSOM → render tree → layout → paint → composite. Optimize by deferring scripts, minimizing CSS, and preloading fonts.”

---

## 8. 🧩 Resource Loading (`async` vs `defer`)

**Definition:**
Attributes that control how scripts load.

### ✅ Key Points

* `async`: downloads in parallel, executes ASAP (order not guaranteed).
* `defer`: downloads in parallel, executes **after HTML parse**, preserves order.
* Default: blocking (bad for performance).

### 🎯 Interview One-Liner

> “Use `defer` for scripts that rely on DOM, `async` for independent scripts. Default blocking scripts delay parsing and hurt performance.”

---


# 🟦 Core JavaScript — Expert-Level Revision

# 🟦 Performance & Optimization

---

## 1. 🧹 Memory Leaks in Frontend

**Definition:**
A memory leak happens when memory is not released after it’s no longer needed.

### ✅ Common Sources

* **Uncleared timers/intervals**:

  ```js
  setInterval(() => { /* ... */ }, 1000); // never cleared
  ```
* **Detached DOM nodes** kept in closures or global arrays.
* **Event listeners** not removed on unmount.
* **Global variables** and singletons that grow unbounded.

### 🎯 Interview One-Liner

> “Frontend leaks often come from forgotten event listeners, timers, or DOM nodes retained in closures. Use cleanup (`clearInterval`, `removeEventListener`) and profiling tools.”

---

## 2. 💤 Lazy Loading & Code Splitting

**Definition:**
Splitting bundles into smaller chunks and loading them on demand.

### ✅ Key Points

* Reduces initial load time.
* Implemented with **dynamic imports** (`import()`), route-based splitting.
* Use `React.lazy` + `Suspense` for components.

### ⚠️ Gotchas

* Too many small chunks → overhead.
* Network latency can hurt if misconfigured.

### 🎯 Interview One-Liner

> “Lazy loading reduces initial load by splitting code into chunks. Use `import()` or `React.lazy`. Balance chunk size to avoid too many round-trips.”

---

## 3. 🌳 Tree-Shaking

**Definition:**
Removing unused code during bundling.

### ✅ Key Points

* Works only with **ESM (import/export)** because it’s statically analyzable.
* Dead code elimination depends on bundler + minifier (Webpack, Rollup, Terser).

### ⚠️ Gotchas

* Dynamic `require()` prevents tree-shaking.
* Side-effects in modules can block elimination.

### 🎯 Interview One-Liner

> “Tree-shaking eliminates unused exports but only works with static ES modules. Avoid dynamic imports and side-effects in libraries.”

---

## 4. ⚡ Web Vitals

**Definition:**
Google’s metrics for user-perceived performance.

### ✅ Core Metrics

* **LCP (Largest Contentful Paint):** load speed (<2.5s).
* **FID (First Input Delay):** input responsiveness (<100ms).
* **CLS (Cumulative Layout Shift):** visual stability (<0.1).
* (New) **INP (Interaction to Next Paint)** replacing FID.

### 🎯 Interview One-Liner

> “Web Vitals measure perceived performance: LCP for load, FID/INP for input, CLS for stability. Optimize via lazy loading, preloading, and reducing JS.”

---

## 5. 🧾 Async Scheduling (Idle Time)

**Definition:**
Scheduling work when the browser is idle.

### ✅ Key Points

* `requestIdleCallback(cb)` → runs when browser is idle.
* Useful for non-critical background work.
* Fallback to timers for unsupported browsers.

### ⚠️ Gotchas

* Not guaranteed to run (if browser never idle).
* Time budget limited (\~50ms).

### 🎯 Interview One-Liner

> “`requestIdleCallback` lets you run background work without blocking the main thread, but it may not fire on busy pages.”

---

## 6. 🎯 Preload, Prefetch, DNS Prefetch

### ✅ Key Points

* **Preload:** critical resources needed soon.
* **Prefetch:** resources likely needed in future navigation.
* **DNS-prefetch:** resolve domain names early.

### Example

```html
<link rel="preload" href="hero.jpg" as="image" />
<link rel="prefetch" href="/next-page.js" />
<link rel="dns-prefetch" href="//cdn.example.com" />
```

### 🎯 Interview One-Liner

> “Preload fetches critical resources now, prefetch loads likely future ones, DNS-prefetch resolves domains early.”

---

## 7. 📦 Bundling Strategies

* **Monolithic bundle** → fast for small apps, bad for scale.
* **Code-splitting** → route-level chunks.
* **Micro-frontends** → separate bundles per domain (federation).
* **CDN caching** → cache chunks by content hash.

### 🎯 Interview One-Liner

> “Bundle strategy depends on scale. Use route-based code splitting, cache chunks with hashes, and avoid giant monolithic bundles.”

---

## 8. 🏎️ Rendering Performance Tips

* Minimize **reflows** (batch DOM changes).
* Use **transform/opacity** for animations.
* Virtualize large lists (e.g., `react-window`).
* Debounce resize/scroll listeners.

### 🎯 Interview One-Liner

> “Reflows are expensive — batch DOM updates, use transform/opacity for animations, and virtualize long lists.”

---


# 🟦 Core JavaScript — Expert-Level Revision

# 🟦 Advanced Types & Equality

---

## 1. 📌 Truthy & Falsy Values

**Definition:**
When converted to a boolean (e.g., in `if` conditions), some values are considered **truthy** or **falsy**.

### ✅ Falsy Values (only 7!)

* `false`
* `0`, `-0`
* `""` (empty string)
* `null`
* `undefined`
* `NaN`

Everything else → **truthy** (including `"0"`, `[]`, `{}`, `Infinity`).

### ⚠️ Gotchas

```js
if ("0") console.log("runs");   // runs (string "0" is truthy)
if ([]) console.log("runs");    // runs (empty array is truthy)
if ({}) console.log("runs");    // runs (empty object is truthy)
```

### 🎯 Interview One-Liner

> “Only 7 values are falsy: false, 0, -0, "", null, undefined, NaN. Everything else is truthy — even empty arrays/objects.”

---

## 2. 🔄 `==` vs `===`

**Definition:**

* `===` (strict equality): no type coercion.
* `==` (loose equality): allows coercion.

### ✅ Rules (selected weird ones)

```js
0 == false        // true
"" == false       // true
null == undefined // true
[] == false       // true ( [] → "" → 0 )
[] == ![]         // true ( [] == false )
[1] == 1          // true ([1].toString() → "1")
[1,2] == "1,2"    // true
```

### ⚠️ Gotchas

* `NaN == NaN` → false (NaN is never equal to itself).
* `null` only equals `undefined` (and itself).
* `0 == []` is true, but `0 == {}` is false.

### 🎯 Interview One-Liner

> “`===` checks value + type, no coercion. `==` coerces and has weird rules: `null == undefined` only, arrays convert to strings, and NaN never equals itself.”

---

## 3. 🧾 Special Numbers: `NaN`, `Infinity`, `-0`

### ✅ NaN

* Not equal to itself: `NaN === NaN` → false.
* Use `Number.isNaN()` (better than `isNaN`).
* `isNaN("foo")` → true (coerces to NaN).

### ✅ Infinity

* `1 / 0` → `Infinity`.
* `-1 / 0` → `-Infinity`.

### ✅ -0

* JS has **two zeros**: `0` and `-0`.
* `0 === -0` → true.
* But `1 / 0 === Infinity`, `1 / -0 === -Infinity`.

### 🎯 Interview One-Liner

> “JS has two zeros: +0 and -0. They compare equal with `===`, but divide by them to get ±Infinity. NaN is never equal to itself.”

---

## 4. 🗝️ `Object.is`

**Definition:**
Like `===` but fixes edge cases:

### ✅ Rules

```js
Object.is(NaN, NaN);   // true
Object.is(0, -0);      // false
Object.is(5, 5);       // true
Object.is({}, {});     // false (different refs)
```

### 🎯 Interview One-Liner

> “`Object.is` is like strict equality but distinguishes -0 and +0, and treats NaN as equal to itself.”

---

## 5. 📦 Primitive vs Object Wrappers

**Definition:**
Primitives (`string`, `number`, `boolean`, `symbol`, `bigint`, `null`, `undefined`) have **object wrappers** for method access.

### ✅ Examples

```js
"hello".toUpperCase();   // works because JS boxes into String object
new String("hello");     // object wrapper
typeof "hello";          // "string"
typeof new String("hi"); // "object"
```

### ⚠️ Gotchas

* `new Boolean(false)` is truthy (object is always truthy).
* Comparing primitive vs object:

```js
"hi" === new String("hi"); // false
"hi" == new String("hi");  // true (coerces)
```

### 🎯 Interview One-Liner

> “Primitives auto-box into wrappers (e.g., 'hi'.toUpperCase()). But wrapper objects (`new String`) are truthy and behave differently — avoid them.”

---

## 6. 🧩 Typeof, instanceof, and `Array.isArray`

### ✅ typeof

* `typeof null` → `"object"` (bug since JS 1.0).
* `typeof NaN` → `"number"`.
* `typeof function() {}` → `"function"`.

### ✅ instanceof

* Checks prototype chain.
* Works across inheritance.
* Fails across iframes (different globals).

### ✅ Array.isArray

* Safest way to check arrays (cross-realm safe).

### Example

```js
[] instanceof Array;           // true
[] instanceof Object;          // true
Array.isArray([]);             // true
typeof null;                   // "object"
```

### 🎯 Interview One-Liner

> “`typeof null` is 'object' (legacy bug). `instanceof` checks prototype chains but breaks across realms. Use `Array.isArray` to check arrays safely.”

---

## 7. 🧮 Type Conversion (Explicit vs Implicit)

### ✅ Explicit

* `Number("42")` → 42
* `String(123)` → "123"
* `Boolean(0)` → false

### ✅ Implicit (coercion)

* `1 + "2"` → "12" (string concatenation).
* `1 - "2"` → -1 (string → number).
* `[] + []` → "" (empty string).
* `[] + {}` → "\[object Object]".
* `{} + []` → 0 (parsed as block + array).

### ⚠️ Gotchas

```js
[] == ![]; // true
// [] -> "" -> 0, ![] -> false -> 0
```

### 🎯 Interview One-Liner

> “Type coercion is implicit conversion. Addition prefers strings, subtraction prefers numbers. Weird cases like \[] + {} = '\[object Object]' are from toString/valueOf conversions.”

---


# 🟦 Core JavaScript — Expert-Level Revision

# 🟦 Error Handling & Debugging

---

## 1. ⚠️ `try` / `catch` / `finally`

**Definition:**
Mechanism for handling runtime exceptions.

### ✅ Key Points

* `catch` handles synchronous errors in the `try` block.
* `finally` always executes (even if return/throw in try/catch).
* Errors bubble up if unhandled.

### ⚠️ Gotchas

```js
try {
  throw new Error("boom");
} catch (e) {
  return "handled";
} finally {
  return "finally"; // overrides catch return
}
```

### 🎯 Interview One-Liner

> “`finally` always runs and overrides return values. Errors bubble up unless caught.”

---

## 2. 🕸️ Error Types in JavaScript

### ✅ Built-in Error Objects

* `Error` → base class.
* `SyntaxError` → invalid syntax (only at parse time).
* `ReferenceError` → accessing undeclared variable.
* `TypeError` → invalid operation (e.g., calling non-function).
* `RangeError` → out-of-range numbers (e.g., invalid array length).
* `URIError` → malformed URI in `encodeURI/decodeURI`.
* `EvalError` → legacy, rarely used.

### Example

```js
try {
  JSON.parse("{ invalid }");
} catch (e) {
  console.log(e instanceof SyntaxError); // true
}
```

### 🎯 Interview One-Liner

> “JS has typed errors: Syntax, Reference, Type, Range, URI. Most common in practice: TypeError and ReferenceError.”

---

## 3. 🛠️ Custom Errors

**Definition:**
Extend the `Error` class for domain-specific errors.

### Example

```js
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}
throw new ValidationError("Invalid input");
```

### 🎯 Interview One-Liner

> “Custom errors extend Error and set a name for better debugging.”

---

## 4. ⚡ Async Error Handling

### ✅ Promises

```js
fetch("bad-url")
  .then(res => res.json())
  .catch(err => console.error("Caught:", err));
```

* `.catch()` handles errors in promise chain.
* Uncaught rejections trigger `unhandledrejection` event.

### ✅ async/await

```js
async function getData() {
  try {
    await fetch("bad-url");
  } catch (err) {
    console.error("Caught:", err);
  }
}
```

* Must wrap `await` in `try/catch`.
* Rejections not caught will bubble like exceptions.

### 🎯 Interview One-Liner

> “Promise errors bubble until caught. In async/await, use try/catch around awaits. Unhandled rejections trigger a global event.”

---

## 5. 🌍 Global Error Handling

### ✅ Browser

```js
window.onerror = (msg, url, line, col, err) => {
  console.error("Global error:", msg, err);
};
window.onunhandledrejection = e => {
  console.error("Unhandled rejection:", e.reason);
};
```

### ✅ Node.js

```js
process.on("uncaughtException", err => { ... });
process.on("unhandledRejection", err => { ... });
```

### ⚠️ Gotchas

* Don’t rely on global handlers as the *only* mechanism — they’re last resort.
* Use for logging/alerting in production.

### 🎯 Interview One-Liner

> “Global error handlers (`window.onerror`, `onunhandledrejection`) are safety nets — good for logging, but not a replacement for local handling.”

---

## 6. 🧭 Debugging Techniques

### ✅ Tools

* `console.*` (log, warn, error, table, dir).
* `debugger` keyword (pauses execution in DevTools).
* Source maps (map minified code to original).

### ✅ Advanced

* Performance profiling (DevTools Performance tab).
* Memory profiling (heap snapshots, allocation timelines).
* Break on DOM mutation.

### 🎯 Interview One-Liner

> “Use console, debugger, and source maps for debugging. For perf/memory, use DevTools profiling and heap snapshots.”

---

## 7. 📋 Best Practices for Error Handling

* **Fail fast, fail safe** → throw early, recover gracefully.
* Don’t swallow errors (`catch(e){}` with empty body).
* Normalize errors (consistent structure across app).
* Log with context (user action, environment).
* Avoid throwing strings, always `throw new Error(...)`.
* Separate **expected errors** (validation) from **unexpected ones** (bugs).

### 🎯 Interview One-Liner

> “Best practice: never swallow errors, always throw Error objects, separate expected from unexpected, and log with context.”

---


# 🟦 Core JavaScript — Expert-Level Revision

# 🟦 Concurrency & Parallelism

---

## 1. 🧵 Single-Threaded Model

**Definition:**
JavaScript executes on a **single thread** (the call stack) with concurrency simulated via the **event loop**.

### ✅ Key Points

* JS can’t run two functions truly in parallel on the main thread.
* Concurrency = overlapping tasks (via async callbacks).
* Parallelism = tasks literally executing at the same time (needs threads/workers).

### ⚠️ Gotchas

* Long-running tasks block UI → “frozen page”.
* Async doesn’t mean parallel (Promises still run on one thread).

### 🎯 Interview One-Liner

> “JavaScript is single-threaded; concurrency comes from the event loop, but real parallelism requires workers.”

---

## 2. ⏳ Concurrency via Event Loop

**Definition:**
The event loop interleaves tasks from macrotask & microtask queues.

### ✅ Key Points

* Concurrency = cooperative multitasking.
* No two JS functions run at the same instant on the same thread.

### Example

```js
setTimeout(() => console.log("timer"), 0);
Promise.resolve().then(() => console.log("promise"));
// Output: promise, timer
```

### 🎯 Interview One-Liner

> “Concurrency in JS is managed by the event loop — tasks interleave but don’t run truly in parallel.”

---

## 3. ⚡ Parallelism via Web Workers

**Definition:**
Web Workers run JS in **background threads** separate from the main UI thread.

### ✅ Key Points

* Communicate via `postMessage` (structured cloning).
* No direct DOM access.
* Useful for CPU-heavy tasks.

### ⚠️ Gotchas

* Serialization overhead for large messages.
* No shared state by default (copy-on-message).
* Debugging workers is harder than main thread code.

### Example

```js
// worker.js
self.onmessage = e => self.postMessage(e.data * 2);

// main.js
const w = new Worker("worker.js");
w.onmessage = e => console.log(e.data);
w.postMessage(10); // 20
```

### 🎯 Interview One-Liner

> “Web Workers provide real parallelism by running JS in separate threads, but can’t touch the DOM and communicate only via messages.”

---

## 4. 🧩 SharedArrayBuffer & Atomics

**Definition:**
APIs for **shared memory** and low-level synchronization between workers.

### ✅ Key Points

* `SharedArrayBuffer`: allows multiple threads to view/edit same memory.
* `Atomics`: provides atomic operations (safe increments, waits, notifications).
* Enables building locks, semaphores, and concurrent data structures in JS.

### ⚠️ Gotchas

* Very advanced — rarely used directly, but underpins WebAssembly multithreading.
* Security concerns → disabled after Spectre/Meltdown, re-enabled with stricter cross-origin isolation.

### Example

```js
const buffer = new SharedArrayBuffer(4);
const arr = new Int32Array(buffer);

Atomics.store(arr, 0, 42);
console.log(Atomics.load(arr, 0)); // 42
```

### 🎯 Interview One-Liner

> “SharedArrayBuffer + Atomics let workers share memory and coordinate safely. It’s how JS supports real multithreading in WebAssembly.”

---

## 5. 🧮 Parallelism in Node.js

**Definition:**
Node is single-threaded per process, but offers parallelism.

### ✅ Key Points

* **Worker Threads** (since Node 10.5) → parallel JS execution.
* **Child Processes** → true OS-level processes.
* **Cluster Module** → multiple processes sharing load.
* **libuv threadpool** → parallelize I/O and certain CPU tasks (crypto, fs).

### 🎯 Interview One-Liner

> “Node achieves parallelism with worker threads, child processes, or libuv’s threadpool — though the main JS thread is single.”

---

## 6. 🏎️ Practical Uses of Parallelism

* **Image processing** in background via workers.
* **Large JSON parsing** → offload to worker to avoid UI freeze.
* **Concurrent fetch requests** → concurrency (not parallelism).
* **WebAssembly with threads** → real CPU parallelism.

---


# 🟦 Core JavaScript — Expert-Level Revision

# 🟦 ESNext & Modern Features

---

## 1. 🔢 BigInt

**Definition:**
A primitive type for arbitrarily large integers.

### ✅ Key Points

* Append `n` → `123n`.
* Can’t mix with normal `Number` without explicit conversion.
* No precision loss for huge numbers.

### ⚠️ Gotchas

```js
2n + 3; // TypeError (can’t mix BigInt and Number)
Number(2n) === 2; // true
```

### 🎯 Interview One-Liner

> “BigInt represents integers beyond Number’s 2^53-1 limit. You can’t mix it with Number — must explicitly convert.”

---

## 2. 🧩 Optional Chaining (`?.`)

**Definition:**
Safe property access without throwing if intermediate is null/undefined.

### ✅ Key Points

* Short-circuits if value is null/undefined.
* Works with properties, function calls, array indexes.

### Example

```js
const user = {};
console.log(user.profile?.email); // undefined, not error
console.log(user.getName?.());    // undefined
```

### 🎯 Interview One-Liner

> “Optional chaining avoids errors by short-circuiting on null/undefined. It works for props, calls, and arrays.”

---

## 3. 🟰 Nullish Coalescing (`??`)

**Definition:**
Provides a fallback only for `null`/`undefined`, not falsy values.

### ✅ Key Points

```js
0 || 42;   // 42
0 ?? 42;   // 0

"" || "x"; // "x"
"" ?? "x"; // ""
```

### 🎯 Interview One-Liner

> “`??` differs from `||` by treating only null/undefined as missing. Falsy values like 0 and '' are kept.”

---

## 4. 🔄 Top-Level `await`

**Definition:**
Allows `await` at the top level of ES modules.

### ✅ Key Points

* Only allowed in ES modules (`type="module"`).
* Blocks module evaluation until awaited promise resolves.

### Example

```js
// top-level-await.js
const data = await fetch("/api").then(r => r.json());
console.log(data);
```

### 🎯 Interview One-Liner

> “Top-level await lets you use await outside functions in ES modules, pausing module execution until resolved.”

---

## 5. ♻️ WeakRefs & FinalizationRegistry

**Definition:**
APIs to reference objects without preventing GC.

### ✅ WeakRef

* `new WeakRef(obj)` → creates weak reference.
* `.deref()` returns object if still alive, else undefined.

### ✅ FinalizationRegistry

* Lets you run cleanup after object GC (non-deterministic).

### ⚠️ Gotchas

* **Unreliable for program logic** — GC is unpredictable.
* Intended for caches, not control flow.

### Example

```js
let obj = { value: 123 };
const weak = new WeakRef(obj);

obj = null; // eligible for GC
console.log(weak.deref()); // maybe object, maybe undefined later
```

### 🎯 Interview One-Liner

> “WeakRefs allow GC’d objects to be referenced weakly, and FinalizationRegistry lets you clean them up. Use for caches, not program logic.”

---

## 6. 📆 Temporal API (Proposal Stage 3)

**Definition:**
New Date/Time API to replace `Date` (which is broken).

### ✅ Key Points

* Immutable, time zone aware, clear APIs.
* Objects: `PlainDate`, `PlainTime`, `ZonedDateTime`, `Duration`.
* Fixes DST bugs, leap second issues.

### Example

```js
import { Temporal } from "@js-temporal/polyfill";
const today = Temporal.Now.plainDateISO();
console.log(today.add({ days: 1 }).toString());
```

### 🎯 Interview One-Liner

> “Temporal is the modern Date/Time API: immutable, time-zone aware, and accurate. It’s the future replacement for JS Date.”

---

## 7. 📦 Dynamic Import

**Definition:**
`import()` loads modules dynamically at runtime.

### ✅ Key Points

* Returns a promise.
* Enables conditional/lazy loading.
* Used for code-splitting.

### Example

```js
if (condition) {
  const mod = await import("./math.js");
  mod.add(2, 3);
}
```

### 🎯 Interview One-Liner

> “Dynamic import lets you load modules at runtime. It returns a promise, enabling conditional and lazy loading.”

---

## 8. 🎯 Logical Assignment Operators

**Definition:**
Shorthand operators for logical + assignment.

### ✅ Key Points

* `||=` assigns if falsy.
* `&&=` assigns if truthy.
* `??=` assigns if null/undefined.

### Example

```js
let a = null;
a ||= 5;  // a = 5

let b = 0;
b ||= 5;  // b = 5
b ??= 5;  // b = 0 (unchanged)
```

### 🎯 Interview One-Liner

> “Logical assignment operators (||=, &&=, ??=) combine short-circuiting with assignment. Handy for defaults and conditionals.”

---

## 9. 🧾 Numeric Separators

**Definition:**
Underscores in numbers for readability.

### Example

```js
const big = 1_000_000_000;
console.log(big); // 1000000000
```

### 🎯 Interview One-Liner

> “Numeric separators make large numbers readable, but don’t affect the value.”

---


# 🟦 Core JavaScript — Expert-Level Revision

# 🟦 Patterns & Architecture in JavaScript

---

## 1. 📦 Module Pattern

**Definition:**
Encapsulates private state using closures, exposing only a public API.

### ✅ Key Points

* Common before ES6 modules (`import/export`).
* Uses IIFEs (Immediately Invoked Function Expressions).
* Prevents polluting global scope.

### Example

```js
const Counter = (function () {
  let count = 0; // private
  return {
    inc: () => ++count,
    get: () => count,
  };
})();
console.log(Counter.inc()); // 1
console.log(Counter.count); // undefined
```

### 🎯 Interview One-Liner

> “The module pattern hides implementation details with closures and exposes a controlled API. It was the precursor to ES modules.”

---

## 2. 👁️ Observer Pattern

**Definition:**
One-to-many dependency: when subject changes, observers are notified.

### ✅ Key Points

* Basis for event systems.
* Used in RxJS, MobX, DOM events.

### Example

```js
class Subject {
  constructor() { this.observers = []; }
  subscribe(fn) { this.observers.push(fn); }
  notify(data) { this.observers.forEach(fn => fn(data)); }
}
const subject = new Subject();
subject.subscribe(data => console.log("Got:", data));
subject.notify("Hello");
```

### 🎯 Interview One-Liner

> “The observer pattern lets many listeners react when one subject changes. It underlies events, RxJS, and reactive libraries.”

---

## 3. 📡 Pub/Sub Pattern

**Definition:**
Decouples publishers from subscribers via a mediator (event bus).

### ✅ Key Points

* Pub/Sub is like Observer but with a **broker** in between.
* Subscribers don’t know who published the event.

### Example

```js
const bus = {};
bus.events = {};
bus.subscribe = (event, fn) =>
  (bus.events[event] = (bus.events[event] || []).concat(fn));
bus.publish = (event, data) =>
  (bus.events[event] || []).forEach(fn => fn(data));

bus.subscribe("login", user => console.log("Welcome", user));
bus.publish("login", "Alice");
```

### 🎯 Interview One-Liner

> “Pub/Sub decouples producers and consumers with an event bus. Unlike Observer, subscribers don’t directly attach to the subject.”

---

## 4. 🧑‍🤝‍🧑 Singleton Pattern

**Definition:**
Restricts a class/module to a single instance.

### ✅ Key Points

* Common for global state, config, caches.
* Enforced via closures or static variables.

### Example

```js
class Singleton {
  constructor() {
    if (Singleton.instance) return Singleton.instance;
    Singleton.instance = this;
  }
}
const a = new Singleton();
const b = new Singleton();
console.log(a === b); // true
```

### 🎯 Interview One-Liner

> “Singleton ensures one instance globally — useful for config, caches, or logging, but overuse makes testing harder.”

---

## 5. 🏭 Factory Pattern

**Definition:**
Function/class that creates objects without exposing the creation logic.

### ✅ Key Points

* Encapsulates instantiation.
* Can return different subclasses depending on arguments.

### Example

```js
function createUser(type) {
  if (type === "admin") return { role: "admin" };
  return { role: "guest" };
}
console.log(createUser("admin"));
```

### 🎯 Interview One-Liner

> “Factory abstracts object creation, returning different variants without exposing constructor details.”

---

## 6. 🧩 Prototype Pattern

**Definition:**
Creates new objects by cloning existing ones.

### ✅ Key Points

* In JS, all objects already inherit via prototypes.
* Object cloning often uses `Object.create(proto)`.

### Example

```js
const animal = { speak() { console.log("Hi"); } };
const dog = Object.create(animal);
dog.speak(); // "Hi"
```

### 🎯 Interview One-Liner

> “Prototype pattern creates objects by cloning existing ones. In JavaScript, it’s built into the language via `Object.create`.”

---

## 7. 🧮 Functional Patterns (FP in JS)

### ✅ Immutability

* Avoid mutating objects/arrays; use spread or `Object.assign`.

### ✅ Function Composition

```js
const compose = (f, g) => x => f(g(x));
const double = x => x * 2;
const square = x => x * x;
console.log(compose(square, double)(3)); // (3*2)^2 = 36
```

### ✅ Pipeline (proposed `|>` operator)

* More readable left-to-right function chaining.

### 🎯 Interview One-Liner

> “FP patterns in JS emphasize immutability, pure functions, and composition. Composition allows small functions to build complex logic.”

---

## 8. ⚖️ Strategy Pattern

**Definition:**
Encapsulates interchangeable algorithms behind a common interface.

### ✅ Example

```js
class Payment {
  setStrategy(strategy) { this.strategy = strategy; }
  pay(amount) { this.strategy.pay(amount); }
}
class Paypal { pay(a) { console.log("PayPal:", a); } }
class Stripe { pay(a) { console.log("Stripe:", a); } }

const payment = new Payment();
payment.setStrategy(new Paypal());
payment.pay(100); // PayPal: 100
```

### 🎯 Interview One-Liner

> “Strategy encapsulates interchangeable algorithms, letting you switch behaviors dynamically.”

---

## 9. 🕵️ Decorator Pattern

**Definition:**
Adds functionality to objects without modifying them.

### ✅ Key Points

* Popular in React (HOCs).
* In ES, decorator syntax (`@`) is in proposal stage.

### Example

```js
function withLogging(fn) {
  return (...args) => {
    console.log("Args:", args);
    return fn(...args);
  };
}
const sum = (a, b) => a + b;
const loggedSum = withLogging(sum);
loggedSum(2, 3); // Logs args
```

### 🎯 Interview One-Liner

> “Decorator adds behavior to functions or objects without modifying the original — e.g., React HOCs.”

---

## 10. 🕸️ Middleware Pattern

**Definition:**
Chain of functions where each step can process input and pass to next.

### ✅ Key Points

* Popular in Express.js, Redux.
* Flexible for cross-cutting concerns (logging, auth).

### Example

```js
function compose(middleware) {
  return function (ctx) {
    let i = 0;
    function next() {
      const fn = middleware[i++];
      if (fn) fn(ctx, next);
    }
    next();
  };
}
const fn = compose([
  (ctx, next) => { ctx.push("a"); next(); },
  (ctx, next) => { ctx.push("b"); next(); }
]);
const arr = [];
fn(arr);
console.log(arr); // ["a","b"]
```

### 🎯 Interview One-Liner

> “Middleware composes a pipeline of functions where each can act and forward. Used in Express, Redux, Koa.”

---


# ✅ Summary (Full Handbook)

This handbook covers expert-level JavaScript concepts in depth:

- Closures, Scope, Hoisting, `this`, Prototypes, Event Loop
- Asynchronous JavaScript (Timers, Promises, async/await, Generators, Debounce/Throttle, rAF, Workers)
- Advanced Objects & Memory (GC, Symbols, WeakMap/WeakSet, Descriptors, Proxy/Reflect, Immutability)
- Advanced Functions & ES6+ (HOFs, Currying, Modules, Destructuring, Params, Iterables, Map/Set, ES6+)
- Browser & DOM (Event Delegation, Reflow vs Repaint, DOM APIs, Storage, Security, Service Workers, CRP, Loading)
- Performance & Optimization (Leaks, Lazy Loading, Tree-shaking, Web Vitals, Async Scheduling, Bundling, Rendering)
- Advanced Types & Equality (Truthy/Falsy, == vs ===, NaN/-0, Object.is, Wrappers, typeof quirks, Coercion)
- Error Handling & Debugging (try/catch, Error types, Custom errors, Async handling, Global handlers, Debugging)
- Concurrency & Parallelism (Single-threaded model, Event Loop, Workers, SharedArrayBuffer, Node parallelism)
- ESNext & Modern Features (BigInt, Optional Chaining, Nullish, Top-level await, WeakRefs, Temporal, Imports, Operators)
- Patterns & Architecture (Module, Observer, Pub/Sub, Singleton, Factory, Prototype, FP, Strategy, Decorator, Middleware)
