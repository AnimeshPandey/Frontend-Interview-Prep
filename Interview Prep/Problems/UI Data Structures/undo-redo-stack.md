# 🔎 Problem 14: Undo/Redo Stack
* Step 1 → Simple undo with a stack.
* Step 2 → Add redo.
* Step 3 → Limit history size.
* Step 4 → Optimize with diffs instead of full snapshots.
* Step 5 → Discuss scaling & real-world usage.

---

## Step 1. Interviewer starts:

*"Implement a system with `do(action)`, `undo()`, and `getState()`."*

---

### ✅ Basic Undo with Stack

```js
class UndoRedo {
  constructor() {
    this.history = []; // past states
    this.state = "";   // current state
  }

  do(newState) {
    this.history.push(this.state);
    this.state = newState;
  }

  undo() {
    if (this.history.length === 0) return;
    this.state = this.history.pop();
  }

  getState() {
    return this.state;
  }
}

// Example
const editor = new UndoRedo();
editor.do("Hello");
editor.do("Hello World");
editor.undo();
console.log(editor.getState()); // "Hello"
```

⚠ Problem: No **redo** support yet.

---

## Step 2. Interviewer adds:

*"Great. Now add redo support — undo → redo should restore forward state."*

---

### ✅ Undo + Redo with Two Stacks

```js
class UndoRedo {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
    this.state = "";
  }

  do(newState) {
    this.undoStack.push(this.state);
    this.state = newState;
    this.redoStack = []; // clear redo on new action
  }

  undo() {
    if (this.undoStack.length === 0) return;
    this.redoStack.push(this.state);
    this.state = this.undoStack.pop();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(this.state);
    this.state = this.redoStack.pop();
  }

  getState() {
    return this.state;
  }
}

// Example
const editor = new UndoRedo();
editor.do("A");
editor.do("AB");
editor.undo(); // "A"
editor.redo(); // "AB"
console.log(editor.getState());
```

✔ Works like Ctrl+Z / Ctrl+Y.

---

## Step 3. Interviewer twists:

*"What if we only want to keep the **last N actions** (like Photoshop with history limit)?"*

---

### ✅ Limit History Size

```js
class UndoRedo {
  constructor(limit = 10) {
    this.undoStack = [];
    this.redoStack = [];
    this.state = "";
    this.limit = limit;
  }

  do(newState) {
    if (this.undoStack.length >= this.limit) {
      this.undoStack.shift(); // remove oldest
    }
    this.undoStack.push(this.state);
    this.state = newState;
    this.redoStack = [];
  }

  // undo/redo same as before...
}
```

✔ Prevents unbounded memory usage.

---

## Step 4. Interviewer pushes:

*"Good. But saving full state snapshots is memory-heavy.
Can you optimize with **diffs** instead of storing entire states?"*

---

### ✅ Diff-Based Undo (Store Operations)

```js
class DiffUndoRedo {
  constructor(initial = "") {
    this.state = initial;
    this.undoStack = [];
    this.redoStack = [];
  }

  do(operation) {
    // operation: { apply: fn, revert: fn }
    this.undoStack.push(operation);
    this.state = operation.apply(this.state);
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length === 0) return;
    const op = this.undoStack.pop();
    this.state = op.revert(this.state);
    this.redoStack.push(op);
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const op = this.redoStack.pop();
    this.state = op.apply(this.state);
    this.undoStack.push(op);
  }

  getState() {
    return this.state;
  }
}

// Example with text append
const editor = new DiffUndoRedo();
editor.do({
  apply: s => s + "Hello",
  revert: s => s.slice(0, -5)
});
editor.do({
  apply: s => s + " World",
  revert: s => s.slice(0, -6)
});
editor.undo(); // "Hello"
editor.redo(); // "Hello World"
```

✔ Much more memory-efficient — only stores operations, not entire snapshots.

---

## Step 5. Interviewer final boss:

*"Great! But how does this scale? What if we’re building Google Docs with thousands of edits?"*

---

### ✅ Performance & Real-World Discussion

* **Time Complexity**:

  * Snapshot version → O(1) for undo/redo, but O(n) memory for states.
  * Diff version → O(1) per op, memory-efficient.
* **Memory Management**:

  * Limit N history.
  * Use checkpoints: full snapshot every 100 steps + diffs in between.
* **Collaborative Editing**:

  * Undo/redo becomes tricky → need OT (Operational Transform) or CRDTs.
  * Must merge diffs from multiple users.
* **Frontend Use Cases**:

  * Rich text editors (Quill, Draft.js).
  * Graphics editors (Figma, Photoshop).
  * Undo/redo in forms, spreadsheets.

---

# 🎯 Final Interview Takeaways (Undo/Redo Stack)

* ✅ Step 1: Simple undo with stack.
* ✅ Step 2: Add redo with two stacks.
* ✅ Step 3: Limit history size.
* ✅ Step 4: Optimize with diffs instead of snapshots.
* ✅ Step 5: Discuss scalability & collaborative editing (OT/CRDT).