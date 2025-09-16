### 1. How JavaScript used to run (before JITs)

* Originally, JavaScript engines were **interpreters only**.
* An **interpreter** reads your JS source and executes it **line by line**, translating it into machine actions on the fly.
* Example:

```js
for (let i = 0; i < 1000; i++) {
  x = x + 1;
}
```

The interpreter would **re-interpret** the same bytecode instructions on *every loop iteration*. That means a lot of repeated work.

---

### 2. Why JIT compilers were invented

* Doing "interpretation every time" is wasteful for **hot code paths** (code that runs repeatedly, like loops, array operations, DOM updates).
* Idea: If the engine notices that a piece of code is being executed **many times**, it’s worth the upfront cost to **compile it to native machine code** and reuse that.

---

### 3. What a JIT compiler actually is

* JIT = **Just-In-Time** compiler.
* It’s called "just-in-time" because the compilation happens **at runtime** (while your program is running), not ahead-of-time like C++ or Java.
* A modern JS engine like **V8** or **SpiderMonkey** has **both**:

  * **Interpreter**: Fast startup, executes code immediately.
  * **Compiler**: Generates optimized machine code for repeated/hot functions.
* Together, interpreter + compiler = JIT system.

---

### 4. How it works in practice

* JS engine starts by **interpreting everything** (fast to begin with).
* When it notices hot code (e.g., loops, repeated function calls):

  1. The interpreter collects **profiling info** (types of variables, branch paths, etc.).
  2. The hot function is handed to the **JIT compiler**.
  3. The JIT produces optimized native code, stored in memory.
  4. Next time, instead of interpreting, the engine jumps straight into that compiled machine code → much faster.

---

### 5. Why not compile everything upfront?

* JavaScript is **dynamic**:

  * Types of variables can change (`x` can be a number in one iteration and a string in the next).
  * Objects can gain or lose properties at runtime.
* So compiling everything up front (like C++ does) isn’t feasible.
* Instead, the JIT compiles **based on assumptions** ("`x` is always a number here"), and if those assumptions break later, it **deoptimizes** and falls back to interpretation.

---

### 6. Key takeaway

> A JIT compiler is **interpreter + compiler**.
>
> * Interpreter runs everything first (quick startup).
> * Compiler kicks in for hot code (loops, repeated functions).
> * The compiled code gets reused, avoiding repeated interpretation.

This hybrid strategy gives both **fast startup** and **fast execution** for long-running code.

---

⚡ Quick analogy:

* **Interpreter only** → like having a human translate a book word-by-word every time you read it.
* **JIT** → the first few pages are read word-by-word, but when the human sees you’re reading a chapter over and over, they write down a translation and give it to you, so you can read directly.

---
