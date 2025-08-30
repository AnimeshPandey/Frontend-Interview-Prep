# 🔎 Problem #24: Realtime Collaboration (OT/CRDT Editor)
* Step 1 → Basic single-user text editor.
* Step 2 → Naive multi-user sync.
* Step 3 → Add **Operational Transform (OT)**.
* Step 4 → Add **CRDT alternative**.
* Step 5 → Discuss tradeoffs, perf, scaling.
---

## Step 1. Interviewer starts:

*"Build a basic text editor state model (insert, delete)."*

---

### ✅ Single-User Editor State

```js
class Editor {
  constructor() {
    this.text = "";
  }

  insert(pos, char) {
    this.text = this.text.slice(0, pos) + char + this.text.slice(pos);
  }

  delete(pos) {
    this.text = this.text.slice(0, pos) + this.text.slice(pos + 1);
  }

  getText() {
    return this.text;
  }
}

// Example
const ed = new Editor();
ed.insert(0, "H");
ed.insert(1, "i");
console.log(ed.getText()); // "Hi"
```

✔ Works for a single user.

---

## Step 2. Interviewer adds:

*"Now make it **multi-user**: if two users send operations, keep them in sync."*

---

### ❌ Naive Sync

* Each client sends operations to server.
* Server applies them in received order, then broadcasts.

⚠ Problem: Conflicts.

**Example:**

* User A inserts `X` at pos 0.
* User B inserts `Y` at pos 0.
* Depending on order, result = `XY` or `YX`.

---

## Step 3. Interviewer twists:

*"Good. Now implement **Operational Transform (OT)** to resolve conflicts."*

---

### ✅ OT Basics

OT transforms remote ops against local ops so order doesn’t matter.

```js
function transformInsert(op1, op2) {
  if (op1.pos < op2.pos) return op1;
  return { ...op1, pos: op1.pos + 1 };
}
```

* User A: `insert(0,"X")`
* User B: `insert(0,"Y")`

Server transforms:

* A’s op → insert(0,"X")
* B’s op → transformInsert(B, A) → insert(1,"Y")

Final text = `"XY"`, regardless of order.

---

### ✅ OT Example in Editor

```js
class OTEditor {
  constructor() {
    this.text = "";
    this.history = [];
  }

  apply(op) {
    if (op.type === "insert") {
      this.text = this.text.slice(0, op.pos) + op.char + this.text.slice(op.pos);
    } else if (op.type === "delete") {
      this.text = this.text.slice(0, op.pos) + this.text.slice(op.pos + 1);
    }
    this.history.push(op);
  }

  transform(remoteOp, localOp) {
    if (remoteOp.type === "insert" && localOp.type === "insert") {
      if (remoteOp.pos <= localOp.pos) localOp.pos++;
    }
    return localOp;
  }
}
```

✔ Handles concurrent edits with **OT transforms**.

---

## Step 4. Interviewer final twist:

*"Nice. But OT is **centralized** (server transforms ops). How would you do **peer-to-peer** (offline editing)? Introduce **CRDTs**."*

---

### ✅ CRDT Alternative (Conflict-Free Replicated Data Type)

* Each character is assigned a **unique ID (timestamp, site ID)**.
* Insert = add `(id, char)` into sequence.
* Delete = tombstone an ID.
* Merging = union of operations, sorted by IDs.

```js
class CRDTEditor {
  constructor(siteId) {
    this.siteId = siteId;
    this.sequence = []; // [{id, char}]
  }

  insert(pos, char) {
    const id = `${Date.now()}-${this.siteId}`;
    this.sequence.splice(pos, 0, { id, char });
  }

  delete(pos) {
    this.sequence.splice(pos, 1);
  }

  merge(remoteOps) {
    this.sequence = [...this.sequence, ...remoteOps]
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  getText() {
    return this.sequence.map(e => e.char).join("");
  }
}
```

✔ Works offline → eventual consistency.

---

## Step 5. Interviewer final boss:

*"Compare OT vs CRDT. What about performance at scale (10k users, 1M edits)?"*

---

### ✅ Performance & Real-World Discussion

* **OT (Operational Transform)**

  * Pros: More compact history (just ops).
  * Cons: Needs central server (transform order).
  * Used by Google Docs.

* **CRDT (Conflict-Free Replicated Data Type)**

  * Pros: Works offline (no central server).
  * Cons: Metadata overhead (unique IDs can bloat doc).
  * Used by Figma, Automerge, Y.js.

* **Performance**

  * OT: O(n) per transform → server bottleneck.
  * CRDT: O(log n) per insert (with balanced tree).
  * Both scale with **garbage collection** (prune old ops).

* **Frontend Use Cases**

  * Google Docs = OT.
  * Figma, Notion = CRDT.
  * Rich-text editors (Quill, ProseMirror) can integrate either.

---

# 🎯 Takeaways (Realtime Collaboration)

* ✅ Step 1: Local editor.
* ✅ Step 2: Naive multi-user sync.
* ✅ Step 3: Add OT transforms.
* ✅ Step 4: CRDT for offline + peer-to-peer.
* ✅ Step 5: Discuss OT vs CRDT tradeoffs.
