# 🔎 Problem 2: Implement JSON.stringify()

---

## Step 1. Interviewer starts:

*"Write a simple function that stringifies primitives like `JSON.stringify` does."*

**Example Inputs**

```js
myStringify("hello");   // "\"hello\""
myStringify(42);        // "42"
myStringify(true);      // "true"
myStringify(null);      // "null"
```

---

### ✅ Initial Solution

```js
function myStringify(value) {
  if (value === null) return "null";
  if (typeof value === "string") return `"${value.replace(/"/g, '\\"')}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  return undefined; // JSON.stringify(undefined) at root returns undefined
}
```

---

## Step 2. Interviewer adds:

*"Great. Now make it work for arrays."*

**Example Input**

```js
myStringify([1, "a", true, null]);
// "[1,\"a\",true,null]"
```

---

### ✅ Add Array Support

```js
function myStringify(value) {
  if (value === null) return "null";
  if (typeof value === "string") return `"${value.replace(/"/g, '\\"')}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    const elements = value.map(v =>
      v === undefined ? "null" : myStringify(v)
    );
    return `[${elements.join(",")}]`;
  }

  return undefined;
}
```

⚡ **Note**: `undefined` inside arrays → `"null"` (matches real JSON).

---

## Step 3. Interviewer adds:

*"Nice. Now handle plain objects."*

**Example Input**

```js
myStringify({ name: "Alice", age: 30 });
// "{"name":"Alice","age":30}"
```

---

### ✅ Add Object Support

```js
function myStringify(value) {
  if (value === null) return "null";
  if (typeof value === "string") return `"${value.replace(/"/g, '\\"')}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    const elements = value.map(v =>
      v === undefined ? "null" : myStringify(v)
    );
    return `[${elements.join(",")}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value).map(([k, v]) => {
      if (typeof v === "undefined" || typeof v === "function") return ""; // JSON skips these
      return `"${k}":${myStringify(v)}`;
    }).filter(Boolean);
    return `{${entries.join(",")}}`;
  }

  return undefined;
}
```

---

## Step 4. Interviewer twists:

*"What happens with circular references?"*

**Example Input**

```js
const obj = {};
obj.self = obj;
myStringify(obj); // should throw TypeError
```

---

### ✅ Add Circular Reference Handling

```js
function myStringify(value, seen = new WeakSet()) {
  if (value === null) return "null";
  if (typeof value === "string") return `"${value.replace(/"/g, '\\"')}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    if (seen.has(value)) throw new TypeError("Converting circular structure to JSON");
    seen.add(value);
    const elements = value.map(v =>
      v === undefined ? "null" : myStringify(v, seen)
    );
    return `[${elements.join(",")}]`;
  }

  if (typeof value === "object") {
    if (seen.has(value)) throw new TypeError("Converting circular structure to JSON");
    seen.add(value);
    const entries = Object.entries(value).map(([k, v]) => {
      if (typeof v === "undefined" || typeof v === "function") return "";
      return `"${k}":${myStringify(v, seen)}`;
    }).filter(Boolean);
    return `{${entries.join(",")}}`;
  }

  return undefined;
}
```

---

## Step 5. Interviewer pushes further:

*"Now add support for pretty-printing (space parameter) like the real JSON.stringify."*

**Example Input**

```js
myStringify({ a: 1, b: { c: 2 } }, null, 2);
```

**Expected Output**

```json
{
  "a": 1,
  "b": {
    "c": 2
  }
}
```

---

### ✅ Add Pretty-Printing

```js
function myStringify(value, replacer = null, space = 0, seen = new WeakSet(), depth = 0) {
  const indent = space ? " ".repeat(depth * space) : "";
  const nextIndent = space ? " ".repeat((depth + 1) * space) : "";
  const newline = space ? "\n" : "";

  if (value === null) return "null";
  if (typeof value === "string") return `"${value.replace(/"/g, '\\"')}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    if (seen.has(value)) throw new TypeError("Converting circular structure to JSON");
    seen.add(value);
    const elements = value.map(v =>
      v === undefined ? "null" : myStringify(v, replacer, space, seen, depth + 1)
    );
    return space
      ? `[\n${nextIndent}${elements.join(`,\n${nextIndent}`)}\n${indent}]`
      : `[${elements.join(",")}]`;
  }

  if (typeof value === "object") {
    if (seen.has(value)) throw new TypeError("Converting circular structure to JSON");
    seen.add(value);

    let entries = Object.entries(value);

    // Apply replacer array if provided
    if (Array.isArray(replacer)) {
      entries = entries.filter(([k]) => replacer.includes(k));
    }

    const formatted = entries.map(([k, v]) => {
      if (typeof v === "undefined" || typeof v === "function") return "";
      return space
        ? `${nextIndent}"${k}": ${myStringify(v, replacer, space, seen, depth + 1)}`
        : `"${k}":${myStringify(v, replacer, space, seen, depth + 1)}`;
    }).filter(Boolean);

    return space
      ? `{\n${formatted.join(",\n")}\n${indent}}`
      : `{${formatted.join(",")}}`;
  }

  return undefined;
}
```

---

## Step 6. Final Boss Twist:

*"Can you also support a **replacer function**, not just an array?"*

**Behavior:**

* Replacer function gets `(key, value)` and returns transformed value.
* Example:

```js
myStringify({ a: 1, b: 2 }, (k, v) => typeof v === "number" ? v * 2 : v);
// {"a":2,"b":4}
```

---

### ✅ Final Extended Solution (with Replacer Function)

```js
function myStringify(value, replacer = null, space = 0, seen = new WeakSet(), depth = 0, key = "") {
  const indent = space ? " ".repeat(depth * space) : "";
  const nextIndent = space ? " ".repeat((depth + 1) * space) : "";
  const newline = space ? "\n" : "";

  // Apply replacer function if provided
  if (typeof replacer === "function") {
    value = replacer(key, value);
  }

  if (value === null) return "null";
  if (typeof value === "string") return `"${value.replace(/"/g, '\\"')}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    if (seen.has(value)) throw new TypeError("Converting circular structure to JSON");
    seen.add(value);
    const elements = value.map((v, i) =>
      v === undefined ? "null" : myStringify(v, replacer, space, seen, depth + 1, i)
    );
    return space
      ? `[\n${nextIndent}${elements.join(`,\n${nextIndent}`)}\n${indent}]`
      : `[${elements.join(",")}]`;
  }

  if (typeof value === "object") {
    if (seen.has(value)) throw new TypeError("Converting circular structure to JSON");
    seen.add(value);

    let entries = Object.entries(value);

    if (Array.isArray(replacer)) {
      entries = entries.filter(([k]) => replacer.includes(k));
    }

    const formatted = entries.map(([k, v]) => {
      if (typeof v === "undefined" || typeof v === "function") return "";
      return space
        ? `${nextIndent}"${k}": ${myStringify(v, replacer, space, seen, depth + 1, k)}`
        : `"${k}":${myStringify(v, replacer, space, seen, depth + 1, k)}`;
    }).filter(Boolean);

    return space
      ? `{\n${formatted.join(",\n")}\n${indent}}`
      : `{${formatted.join(",")}}`;
  }

  return undefined;
}
```

---

## ✅ Examples

```js
console.log(myStringify({ a: 1, b: 2 }, (k, v) => typeof v === "number" ? v * 2 : v));
// {"a":2,"b":4}

console.log(myStringify({ a: 1, b: 2 }, ["a"], 2));
/*
{
  "a": 1
}
*/
```

---

# 🎯 Final Interview Takeaways (JSON.stringify)

* ✅ Start simple (primitives).
* ✅ Add arrays + objects.
* ✅ Handle `undefined`/functions correctly.
* ✅ Detect circular refs with `WeakSet`.
* ✅ Support pretty-printing (`space`).
* ✅ Support replacer **array** & **function**.
* ⚡ Bonus: Discuss **performance** (deep recursion on huge objects, tail recursion issues).