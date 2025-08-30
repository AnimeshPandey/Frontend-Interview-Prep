# **4. Accordion**

### ✅ Requirements

* Renders a list of sections.
* Each section has a **header** (button) and a **panel** (content).
* Clicking a header toggles its panel open/closed.
* Only **one open at a time** (unless multi-expand is allowed).
* Accessibility:

  * Header: `button` with `aria-expanded`, `aria-controls`.
  * Panel: `role="region"`, `aria-labelledby`.
  * Keyboard:

    * `Enter` / `Space` toggles section.
    * `ArrowUp` / `ArrowDown` moves between headers.

---

### ⚙️ Step-by-Step Solution

1. **State**: Track open section(s).

   * Single expand: store one index.
   * Multi expand: store a `Set` of open indices.
2. **Keyboard navigation**: Arrow keys cycle through headers.
3. **ARIA roles**: Each header ↔ panel linked with unique `id`.
4. **Reusable API**: `<Accordion items=[{title, content}] />`.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useState, useRef } from "react";

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export default function Accordion({ items, allowMultiple = false }: AccordionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) => {
      const newSet = new Set(prev);
      if (allowMultiple) {
        newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      } else {
        newSet.clear();
        newSet.add(index);
      }
      return newSet;
    });
  };

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      buttonRefs.current[(index + 1) % items.length]?.focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      buttonRefs.current[(index - 1 + items.length) % items.length]?.focus();
    }
    if (e.key === "Home") {
      e.preventDefault();
      buttonRefs.current[0]?.focus();
    }
    if (e.key === "End") {
      e.preventDefault();
      buttonRefs.current[items.length - 1]?.focus();
    }
  };

  return (
    <div className="border rounded-lg divide-y">
      {items.map((item, i) => {
        const isOpen = openIndices.has(i);
        return (
          <div key={i}>
            <h3>
              <button
                ref={(el) => (buttonRefs.current[i] = el)}
                aria-expanded={isOpen}
                aria-controls={`panel-${i}`}
                id={`accordion-${i}`}
                onClick={() => toggleIndex(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="w-full text-left p-3 font-semibold flex justify-between items-center"
              >
                {item.title}
                <span>{isOpen ? "−" : "+"}</span>
              </button>
            </h3>
            <div
              id={`panel-${i}`}
              role="region"
              aria-labelledby={`accordion-${i}`}
              hidden={!isOpen}
              className="p-3"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Multi-expand**: Already supported with `allowMultiple`.
* **Controlled vs uncontrolled**: Expose `openIndices` & `onChange` props.
* **Animations**: Smooth expand/collapse transitions (height animation with CSS/Framer Motion).
* **Accessibility**: Ensure headers use `button` (not `div`).
* **Dynamic items**: Add/remove sections dynamically.