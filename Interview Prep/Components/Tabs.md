# **1. Tabs Component**

### ✅ Requirements

* Render multiple tabs with labels & panels.
* Clicking a tab should show the respective content.
* Only one active tab at a time.
* Keyboard navigation:

  * `ArrowLeft` / `ArrowRight` cycles between tabs.
  * `Home` goes to first, `End` goes to last.
* Accessibility: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, `id`.

---

### ⚙️ Step-by-Step Solution

1. State: `activeIndex` to track selected tab.
2. Keyboard handlers: cycle tab index safely with wrap-around.
3. Accessibility IDs: tab ↔ panel mapping.
4. Composition: `<Tabs> <TabList> <Tab> <TabPanels> <TabPanel>`.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useState } from "react";

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultIndex?: number;
}

export default function Tabs({ tabs, defaultIndex = 0 }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    if (e.key === "ArrowRight") newIndex = (index + 1) % tabs.length;
    if (e.key === "ArrowLeft") newIndex = (index - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") newIndex = 0;
    if (e.key === "End") newIndex = tabs.length - 1;

    if (newIndex !== index) {
      e.preventDefault();
      setActiveIndex(newIndex);
    }
  };

  return (
    <div>
      {/* Tablist */}
      <div role="tablist" aria-label="Sample Tabs" className="flex border-b">
        {tabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={activeIndex === i}
            aria-controls={`panel-${i}`}
            id={`tab-${i}`}
            tabIndex={activeIndex === i ? 0 : -1}
            className={`px-4 py-2 ${
              activeIndex === i ? "border-b-2 border-blue-500 font-bold" : ""
            }`}
            onClick={() => setActiveIndex(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      {tabs.map((tab, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`panel-${i}`}
          aria-labelledby={`tab-${i}`}
          hidden={activeIndex !== i}
          className="p-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Dynamic tabs**: How would you add/remove tabs dynamically?
* **Controlled vs Uncontrolled**: Accept `activeIndex` & `onChange` as props for external state control.
* **Performance**: Lazy load tab panels (render only active).
* **Styling**: Add animations or transition between panels.