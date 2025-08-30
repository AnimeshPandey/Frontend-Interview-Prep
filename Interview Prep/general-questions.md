# 📘 JavaScript Questions
---

### 1. Explain **event delegation**.

✅ **Definition:**
Event delegation is a pattern where you attach a single event listener to a parent element instead of multiple children. Because of **event bubbling**, the event propagates up, and you can check the `event.target` to see which child triggered it.

🧩 **Example:**

```js
// Instead of adding listeners to every <li>, delegate to <ul>
document.querySelector("ul").addEventListener("click", function(e) {
  if (e.target.tagName === "LI") {
    console.log("Clicked:", e.target.innerText);
  }
});
```

✅ **Why useful?**

* Performance (fewer listeners).
* Handles dynamically added elements.

🔗 [MDN – Event Delegation](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_delegation)

---

### 2. Explain how **`this`** works in JavaScript.

✅ **Definition:**
`this` refers to the object that the function is called on. Its value depends on how the function is invoked.

🧩 **Cases:**

```js
// Global (non-strict mode)
console.log(this); // window in browsers

// Object method
const obj = {
  name: "JS",
  greet() { console.log(this.name); }
};
obj.greet(); // "JS"

// Detached method
const f = obj.greet;
f(); // undefined (strict mode), window (non-strict)

// Explicit binding
f.call({ name: "Python" }); // "Python"

// Arrow function
const arrow = () => console.log(this);
arrow(); // inherits `this` from enclosing scope
```

✅ **ES6 change:**
Arrow functions **don’t have their own `this`**, they use lexical `this`. This avoids `.bind(this)` boilerplate in React class components.

🔗 [MDN – this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)

---

### 3. Explain how **prototypal inheritance** works.

✅ **Definition:**
In JS, objects inherit from other objects through the **prototype chain**. Every object has an internal `[[Prototype]]` (accessible via `__proto__` or `Object.getPrototypeOf`).

🧩 **Example:**

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  console.log(`${this.name} makes a sound`);
};

const dog = new Animal("Dog");
dog.speak(); // "Dog makes a sound"

// dog.__proto__ === Animal.prototype
```

✅ **Key point:**
Property lookup travels **up the prototype chain** until found or reaches `Object.prototype`.

🔗 [MDN – Prototypal Inheritance](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object_prototypes)

---

### 4. What is the difference between **`null`, `undefined`, and undeclared\`**?

✅ **Definitions:**

* `undefined`: variable declared but not assigned.
* `null`: explicit assignment to “no value”.
* **undeclared**: variable never declared at all.

🧩 **Example:**

```js
let a;
console.log(a); // undefined

let b = null;
console.log(b); // null

console.log(c); // ReferenceError: c is not defined
```

✅ **Checks:**

```js
typeof a === "undefined";   // true if undefined
b === null;                 // true if null
typeof c === "undefined";   // true (but c is undeclared!)
```

✅ **Tip:** Always use `=== null` or `typeof x === "undefined"` to avoid confusion.

🔗 [MDN – null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null)
🔗 [MDN – undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)

---

### 5. What is a **closure**, and how/why would you use one?

✅ **Definition:**
A closure is when a function **remembers variables** from its lexical scope even when executed outside that scope.

🧩 **Example:**

```js
function makeCounter() {
  let count = 0;
  return function() {
    count++;
    return count;
  }
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
```

✅ **Use cases:**

* Data privacy (simulate private variables).
* Function factories.
* Memoization.
* Event handlers.

🔗 [MDN – Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)

---

### 6. What language constructions do you use for iterating over **object properties** and **array items**?

✅ **For arrays:**

* `for` loop
* `for...of`
* `forEach`, `map`, `filter`, `reduce`, `some`, `every`

```js
const arr = [1, 2, 3];

// Classic
for (let i = 0; i < arr.length; i++) console.log(arr[i]);

// for..of
for (const num of arr) console.log(num);

// forEach
arr.forEach((n) => console.log(n));

// map
const doubled = arr.map((n) => n * 2);
```

✅ **For objects:**

* `for...in` (iterates keys, includes inherited → must check with `hasOwnProperty`)
* `Object.keys(obj).forEach()`
* `Object.entries(obj)`

```js
const obj = { a: 1, b: 2 };

// for..in
for (let key in obj) {
  if (obj.hasOwnProperty(key)) console.log(key, obj[key]);
}

// Object.keys
Object.keys(obj).forEach((k) => console.log(k, obj[k]));

// Object.entries
for (const [k, v] of Object.entries(obj)) console.log(k, v);
```

🔗 [MDN – Iteration protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)

---

### 7. Can you describe the main difference between `Array.forEach()` and `Array.map()`?

✅ **forEach:**

* Executes a callback for each item.
* **Does not return a new array.**

✅ **map:**

* Transforms each element.
* Returns a **new array** with the results.

🧩 **Example:**

```js
const arr = [1, 2, 3];

arr.forEach((n) => console.log(n * 2)); // logs 2, 4, 6 → returns undefined

const doubled = arr.map((n) => n * 2); // [2, 4, 6]
```

✅ **Other array iteration methods:**

* `filter` → keeps elements by condition.
* `reduce` → accumulate into single value.
* `some` → at least one satisfies condition.
* `every` → all satisfy condition.
* `find` → first matching element.

🔗 [MDN – Array.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
🔗 [MDN – Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)

---

### 8. What is a typical use case for **anonymous functions**?

✅ **Definition:** Functions without a name, often used inline.

✅ **Use cases:**

* Callbacks in event listeners:

  ```js
  button.addEventListener("click", function () {
    console.log("clicked");
  });
  ```
* Array methods:

  ```js
  [1, 2, 3].map(function (n) { return n * 2; });
  ```
* IIFEs (Immediately Invoked Function Expressions):

  ```js
  (function () { console.log("IIFE runs immediately"); })();
  ```
* Passing small behavior without polluting global scope.

🔗 [MDN – Function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function)

---

### 9. What is the difference between **host objects** and **native objects**?

✅ **Native objects:**

* Built into the JS language, defined by the ECMAScript spec.
* Examples: `Object`, `Array`, `Function`, `Date`, `Math`, `RegExp`.

✅ **Host objects:**

* Provided by the environment (browser, Node.js).
* Examples (browser): `window`, `document`, `XMLHttpRequest`, `localStorage`.
* Examples (Node): `fs`, `Buffer`.

🧩 **Example:**

```js
// Native
const now = new Date(); // Date is native

// Host
document.getElementById("root"); // document is host
```

🔗 [MDN – Objects in JS](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects)

---

### 10. Explain the difference between:

```js
function Person() {}
var person = Person();
var person = new Person();
```

✅ **Case 1 – `function Person(){}`**
Defines a function `Person`.

✅ **Case 2 – `var person = Person();`**

* Invokes the function **like a regular function**.
* If `Person` doesn’t `return` anything, it returns `undefined`.
* `this` will be `undefined` in strict mode or `window` in non-strict mode.

✅ **Case 3 – `var person = new Person();`**

* Calls `Person` as a **constructor**.
* Creates a new object, sets its prototype to `Person.prototype`.
* Returns the object (unless function explicitly returns another object).

🧩 **Example:**

```js
function Person(name) {
  this.name = name;
}

console.log(Person("Alice")); // undefined (adds name to window if not strict)
console.log(new Person("Bob")); // Person { name: "Bob" }
```

🔗 [MDN – new operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new)

---

### 11. Explain the differences on the usage of `foo` between:

```js
function foo() {}
var foo = function() {}
```

✅ **Case 1 – Function Declaration**

```js
function foo() {}
```

* Hoisted entirely (name + body).
* You can call it **before it’s defined**.

✅ **Case 2 – Function Expression**

```js
var foo = function() {}
```

* Variable `foo` is hoisted, but initialized to `undefined`.
* The function assignment happens at runtime.
* You **cannot call it before it’s defined**.

🧩 Example:

```js
foo1(); // works
function foo1() { console.log("declaration"); }

foo2(); // TypeError: foo2 is not a function
var foo2 = function() { console.log("expression"); };
```

🔗 [MDN – Function declarations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)

---

### 12. Can you explain what `Function.call` and `Function.apply` do? What is the notable difference?

✅ **Definition:**
Both invoke a function with an explicit `this` value.

* `call(thisArg, arg1, arg2, ...)` → arguments listed individually.
* `apply(thisArg, [argsArray])` → arguments provided as an array.

🧩 Example:

```js
function greet(greeting, punctuation) {
  console.log(greeting + " " + this.name + punctuation);
}

const person = { name: "Alice" };

greet.call(person, "Hello", "!"); // Hello Alice!
greet.apply(person, ["Hi", "..."]); // Hi Alice...
```

✅ **Difference:** `call` vs `apply` is just how arguments are passed.

🔗 [MDN – Function.prototype.call](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
🔗 [MDN – Function.prototype.apply](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)

---

### 13. Explain `Function.prototype.bind`.

✅ **Definition:**
`bind` creates a **new function** with a bound `this` value and optionally pre-set arguments. It does **not call the function immediately** (unlike `call`/`apply`).

🧩 Example:

```js
const obj = { x: 42 };

function print() {
  console.log(this.x);
}

const bound = print.bind(obj);
bound(); // 42
```

✅ **Partial application:**

```js
function multiply(a, b) {
  return a * b;
}
const double = multiply.bind(null, 2);
console.log(double(5)); // 10
```

🔗 [MDN – Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)

---

### 14. What is the difference between **feature detection**, **feature inference**, and **using the UA string**?

✅ **Feature Detection** (best practice):
Check if a feature exists before using it.

```js
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(...);
}
```

✅ **Feature Inference** (risky):
Assume availability of feature because of another.

```js
if (document.getElementsByTagName) {
  // Assume querySelector also exists → may fail
}
```

✅ **UA (User Agent) sniffing** (worst practice):
Check browser via `navigator.userAgent`. Fragile & spoofable.

```js
if (navigator.userAgent.includes("Chrome")) { ... }
```

🔗 [MDN – Browser detection using the user agent](https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent)

---

### 15. Explain **hoisting**.

✅ **Definition:**
JavaScript moves **declarations** (not initializations) to the top of their scope at compile time.

🧩 **Function hoisting:**

```js
foo(); // works
function foo() { console.log("hoisted"); }
```

🧩 **Variable hoisting:**

```js
console.log(a); // undefined
var a = 5;
```

✅ **`let` and `const`:**

* Hoisted but not initialized → “temporal dead zone”.

```js
console.log(b); // ReferenceError
let b = 10;
```

🔗 [MDN – Hoisting](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)

---

### 16. What is **type coercion**? What are common pitfalls?

✅ **Definition:**
Type coercion = JS automatically converting values between types (`string`, `number`, `boolean`).

* **Implicit**: `"5" * 2 → 10`
* **Explicit**: `Number("5") → 5`

🧩 **Examples:**

```js
"5" + 1     // "51"  (string concat)
"5" - 1     // 4     (string → number)
[] + []     // ""    (array → string)
[] + {}     // "[object Object]"
!!"hi"      // true
```

✅ **Pitfalls:**

* `"0" == false` → true (confusing)
* Empty arrays/objects coerce weirdly

👉 Always prefer `===` (strict equality).

🔗 [MDN – Type conversions](https://developer.mozilla.org/en-US/docs/Glossary/Type_Conversion)

---

### 17. Describe **event bubbling**.

✅ Events start at the **target element** and propagate **upwards** through ancestors.

```js
<div id="parent">
  <button id="child">Click me</button>
</div>
```

```js
document.getElementById("parent").addEventListener("click", () => console.log("parent"));
document.getElementById("child").addEventListener("click", () => console.log("child"));
```

Clicking child logs:

```
child
parent
```

🔗 [MDN – Event bubbling](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#bubbling)

---

### 18. Describe **event capturing**.

✅ Opposite of bubbling: events flow **top-down** (root → target).
Enabled via `addEventListener(type, listener, true)`.

🧩 Example:

```js
parent.addEventListener("click", () => console.log("capture parent"), true);
```

Order: `capture parent → child listener → bubble parent`.

🔗 [MDN – Event flow](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#capture)

---

### 19. What is the difference between an **attribute** and a **property**?

✅ **Attribute:**

* Defined in HTML.
* Static initial values.

✅ **Property:**

* Defined on DOM objects.
* Dynamic, reflects state.

🧩 Example:

```html
<input id="el" value="hello">
```

```js
const el = document.getElementById("el");
el.getAttribute("value"); // "hello" (original attribute)
el.value;                 // "hello" (property)
el.value = "world";
el.getAttribute("value"); // still "hello"
```

🔗 [MDN – attributes vs properties](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes)

---

### 20. What are the pros and cons of **extending built-in JS objects**?

✅ **Pros:**

* Add missing functionality (polyfills).

```js
if (!Array.prototype.first) {
  Array.prototype.first = function() { return this[0]; }
}
```

✅ **Cons:**

* Risk of conflicts with future standards.
* Can break third-party code.
* Not recommended (except polyfills with proper guards).

🔗 [MDN – Avoid extending natives](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain#bad_practice_extending_natives)

---

### 21. What is the difference between `==` and `===`?

✅ `==` (loose equality): compares values with **type coercion**.
✅ `===` (strict equality): compares values **without coercion**.

🧩 Example:

```js
0 == false   // true
0 === false  // false

"5" == 5     // true
"5" === 5    // false
```

👉 Best practice: use `===` unless you explicitly want coercion.

🔗 [MDN – Equality comparisons](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)

---

### 22. Explain the **same-origin policy** with regards to JavaScript.

✅ **Definition:**
A page can only access data from the **same origin** (protocol + domain + port).

✅ **Purpose:**
Prevents XSS & CSRF (security isolation).

🧩 Example:

* Page at `https://example.com` can’t fetch `https://other.com` unless CORS headers allow it.

🔗 [MDN – Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)

---

### 23. Why is it called a **Ternary operator**?

✅ **Definition:**
Because it takes **three operands**: `condition ? expr1 : expr2`.

🧩 Example:

```js
let age = 20;
let status = age >= 18 ? "adult" : "minor";
```

---

### 24. What is **strict mode**? Pros/cons?

✅ **Definition:**
`"use strict";` makes JS execute in stricter parsing mode.

✅ **Advantages:**

* Prevents accidental globals.
* Disallows duplicate params.
* Throws on invalid assignments.

🧩 Example:

```js
"use strict";
x = 5; // ReferenceError: x is not defined
```

✅ **Disadvantages:**

* Can break legacy code relying on sloppy behavior.

🔗 [MDN – Strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)

---

### 25. What are some advantages/disadvantages of writing in a language that **compiles to JS** (e.g. TypeScript, CoffeeScript, Elm)?

✅ **Advantages:**

* Type safety (TypeScript).
* Cleaner syntax, advanced language features.
* Productivity and tooling (autocomplete, linting).

✅ **Disadvantages:**

* Build step required.
* Debugging harder (though source maps help).
* Ecosystem lock-in.

🔗 [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

### 26. What tools and techniques do you use for **debugging JS code**?

✅ **Tools:**

* **Browser DevTools** → breakpoints, watch expressions, network tab.
* **console API**: `log`, `warn`, `error`, `table`, `trace`, `time`.
* **Linters**: ESLint for catching errors early.
* **Debugger statement**: pauses code execution.
* **Unit tests**: Jest, Vitest.

🧩 Example:

```js
console.table([{id: 1, name: "Alice"}, {id: 2, name: "Bob"}]);
```

🔗 [Chrome DevTools Guide](https://developer.chrome.com/docs/devtools/)

---

### 27. Explain the difference between **mutable** and **immutable** objects.

✅ **Mutable:** can be changed after creation.
✅ **Immutable:** cannot be changed, new copy created.

🧩 **Examples:**

* Mutable: `let obj = {x:1}; obj.x=2;`
* Immutable: `Object.freeze(obj)` or libraries like **Immutable.js**.

✅ **Pros of immutability:**

* Easier debugging.
* Predictable state.
* Works well with React/Redux.

✅ **Cons:**

* More memory usage.
* Performance overhead for large objects.

🔗 [MDN – Object.freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)

---

### 28. Explain the difference between **synchronous** and **asynchronous** functions.

✅ **Synchronous:**
Runs line by line, blocking further execution.

✅ **Asynchronous:**
Non-blocking, allows continuation while waiting.

🧩 Example:

```js
console.log("A");
setTimeout(() => console.log("B"), 1000);
console.log("C");
// Output: A, C, B
```

🔗 [MDN – Concurrency model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)

---

### 29. What is the **event loop**? Difference between **call stack** and **task queue**?

✅ **Event loop:**
JS runtime mechanism that checks the call stack & task queues, ensuring async tasks run correctly.

🧩 Example flow:

```js
console.log("1");
setTimeout(() => console.log("2"), 0);
console.log("3");
// Output: 1, 3, 2
```

✅ **Call Stack:**
Functions executing right now.

✅ **Task Queue / Callback Queue:**
Holds async callbacks waiting to run.

🔗 [Jake Archibald – In the loop](https://www.youtube.com/watch?v=cCOL7MC4Pl0)

---

### 30. What are the differences between variables created using `let`, `var`, or `const`?

✅ **var:**

* Function scoped.
* Hoisted (initialized as `undefined`).
* Allows redeclaration.

✅ **let:**

* Block scoped.
* Hoisted but in temporal dead zone.
* No redeclaration.

✅ **const:**

* Block scoped.
* Must be initialized.
* Binding is immutable, but object properties **can still change**.

🧩 Example:

```js
const obj = { x: 1 };
obj.x = 2; // allowed
// obj = {} // error
```

👉 To make fully immutable → use `Object.freeze(obj)`.

🔗 [MDN – var](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)

---

### 31. What are the differences between **ES6 classes** and **ES5 function constructors**?

✅ **ES5 constructor:**

```js
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function() {
  console.log("Hi " + this.name);
};
```

✅ **ES6 class:**

```js
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    console.log(`Hi ${this.name}`);
  }
}
```

🔑 **Differences:**

* Classes are syntactic sugar over prototypes.
* Classes have `constructor` + methods auto-added to prototype.
* Class methods are **non-enumerable**.
* Classes run in **strict mode** by default.
* Can use `extends` + `super`.

🔗 [MDN – Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)

---

### 32. Use case for **arrow function syntax** and differences from other functions?

✅ **Use case:** Shorter syntax + lexical `this`.

```js
setTimeout(() => console.log(this), 1000);
```

Arrow preserves `this` from enclosing scope (useful in callbacks).

✅ **Differences:**

* No `this`, `arguments`, `new.target`.
* Cannot be used as constructors (`new () => {}` throws).
* Always anonymous.

🔗 [MDN – Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)

---

### 33. What advantage is there for using arrow syntax for methods in constructors?

✅ Ensures `this` binding automatically. No need for `.bind(this)`.

🧩 Example in React class components:

```js
class Button extends React.Component {
  handleClick = () => {
    console.log(this.props.label);
  };
}
```

Without arrow, you’d need `this.handleClick = this.handleClick.bind(this)` in constructor.

---

### 34. What is the definition of a **higher-order function**?

✅ **Definition:** A function that either:

* Takes one or more functions as arguments, OR
* Returns a function.

🧩 Example:

```js
function withLogging(fn) {
  return (...args) => {
    console.log("Calling with", args);
    return fn(...args);
  };
}

const sum = (a, b) => a + b;
const loggedSum = withLogging(sum);
console.log(loggedSum(2, 3)); // logs + returns 5
```

🔗 [MDN – Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)

---

### 35. Example of **destructuring** an object or array?

🧩 **Array:**

```js
const [first, second] = [10, 20];
console.log(first); // 10
```

🧩 **Object:**

```js
const { name, age } = { name: "Alice", age: 30 };
console.log(name); // Alice
```

🧩 **With defaults:**

```js
const { role = "guest" } = {};
console.log(role); // guest
```

🔗 [MDN – Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)

---

### 36. Example of generating a string with **template literals**?

🧩 Example:

```js
const name = "Alice";
const age = 25;
console.log(`Hello, my name is ${name}, and I’m ${age} years old.`);
```

Supports **multi-line**:

```js
const poem = `Roses are red
Violets are blue`;
```

🔗 [MDN – Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)

---

### 37. Example of a **curry function** and why it’s useful?

✅ **Definition:** Currying transforms a function of multiple args → sequence of functions.

🧩 Example:

```js
function currySum(a) {
  return (b) => (c) => a + b + c;
}
console.log(currySum(1)(2)(3)); // 6
```

✅ **Advantages:**

* Function reusability.
* Partial application.
* Functional composition.

🔗 [MDN – Currying](https://developer.mozilla.org/en-US/docs/Glossary/Currying)

---

### 38. Benefits of using **spread syntax** and difference from **rest syntax**?

✅ **Spread (`...`)** → expand.

```js
const arr = [1, 2, 3];
const copy = [...arr]; // [1,2,3]
const merged = [...arr, 4, 5];
```

✅ **Rest (`...`)** → collect.

```js
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
console.log(sum(1, 2, 3)); // 6
```

🔗 [MDN – Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
🔗 [MDN – Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)

---

### 39. How can you **share code between files**?

✅ **Options:**

* **ES Modules**: `export` / `import`.
* **CommonJS**: `module.exports` / `require()` (Node).
* **Bundlers**: Webpack, Vite, Rollup.
* **Packages**: npm.

🧩 Example:

```js
// utils.js
export function add(a, b) { return a + b; }

// main.js
import { add } from "./utils.js";
```

🔗 [MDN – Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

---

### 40. Why might you want to create **static class members**?

✅ **Static members:** Belong to the class itself, not instances.
Used for **utility methods, constants, counters**.

🧩 Example:

```js
class MathUtil {
  static add(a, b) {
    return a + b;
  }
}

console.log(MathUtil.add(2, 3)); // 5
```

✅ **Use cases:**

* Factory methods.
* Configuration values.
* Shared utilities.

🔗 [MDN – static](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static)

---

### 41. What is the difference between **`while`** and **`do-while`** loops?

✅ **while**

* Condition is checked **before** loop body runs.
* Body may not run at all.

✅ **do-while**

* Body runs **at least once**, condition checked **after**.

🧩 Example:

```js
let x = 0;

while (x > 0) {
  console.log("while"); // never runs
}

do {
  console.log("do-while"); // runs once
} while (x > 0);
```

🔗 [MDN – Loops](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration)

---

### 42. What is a **Promise**? Where and how would you use it?

✅ **Definition:**
Promise = object representing a future value (pending → fulfilled/rejected).

✅ **Use cases:**

* Async operations (network calls, timers, file I/O).

🧩 Example:

```js
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve("done"), 1000);
});

p.then((val) => console.log(val)) // "done"
 .catch((err) => console.error(err));
```

✅ **Promise chaining:**

```js
fetch("/data.json")
  .then(res => res.json())
  .then(data => console.log(data));
```

🔗 [MDN – Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

---

### 43. Discuss how you might use **OOP principles** in JS.

✅ **Encapsulation**: Hide details with closures or private fields.
✅ **Inheritance**: Use `class` + `extends` or prototype chain.
✅ **Polymorphism**: Override methods in subclasses.
✅ **Abstraction**: Define interfaces via TypeScript or base classes.

🧩 Example:

```js
class Animal {
  speak() { console.log("sound"); }
}

class Dog extends Animal {
  speak() { console.log("woof"); }
}
```

---

### 44. What is the difference between **event.target** and **event.currentTarget**?

✅ **event.target**

* The element that **triggered** the event.

✅ **event.currentTarget**

* The element whose **listener is currently running**.

🧩 Example:

```js
parent.addEventListener("click", (e) => {
  console.log("target:", e.target);
  console.log("currentTarget:", e.currentTarget);
});
```

If a child inside parent is clicked →

* `target = child`
* `currentTarget = parent`

🔗 [MDN – event.target](https://developer.mozilla.org/en-US/docs/Web/API/Event/target)

---

### 45. What is the difference between **event.preventDefault()** and **event.stopPropagation()**?

✅ **event.preventDefault()**

* Prevents default browser behavior.
* Example: stop form submit → page reload.

✅ **event.stopPropagation()**

* Stops event from bubbling up/down.
* Example: prevent parent listener firing.

🧩 Example:

```js
form.addEventListener("submit", (e) => {
  e.preventDefault(); // no reload
});

child.addEventListener("click", (e) => {
  e.stopPropagation(); // parent won't fire
});
```

🔗 [MDN – Event.preventDefault](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)

---

# 🧩 Coding Questions

---

### Q1. Make this work:

```js
duplicate([1,2,3,4,5]); // [1,2,3,4,5,1,2,3,4,5]
```

✅ Solution:

```js
function duplicate(arr) {
  return arr.concat(arr);
}
```

---

### Q2. Create a **FizzBuzz** loop (1–100).

```js
for (let i = 1; i <= 100; i++) {
  if (i % 15 === 0) console.log("fizzbuzz");
  else if (i % 3 === 0) console.log("fizz");
  else if (i % 5 === 0) console.log("buzz");
  else console.log(i);
}
```

---

### Q3. What will be returned by each?

```js
console.log("hello" || "world"); // "hello" (first truthy)
console.log("foo" && "bar");     // "bar" (last truthy if all truthy)
```

---

### Q4. Write an **IIFE (Immediately Invoked Function Expression)**

```js
(function() {
  console.log("Runs immediately");
})();
```

Or ES6:

```js
(() => console.log("Arrow IIFE"))();
```

---
