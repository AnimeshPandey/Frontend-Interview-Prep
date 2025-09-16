## 1) Big picture: what `JSON.stringify` really does (short spec summary)

* Converts JavaScript values into **JSON (JavaScript Object Notation)** text.
* Handles primitives (strings, numbers, booleans), `null`.
* `undefined`, `function`, and `symbol`:

  * If the *top-level* value is one of these → `JSON.stringify` returns `undefined`.
  * If they appear **as object property values**, the property is omitted.
  * If they appear **as array elements**, they become `null`.
* Objects: keys are the object's own enumerable string keys (not symbols); values are serialized recursively.
* Arrays: serialized element-by-element.
* `Date` objects: `toISOString()` is used (effectively stringified).
* `toJSON` (if present on an object) should be honored (object.toJSON() is used).
* Circular references → **throw** a `TypeError`.
* `NaN` and `Infinity` → serialized as `null`.
* Strings must be escaped (quotes, backslashes, control characters, and certain Unicode separators).

If you can recite a condensed version of these points to the interviewer, you show you know the spec boundaries.

---

## 2) Prioritized, incremental plan (what to implement first, and why)

When coding on the fly, break the problem into small, testable increments. Each step yields a working extension of the previous.

1. **Skeleton and primitives**

   * Implement `null`, numbers (finite), boolean, simple strings (no escaping yet), and top-level `undefined` → `undefined`.
   * Rationale: small, gets you started; you can demonstrate correct base handling.

2. **String escaping**

   * Add escaping for `"`, `\`, and common control characters (`\b`, `\f`, `\n`, `\r`, `\t`) and optionally U+2028/U+2029.
   * Rationale: Strings show you understand correctness details.

3. **Arrays**

   * Recursively serialize elements; convert non-serializable values to `null` for array elements.
   * Rationale: Simple recursion pattern, easy to test.

4. **Objects**

   * Iterate `Object.keys(obj)`; for each value, serialize and omit properties whose serialization would be `undefined`.
   * Rationale: Mirrors JSON semantics.

5. **Cycle detection**

   * Add a `WeakSet` (or `Set`) of seen objects to detect cycles and throw `TypeError`.
   * Rationale: Prevent infinite recursion — necessary for correctness.

6. **Dates and `.toJSON`**

   * If value has `toJSON`, call it and serialize the returned value. For `Date`, default `toJSON` yields ISO string anyway.
   * Rationale: Keeps parity with JSON behavior.

7. **Edge polish**

   * Map `NaN`/`Infinity` to `null`.
   * Confirm top-level behavior with `undefined`, `function`, `symbol` returns `undefined`.
   * Add small performance/robustness tweaks (WeakSet so GC is fine).

This incremental plan is exactly what you should narrate in an interview: "`Step 1: base cases; Step 2: strings; Step 3: arrays; Step 4: objects; Step 5: cycles; Step 6: toJSON/Date; Step 7: finishing touches`."

---

## 3) Key implementation decisions and why

* **Recursion** vs **iteration**: recursion is natural here (tree-traversal). Note recursion depth limits exist for very deep structures; acceptable for interview unless interviewer asks for iterative approach.
* **Cycle detection**: use a `WeakSet` (holds object references, won't prevent garbage collection). Use it to `has`/`add` before recursing and `delete` or let stack unwind. `WeakSet` does not let you list elements but you only need membership checks.
* **String escaping**: use a single `String.prototype.replace` with a regex and a mapping function — fast and clear.
* **Choosing which properties to iterate**: use `Object.keys()` to honor "own, enumerable string keys".
* **Top-level special-case**: `JSON.stringify(undefined)` should return `undefined` (not the string `"undefined"`).
* **Use `toJSON` semantics**: check if `value && typeof value.toJSON === 'function'` — if so, call it and then serialize returned value.

---

## 4) Live-coding pattern (what to type in first 5–10 minutes)

When you start coding in the interview, follow this order:

### A. Write the function skeleton and base cases

Tell the interviewer: "I'll write the base cases first so we have a working core."

```javascript
function customStringify(value) {
  // WeakSet to track visited objects for circular detection
  const seen = new WeakSet();

  function escapeString(str) {
    // basic escape - we'll expand later
    return '"' + str.replace(/["\\]/g, '\\$&') + '"';
  }

  function serialize(val) {
    if (val === null) return 'null';
    const t = typeof val;
    if (t === 'string') return escapeString(val);
    if (t === 'number') return isFinite(val) ? String(val) : 'null';
    if (t === 'boolean') return val ? 'true' : 'false';
    if (t === 'undefined' || t === 'function' || t === 'symbol') return undefined;
    // objects/arrays handled later
    return '{}'; // placeholder for now
  }

  return serialize(value);
}
```

Test it quickly:

```javascript
console.log(customStringify(1));      // "1"
console.log(customStringify("x"));    // "\"x\"" (escaped)
console.log(customStringify(null));   // "null"
console.log(customStringify(undefined)); // undefined
```

### B. Add arrays (expand recursion)

Now implement arrays and recursively call `serialize`. When an array element serializes to `undefined`, it should become `"null"`:

```javascript
if (Array.isArray(val)) {
  if (seen.has(val)) throw new TypeError('Converting circular structure to JSON');
  seen.add(val);
  const items = val.map(item => {
    const s = serialize(item);
    return s === undefined ? 'null' : s;
  });
  seen.delete(val);
  return '[' + items.join(',') + ']';
}
```

Test:

```javascript
console.log(customStringify([1, undefined, 'a', () => {}])); // [1,null,"a",null]
```

### C. Add objects

Iterate `Object.keys(val)` and omit keys whose serializations are `undefined`:

```javascript
if (typeof val === 'object') {
  if (seen.has(val)) throw new TypeError('Converting circular structure to JSON');
  seen.add(val);
  const parts = [];
  for (const k of Object.keys(val)) {
    const s = serialize(val[k]);
    if (s !== undefined) parts.push(escapeString(k) + ':' + s);
  }
  seen.delete(val);
  return '{' + parts.join(',') + '}';
}
```

Test:

```javascript
console.log(customStringify({a:1, b: undefined, c: 's'})); // {"a":1,"c":"s"}
```

### D. Add better string escaping

Replace control chars: `\b`, `\f`, `\n`, `\r`, `\t` and Unicode line/paragraph separators U+2028 and U+2029:

```javascript
function escapeString(str) {
  return '"' + str.replace(/[\\"\u0000-\u001F\u2028\u2029]/g, ch => {
    switch (ch) {
      case '"': return '\\"';
      case '\\': return '\\\\';
      case '\b': return '\\b';
      case '\f': return '\\f';
      case '\n': return '\\n';
      case '\r': return '\\r';
      case '\t': return '\\t';
      case '\u2028': return '\\u2028';
      case '\u2029': return '\\u2029';
      default:
        // unicode-escape control chars
        return '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
    }
  }) + '"';
}
```

Test:

```javascript
console.log(customStringify("line\nbreak")); // "\"line\nbreak\"" (with escape)
```

### E. Add `toJSON` and Date handling

Before serializing an object, if it has `.toJSON` method, call it:

```javascript
if (val && typeof val.toJSON === 'function') {
  return serialize(val.toJSON());
}
```

Dates automatically convert via `toJSON()` to ISO strings.

### F. Add NaN/Infinity behavior (numbers already handled as `isFinite` -> `null`)

### G. Ensure top-level `undefined` returns `undefined`

When you return `serialize(value)` directly, handle the case where `serialize` returns `undefined` (top-level `undefined`) — return `undefined`. That's already achieved if the top-level returns `undefined`.

---

## 5) Pitfalls & interviewer challenges (and how to respond)

* **Circular references**: demonstrate with a small example and say you’ll use `WeakSet` to detect cycles. If interviewer asks for preserving circular structure in output, explain that’s a different problem (not JSON).
* **`toJSON` semantics**: mention that certain built-ins (Date) implement `toJSON` and JSON.stringify uses it. If asked, implement that.
* **Enumeration order**: JSON uses own string keys — use `Object.keys()` (not `for..in`) to avoid prototype/ inherited props.
* **Performance**: native `JSON.stringify` is faster — your JS implementation is for learning or customization.
* **String escaping completeness**: remember `\u2028` and `\u2029` (they break some JS string literal contexts).
* **Recursion depth**: be ready to say "for extreme depth I'd use an iterative stack or tail recursion elimination, but for typical data recursion is fine."

If the interviewer asks for additional features (replacer, spacing), propose to add them after the core is correct.

---

## 6) Triage of test cases to run as you go

1. Primitives:

   * `1`, `0`, `-0`, `NaN`, `Infinity`, `true`, `false`, `null`, `"s"`, `''`
2. Top-level undefined / function / symbol:

   * `undefined`, `() => {}`, `Symbol('x')` → `undefined`
3. Arrays:

   * `[1, undefined, function(){}, Symbol('s')]` → `[1,null,null,null]`
4. Objects:

   * `{a:1, b:undefined, c:function(){}}` → `{"a":1}`
5. Nested and circular:

   * `const a = {}; a.a = a;` → throws `TypeError`
6. Date:

   * `new Date('2020-01-01')` → `"2020-01-01T00:00:00.000Z"`
7. Special strings:

   * `"\n"`, `"\u2028"`, `'\b'` → correctly escaped

Run them as you add each feature.

---

## 7) Short final implementation (complete) — pasteable

(This is the polished version you can present after walking through the steps.)

```javascript
function customStringify(value) {
  const seen = new WeakSet();

  function escapeString(str) {
    return '"' + str.replace(/[\\"\u0000-\u001F\u2028\u2029]/g, function (ch) {
      switch (ch) {
        case '"': return '\\"';
        case '\\': return '\\\\';
        case '\b': return '\\b';
        case '\f': return '\\f';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '\t': return '\\t';
        case '\u2028': return '\\u2028';
        case '\u2029': return '\\u2029';
        default:
          return '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
      }
    }) + '"';
  }

  function serialize(val) {
    if (val === null) return 'null';

    const t = typeof val;
    if (t === 'string') return escapeString(val);
    if (t === 'number') return isFinite(val) ? String(val) : 'null';
    if (t === 'boolean') return val ? 'true' : 'false';
    if (t === 'undefined' || t === 'function' || t === 'symbol') return undefined;

    // If object has toJSON, use it
    if (val && typeof val.toJSON === 'function') {
      return serialize(val.toJSON());
    }

    if (Array.isArray(val)) {
      if (seen.has(val)) throw new TypeError('Converting circular structure to JSON');
      seen.add(val);
      const arr = val.map(item => {
        const s = serialize(item);
        return s === undefined ? 'null' : s;
      });
      seen.delete(val);
      return '[' + arr.join(',') + ']';
    }

    if (t === 'object') {
      if (seen.has(val)) throw new TypeError('Converting circular structure to JSON');
      seen.add(val);
      const parts = [];
      for (const key of Object.keys(val)) {
        const s = serialize(val[key]);
        if (s !== undefined) parts.push(escapeString(key) + ':' + s);
      }
      seen.delete(val);
      return '{' + parts.join(',') + '}';
    }

    return undefined; // fallback
  }

  return serialize(value);
}
```

---

## 8) How to talk this through in an interview (script and keywords)

* Start: `"I'll implement a simplified `JSON.stringify`. I'll follow this incremental plan: base types, strings/escaping, arrays, objects, cycle detection, then toJSON and final touches."`
* While coding: narrate each decision: `"I use `WeakSet` to detect cycles because it won't prevent garbage collection and we only need membership checks."`
* When hitting a tricky bit: `"Strings must escape control characters and also U+2028/U+2029 because they can break JS string literals."`
* Complexity: `"Time O(n) where n is number of nodes visited; space O(n) due to recursion and `WeakSet`."`
* If running out of time: implement minimal working version (primitives + array/object + cycle detection) and say how you'd extend to `replacer`/`space`/performance improvements.

---

## 9) Follow-ups you should be ready to implement or discuss

* Add `replacer` function or array and `space` parameter for pretty printing.
* Honor property descriptors or non-enumerable keys (not in spec).
* Implement iterative traversal to avoid recursion stack overflow for very deep inputs.
* Implement a version that can serialize Maps/Sets (not part of JSON spec).
* Performance: avoid repeated string concatenation if needed (use array join as above, or string builder).

---

## TL;DR — The 60-second plan you can say and then code

1. Say: *"I'll implement base cases, then arrays, then objects, then add cycle detection and string escaping."*
2. Type base cases for primitives and early `return` for `undefined`/functions/symbols.
3. Add a simple `escapeString` and then arrays recursion. Test arrays.
4. Add object handling via `Object.keys()` and test.
5. Add `WeakSet` to detect cycles. Test circular structure.
6. Add `toJSON`, mapping `NaN`/`Infinity` to `null`, and polish escaping.

---

First: **the significance of `toJSON`**. Then I’ll cover each follow-up (replacer/space, non-enumerables and descriptors, iterative traversal, Map/Set serialization, and performance).
---

# `toJSON` — significance, semantics, and how to implement support

### 1) Problem / Purpose

`toJSON` is a convention used by JavaScript built-ins (for example, `Date.prototype.toJSON`) and by user objects to **control how an object is converted to a representation suitable for JSON serialization**. It allows objects to define a custom serialized form.

### 2) Why it matters

* **Built-ins rely on it**: `Date.prototype.toJSON()` returns an ISO 8601 string — that’s how `JSON.stringify(new Date())` outputs a string instead of a structural object.
* **Custom serialization**: Classes can expose `toJSON()` to return only the data you want serialized (e.g., omit internal fields).
* **Spec compliance**: The ECMAScript `JSON.stringify` algorithm invokes `toJSON` before applying the replacer function (if any), so to match spec you must call it in the right order.

### 3) Exact semantics (what `JSON.stringify` does)

* When serializing a value, **if the value is an object and has a callable `toJSON` property**, `JSON.stringify` calls `value.toJSON(key)` **first**, and serializes the *returned* value instead of the original object.

  * The `key` parameter: When serializing a property `obj[k]`, engines call `obj[k].toJSON(k)`. For the root value, implementations typically call `toJSON` with an empty string `''`.
* After `toJSON` returns some result, that result is then fed into the replacer (if provided) and normal serialization continues.
* If `toJSON` throws, the exception propagates (serialization aborts).

### 4) Edge cases & interview talking points

* If `toJSON` returns `undefined` for a property value, that property will be omitted from the serialized object (same as if serialize result was `undefined`).
* If `toJSON` returns a non-primitive (object/array), that returned structure is traversed and serialized normally (including cycle checking).
* `toJSON` can have side effects — be cautious about calling getters/toJSON that mutate state.
* `toJSON` vs replacer: **order matters** — `toJSON` runs *before* replacer.

### 5) How to implement support in our serializer

* Pass a `key` parameter down the recursion (or emulate the spec by wrapping root in an object `{ "": value }` then calling internal stringify on that wrapper, so the inner call passes `''` as the initial key). This is the approach used by most implementations because it keeps code simpler.
* When encountering an object `val`:

  1. If `val` has a callable `toJSON`, do `val = val.toJSON(key)`.
  2. Then apply replacer (if function) with `(key, val)` — see replacer section below.
  3. Then proceed to serialize the returned value.

### 6) Small example

```javascript
class User {
  constructor(name, password) { this.name = name; this._password = password; }
  toJSON() { return { name: this.name }; }
}

JSON.stringify(new User('Alice', 'secret')); // '{"name":"Alice"}'
```

### 7) Implementation note (code fragment)

In the serializer’s internal `serialize(key, value)`:

```javascript
function serialize(key, value) {
  // step 1: if value && typeof value.toJSON === 'function' -> call it
  if (value && typeof value.toJSON === 'function') {
    value = value.toJSON(key);
  }
  // step 2: if replacer is a function -> value = replacer.call(holder, key, value)
  // step 3: continue serialization on 'value'
}
```

(Where `holder` is the parent object, matching spec semantics.)

---

# Follow-ups — implemented in deepdive-explain style

## A — Add `replacer` (function or array) and `space` parameter for pretty-printing

### 1) Problem / motivation

* `replacer` lets you **transform** values or **filter** which object properties are included.

  * If `replacer` is a *function*, it is called as `replacer(key, value)` for each property (after `toJSON`), and the returned value is what gets serialized.
  * If `replacer` is an *array* of strings/numbers, it acts as a **whitelist** of property keys (only those keys at any depth are included).
* `space` controls whitespace indentation (number or string) to produce a prettier, human-readable JSON. Useful for logs/configs.

### 2) Behavior rules (spec)

* The top-level call is done via a wrapper `{"": value}` and then `Str('', wrapper)`; this makes the replacer see the root with key `''`.
* If `replacer` is a function:

  * For each property (including the wrapper step), call `replacer(key, value)` and use the returned value (if the replacer returns `undefined` for a property, that property is omitted).
* If `replacer` is an array:

  * Compute a **set of property names** from that array (convert each value to string).
  * When serializing an object, only consider keys that are in that set. (Arrays are still fully serialized.)
* `space`:

  * If `space` is a number, use that many spaces (capped at 10).
  * If `space` is a string, use up to 10 characters of that string as the indent.
  * When `space` is non-empty, object and array outputs include newlines and indentation.

### 3) Algorithm design (how to integrate)

* Maintain `replacerFn` (function or `null`) and `propertyList` (set if replacer array).
* To implement pretty printing, maintain two variables:

  * `gap` — the current indentation string (e.g., `"    "` for 4 spaces multiplied by depth).
  * `indent` — the base indent string (the `space` param processed).
* When serializing objects or arrays, instead of producing compact `{"a":1,"b":2}`, produce formatted output:

  * Object with keys: `'{\n' + gap + key1 + ': ' + value1 + ',\n' + gap + key2 + ': ' + value2 + '\n' + previousGap + '}'`
* Use `Array.prototype.join` for assembling parts — **avoid repeated string concatenation** (see performance section).

### 4) Complexity

* Time: still O(n) over nodes. The replacer function adds extra call overhead per property.
* Space: O(n) for output + recursion (or stack if iterative).

### 5) Implementation (complete, combining with `toJSON` behavior)

Here's a self-contained `stringifyWithReplacerAndSpace` implementing `toJSON`, replacer (function|array), and pretty printing:

```javascript
function stringifyWithReplacerAndSpace(value, replacer = null, space = null) {
  // Prepare replacer
  let replacerFn = null;
  let propertyList = null;
  if (typeof replacer === 'function') replacerFn = replacer;
  else if (Array.isArray(replacer)) {
    propertyList = new Set(replacer.map(String));
  }

  // Prepare space/indent
  let indent = '';
  if (typeof space === 'number') indent = ' '.repeat(Math.min(10, Math.max(0, space)));
  else if (typeof space === 'string') indent = space.slice(0, 10);

  // WeakSet to detect cycles
  const seen = new WeakSet();

  function quoteString(str) {
    return '"' + str.replace(/[\\"\u0000-\u001F\u2028\u2029]/g, ch => {
      switch (ch) {
        case '"': return '\\"';
        case '\\': return '\\\\';
        case '\b': return '\\b';
        case '\f': return '\\f';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '\t': return '\\t';
        case '\u2028': return '\\u2028';
        case '\u2029': return '\\u2029';
        default:
          return '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
      }
    }) + '"';
  }

  // Create the wrapper object to ensure key '' is used for root
  const wrapper = { '': value };

  function innerSerialize(holder, key, gap) {
    let val = holder[key];

    // 1) if object has toJSON, call it first (pass key)
    if (val && typeof val.toJSON === 'function') {
      val = val.toJSON(key);
    }

    // 2) call replacer function if provided (specifies replacer sees the returned toJSON)
    if (replacerFn) {
      val = replacerFn.call(holder, key, val);
    }

    // Primitives
    const t = typeof val;
    if (val === null) return 'null';
    if (t === 'string') return quoteString(val);
    if (t === 'number') return isFinite(val) ? String(val) : 'null';
    if (t === 'boolean') return val ? 'true' : 'false';
    if (t === 'undefined' || t === 'function' || t === 'symbol') return undefined;

    // Arrays
    if (Array.isArray(val)) {
      if (seen.has(val)) throw new TypeError('Converting circular structure to JSON');
      seen.add(val);

      if (indent === '') { // compact form
        const partial = val.map((item, i) => {
          const str = innerSerialize(val, String(i), gap + indent);
          return str === undefined ? 'null' : str;
        });
        seen.delete(val);
        return '[' + partial.join(',') + ']';
      } else {
        const newGap = gap + indent;
        const partial = val.map((item, i) => {
          const str = innerSerialize(val, String(i), newGap);
          return str === undefined ? 'null' : newGap + str;
        });
        seen.delete(val);
        if (partial.length === 0) return '[]';
        return '[\n' + partial.join(',\n') + '\n' + gap + ']';
      }
    }

    // Objects
    if (typeof val === 'object') {
      if (seen.has(val)) throw new TypeError('Converting circular structure to JSON');
      seen.add(val);

      // select keys: own enumerable keys OR whitelist
      const keys = Object.keys(val).filter(k => {
        if (propertyList) return propertyList.has(k);
        return true;
      });

      // keep ordering as keys array order (Object.keys)
      if (indent === '') {
        const partial = [];
        for (const k of keys) {
          const vstr = innerSerialize(val, k, gap + indent);
          if (vstr !== undefined) partial.push(quoteString(k) + ':' + vstr);
        }
        seen.delete(val);
        return '{' + partial.join(',') + '}';
      } else {
        const newGap = gap + indent;
        const partial = [];
        for (const k of keys) {
          const vstr = innerSerialize(val, k, newGap);
          if (vstr !== undefined) partial.push(newGap + quoteString(k) + ': ' + vstr);
        }
        seen.delete(val);
        if (partial.length === 0) return '{}';
        return '{\n' + partial.join(',\n') + '\n' + gap + '}';
      }
    }

    return undefined; // fallback
  }

  // Start with empty gap for root
  return innerSerialize(wrapper, '', '');
}
```

### 6) Tests / examples

```javascript
stringifyWithReplacerAndSpace({a:1,b:2}, ['a']); 
// '{"a":1}'

stringifyWithReplacerAndSpace({x:1,y:2}, (k,v) => (typeof v === 'number' ? v*2 : v), 2);
/*
{
  "x": 2,
  "y": 4
}
*/

stringifyWithReplacerAndSpace(new Date('2020-01-01'), null, 2);
// "\"2020-01-01T00:00:00.000Z\""
```

### 7) Production considerations & pitfalls

* Replacer functions may be slow if called for every node; profile when used heavily.
* Whitelist arrays must be converted to strings; duplicates are ignored.
* Be cautious with pretty printing for very large objects — increased memory usage due to extra whitespace.
* Respect spec semantics (toJSON before replacer, wrapper for root) to behave like native `JSON.stringify`.

---

## B — Honor property descriptors / non-enumerable keys (not spec)

### 1) Problem / motivation

By default the JSON spec **ignores non-enumerable properties** and symbol-keyed properties. In some applications you may want to capture more of an object's internal shape:

* Include non-enumerable own properties (`Object.getOwnPropertyNames`).
* Include symbol properties (`Object.getOwnPropertySymbols`).
* Optionally, serialize **property descriptors** (meta-information like `writable`, `configurable`, `enumerable`, or getter/setter definitions).

This is **not** standard JSON. The design must make tradeoffs: **side effects**, verbosity, and potential security leaks.

### 2) Design choices & tradeoffs

* **Include non-enumerable & symbol keys** vs **only enumerable**:

  * Simpler: add an option `includeNonEnumerable: true` to include `Object.getOwnPropertyNames` + `Object.getOwnPropertySymbols`.
* **Serialize descriptors**:

  * Option A: **Serialize values only**, but include non-enumerable keys.
  * Option B: **Serialize descriptors** as a nested structure: `{ key: { value: ..., descriptor: { writable: true, enumerable: false, configurable: false } } }`.
  * Option C: **Ignore getters/setters**: If a property has a getter, either call it (dangerous side effects) or record that it's an accessor.

**Recommendation**: expose options and default to *not* include non-enumerables (to keep spec behavior). If requested, include non-enumerables but **do not call accessors** by default (or make it explicit with another option `callGetters`).

### 3) Implementation outline

* Option: `options = { includeNonEnumerable: false, includeSymbols: false, includePropertyDescriptors: false, callGetters: false }`.
* For each object:

  * If `includeNonEnumerable`, use `Object.getOwnPropertyNames(obj)` and (if requested) `Object.getOwnPropertySymbols(obj)` to build key list.
  * For each key, `const desc = Object.getOwnPropertyDescriptor(obj, key)`.

    * If `desc.get` or `desc.set`:

      * If `callGetters` is true, call getter and use returned value (warn about side effects).
      * Otherwise skip the property or represent as `{ getter: true }` or serialize descriptor metadata.
    * If `includePropertyDescriptors` is true, serialize `{ value: <serialized value>, descriptor: { writable, enumerable, configurable } }`.

### 4) Code sketch (option enabled)

```javascript
function keysForObject(obj, opts = {}) {
  const keys = opts.includeNonEnumerable
    ? Object.getOwnPropertyNames(obj)
    : Object.keys(obj);
  if (opts.includeSymbols) {
    const syms = Object.getOwnPropertySymbols(obj);
    // Symbol keys must be handled carefully; we can convert to string via sym.toString()
    keys.push(...syms);
  }
  return keys;
}

// inside object serialization:
for (const k of keysForObject(val, options)) {
  const desc = Object.getOwnPropertyDescriptor(val, k);
  if (desc.get || desc.set) {
    if (options.callGetters && typeof desc.get === 'function') {
      const v = desc.get.call(val);
      // serialize v...
    } else if (options.includePropertyDescriptors) {
      // serialize descriptor metadata, not invoking getter
    } else {
      // skip accessor property
    }
  } else {
    // desc.value is available — serialize desc.value
  }
}
```

### 5) Edge cases & pitfalls

* **Getters** can mutate state or throw; avoid calling them by default.
* **Symbols** cannot be directly converted to JSON keys — you must choose a representation (e.g., `Symbol(foo)` string) — this can be lossy.
* **Security**: non-enumerable/internal fields might include secrets — exposing them can leak sensitive data. Make this behavior opt-in and warn callers.

### 6) Complexity

* Minor additional cost to build descriptors; same asymptotic complexity.

### 7) Interview talking points

* Explain why JSON excludes non-enumerables by design (simplicity & least surprise).
* If asked to support property descriptors, describe the explicit options and why you'd not call getters by default.

---

## C — Implement iterative traversal to avoid recursion stack overflow

### 1) Motivation

Recursion depth is limited in JavaScript environments; massively nested objects or arrays can cause `RangeError: Maximum call stack size exceeded`. To support deeply nested structures, use an **explicit stack** and iterative processing.

### 2) Key idea

* Replace recursive calls with an explicit stack of frames. Each frame represents a task: serialize a value and attach its *result token* to the parent.
* Keep frames that track:

  * `value` being processed
  * `parent` frame (or index into parent's result slots)
  * `keys` (list of object keys or array indices still to process)
  * `results` (array of serialized child tokens)
  * `state` (e.g., `start`, `processing`, `completed`)
* Use `WeakSet` to detect cycles as before.

This is more complex to implement but conceptually straightforward: simulate recursion.

### 3) Algorithm (depth-first iterative)

1. Create a `rootFrame` with `value` = wrapper object `{'': input}` and `key=''`.
2. Push `rootFrame` onto stack.
3. While stack not empty:

   * Peek top frame `F`.
   * If `F` is expecting a primitive, compute serialized token and pop it, then attach its token to `F.parent` or return if root.
   * If `F` is an object or array and not yet expanded, compute its keys/indices and push child frames for the next unprocessed child.
   * When all children processed, assemble token for `F` by joining child tokens and pop.
4. Build strings using `Array.push` tokens to avoid heavy concatenation; join when finishing each object/array.

### 4) Implementation (compact iterative serializer)

Below is a simplified iterative serializer that handles primitives, arrays, objects, `toJSON`, and cycle detection. For brevity it omits replacer/space — but the approach extends to them.

```javascript
function iterativeStringify(value) {
  const seen = new WeakSet();

  function quoteString(s) {
    return '"' + s.replace(/[\\"\u0000-\u001F\u2028\u2029]/g, ch => {
      // same escaping implementation
      ...
    }) + '"';
  }

  const wrapper = { '': value };

  // Frame definition:
  // { holder, key, value, keys, index, parts, isArray }
  const rootFrame = { holder: wrapper, key: '', value: wrapper[''], keys: null, index: 0, parts: [], isArray: false };
  const stack = [rootFrame];

  while (stack.length) {
    const frame = stack[stack.length - 1];
    const { holder, key } = frame;

    // Lazily compute value and run toJSON if present
    if (!('valueComputed' in frame)) {
      frame.value = holder[key];
      if (frame.value && typeof frame.value.toJSON === 'function') {
        try { frame.value = frame.value.toJSON(key); } catch (err) { throw err; }
      }
      frame.valueComputed = true;
    }

    const val = frame.value;
    // primitives
    if (val === null || typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || typeof val === 'undefined') {
      let token;
      if (val === null) token = 'null';
      else if (typeof val === 'string') token = quoteString(val);
      else if (typeof val === 'number') token = isFinite(val) ? String(val) : 'null';
      else if (typeof val === 'boolean') token = val ? 'true' : 'false';
      else token = undefined; // undefined/function/symbol yields undefined

      stack.pop();
      if (stack.length === 0) return token; // root
      const parent = stack[stack.length - 1];
      if (token === undefined) parent.parts.push(undefined);
      else parent.parts.push(token);
      continue;
    }

    // objects/arrays
    if (typeof val === 'object') {
      if (!frame.keys) {
        if (seen.has(val)) throw new TypeError('Converting circular structure to JSON');
        seen.add(val);
        if (Array.isArray(val)) {
          frame.isArray = true;
          frame.keys = Array.from({ length: val.length }, (_, i) => String(i));
        } else {
          frame.isArray = false;
          frame.keys = Object.keys(val);
        }
        frame.index = 0;
        frame.parts = [];
      }

      // if all children processed, assemble and pop
      if (frame.index >= frame.keys.length) {
        // assemble token
        let token;
        if (frame.isArray) {
          // map undefined to null
          const mapped = frame.parts.map(x => x === undefined ? 'null' : x);
          token = '[' + mapped.join(',') + ']';
        } else {
          const kv = [];
          for (let i = 0; i < frame.keys.length; i++) {
            const k = frame.keys[i];
            const v = frame.parts[i];
            if (v !== undefined) kv.push(quoteString(k) + ':' + v);
          }
          token = '{' + kv.join(',') + '}';
        }
        seen.delete(frame.value);
        stack.pop();
        if (stack.length === 0) return token;
        stack[stack.length - 1].parts.push(token);
        continue;
      }

      // process next child
      const childKey = frame.keys[frame.index++];
      // push child frame
      const childFrame = { holder: frame.value, key: childKey, valueComputed: false };
      stack.push(childFrame);
      continue;
    }

    // functions/symbols -> undefined
    stack.pop();
    if (stack.length === 0) return undefined;
    stack[stack.length - 1].parts.push(undefined);
  }
}
```

### 5) Complexity

* Time: O(n).
* Space: O(n) for explicit stack and building result tokens.

### 6) Pros / Cons

* Pro: avoids JS recursion limits.
* Con: more complex code, slightly higher bookkeeping overhead. Pretty-printing and replacer integration complicate frame state further.

### 7) Interview talking points

* Mention using an explicit stack and describing frame contents is a typical way to simulate recursion iteratively.
* Explain that when implementing pretty printing or replacer, you must propagate `gap`/indent and `holder` context across frames.

---

## D — Serialize `Map` / `Set` (not part of JSON spec) — design alternatives

### 1) Motivation

`Map` and `Set` are widely used ES6 collections, but JSON has no native representation. Many projects want reasonable defaults.

### 2) Common design choices

* **Map → array of `[k, v]` pairs** (lossless and general): e.g., `Array.from(map)` becomes `[[k1, v1], [k2, v2]]`. Works for arbitrary keys.
* **Map → object** if keys are strings: convert to `{ key1: v1, key2: v2 }` (nice compact form but only safe if all keys are strings).
* **Set → array** of values: e.g., `Array.from(set)`.
* Optionally add a marker to signal the original type — e.g., `{ "__type__": "Map", "entries": [...] }` — useful for roundtrip when deserializing.

### 3) Implementation approach

Add an option: `mapHandling: 'array' | 'objectIfStringKeys' | 'objectStrict'` and `setHandling: 'array' | 'objectWithMarker'`. Example simple behavior:

```javascript
if (val instanceof Map) {
  if (options.mapAsObject && [...val.keys()].every(k => typeof k === 'string')) {
    // convert to plain object
    const obj = {};
    for (const [k, v] of val) obj[k] = v;
    // serialize obj normally (remember to cycle-detect and toJSON/replacer)
  } else {
    // serialize as array of entries
    const arr = Array.from(val.entries());
    // serialize arr normally
  }
}
if (val instanceof Set) {
  const arr = Array.from(val);
  // serialize arr normally
}
```

### 4) Edge cases & pitfalls

* Map keys that aren't serializable to unique JSON object keys — using object representation can lose information.
* Circular references inside Map values still require cycle detection.
* If you add a `__type__` marker, consumers must know how to interpret it (custom reviver required).

### 5) Interview talking points

* Explain tradeoffs: **losslessness vs readability**.
* For a library, prefer `Map -> array of pairs` and `Set -> array` as they’re lossless and unambiguous.

---

## E — Performance: avoid repeated string concatenation; stream & memory considerations

### 1) Why it matters

* Concatenating strings repeatedly (e.g., `s = s + token`) creates many intermediate strings and can be slow and memory intensive for large structures. Native `JSON.stringify` is highly optimized (engine C/C++). For JS-level serializer, avoid pathological concatenation.

### 2) Efficient strategies

* **Chunk collection + join**: collect small string tokens into an array and `join('')` once for each object/array or for entire result. This avoids quadratic behavior.

  * In our implementations above we use arrays for parts (`parts.push(...)`) and join at assembly time: this is efficient.
* **Chunk streaming**: for very large outputs, write chunks directly to an output stream instead of keeping entire result in memory. This is essential for huge structures (logs, large exports).

  * Approach: produce tokens incrementally and `write()` them to a stream (HTTP response, file). Requires an iterative traversal and careful control over backpressure.
* **StringBuilder / linked list of chunks**: maintain a list of buffers (arrays or strings) and join at the very end if you must produce a single string. Joining fewer larger chunks is better than joining many tiny ones.
* **Avoid unnecessary boxing / checks**: in hot loops, minimize `instanceof`, `typeof`, property lookups — cache functions and regexes outside loops to reduce overhead.

### 3) Implementation tips

* When building object/array strings, build `parts` arrays with final tokens and use `join(',')` or `join(',\n')` for pretty printing. This is in the `stringifyWithReplacerAndSpace` code above.
* Avoid nesting `parts.join(...)` inside deep loops unnecessarily.
* For streaming output:

  * Implement iterative traversal and `write` tokens as you finish each node.
  * Ensure you call `write` in the correct order (depth-first) and handle asynchronous write backpressure (if the sink is async).

### 4) Complexity & tradeoffs

* Using chunk arrays lowers memory churn and usually gives near-linear performance.
* Streaming reduces peak memory but complicates API and reviver/roundtrip behavior.

### 5) Production considerations

* Prefer native `JSON.stringify` for performance if you don’t require custom behavior.
* If you need replacer/toJSON/extensions + performance, implement a hybrid:

  * Try to call native `JSON.stringify` whenever replacer is `null`/`undefined`, `space` is `undefined`, and there is no `toJSON` likely — fall back otherwise.
* Benchmark with realistic payloads.

---

# Quick summary & what I recommend doing next

* `toJSON` is **essential** to implement if you want compatibility with built-ins (e.g., `Date`) and many classes; call it before replacer, pass the `key` argument (or use the wrapper trick).
* `replacer` (function or array) and `space` (indent) are well-defined in the spec — I provided a full implementation earlier that combines these features.
* Including non-enumerable keys and property descriptors is possible but **non-standard** and risky (getters, secrets). Implement as opt-in with clear flags (`includeNonEnumerable`, `callGetters`, `includePropertyDescriptors`).
* To avoid recursion overflow, implement an **iterative** traversal with an explicit stack. I gave a frame-based algorithm and a compact iterative implementation sketch.
* For `Map`/`Set`, prefer **array-of-pairs** (Map) and array (Set) as default; optionally convert Map to object only when all keys are strings (or provide flags).
* Avoid repeated concatenation: use **parts arrays + `join`**, or stream chunks to a writable sink for very large outputs.
