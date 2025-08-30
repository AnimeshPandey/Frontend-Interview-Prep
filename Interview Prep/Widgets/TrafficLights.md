# **7. Traffic Light**

### ✅ Requirements

* Simulate a **traffic light** with 3 lights: Red, Yellow, Green.
* Each light cycles in a timed sequence:

  * Red → Green → Yellow → Red …
* Support configurable durations (e.g. Red = 5s, Green = 5s, Yellow = 2s).
* Accessibility:

  * Announce current state (`aria-live="polite"`).
  * Each light labeled (`aria-label="Red light on"`).
* Extensible: Should support pausing/resuming.

---

### ⚙️ Step-by-Step Solution

1. **State**:

   * `currentLight` → `"red" | "yellow" | "green"`.
2. **Config**:

   * `durations = { red: 5000, green: 5000, yellow: 2000 }`.
3. **Logic**:

   * Use `useEffect` + `setTimeout` to switch lights sequentially.
   * Cleanup timer on unmount.
4. **Rendering**:

   * Vertical stack of circles.
   * Active light → bright, inactive → dimmed.
5. **Accessibility**:

   * `role="status"` with live announcement of state.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useEffect, useState } from "react";

interface TrafficLightProps {
  durations?: { red: number; yellow: number; green: number };
}

export default function TrafficLight({
  durations = { red: 5000, yellow: 2000, green: 5000 },
}: TrafficLightProps) {
  const [current, setCurrent] = useState<"red" | "yellow" | "green">("red");

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (current === "red") {
      timer = setTimeout(() => setCurrent("green"), durations.red);
    } else if (current === "green") {
      timer = setTimeout(() => setCurrent("yellow"), durations.green);
    } else if (current === "yellow") {
      timer = setTimeout(() => setCurrent("red"), durations.yellow);
    }

    return () => clearTimeout(timer);
  }, [current, durations]);

  const getClass = (color: string) =>
    `w-16 h-16 rounded-full mb-4 ${
      current === color ? color + "-500" : "bg-gray-400"
    }`;

  return (
    <div className="flex flex-col items-center p-6 bg-black rounded-lg w-24" role="status" aria-live="polite">
      <div className={getClass("red")} aria-label={current === "red" ? "Red light on" : "Red light off"} />
      <div className={getClass("yellow")} aria-label={current === "yellow" ? "Yellow light on" : "Yellow light off"} />
      <div className={getClass("green")} aria-label={current === "green" ? "Green light on" : "Green light off"} />
      <p className="text-white mt-2 capitalize">{current} light</p>
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Pause/Resume**: Add controls to stop/start the cycle (store `isPaused`).
* **Manual override**: Allow setting a specific light manually.
* **Multiple lights**: Model a 4-way intersection with independent cycles.
* **Animation**: Smooth fade transitions when lights change.
* **Accessibility upgrade**: Announce `"Cars may go now"` / `"Stop, red light"` instead of just color.