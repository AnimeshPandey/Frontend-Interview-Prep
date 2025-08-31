# 🔎 Part 1: Use Cases for IIFEs in JS / React

## ✅ Classic JS Use Cases

1. **Avoid polluting global scope**

   ```js
   (function() {
     // private variables
     const secret = "12345";
     console.log("IIFE runs immediately!");
   })();
   console.log(secret); // ❌ ReferenceError (not global)
   ```

   → Useful before modules existed, when everything was global.

2. **Module Pattern (pre-ES6 modules)**

   ```js
   const Counter = (function() {
     let count = 0; // private
     return {
       inc() { count++; },
       get() { return count; }
     };
   })();

   Counter.inc();
   console.log(Counter.get()); // 1
   ```

   → Simulated private state using closures.

3. **Initialization code (run once, immediately)**

   ```js
   (function setupApp() {
     console.log("App initialized");
   })();
   ```

   → Useful for config/bootstrap code.

4. **Polyfills / shims**
   Libraries often used IIFEs to wrap polyfills so they don’t leak globals unnecessarily.

---

## ✅ React Use Cases

Even though React uses **ES modules**, you still see IIFEs in a few cases:

1. **Isolating utility logic inside a component**

   ```jsx
   function MyComponent() {
     const value = (() => {
       // IIFE lets you run complex logic once
       const raw = Math.random() * 100;
       return Math.round(raw);
     })();

     return <div>Value: {value}</div>;
   }
   ```

   → Instead of declaring a helper function outside, you compute once and keep scope local.

2. **Emulating “static blocks” before class fields**

   ```jsx
   class MyClass {
     static config = (() => {
       // run setup code for static config
       return { id: Date.now() };
     })();
   }

   console.log(MyClass.config);
   ```

   → Similar to Java’s `static { }` blocks, run once at class definition.

3. **Encapsulating private variables in libraries**
   Many React utility libraries wrap themselves in an IIFE before exporting, to prevent accidental leakage.

---

# 🔎 Part 2: How Bundlers Use IIFEs (Webpack/Rollup)

Bundlers like Webpack and Rollup wrap your entire app inside an **IIFE** to:

* Avoid leaking variables to the global scope.
* Simulate module isolation (before ESM was widely supported).
* Provide their own `require` function for dependency resolution.

---

## 🛠️ Example: Webpack Output

Say you write:

```js
// math.js
export function add(a, b) { return a + b; }

// app.js
import { add } from "./math.js";
console.log(add(2, 3));
```

Webpack might bundle it like this:

```js
(function(modules) {
  // Webpack bootstrap
  function __webpack_require__(id) {
    const [fn, mapping] = modules[id];
    const module = { exports: {} };
    fn(__webpack_require__, module, module.exports);
    return module.exports;
  }

  // start execution
  __webpack_require__(0);

})({
  0: [function(require, module, exports) {
    const { add } = require(1);
    console.log(add(2, 3));
  }, {}],

  1: [function(require, module, exports) {
    function add(a, b) { return a + b; }
    module.exports = { add };
  }, {}]
});
```

* The whole thing is inside an **IIFE** → `(function(modules){...})(...)`.
* This keeps variables like `__webpack_require__` out of the global scope.
* Each module is represented as a function, with `require/module/exports` injected.

---

## 🛠️ Example: Rollup Output

Rollup (focused on ESM) uses simpler IIFEs for UMD bundles:

```js
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
      ? define(['exports'], factory)
      : factory((global.myLib = {}));
})(this, function (exports) {
  'use strict';

  function add(a, b) { return a + b; }
  exports.add = add;
});
```

* This is **UMD style** inside an IIFE.
* It works in Node (`module.exports`), AMD (`define`), or browser globals.

---

# ✅ Summary

* **IIFEs** are useful for:

  * Scope isolation (no globals).
  * Module pattern (private state).
  * One-off initialization code.
  * In React: compute-once logic, static blocks, private encapsulation.

* **Bundlers** (Webpack/Rollup) still rely on IIFEs to:

  * Encapsulate modules.
  * Provide their own loader (`require`, `exports`).
  * Simulate module systems across different environments.

---

# 🛠️ Real-World React Libraries Using IIFEs

---

## 1. **Redux Toolkit (RTK)**

Redux Toolkit publishes an **UMD build** (so you can use it via `<script>` tags in browsers). That UMD bundle is wrapped in an **IIFE**.

```js
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports, require('redux'))
    : typeof define === 'function' && define.amd
      ? define(['exports', 'redux'], factory)
      : (global.RTK = {}, factory(global.RTK, global.redux));
})(this, function (exports, redux) {
  'use strict';

  function configureStore(...) { ... }
  exports.configureStore = configureStore;
});
```

✅ Why?

* Works in **Node (CommonJS)**, **AMD (RequireJS)**, and **Browser globals**.
* Prevents variables like `configureStore` from leaking into `window`.

---

## 2. **React Query**

React Query (now TanStack Query) also ships a UMD build that wraps everything in an IIFE:

```js
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports, require('react'))
    : typeof define === 'function' && define.amd
      ? define(['exports', 'react'], factory)
      : (global.ReactQuery = {}, factory(global.ReactQuery, global.React));
})(this, function (exports, React) {
  'use strict';
  
  function useQuery(...) { ... }
  exports.useQuery = useQuery;
});
```

✅ Why?

* Makes it possible to use React Query directly via a `<script>` tag:

  ```html
  <script src="https://unpkg.com/react-query/umd/react-query.development.js"></script>
  <script>
    const { useQuery } = ReactQuery;
  </script>
  ```

---

## 3. **React Itself (Legacy Builds)**

Even React’s own UMD bundles (`react.development.js` / `react.production.min.js`) are wrapped in an IIFE:

```js
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
      ? define(['exports'], factory)
      : (global.React = {}, factory(global.React));
})(this, function (exports) {
  'use strict';

  function createElement(type, props, ...children) { ... }
  exports.createElement = createElement;
});
```

✅ Why?

* Keeps React’s internals private.
* Attaches only a single global (`window.React`).
* Makes React usable in environments without bundlers.

---

## 4. **Other React Ecosystem Libraries**

* **Immer.js** (used by Redux Toolkit) → UMD IIFE wrapper.
* **Lodash** (used widely in React projects) → has UMD builds wrapped in IIFEs.
* **Day.js / Moment.js** → also IIFE/UMD wrappers.

---

# 🔎 Why IIFEs Are Still Useful in React Ecosystem

1. **Global-safe library builds**

   * CDN distribution (UMD/IIFE build).
   * Libraries can expose **one clean global variable** (e.g., `ReactQuery`, `Redux`).

2. **Encapsulation of internals**

   * Prevents leaking private variables into global scope.

3. **One-off initialization**

   * Libraries often run setup logic at load time inside an IIFE.

4. **Cross-environment compatibility**

   * IIFEs enable UMD wrappers → works in Node, AMD, or browser without code changes.

---

# ✅ Summary

* **Modern React apps** → rarely write IIFEs manually (ESM + bundlers handle it).
* **React libraries** → still use IIFEs in **UMD builds** for global-safe distribution.
* **Examples**: Redux Toolkit, React Query, React (UMD builds), Immer, Lodash.
* **Bundlers (Webpack/Rollup)** → automatically generate IIFEs to encapsulate your app’s code.

---


# 🛠️ Step 1: Write a Tiny React Library (ESM)

👉 File: `MyButton.js`

```jsx
import React from "react";

export function MyButton({ label }) {
  return <button>{label}</button>;
}
```

👉 File: `index.js`

```js
export { MyButton } from "./MyButton.js";
```

✅ This is clean ES6+ syntax using `export`.
If you publish this directly, bundlers (Webpack/Vite) can consume it.
But if you want people to use it via **CDN `<script>`**, you need a **UMD/IIFE bundle**.

---

# 🛠️ Step 2: Rollup/Webpack Configuration (UMD Build)

👉 Rollup config (`rollup.config.js`):

```js
import babel from '@rollup/plugin-babel';

export default {
  input: "index.js",
  output: {
    file: "dist/my-lib.umd.js",
    format: "umd", // tells Rollup to make a UMD build
    name: "MyLib", // global variable name when used in <script>
    globals: {
      react: "React"
    }
  },
  external: ["react"], // don't bundle React
  plugins: [babel({ babelHelpers: "bundled" })]
};
```

---

# 🛠️ Step 3: The Bundled UMD Output

When you run Rollup, it generates something like this:

```js
(function (global, factory) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    // Node.js / CommonJS
    factory(exports, require("react"));
  } else if (typeof define === "function" && define.amd) {
    // AMD (RequireJS)
    define(["exports", "react"], factory);
  } else {
    // Browser Global
    global.MyLib = {};
    factory(global.MyLib, global.React);
  }
})(this, function (exports, React) {
  "use strict";

  function MyButton({ label }) {
    return React.createElement("button", null, label);
  }

  exports.MyButton = MyButton;
});
```

---

# 🔎 Breakdown of This IIFE Wrapper

1. **The outer IIFE**:

   ```js
   (function(global, factory) { ... })(this, function(exports, React) { ... });
   ```

   * Prevents leaking variables.
   * Chooses the right module system depending on environment.

2. **UMD checks**:

   * If Node/CommonJS → `require()`.
   * If AMD → `define()`.
   * Else attach to `global.MyLib`.

3. **Inside factory**:

   * Defines your actual code (`MyButton`).
   * Attaches it to `exports`.

4. **In Browser via `<script>`**:

   ```html
   <script src="https://cdn.jsdelivr.net/npm/my-lib/dist/my-lib.umd.js"></script>
   <script>
     const { MyButton } = MyLib;
     ReactDOM.render(React.createElement(MyButton, { label: "Click" }), document.getElementById("root"));
   </script>
   ```

---

# ✅ Why Bundlers Use IIFEs

* **Encapsulation**: keeps internal variables private.
* **Universal support**: one build works in Node, AMD, or browser.
* **Clean globals**: only one object (`MyLib`) is exposed.

---

# 🧠 Key Takeaway

* **You (developer)**: write React libraries in modern **ES Modules** (`import/export`).
* **Bundlers**: wrap your code in an **IIFE UMD wrapper** to make it usable in every environment.
* **Consumers**:

  * In Node → `require("my-lib")`
  * In Browser (CDN) → `<script>` → `window.MyLib.MyButton`

---

Let’s now look at the **same tiny React library** bundled by **Webpack**.
Webpack has a slightly different bundling style than Rollup, but the **core idea is the same**: it wraps everything in an **IIFE** for isolation.

---

# 🛠️ Step 1: The Tiny React Library (ESM)

👉 `MyButton.js`

```jsx
import React from "react";

export function MyButton({ label }) {
  return <button>{label}</button>;
}
```

👉 `index.js`

```js
export { MyButton } from "./MyButton.js";
```

---

# 🛠️ Step 2: Webpack Config (UMD Build)

👉 `webpack.config.js`

```js
const path = require("path");

module.exports = {
  entry: "./index.js",
  output: {
    filename: "my-lib.umd.js",
    path: path.resolve(__dirname, "dist"),
    library: "MyLib",       // the global variable when used via <script>
    libraryTarget: "umd"    // tells Webpack to build UMD
  },
  externals: {
    react: "React"          // don't bundle React
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader"
      }
    ]
  }
};
```

---

# 🛠️ Step 3: Webpack Output (Simplified)

After bundling, Webpack produces something like this (simplified for clarity):

```js
(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === "object" && typeof module === "object")
    module.exports = factory(require("react")); // Node / CommonJS
  else if (typeof define === "function" && define.amd)
    define(["react"], factory); // AMD
  else if (typeof exports === "object")
    exports["MyLib"] = factory(require("react"));
  else
    root["MyLib"] = factory(root["React"]); // Browser global
})(this, function (__WEBPACK_EXTERNAL_MODULE_react__) {
  return (function(modules) {
    // Webpack bootstrap IIFE
    var installedModules = {};

    function __webpack_require__(moduleId) {
      if (installedModules[moduleId]) {
        return installedModules[moduleId].exports;
      }
      var module = installedModules[moduleId] = {
        i: moduleId,
        l: false,
        exports: {}
      };
      modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
      module.l = true;
      return module.exports;
    }

    // Load entry module and return exports
    return __webpack_require__(0);
  })([
    // Module array
    function(module, __webpack_exports__, __webpack_require__) {
      __webpack_require__.r(__webpack_exports__);
      var react = __webpack_require__(1); // external React
      function MyButton({ label }) {
        return react.createElement("button", null, label);
      }
      __webpack_require__.d(__webpack_exports__, "MyButton", function() { return MyButton; });
    },
    function(module, exports) {
      module.exports = __WEBPACK_EXTERNAL_MODULE_react__;
    }
  ]);
});
```

---

# 🔎 What’s Happening Here?

1. **The outer IIFE (UMD wrapper):**

   ```js
   (function webpackUniversalModuleDefinition(root, factory) { ... })(this, function (...) { ... });
   ```

   * Picks the right system:

     * CommonJS (`module.exports`)
     * AMD (`define`)
     * Browser global (`root.MyLib`)

2. **Webpack bootstrap IIFE:**

   ```js
   return (function(modules) { ... })([ ... ]);
   ```

   * Encapsulates all modules in an array.
   * Provides a fake `require` (`__webpack_require__`) function.
   * Caches modules after first load.

3. **Your module inside the array:**

   * `MyButton` is defined.
   * `React` is passed as external dependency.
   * Exported via `__webpack_exports__`.

---

# 🛠️ Step 4: Using the Library via CDN

Once built, you can use it like this:

```html
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="dist/my-lib.umd.js"></script>

<div id="root"></div>
<script>
  const { MyButton } = MyLib;
  ReactDOM.render(React.createElement(MyButton, { label: "Click me" }), document.getElementById("root"));
</script>
```

---

# ✅ Key Takeaways

* Both **Rollup** and **Webpack** wrap your code in **IIFEs**:

  * For **isolation** (no globals leaking).
  * For **UMD compatibility** (Node, AMD, Browser).

* **Webpack style**:

  * Uses a **bootstrap IIFE** with a fake `__webpack_require__`.
  * Stores modules in an array, referenced by index.

* **Rollup style**:

  * Generates cleaner code (tree-shaking oriented).
  * Still uses an IIFE for UMD bundles.

---

# 📊 Webpack vs Rollup UMD Output (Side-by-Side)

---

## 🛠️ Source Code (input for both bundlers)

👉 `MyButton.js`

```jsx
import React from "react";

export function MyButton({ label }) {
  return <button>{label}</button>;
}
```

👉 `index.js`

```js
export { MyButton } from "./MyButton.js";
```

---

## 🔹 Webpack Output (Simplified)

```js
(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === "object" && typeof module === "object")
    module.exports = factory(require("react"));
  else if (typeof define === "function" && define.amd)
    define(["react"], factory);
  else
    root["MyLib"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_react__) {
  return (function(modules) {
    var installedModules = {};

    function __webpack_require__(moduleId) {
      if (installedModules[moduleId]) return installedModules[moduleId].exports;
      var module = installedModules[moduleId] = { i: moduleId, l: false, exports: {} };
      modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
      module.l = true;
      return module.exports;
    }

    return __webpack_require__(0);
  })([
    function(module, __webpack_exports__, __webpack_require__) {
      var React = __webpack_require__(1);
      function MyButton({ label }) {
        return React.createElement("button", null, label);
      }
      __webpack_exports__.MyButton = MyButton;
    },
    function(module, exports) {
      module.exports = __WEBPACK_EXTERNAL_MODULE_react__;
    }
  ]);
});
```

---

## 🔹 Rollup Output (Simplified)

```js
(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports, require("react"))
    : typeof define === "function" && define.amd
      ? define(["exports", "react"], factory)
      : (global.MyLib = {}, factory(global.MyLib, global.React));
})(this, function (exports, React) {
  "use strict";

  function MyButton({ label }) {
    return React.createElement("button", null, label);
  }

  exports.MyButton = MyButton;
});
```

---

# 🔎 Key Differences (Table)

| Aspect              | **Webpack**                                                           | **Rollup**                                    |
| ------------------- | --------------------------------------------------------------------- | --------------------------------------------- |
| **Wrapper style**   | Complex **bootstrap IIFE** with custom `__webpack_require__`.         | Simple UMD IIFE with direct factory call.     |
| **Module system**   | Simulates CommonJS modules (`require`, `exports`) with caching.       | Preserves ES Modules semantics.               |
| **Output size**     | Bigger (adds runtime overhead for `__webpack_require__`).             | Smaller & cleaner (tree-shaking friendly).    |
| **Tree-shaking**    | Works but more complex (relies on static analysis).                   | Built-in & more aggressive.                   |
| **Globals mapping** | `root["MyLib"] = factory(root["React"])`                              | `(global.MyLib, global.React)`                |
| **Focus**           | Application bundling (supports dynamic imports, HMR, code splitting). | Library bundling (optimized for reusability). |
| **Readability**     | Harder to read manually.                                              | Much cleaner output.                          |

---

# ✅ Summary

* **Webpack**

  * Wraps everything in a **runtime system** (`__webpack_require__`, module cache, etc.).
  * Good for **apps** (handles many features, dynamic imports, HMR).
  * Output is heavier and harder to read.

* **Rollup**

  * Outputs **minimal, clean code** (great for libraries).
  * Uses a simple **UMD IIFE wrapper**.
  * Best for **publishing libraries** (like React Query, Redux Toolkit).

---
