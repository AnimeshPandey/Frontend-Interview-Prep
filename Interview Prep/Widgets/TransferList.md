# **10. Transfer List**

### ✅ Requirements

* Two lists: **Available items** (left) and **Selected items** (right).
* Users can move items between lists using buttons (`>` and `<`) or by clicking.
* Support **multi-select** (shift/ctrl-click) and **move all**.
* Accessibility:

  * Each list should be a `listbox` with `option`s.
  * Buttons with proper `aria-label`s.
* Extensible: Support async data loading, filtering, and drag-and-drop.

---

### ⚙️ Step-by-Step Solution

1. **State**:

   * `leftItems` = items available.
   * `rightItems` = items selected.
   * `selectedLeft` / `selectedRight` for highlighting.
2. **Moving items**:

   * On “>`” → move `selectedLeft\` to right.
   * On “<” → move `selectedRight` to left.
3. **Multi-select**:

   * Support shift-click range selection and ctrl/cmd multi-select.
   * Store selection in arrays.
4. **Accessibility**:

   * Left list → `aria-label="Available items"`.
   * Right list → `aria-label="Selected items"`.
   * Buttons → `"Move selected to right"`.
5. **Optional features**:

   * Move All buttons (`>>`, `<<`).
   * Search bar to filter items.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useState } from "react";

interface TransferListProps {
  items: string[];
}

export default function TransferList({ items }: TransferListProps) {
  const [left, setLeft] = useState(items);
  const [right, setRight] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string[]>([]);
  const [selectedRight, setSelectedRight] = useState<string[]>([]);

  const moveToRight = () => {
    setRight((prev) => [...prev, ...selectedLeft]);
    setLeft((prev) => prev.filter((item) => !selectedLeft.includes(item)));
    setSelectedLeft([]);
  };

  const moveToLeft = () => {
    setLeft((prev) => [...prev, ...selectedRight]);
    setRight((prev) => prev.filter((item) => !selectedRight.includes(item)));
    setSelectedRight([]);
  };

  return (
    <div className="flex items-center gap-6">
      {/* Left list */}
      <ul
        role="listbox"
        aria-label="Available items"
        className="w-48 h-64 border rounded p-2 overflow-auto"
      >
        {left.map((item) => (
          <li
            key={item}
            role="option"
            aria-selected={selectedLeft.includes(item)}
            onClick={() =>
              setSelectedLeft((sel) =>
                sel.includes(item) ? sel.filter((i) => i !== item) : [...sel, item]
              )
            }
            className={`p-2 cursor-pointer rounded ${
              selectedLeft.includes(item) ? "bg-blue-500 text-white" : "hover:bg-gray-200"
            }`}
          >
            {item}
          </li>
        ))}
      </ul>

      {/* Controls */}
      <div className="flex flex-col gap-2">
        <button
          onClick={moveToRight}
          disabled={selectedLeft.length === 0}
          aria-label="Move selected to right"
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          &gt;
        </button>
        <button
          onClick={moveToLeft}
          disabled={selectedRight.length === 0}
          aria-label="Move selected to left"
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          &lt;
        </button>
      </div>

      {/* Right list */}
      <ul
        role="listbox"
        aria-label="Selected items"
        className="w-48 h-64 border rounded p-2 overflow-auto"
      >
        {right.map((item) => (
          <li
            key={item}
            role="option"
            aria-selected={selectedRight.includes(item)}
            onClick={() =>
              setSelectedRight((sel) =>
                sel.includes(item) ? sel.filter((i) => i !== item) : [...sel, item]
              )
            }
            className={`p-2 cursor-pointer rounded ${
              selectedRight.includes(item) ? "bg-green-500 text-white" : "hover:bg-gray-200"
            }`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Move All**: Add `>>` and `<<` buttons to transfer all items at once.
* **Filtering/Search**: Add an input above each list to filter items dynamically.
* **Keyboard navigation**: Arrow keys to move focus between options.
* **Drag & Drop**: Implement with `react-beautiful-dnd` or native HTML drag APIs.
* **Controlled version**: Accept `left` and `right` arrays as props with `onChange`.