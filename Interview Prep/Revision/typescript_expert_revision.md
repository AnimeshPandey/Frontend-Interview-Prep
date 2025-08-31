# 🟦 TypeScript Expert Revision Handbook

## 📑 Table of Contents

- [Fundamentals](#-fundamentals-expert-level)
- [Advanced Types](#-advanced-types)
- [Generics in Depth](#-generics-in-depth)
- [Type Inference & Compatibility](#-type-inference--compatibility)
- [Type Safety in JavaScript Interop](#-type-safety-in-javascript-interop)
- [Type Guards & Narrowing](#-type-guards--narrowing)
- [Advanced Patterns](#-advanced-patterns)
- [TypeScript in React](#-typescript-in-react)
- [Performance & Scaling](#-performance--scaling-typescript)
- [Ecosystem & Future](#-ecosystem--future)

---

# 🟦 TypeScript Expert Revision Handbook


# 🟦 Fundamentals (Expert Level)

---

## 1. 🧩 Type System vs Runtime Behavior

**Definition:**
TypeScript is a **compile-time type system** — all types are erased at runtime.

### ✅ Key Points

* Types are **structural**, not nominal (duck typing).
* Type checking = compile-time only.
* At runtime, it’s just JavaScript.

### ⚠️ Gotchas

* Type safety doesn’t prevent runtime errors:

```ts
function greet(name: string) {
  return "Hello " + name.toUpperCase();
}
greet((123 as unknown) as string); // compiles, but runtime crash
```

* No runtime enforcement — you need runtime validators (`zod`, `io-ts`, `yup`).

### 🎯 Interview One-Liner

> “TypeScript’s types disappear at runtime. They make dev-time guarantees, but runtime safety requires explicit validation.”

---

## 2. 🔢 Core Primitive Types

### ✅ Basic Types

* `string`, `number`, `boolean`
* `null`, `undefined`
* `symbol`, `bigint`

### ✅ Special Types

* `any` → Opt-out of type system (unsafe).
* `unknown` → Safer alternative; must narrow before use.
* `never` → Function that never returns (errors, infinite loops).
* `void` → Function returns nothing.

### ⚠️ Gotchas

```ts
let x: any = 42;
x.toUpperCase(); // compiles, runtime crash

let y: unknown = 42;
y.toUpperCase(); // ❌ compile error
```

### 🎯 Interview One-Liner

> “`any` disables safety. Prefer `unknown` when you don’t know the type, since it forces narrowing before use.”

---

## 3. 🏷️ Type Assertions vs Casting

**Definition:**
Tell the compiler “trust me, this is of type X.”

### ✅ Syntax

```ts
const el = document.getElementById("foo") as HTMLDivElement;
```

### ✅ Non-null Assertion

```ts
const el = document.getElementById("foo")!; // never null
```

### ⚠️ Gotchas

* Overusing assertions bypasses safety.
* Wrong assertions → runtime crashes.
* Non-null `!` can hide real null bugs.

### 🎯 Interview One-Liner

> “Assertions tell TS to trust you. They don’t change runtime — overuse can hide real errors.”

---

## 4. 🔍 Type Narrowing (Control Flow Analysis)

**Definition:**
TS refines types based on runtime checks.

### ✅ Techniques

* `typeof`
* `instanceof`
* Equality checks
* Discriminated unions (tag property)

### Example

```ts
function printLen(x: string | string[]) {
  if (typeof x === "string") console.log(x.length);
  else console.log(x.length); // string[] length
}
```

### ⚠️ Gotchas

* Narrowing only works if TS can **see** the check.
* External function calls won’t narrow unless you define **type predicates**.

```ts
function isString(x: unknown): x is string {
  return typeof x === "string";
}
```

### 🎯 Interview One-Liner

> “TypeScript narrows unions using control flow. You can extend it with custom type predicates.”

---

## 5. 🚦 Strict Null Checking

**Definition:**
With `strictNullChecks`, `null` and `undefined` are not assignable to other types unless explicitly included.

### ✅ Example

```ts
let x: string = null; // ❌ error under strictNullChecks
let y: string | null = null; // ✅
```

### ✅ Optional Chaining + Nullish Coalescing

```ts
const name = user?.profile?.name ?? "Guest";
```

### ⚠️ Gotchas

* Many JS libs don’t account for `undefined`.
* Without `strictNullChecks`, you get **unsound behavior** (nullable everywhere).

### 🎯 Interview One-Liner

> “Strict null checks make nullability explicit, avoiding the billion-dollar mistake. Combine with optional chaining and nullish coalescing.”

---

## 6. 🔎 Structural Typing (vs Nominal)

**Definition:**
TS uses **structural typing** — compatibility is based on shape, not declared type.

### ✅ Example

```ts
type Point = { x: number; y: number };
type Coord = { x: number; y: number };

let a: Point = { x: 1, y: 2 };
let b: Coord = a; // ✅ works (same shape)
```

### ⚠️ Gotchas

* Extra properties are rejected in **object literals**:

```ts
let p: Point = { x: 1, y: 2, z: 3 }; // ❌ error
```

* But extra props are allowed if passed as variable:

```ts
const tmp = { x: 1, y: 2, z: 3 };
let p: Point = tmp; // ✅ works
```

### 🎯 Interview One-Liner

> “TypeScript is structurally typed — if it quacks like a duck, it’s assignable. But object literals have stricter excess property checks.”

---

## 7. 📝 Type Aliases vs Interfaces

**Definition:**
Two ways to define object types.

### ✅ Differences

* **Interface:** extendable via declaration merging.
* **Type Alias:** supports unions, intersections, primitives.

### Example

```ts
interface A { x: number }
interface A { y: number } // merged
type B = { x: number } & { y: number } // no merging, must intersect
```

### ⚠️ Gotchas

* Prefer `interface` for public APIs (extendable).
* Prefer `type` for unions and complex compositions.

### 🎯 Interview One-Liner

> “Interfaces are open (mergeable), types are closed but more flexible (unions, intersections). Use each where it fits.”

---

## 8. 📦 Enums vs Literal Types

### ✅ Enums

```ts
enum Direction { Up, Down }
```

### ✅ Literal Unions

```ts
type Direction = "up" | "down";
```

### ⚠️ Gotchas

* **String literal unions** are usually better (type-safe, no runtime overhead).
* Enums generate runtime objects → heavier.
* `const enum` is inlined at compile time but can break tooling.

### 🎯 Interview One-Liner

> “Prefer literal unions over enums — they’re lighter and more type-safe. Use enums only when runtime mapping is required.”

---


# 🟦 Advanced Types

---

## 1. ➕ Union & Intersection Types

### ✅ Union (`|`)

* Represents **either type**.

```ts
type Input = string | number;
let val: Input = "hi";  // ✅
val = 42;               // ✅
```

### ✅ Intersection (`&`)

* Combines multiple types.

```ts
type Person = { name: string };
type Worker = { company: string };
type Employee = Person & Worker; 
// { name: string; company: string }
```

### ⚠️ Gotchas

* Union narrows to shared members:

```ts
function len(x: string | string[]) {
  return x.length; // works (length exists on both)
}
```

* Intersection of incompatible types → `never`:

```ts
type Impossible = string & number; // never
```

### 🎯 One-Liner

> “Unions = OR, intersections = AND. Incompatible intersections collapse to never.”

---

## 2. 🔢 Literal Types & Const Assertions

### ✅ Literal Types

```ts
let dir: "up" | "down";
dir = "up"; // ✅
dir = "left"; // ❌
```

### ✅ `as const`

* Locks values into literal types.

```ts
const colors = ["red", "green"] as const;
type Color = typeof colors[number]; // "red" | "green"
```

### 🎯 One-Liner

> “Literal types restrict values to exact strings/numbers. `as const` freezes arrays/objects for inference.”

---

## 3. 📝 Template Literal Types

### ✅ Key Points

* Build strings at type level.

```ts
type Event = `on${Capitalize<"click" | "hover">}`;
// "onClick" | "onHover"
```

### ✅ Use Cases

* Event handler names.
* Typed CSS props.
* API route patterns.

### 🎯 One-Liner

> “Template literal types compose strings at type level — great for event names, routes, and API typings.”

---

## 4. 🧮 Conditional Types

**Definition:**
`T extends U ? X : Y`

### ✅ Example

```ts
type IsString<T> = T extends string ? true : false;
type A = IsString<"hi">;   // true
type B = IsString<number>; // false
```

### ✅ Distributive Behavior

```ts
type ToArray<T> = T extends any ? T[] : never;
type C = ToArray<string | number>; // string[] | number[]
```

### ⚠️ Gotchas

* Distribution only happens on **naked type parameters**.
* Use brackets to disable:

```ts
type NoDistrib<T> = [T] extends [any] ? T[] : never;
```

### 🎯 One-Liner

> “Conditional types let you branch at type level. By default they distribute over unions.”

---

## 5. 🗂️ Mapped Types

### ✅ Basics

```ts
type OptionsFlags<T> = {
  [K in keyof T]: boolean;
};
type Features = { darkMode: () => void };
type Flags = OptionsFlags<Features>; 
// { darkMode: boolean }
```

### ✅ Modifiers

* `readonly`
* `?` optional
* `-readonly` / `-?` to remove

```ts
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
```

### 🎯 One-Liner

> “Mapped types iterate over keys to transform shape — add/remove optionality, readonly, etc.”

---

## 6. 🛠️ Utility Types

### ✅ Built-ins

* `Partial<T>` → all optional
* `Required<T>` → all required
* `Readonly<T>` → all readonly
* `Pick<T, K>` → subset
* `Omit<T, K>` → all except
* `Record<K, V>` → dict type
* `ReturnType<T>` → infer fn return
* `Parameters<T>` → tuple of args
* `InstanceType<T>` → type of `new T()`

### Example

```ts
type Todo = { id: number; title: string; done?: boolean };
type TodoDraft = Partial<Todo>; // all optional
```

### 🎯 One-Liner

> “Utility types like Partial, Pick, Omit, Record abstract common transformations of object types.”

---

## 7. 🧩 Key Remapping in Mapped Types (TS 4.1+)

```ts
type Prefix<T> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: T[K]
};
type Events = Prefix<{ click: () => void }>;
// { onClick: () => void }
```

### 🎯 One-Liner

> “Mapped types can rename keys dynamically using `as` clauses and template literals.”

---

## 8. 🌀 Recursive & Deep Types

### ✅ Recursive Types

```ts
type JSONValue = string | number | boolean | JSONValue[] | { [k: string]: JSONValue };
```

### ✅ Deep Utility

```ts
type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };
```

### ⚠️ Gotchas

* Deep recursion can slow compiler dramatically.
* Use cautiously in very large codebases.

### 🎯 One-Liner

> “Recursive types enable JSON-like structures and deep utilities, but may hit compiler perf limits.”

---


# 🟦 Generics in Depth

---

## 1. 🧩 Generic Functions

**Definition:**
Functions parameterized with type variables.

### ✅ Example

```ts
function identity<T>(arg: T): T {
  return arg;
}
const a = identity<string>("hello");
const b = identity(42); // inferred as number
```

### 🎯 One-Liner

> “Generics make functions reusable across types, with inference for convenience.”

---

## 2. 🔒 Constraints (`extends`)

Restrict generics to a subset of types.

### ✅ Example

```ts
function getLength<T extends { length: number }>(x: T) {
  return x.length;
}
getLength("hi");       // ✅
getLength([1,2,3]);    // ✅
getLength(42);         // ❌
```

### 🎯 One-Liner

> “Constraints limit generics with `extends`, allowing access to known members.”

---

## 3. 🏷️ Generic Interfaces & Classes

### ✅ Interfaces

```ts
interface Box<T> { value: T }
const stringBox: Box<string> = { value: "hi" };
```

### ✅ Classes

```ts
class Container<T> {
  constructor(public value: T) {}
}
const c = new Container<number>(123);
```

### 🎯 One-Liner

> “Generics extend beyond functions — interfaces and classes can also be parameterized.”

---

## 4. ⚖️ Default Generic Parameters

Provide defaults for flexibility.

### ✅ Example

```ts
interface ApiResponse<T = any> {
  data: T;
  error?: string;
}
const res: ApiResponse = { data: "hi" }; // T defaults to any
```

### 🎯 One-Liner

> “Defaults reduce boilerplate when generic type can be inferred or safely assumed.”

---

## 5. 🔄 Keyof & Indexed Access with Generics

### ✅ Keyof

```ts
type Keys<T> = keyof T;
type User = { id: number; name: string };
type UKeys = Keys<User>; // "id" | "name"
```

### ✅ Indexed Access

```ts
type Value<T, K extends keyof T> = T[K];
type NameType = Value<User, "name">; // string
```

### 🎯 One-Liner

> “Keyof + indexed access lets you make type-safe utilities (like Pick/Omit).”

---

## 6. 🎭 Conditional Generics

Generics inside conditional types = super powerful.

### ✅ Example

```ts
type Flatten<T> = T extends any[] ? T[number] : T;
type A = Flatten<string[]>; // string
type B = Flatten<number>;   // number
```

### 🎯 One-Liner

> “Conditional generics let you branch inside generics — e.g., flatten arrays, unwrap promises.”

---

## 7. ⚖️ Variance (Covariance vs Contravariance)

**Definition:**
How subtyping interacts with generics.

### ✅ Covariance

* Safe to use subtype in place of supertype.

```ts
let str: string = "hi";
let val: string | number = str; // ✅
```

### ✅ Contravariance

* Function parameters are contravariant:

```ts
type Fn<T> = (x: T) => void;
let fn: Fn<string | number> = (x: string) => {}; // ✅
```

### ⚠️ Gotchas

* TypeScript uses **bivariant function parameters** by default for compatibility (unsafe but practical).
* `--strictFunctionTypes` enforces contravariance.

### 🎯 One-Liner

> “Function parameters are contravariant, return types are covariant. TS is bivariant by default unless strictFunctionTypes is on.”

---

## 8. 🌀 Higher-Kinded Types (HKTs, Workarounds)

TypeScript doesn’t support true HKTs (types parameterized over type constructors), but you can simulate.

### ✅ Example

```ts
interface Functor<F> {
  map<A, B>(fa: F & { value: A }, fn: (a: A) => B): F & { value: B }
}
```

Or libraries like `fp-ts` emulate HKT with encoding tricks.

### 🎯 One-Liner

> “TypeScript lacks HKTs, but libraries like fp-ts emulate them with encoding patterns.”

---

## 9. 🔗 Generics in React

### ✅ Typing `useState`

```ts
const [val, setVal] = useState<string | null>(null);
```

### ✅ Typing `useReducer`

```ts
type Action = { type: "inc" } | { type: "dec" };
function reducer(s: number, a: Action): number {
  return a.type === "inc" ? s+1 : s-1;
}
const [count, dispatch] = useReducer(reducer, 0);
```

### ✅ Typing Props

```ts
interface ButtonProps<T extends "button" | "a"> {
  as: T;
  props: T extends "a" ? { href: string } : { onClick: () => void };
}
```

### 🎯 One-Liner

> “Generics in React type hooks, props, reducers, and flexible components (e.g., polymorphic components).”

---


# 🟦 Type Inference & Compatibility

---

## 1. 🔍 Type Inference Basics

**Definition:**
TypeScript infers types when not explicitly annotated.

### ✅ Examples

```ts
let x = 42;      // inferred as number
let y = [1, 2];  // inferred as number[]
```

### ✅ Contextual Typing

* Function parameters infer type from usage:

```ts
window.onmousedown = (e) => { 
  console.log(e.button); // e inferred as MouseEvent
};
```

### 🎯 One-Liner

> “Type inference works both from initializer values and from context (like callbacks).”

---

## 2. ⚖️ Excess Property Checks

**Definition:**
TypeScript enforces stricter checks for object **literals**.

### ✅ Example

```ts
type User = { name: string };
const u1: User = { name: "Alice", age: 30 }; // ❌ excess property
const tmp = { name: "Alice", age: 30 };
const u2: User = tmp; // ✅ allowed (assignment, not literal)
```

### ⚠️ Gotchas

* Literal checks prevent typos in inline objects.
* Assigning via variable bypasses check.

### 🎯 One-Liner

> “Object literals get extra checks for unknown properties. Assign via variable to bypass.”

---

## 3. 🔄 Type Widening & Narrowing

### ✅ Widening

* Without `as const`, literal types widen:

```ts
let a = "hi";     // type string (widened)
const b = "hi";   // type "hi" (literal)
```

### ✅ Narrowing

* Control-flow analysis narrows union types:

```ts
function f(x: string | null) {
  if (x !== null) return x.toUpperCase(); // narrowed to string
}
```

### ⚠️ Gotchas

* `let x = null` → type is `any` unless strictNullChecks.
* Arrays widen unless frozen with `as const`.

### 🎯 One-Liner

> “TS widens literals by default. Use `as const` to keep narrow literal types.”

---

## 4. 🏷️ Assignability & Compatibility

**Definition:**
TypeScript is **structurally typed** → assignability depends on shape.

### ✅ Example

```ts
type Point = { x: number; y: number };
type Coord = { x: number; y: number; z?: number };

let p: Point = { x: 1, y: 2 };
let c: Coord = p;  // ✅ works
p = c;             // ✅ works (z optional)
```

### ⚠️ Gotchas

* Function parameters are **bivariant** by default (unsafe).
* Use `strictFunctionTypes` for true contravariance.

### 🎯 One-Liner

> “TS uses structural typing: if shapes match, types are compatible. Functions default to bivariant params unless strict.”

---

## 5. 🧩 `any` vs `unknown` vs `never`

### ✅ any

* Opt-out of type checking.
* Can be assigned to/from anything.

```ts
let a: any = 42;
a.foo.bar(); // compiles, runtime error
```

### ✅ unknown

* Top type (safe any).
* Must be narrowed before use.

```ts
let b: unknown = 42;
b.toUpperCase(); // ❌ error
if (typeof b === "string") b.toUpperCase(); // ✅
```

### ✅ never

* Bottom type (no value possible).
* Used in exhaustiveness checks.

```ts
type Shape = { kind: "circle" } | { kind: "square" };
function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return 1;
    case "square": return 2;
    default: const _exhaustive: never = s; // ✅ ensures all cases handled
  }
}
```

### 🎯 One-Liner

> “`any` disables safety, `unknown` forces narrowing, `never` represents impossible cases.”

---

## 6. 🧠 Inference in Functions

### ✅ Return Inference

```ts
function add(a: number, b: number) {
  return a + b; // inferred as number
}
```

### ✅ Generic Inference

```ts
function first<T>(arr: T[]): T {
  return arr[0];
}
const v = first(["a", "b"]); // v: string
```

### ⚠️ Gotchas

* Sometimes inference is **too wide**:

```ts
function f() { return Math.random() ? "a" : "b"; }
// inferred as string, not "a"|"b"
```

→ Fix with `as const` or explicit typing.

### 🎯 One-Liner

> “Function return types are inferred, but unions may widen. Use `as const` or annotations for precision.”

---

## 7. 🛠️ Type Compatibility in Enums

### ✅ Numeric Enums

* Compatible with numbers.

```ts
enum Dir { Up, Down }
let d: Dir = 0; // ✅
```

### ✅ String Enums

* Not compatible with strings unless explicitly.

```ts
enum Color { Red = "red" }
let c: Color = "red"; // ❌
```

### 🎯 One-Liner

> “Numeric enums are assignable to numbers, but string enums require exact matches.”

---

## 8. ⚡ Type Compatibility in Tuples vs Arrays

### ✅ Tuples

```ts
type Pair = [string, number];
let p: Pair = ["hi", 42];
```

* Tuples have fixed length, arrays are flexible.

### ⚠️ Gotchas

```ts
let t: [number, number] = [1, 2];
t.push(3); // ✅ allowed! TS doesn’t enforce length at runtime
```

### 🎯 One-Liner

> “Tuples enforce order but not length at runtime — they’re arrays under the hood.”

---


# 🟦 Type Safety in JavaScript Interop

---

## 1. 📜 Ambient Declarations (`declare`)

**Definition:**
Tell TypeScript about variables/modules that exist at runtime (JS), but aren’t defined in TS code.

### ✅ Examples

```ts
declare const VERSION: string;
console.log(VERSION); // TS knows VERSION is string

declare module "legacy-lib" {
  export function legacyFn(): void;
}
```

### ⚠️ Gotchas

* Declarations don’t generate runtime code — only inform compiler.
* If declaration doesn’t match actual runtime → runtime errors.

### 🎯 One-Liner

> “`declare` informs the type system about external JS values but doesn’t emit code. Accuracy is critical or you’ll get runtime errors.”

---

## 2. 📦 Type Declarations for JS Libraries

### ✅ Strategies

* **@types packages**:

```bash
npm install --save-dev @types/lodash
```

* **Manual `d.ts` files** for missing types:

```ts
// lodash.d.ts
declare module "lodash" {
  export function chunk<T>(arr: T[], size: number): T[][];
}
```

### ⚠️ Gotchas

* If types are outdated/mismatched → TS lies about API.
* Can “augment” instead of redefining (see below).

### 🎯 One-Liner

> “Missing types for JS libs? Install `@types` or write `.d.ts` files — but keep them accurate with the runtime.”

---

## 3. 🧩 Module Augmentation & Declaration Merging

**Definition:**
Extend existing module or type definitions without rewriting.

### ✅ Example

```ts
// add a method to lodash
declare module "lodash" {
  export function customHello(): string;
}
```

### ✅ Declaration Merging

* Interfaces with the same name merge:

```ts
interface User { id: number }
interface User { name: string }
const u: User = { id: 1, name: "Alice" }; // ✅
```

### ⚠️ Gotchas

* Augmentation is global → can cause conflicts across packages.
* Prefer module augmentation for libs, not `any` hacks.

### 🎯 One-Liner

> “Declaration merging/augmentation extends types safely. Useful for adding custom fields or extending 3rd-party libraries.”

---

## 4. 🎯 `as const` for Safe Interop

**Definition:**
`as const` freezes literals into **readonly** narrow types.

### ✅ Example

```ts
const roles = ["admin", "user", "guest"] as const;
type Role = typeof roles[number]; 
// "admin" | "user" | "guest"
```

### ✅ Use Case

* Ensures config/constants match at runtime.
* Great for enums/union types from JS arrays.

### 🎯 One-Liner

> “`as const` locks JS literals into readonly narrow types — perfect for role lists, config, or enum-like structures.”

---

## 5. ⚙️ `tsconfig` Strictness Flags

### ✅ Important Flags

* `strict` → enables all strict checks.
* `noImplicitAny` → no silent `any`.
* `strictNullChecks` → enforce explicit nullability.
* `noUncheckedIndexedAccess` → array lookups can return `undefined`.
* `exactOptionalPropertyTypes` → `?` means strictly optional.

### ⚠️ Gotchas

* Teams often disable strictness → leaks `any`.
* Migrating large JS → TS requires **incremental adoption**.

### 🎯 One-Liner

> “Always enable `strict`. Key flags like `noImplicitAny` and `strictNullChecks` catch hidden bugs in JS interop.”

---

## 6. 🛠️ Working with Untyped JS Objects

### ✅ Options

* Use `unknown` + type guards:

```ts
function isUser(u: any): u is { id: number } {
  return typeof u.id === "number";
}
```

* Or validate at runtime with **Zod/io-ts**:

```ts
import { z } from "zod";
const User = z.object({ id: z.number(), name: z.string() });
type User = z.infer<typeof User>;
```

### 🎯 One-Liner

> “Untyped JS objects should be validated at runtime with schemas (Zod/io-ts), not just trusted via `any`.”

---

## 7. 🔗 Migrating JS → TS (Gradual Typing)

### ✅ Strategies

* Rename `.js` → `.ts` or `.tsx`.
* Use `allowJs` + `checkJs` in tsconfig to gradually type JS.
* Add JSDoc annotations:

```js
/**
 * @param {string} name
 * @returns {string}
 */
function greet(name) { return "Hello " + name; }
```

* TS infers types from JSDoc until converted.

### ⚠️ Gotchas

* JSDoc typing is weaker than TS proper.
* Incremental migration often mixes `any` → must clean up later.

### 🎯 One-Liner

> “Migrate JS → TS gradually: enable `checkJs`, add JSDoc types, then refactor into full TypeScript.”

---

## 8. 🛡️ Runtime vs Compile-Time Safety

**Core Rule:**
Types vanish at runtime → if interoping with JS, you need **runtime checks**.

### ✅ Example

```ts
function safeParse(json: string): unknown {
  try { return JSON.parse(json) } catch { return null }
}
const data = safeParse("not-json"); // type unknown
// must validate before using
```

### 🎯 One-Liner

> “TypeScript only checks at compile time. For JS interop, add runtime validation to truly guarantee safety.”

---


# 🟦 Type Guards & Narrowing

---

## 1. 🔎 Built-in Type Guards: `typeof`

**Definition:**
`typeof` lets TypeScript narrow primitive types.

### ✅ Example

```ts
function log(val: string | number) {
  if (typeof val === "string") {
    console.log(val.toUpperCase()); // val: string
  } else {
    console.log(val.toFixed(2));    // val: number
  }
}
```

### ⚠️ Gotchas

* Only works on **primitives**: `"string" | "number" | "boolean" | "bigint" | "symbol" | "undefined" | "object" | "function"`.
* Doesn’t differentiate `null` vs `object` (`typeof null === "object"`).

### 🎯 One-Liner

> “Use `typeof` for primitives — but note `typeof null === 'object'`.”

---

## 2. 🏗️ Built-in Type Guards: `instanceof`

**Definition:**
Narrow objects by checking prototype chain.

### ✅ Example

```ts
function handleError(e: Error | string) {
  if (e instanceof Error) {
    console.error(e.message); // Error
  } else {
    console.error(e); // string
  }
}
```

### ⚠️ Gotchas

* Only works with classes/constructors (not plain objects).
* Inheritance hierarchy is respected.

### 🎯 One-Liner

> “Use `instanceof` for class-based narrowing — it checks prototype chain.”

---

## 3. 🧩 In-Operator Narrowing

**Definition:**
Check if a property exists in object → narrows union.

### ✅ Example

```ts
type Cat = { meow: () => void };
type Dog = { bark: () => void };

function speak(animal: Cat | Dog) {
  if ("meow" in animal) animal.meow();
  else animal.bark();
}
```

### 🎯 One-Liner

> “The `in` operator narrows unions by checking for property existence.”

---

## 4. 🏷️ Discriminated (Tagged) Unions

**Definition:**
Unions with a common literal field (“tag”) for safe narrowing.

### ✅ Example

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function area(s: Shape) {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "square": return s.side ** 2;
  }
}
```

### 🎯 One-Liner

> “Discriminated unions use a common literal field to guarantee safe narrowing in switches.”

---

## 5. 🛠️ Custom Type Predicates

**Definition:**
User-defined functions that tell TS a condition implies a type.

### ✅ Example

```ts
function isString(x: unknown): x is string {
  return typeof x === "string";
}

function log(x: unknown) {
  if (isString(x)) console.log(x.toUpperCase());
}
```

### 🎯 One-Liner

> “Custom type predicates (`x is T`) let you teach TS how to narrow beyond built-ins.”

---

## 6. 🚦 Exhaustiveness Checking with `never`

**Definition:**
Force handling all cases in a union.

### ✅ Example

```ts
type Shape =
  | { kind: "circle"; r: number }
  | { kind: "square"; s: number };

function perimeter(s: Shape) {
  switch (s.kind) {
    case "circle": return 2 * Math.PI * s.r;
    case "square": return 4 * s.s;
    default:
      const _exhaustive: never = s; // compile error if new case added
      return _exhaustive;
  }
}
```

### 🎯 One-Liner

> “Exhaustiveness checks with `never` ensure all union cases are handled — future-proofing code.”

---

## 7. 🧠 Control Flow Analysis

**Definition:**
TS tracks variables through branches to narrow automatically.

### ✅ Example

```ts
function f(x: string | null) {
  if (!x) return; 
  // x is now string, since null was filtered out
  return x.toUpperCase();
}
```

### ⚠️ Gotchas

* TS is **flow-sensitive** — order matters.
* Reassignments can widen again.

### 🎯 One-Liner

> “TS narrows types flow-sensitively — once a check passes, TS refines type until reassignment.”

---

## 8. 🧩 Assertion Functions (TS 3.7+)

**Definition:**
Custom functions that throw on invalid values while narrowing type.

### ✅ Example

```ts
function assertIsString(x: any): asserts x is string {
  if (typeof x !== "string") throw new Error("Not a string");
}

function shout(x: any) {
  assertIsString(x);
  console.log(x.toUpperCase()); // x: string
}
```

### 🎯 One-Liner

> “Assertion functions throw at runtime and tell TS the variable is narrowed if no error occurs.”

---

## 9. 📦 Combining Guards

### ✅ Example

```ts
function handle(input: string | number | null) {
  if (input == null) return;          // null/undefined filtered
  if (typeof input === "string") {    // narrowed to string
    return input.toUpperCase();
  }
  return input.toFixed(2);            // number
}
```

### 🎯 One-Liner

> “Combine guards (`== null`, `typeof`, `instanceof`) for precise narrowing of complex unions.”

---


# 🟦 Advanced Patterns

---

## 1. 🏷️ Branded Types (Nominal Typing in TS)

**Problem:**
TS is **structural** — `type UserId = string` is indistinguishable from any `string`.

**Solution:**
Add a “brand” field to enforce nominal typing.

### ✅ Example

```ts
type UserId = string & { __brand: "UserId" };
function getUser(id: UserId) {}
getUser("123" as UserId);  // ✅
getUser("random");         // ❌ must be branded
```

### 🎯 One-Liner

> “Branded types simulate nominal typing in TS, preventing accidental mixing of structurally identical types.”

---

## 2. 🌀 Opaque Types

**Definition:**
Similar to branded types, but completely hide the underlying type from consumers.

### ✅ Example

```ts
type Opaque<K, T> = T & { __TYPE__: K };
type UserId = Opaque<"UserId", string>;

function createUserId(s: string): UserId {
  return s as UserId;
}
```

### 🎯 One-Liner

> “Opaque types hide implementation details and prevent misuse, forcing controlled constructors.”

---

## 3. 🛠️ Recursive Utility Types

### ✅ DeepPartial

```ts
type DeepPartial<T> = {
  [K in keyof T]?: DeepPartial<T[K]>;
};
```

### ✅ DeepReadonly

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};
```

### ⚠️ Gotchas

* Deep recursion can slow down compiler.
* Use selectively in large projects.

### 🎯 One-Liner

> “Recursive types enable deep utilities like DeepPartial, but heavy use impacts compiler performance.”

---

## 4. 🧩 Conditional & Mapped Utilities

### ✅ NonNullable

```ts
type NonNullable<T> = T extends null | undefined ? never : T;
```

### ✅ Diff

```ts
type Diff<T, U> = T extends U ? never : T;
```

### ✅ Overwrite

```ts
type Overwrite<T, U> = Omit<T, keyof U> & U;
```

### 🎯 One-Liner

> “Mapped + conditional types let you build powerful utilities like Diff, Overwrite, NonNullable.”

---

## 5. 🔄 Variadic Tuple Types

**Definition:**
Model tuples of variable length with generics.

### ✅ Example

```ts
type Push<T extends any[], V> = [...T, V];
type T1 = Push<[1,2], 3>; // [1,2,3]

type Concat<T extends any[], U extends any[]> = [...T, ...U];
type T2 = Concat<[1,2], [3,4]>; // [1,2,3,4]
```

### 🎯 One-Liner

> “Variadic tuple types let you append, prepend, or merge tuples while preserving type precision.”

---

## 6. 🏗️ Builder Pattern in TypeScript

### ✅ Example

```ts
class RequestBuilder {
  private url: string = "";
  private method: "GET" | "POST" = "GET";
  
  setUrl(url: string) { this.url = url; return this; }
  setMethod(m: "GET" | "POST") { this.method = m; return this; }
  build() { return { url: this.url, method: this.method }; }
}

const req = new RequestBuilder().setUrl("/api").setMethod("POST").build();
```

### 🎯 One-Liner

> “Builder patterns ensure chained configuration APIs with type safety and autocomplete.”

---

## 7. 🛡️ Exact Types (Prevent Excess Keys)

**Problem:**
TS normally allows extra props via assignment.

**Solution:**
Create an `Exact<T, U>` utility.

### ✅ Example

```ts
type Exact<T, U extends T> = T & { [K in Exclude<keyof U, keyof T>]?: never };

type Person = { name: string };
const p: Exact<Person, { name: string; age: number }> = { name: "A", age: 20 }; 
// ❌ error: extra 'age'
```

### 🎯 One-Liner

> “Exact types prevent excess keys, useful for APIs where only known fields are allowed.”

---

## 8. 📦 Extracting Types from Values

### ✅ typeof + keyof

```ts
const config = {
  roles: ["admin", "user", "guest"] as const,
};
type Role = typeof config["roles"][number]; 
// "admin" | "user" | "guest"
```

### 🎯 One-Liner

> “Use `typeof` and `as const` to derive union types from runtime values like config arrays.”

---

## 9. 🧠 Phantom Types (Static Guarantees)

**Definition:**
Types that exist only at compile-time, to encode invariants.

### ✅ Example

```ts
type Celsius = number & { __unit: "Celsius" };
type Fahrenheit = number & { __unit: "Fahrenheit" };

function toF(c: Celsius): Fahrenheit { return (c * 9/5 + 32) as Fahrenheit; }

let t: Celsius = 100 as Celsius;
toF(t); // ✅
toF(100 as Fahrenheit); // ❌
```

### 🎯 One-Liner

> “Phantom types enforce domain-specific rules (like units) without runtime cost.”

---


# 🟦 TypeScript in React

---

## 1. 🎯 Typing Component Props

### ✅ Functional Components

```ts
type ButtonProps = {
  label: string;
  onClick?: () => void;
};

const Button: React.FC<ButtonProps> = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);
```

### ⚠️ Gotchas

* `React.FC` implicitly adds `children` prop — often unwanted.
* Better to type `children` explicitly.

```ts
type Props = { children?: React.ReactNode };
```

### 🎯 One-Liner

> “Prefer explicit prop typing over `React.FC` to avoid hidden `children`.”

---

## 2. 🏷️ Children Typing

### ✅ Common Patterns

```ts
type Props = { children: React.ReactNode }; // anything renderable
type Props2 = { children: React.ReactElement }; // exactly one element
type Props3<T> = { children: (data: T) => React.ReactNode }; // render prop
```

### 🎯 One-Liner

> “Use `ReactNode` for generic children, `ReactElement` for single elements, and functions for render props.”

---

## 3. 🧩 Typing Hooks (`useState`, `useReducer`)

### ✅ useState

```ts
const [count, setCount] = useState<number>(0); // explicit
const [name, setName] = useState("Alice"); // inferred as string
```

* `useState<T | null>(null)` when initial value is null.

### ✅ useReducer

```ts
type Action = { type: "inc" } | { type: "dec" };
function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "inc": return state + 1;
    case "dec": return state - 1;
  }
}
const [count, dispatch] = useReducer(reducer, 0);
```

### 🎯 One-Liner

> “Type state & actions explicitly in hooks. Use union types for reducers.”

---

## 4. 🌐 Typing Context Providers

### ✅ Example

```ts
type User = { id: string; name: string };
type UserContextType = { user: User | null; setUser: (u: User) => void };

const UserContext = React.createContext<UserContextType | undefined>(undefined);

function useUser() {
  const ctx = React.useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
}
```

### 🎯 One-Liner

> “Context values should include both data and setters, wrapped in a custom hook for safety.”

---

## 5. 🧵 Typing Refs & forwardRef

### ✅ DOM Refs

```ts
const inputRef = React.useRef<HTMLInputElement>(null);
inputRef.current?.focus();
```

### ✅ forwardRef

```ts
type InputProps = { label: string };
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label }, ref) => <input ref={ref} placeholder={label} />
);
```

### ✅ useImperativeHandle

```ts
type Handle = { focus: () => void };
const CustomInput = React.forwardRef<Handle>((props, ref) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));
  return <input ref={inputRef} />;
});
```

### 🎯 One-Liner

> “Use `forwardRef` with generic ref types. Expose imperative APIs with `useImperativeHandle`.”

---

## 6. 🧮 Typing Higher-Order Components (HOCs)

### ✅ Example

```ts
function withLoading<T>(Component: React.ComponentType<T>) {
  return (props: T & { loading: boolean }) =>
    props.loading ? <div>Loading...</div> : <Component {...props} />;
}
```

### ⚠️ Gotchas

* Must preserve props (`T`) and merge with new ones.
* Watch out for lost generics when wrapping.

### 🎯 One-Liner

> “HOCs should preserve original props via generics and merge additional ones.”

---

## 7. 🧑‍🔬 Typing Generic Components

### ✅ Example

```ts
type ListProps<T> = {
  items: T[];
  render: (item: T) => React.ReactNode;
};

function List<T>({ items, render }: ListProps<T>) {
  return <ul>{items.map(render)}</ul>;
}

<List items={[1, 2, 3]} render={(x) => <li>{x}</li>} />;
```

### 🎯 One-Liner

> “Generic components let props depend on type parameters — perfect for reusable lists and tables.”

---

## 8. 🔄 Typing Event Handlers

### ✅ Example

```ts
function Form() {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  return <input onChange={handleChange} />;
}
```

### ✅ Common Event Types

* `React.MouseEvent<HTMLButtonElement>`
* `React.ChangeEvent<HTMLInputElement>`
* `React.FormEvent<HTMLFormElement>`

### 🎯 One-Liner

> “Use React’s synthetic event types (MouseEvent, ChangeEvent) for handlers, parameterized by element type.”

---

## 9. 🧩 Typing Polymorphic `as` Components

### ✅ Example

```ts
type PolymorphicProps<T extends React.ElementType> = {
  as?: T;
  children: React.ReactNode;
} & React.ComponentProps<T>;

function Box<T extends React.ElementType = "div">({ as, ...props }: PolymorphicProps<T>) {
  const Component = as || "div";
  return <Component {...props} />;
}

<Box as="a" href="https://ts">Link</Box>; // href type-safe
```

### 🎯 One-Liner

> “Polymorphic components use `as` + generics + `ComponentProps<T>` to forward correct props.”

---


# 🟦 Performance & Scaling TypeScript

---

## 1. ⚡ Type-Checking Performance in Large Projects

### ✅ Common Bottlenecks

* Deeply nested conditional types.
* Overuse of recursive mapped types (e.g., DeepPartial, DeepReadonly).
* Giant union types (e.g., `"A" | "B" | ... | "Z"` with hundreds of members).
* Heavy `infer` usage inside generics.

### ✅ Tools

* `tsc --diagnostics` → measure type-check performance.
* `tsc --extendedDiagnostics` → detailed breakdown (parse time, check time, emit time).

### 🎯 One-Liner

> “The biggest type-check killers are deep recursion, massive unions, and heavy conditional types — profile with `--diagnostics`.”

---

## 2. 🛠️ Avoiding Over-Complex Types

### ✅ Problem

Some teams abuse TS to encode too much at type level.

```ts
type Crazy<T> = T extends string 
  ? { str: T } 
  : T extends number 
    ? { num: T } 
    : never;
```

* Hard to maintain, slows compiler.

### ✅ Guidelines

* Keep types simple for DX (developer experience).
* Don’t encode logic that belongs in **runtime code**.
* Prefer branded/opaque types for safety, instead of extreme conditional gymnastics.

### 🎯 One-Liner

> “Don’t over-engineer types — TS is for safety, not replacing runtime logic.”

---

## 3. 📦 Build Pipelines: `tsc` vs Babel vs SWC

### ✅ tsc

* Full type-checker + emit.
* Slowest, but canonical.

### ✅ Babel with `@babel/preset-typescript`

* Strips types → **no type-checking**.
* Fast, but must run `tsc --noEmit` separately.

### ✅ SWC (used in Next.js, Vite, Turborepo)

* Rust-based transpiler, very fast.
* Strips types only.

### ⚠️ Gotchas

* Babel/SWC do not catch type errors — must run type-check separately in CI.

### 🎯 One-Liner

> “Use SWC/Babel for fast builds, but keep `tsc --noEmit` in CI for type safety.”

---

## 4. 🔄 Incremental Compilation

### ✅ Options

* `"incremental": true` in `tsconfig.json` → saves `.tsbuildinfo` cache.
* `"composite": true` for project references (multi-package repos).

### ✅ Benefits

* Only re-check changed files.
* Required for monorepos with shared libraries.

### 🎯 One-Liner

> “Enable `incremental` + `composite` in tsconfig to avoid full re-checks in large repos.”

---

## 5. 🧩 Project References (Scaling Monorepos)

**Definition:**
Break project into multiple sub-projects with **clear build boundaries**.

### ✅ Example

```json
// tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/ui" },
    { "path": "./packages/server" }
  ]
}
```

### ✅ Benefits

* Faster builds (independent packages).
* Enforces dependency contracts.
* Works great with Nx/Turborepo.

### 🎯 One-Liner

> “Project references let you split large codebases into smaller typed units with enforced contracts.”

---

## 6. 🧠 Type-Only Imports & Exports (TS 3.8+)

### ✅ Example

```ts
import type { User } from "./types"; // stripped at runtime
export type { Config } from "./config";
```

### ✅ Benefits

* Avoids accidentally bundling type-only modules.
* Reduces unnecessary runtime imports.

### 🎯 One-Liner

> “Use `import type` and `export type` to ensure pure type imports don’t affect runtime bundles.”

---

## 7. ⚖️ Managing `any` at Scale

### ✅ Problems

* `any` spreads like a virus in codebases.
* One `any` can propagate through dozens of types.

### ✅ Solutions

* Use `unknown` instead of `any` when possible.
* Use `eslint` rules (`@typescript-eslint/no-explicit-any`).
* Introduce “escape hatches” (`TODO: fix any`) but track debt.

### 🎯 One-Liner

> “Manage `any` aggressively — prefer `unknown`, enforce lint rules, and track escape hatches.”

---

## 8. 📊 Large Codebase Best Practices

* ✅ Strict mode always (`strict: true`).
* ✅ Type-only imports (`import type`).
* ✅ Use **Zod/io-ts** for runtime validation of API responses.
* ✅ Add `tsc --noEmit` in CI to enforce type safety.
* ✅ Use `paths` in `tsconfig.json` for clean imports.
* ✅ Monitor `tsc --diagnostics` to spot type-check slowdowns.

### 🎯 One-Liner

> “Large TS projects succeed when strict mode, type-only imports, runtime validation, and CI type-checks are enforced.”

---


# 🟦 Ecosystem & Future

---

## 1. 🧩 Decorators (Stage 3 Proposal)

**Definition:**
Annotations for classes, methods, and properties.

### ✅ Example

```ts
function readonly(target: any, key: string) {
  Object.defineProperty(target, key, { writable: false });
}

class User {
  @readonly
  name = "Alice";
}
```

### ✅ Use Cases

* Dependency injection (NestJS).
* ORMs (TypeORM, Prisma).
* Metadata reflection.

### ⚠️ Gotchas

* Still experimental — syntax differs across versions.
* Requires `"experimentalDecorators": true` in `tsconfig.json`.

### 🎯 One-Liner

> “Decorators add metadata to classes/members — useful in frameworks like NestJS, but still experimental in TS.”

---

## 2. 📜 Type Annotations in JavaScript (TC39 Proposal)

**Definition:**
JavaScript itself may gain **type syntax** (stripped at runtime).

### ✅ Example (future JS)

```js
function add(a: number, b: number): number {
  return a + b;
}
```

* Types would be **ignored at runtime**, like TS today.
* TS would align with native JS type syntax.

### 🎯 One-Liner

> “JS is moving toward built-in type annotations. TS will align, making gradual adoption easier.”

---

## 3. ⚖️ TypeScript vs Flow vs Others

### ✅ TypeScript

* Mainstream, broad ecosystem.
* Stronger tooling, VSCode integration.

### ✅ Flow (Meta)

* Better type inference in theory.
* Lost adoption due to ecosystem fragmentation.

### ✅ Elm / ReasonML / PureScript

* Stronger type systems, but niche.

### 🎯 One-Liner

> “TS won the ecosystem war — Flow and others have niche uses, but TS dominates frontend and Node.”

---

## 4. 🆕 New & Recent TS Features

### ✅ `satisfies` Operator (TS 4.9)

```ts
const theme = {
  primary: "blue",
  secondary: "red"
} satisfies Record<string, string>;
```

* Ensures structure **without widening** values.

### ✅ `const` Type Parameters (coming soon)

```ts
function tuple<const T extends string[]>(...args: T): T {
  return args;
}
const t = tuple("a", "b"); // type ["a", "b"]
```

### ✅ Variance Annotations (future)

* Explicitly mark generics as `in` (contravariant) or `out` (covariant).

### 🎯 One-Liner

> “Features like `satisfies` and `const` generics improve precision without hacks — future TS is about better inference + clarity.”

---

## 5. 🏗️ Migration Strategies

### ✅ JS → TS

* Enable `allowJs` + `checkJs`.
* Rename `.js` → `.ts` gradually.
* Add strict config (`noImplicitAny`, `strictNullChecks`).
* Replace JSDoc with real types.

### ✅ Flow → TS

* Use codemods (`flow-to-ts`).
* Incrementally replace types.

### ✅ Legacy TS → Modern

* Remove `namespace` in favor of ES modules.
* Switch to `strict` mode.
* Replace `/// <reference>` with proper imports.

### 🎯 One-Liner

> “Migrate incrementally: JS → TS with `checkJs`, Flow → TS with codemods, legacy TS → strict modules.”

---

## 6. 🏢 TypeScript at Scale

### ✅ Observations

* At very large scale (10M+ LOC), TS type-checking can bottleneck.
* Some companies (Google, Meta) experiment with **faster type-checkers** (SWC, Rome, incremental builds).
* Types become **API contracts** between teams — not just safety.

### 🎯 One-Liner

> “At scale, TypeScript types are contracts between teams. Performance requires project references + incremental builds.”

---

## 7. 🔮 Future of TypeScript

### ✅ Trends

* Closer alignment with JavaScript (native type annotations).
* Better inference (const generics, variance).
* Compiler performance improvements (Rust-based checkers like `tsc-swc`).
* More runtime type-checking integration (Zod + TS).

### 🎯 One-Liner

> “The future of TS is tighter JS integration, better inference, and faster compilers — runtime validation will bridge static gaps.”

---


# ✅ Summary (Full Handbook)

This TypeScript handbook covers staff/architect-level depth:

- Fundamentals (type system vs runtime, primitives, assertions, narrowing, null checks, structural typing, interfaces vs types, enums vs literal types)
- Advanced Types (unions, intersections, literals, const assertions, template literals, conditional, mapped, utility types, recursive types)
- Generics (functions, constraints, defaults, keyof/indexed access, conditional generics, variance, HKTs, React generics)
- Type Inference & Compatibility (inference, widening/narrowing, assignability, any vs unknown vs never, enums, tuples vs arrays)
- JavaScript Interop (ambient declarations, @types, module augmentation, declaration merging, as const, tsconfig strictness, runtime validation, gradual migration)
- Type Guards & Narrowing (typeof, instanceof, in-operator, discriminated unions, custom predicates, assertion functions, exhaustiveness checks)
- Advanced Patterns (branded types, opaque types, recursive utilities, mapped utilities, variadic tuples, builder pattern, exact types, phantom types)
- TypeScript in React (props, children, hooks, context, refs, HOCs, generic components, event handlers, polymorphic components)
- Performance & Scaling (diagnostics, avoiding complex types, Babel/SWC vs tsc, incremental compilation, project references, import type, managing any, best practices)
- Ecosystem & Future (decorators, JS type annotations proposal, TS vs Flow, new features like satisfies/const generics, migration strategies, TS at scale, future trends)
