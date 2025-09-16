# Hoisting in JavaScript — a deep dive

**Short summary:**
Hoisting is the JavaScript behavior where **declarations** are processed before any code runs, so their *bindings* exist at the top of their scope. What differs is **how** those bindings are initialized: functions get their full body, `var` declarations become `undefined`, and `let` / `const` / `class` are hoisted but left **uninitialized** (the Temporal Dead Zone) until execution reaches their declaration.

---

## How the engine actually does it (simple model)

JS engines conceptually run in two phases for each scope:

1. **Creation (compile) phase**

   * The engine scans the scope and creates bindings for declarations.
   * For each **function declaration** → create a binding and set it to the function object.
   * For each **`var`** → create a binding and initialize it to `undefined`.
   * For each **`let`/`const`/`class`** → create a binding but **do not initialize** it yet (this is the TDZ).
   * Create the scope object(s) (global object, lexical environment, variable environment).

2. **Execution phase**

   * The code runs line-by-line.
   * Assignments and initializations happen here (e.g., `var a = 5;` assigns 5 now; `let b = 2;` initializes `b` now).

> Important mental model: **Hoisting does not "move" code** — it means *declarations* are registered first. The actual assignments/initializations happen later during execution.

---

## What gets hoisted — quick table

| Declarator                                                     |                            Hoisted? | Initial value before execution | Can you access before declaration?             |
| -------------------------------------------------------------- | ----------------------------------: | ------------------------------ | ---------------------------------------------- |
| `function foo(){}` (declaration)                               |                                 Yes | The full function object       | Yes — you can call it.                         |
| `var x`                                                        |                                 Yes | `undefined`                    | Yes — returns `undefined` (no ReferenceError). |
| `let y` / `const z`                                            |               Yes (binding created) | **uninitialized** (TDZ)        | **No** — ReferenceError if accessed.           |
| `class C {}`                                                   |               Yes (binding created) | **uninitialized** (TDZ)        | **No** — ReferenceError.                       |
| `var f = function(){}` (function expression assigned to `var`) | `var` hoisted → binding `undefined` | `undefined` until assignment   | No — calling it before assignment → TypeError. |

---

## Concrete examples (and explanations)

### `var` vs `let/const`

```js
console.log(a); // undefined    (var is hoisted and initialized to undefined)
var a = 10;
```

```js
console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 20;
```

Explanation: `var a` was created and initialized to `undefined` during creation phase. `let b` has a binding but is uninitialized (TDZ) until the `let` statement runs.

---

### Function declaration vs function expression

```js
hoistedFn(); // "hello"
function hoistedFn(){ console.log('hello'); }
```

Function declarations are hoisted with their body → callable before their appearance.

```js
expr(); // TypeError: expr is not a function
var expr = function(){ console.log('hi'); };
```

`expr` is hoisted as a `var` (undefined). Trying to call `undefined()` → TypeError.

---

### Function + var with same name (order matters)

```js
console.log(typeof fn); // "function"
function fn(){ return 'decl'; }
var fn = 'assigned later';
console.log(typeof fn); // "string"  (after the assignment line executes)
```

At creation, the function declaration sets `fn` to the function. The `var fn` declaration is ignored (no new binding), but the later runtime assignment (`fn = 'assigned later'`) overwrites it.

---

### Class hoisting (TDZ)

```js
new Person(); // ReferenceError: Cannot access 'Person' before initialization
class Person {}
```

Classes are hoisted in the sense their binding exists, but they are uninitialized until the class statement executes — same as `let`/`const`.

---

### Loop + `var` closure trap

```js
for (var i = 0; i < 3; i++) {
  setTimeout(()=> console.log(i), 100); // prints 3, 3, 3
}
```

`var i` is function-scoped; the same `i` is shared. By the time callbacks run, `i === 3`.

```js
for (let i = 0; i < 3; i++) {
  setTimeout(()=> console.log(i), 100); // prints 0, 1, 2
}
```

`let i` is block-scoped with a fresh binding per loop iteration.

---

### `typeof` nuance

```js
console.log(typeof notDeclared); // "undefined"   (no error)
```

But:

```js
console.log(typeof x); // ReferenceError if x is in TDZ (let/const)
let x = 1;
```

`typeof` does **not** protect you from the TDZ for `let`/`const`.

---

## Why hoisting exists / how to think about it

* Hoisting is a consequence of how the language initializes scope before execution starts. It's easier to reason about programs if declarations are known up front.
* Historically, `var` behavior + function declarations led to common bugs, and ES6 introduced block-scoped `let`/`const` and TDZ to make code safer and reduce accidental uses before initialization.

---

## Common pitfalls & interview traps

* Calling a function expression assigned to a `var` before assignment: `TypeError`.
* Accessing `let`/`const` before declaration → `ReferenceError` (TDZ).
* Assuming `var` is block-scoped (it isn’t).
* For-loops with `var` and async callbacks capture the same variable.
* Function declarations inside blocks behave inconsistently across older environments — prefer top-level declarations or function expressions.
* Expecting `typeof` to guard against TDZ — it does not for `let`/`const`.

---

## How to avoid hoisting problems (best practices)

* Prefer `const` and `let` over `var`.
* Declare variables and functions at the top of their scope (or before use) to be explicit.
* Prefer function declarations for utility functions you call early, or use `const fn = () => {}` and initialize before first use.
* Use linters (ESLint rules like `no-use-before-define`) to catch early-use errors.
* Avoid function declarations inside blocks (for portability).
* Write small scopes and avoid relying on implicit hoisting behavior.

---

## Quick mental cheat-sheet

* Function declarations: **fully hoisted** → you can call before the line where they're written.
* `var`: declaration hoisted, **initialized to `undefined`**.
* `let`/`const`/`class`: binding hoisted, **uninitialized** → **TDZ** until execution reaches declaration.
* Hoisting = declarations visible; **initializations happen in execution order**.

---

# 10 Tricky interview-style hoisting questions (with answers + explanations)

---

### Q1

```js
console.log(typeof foo); 
var foo = 'bar';
console.log(typeof foo);
```

**Output**

```
"undefined"
"string"
```

**Why:** `var foo` is hoisted and initialized to `undefined` at creation time, so `typeof foo` before assignment is `"undefined"`. After assignment it's a string.

---

### Q2

```js
hoistMe();
function hoistMe(){ console.log('called'); }
```

**Output**

```
called
```

**Why:** Function **declarations** are hoisted with their body — callable before the line they appear.

---

### Q3

```js
console.log(a);
let a = 2;
```

**Output**

```
ReferenceError: Cannot access 'a' before initialization
```

**Why:** `let` creates a binding during creation phase but leaves it **uninitialized** (TDZ). Access before initialization throws.

---

### Q4

```js
var f = 'global';
(function(){
  console.log(f);
  var f = 'local';
})();
```

**Output**

```
undefined
```

**Why:** Inside the IIFE, `var f` is hoisted and initialized to `undefined` before execution; the `console.log` sees that inner `f` (undefined) — not the outer `'global'`.

---

### Q5

```js
console.log(typeof notDeclared);   // A
console.log(typeof alsoLet);       // B
let alsoLet = 1;
```

**Output**

```
"undefined"   // A
ReferenceError // B
```

**Why:** `typeof notDeclared` for a truly undeclared identifier returns `"undefined"` (no error). But `alsoLet` is in TDZ, so `typeof` throws a `ReferenceError` for it.

---

### Q6

```js
function foo(){ return 1; }
var foo = 2;
console.log(foo);
```

**Output**

```
2
```

**Why:** During creation phase the function declaration sets `foo` to the function. `var foo` doesn't create a new binding (already exists) but the later assignment `foo = 2` during execution overwrites it.

---

### Q7

```js
console.log(typeof x);
{
  let x = 5;
}
```

**Output**

```
ReferenceError: Cannot access 'x' before initialization
```

**Why:** `x` is a block-scoped `let`. The block's creation phase establishes the binding before execution enters the block, producing a TDZ for `x`. Accessing it before the `let` declaration (even via `typeof`) throws.

---

### Q8

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

**Output**

```
3
3
3
```

**Why:** `var i` is function-scoped — the same `i` is shared. By the time callbacks run, the loop has finished and `i === 3`. Using `let i` gives `0,1,2`.

---

### Q9

```js
console.log(fn); 
var fn = function(){ console.log('hi'); }
```

**Output**

```
undefined
```

**Why:** `var fn` is hoisted and initialized to `undefined`. The assigned function expression happens at execution-time; so before that `fn` is `undefined`.

---

### Q10

```js
if(false){
  function f(){ console.log('from block'); }
}
console.log(typeof f);
```

**Output (ES2015+ compliant engines)**

```
"undefined"
```

**Why / nuance:** Function declarations inside blocks are tricky historically. In ES2015+ block-level function declarations are hoisted to the block and do **not** create a binding in the surrounding scope (in strict ES2015 behavior), so `f` is `undefined` outside. Older non-strict engines had different behavior — this is an interview gotcha: prefer function expressions in blocks for portability.

---

The **Temporal Dead Zone (TDZ)** in JavaScript refers to the period of time between when a variable is **entered into scope** and when it is **actually declared (initialized)**. During this period, accessing the variable will throw a **ReferenceError**, even though the variable is in scope.

---

### Why does it happen?

It happens because:

* `let` and `const` are **hoisted** like `var`, but **not initialized** with a default value (`undefined`) at the top of the scope.
* They remain in an **uninitialized state** until the actual `let`/`const` declaration is executed.
* Any attempt to access the variable before that point is the TDZ.

---

### Example 1 — TDZ in action

```js
console.log(a); // ❌ ReferenceError: Cannot access 'a' before initialization
let a = 10;
```

Explanation:

* `a` is hoisted to the top of the scope, but not initialized.
* Until the line `let a = 10;` runs, the variable `a` is in the **TDZ**.

---

### Example 2 — Scope-based TDZ

```js
function demo() {
  console.log(b); // ❌ ReferenceError
  let b = 20;
}
demo();
```

Here:

* `b` is in scope from the start of `demo`.
* But until `let b = 20;` executes, `b` is in the TDZ.

---

### Example 3 — Block scope TDZ

```js
{
  // TDZ starts
  console.log(c); // ❌ ReferenceError
  const c = 30;   // TDZ ends
}
```

---

### Why is TDZ useful?

1. **Avoids accidental use** of variables before initialization (a common bug with `var`).

   ```js
   console.log(x); // undefined, might cause bugs
   var x = 5;
   ```

   vs

   ```js
   console.log(x); // ReferenceError
   let x = 5;
   ```

2. **Makes code more predictable** by enforcing correct ordering.

---

✅ **In short:**
The **Temporal Dead Zone (TDZ)** is the period between the **hoisting of a variable declared with `let`/`const`** and its **actual initialization**, during which accessing it throws a **ReferenceError**.

---