# **8. Digital Clock**

### ✅ Requirements

* Show the **current time** in `HH:MM:SS` format.
* Support **12-hour** (with AM/PM) and **24-hour** formats.
* Update every second.
* Accessibility:

  * `role="timer"` or `role="status"` with `aria-live="polite"`.
  * Provide a textual label, e.g. `"Current time is 10:45:12 AM"`.
* Extensible: Add timezone support.

---

### ⚙️ Step-by-Step Solution

1. **State**: `time` as a `Date` object.
2. **Effect**:

   * `setInterval` every 1000 ms to update state.
   * Cleanup on unmount.
3. **Formatting**:

   * `Intl.DateTimeFormat` or manual string formatting.
   * Switch between 12h and 24h modes with a prop.
4. **Accessibility**:

   * Live region that updates as time changes.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useEffect, useState } from "react";

interface DigitalClockProps {
  format12h?: boolean;
  timezone?: string; // e.g. "Asia/Kolkata"
}

export default function DigitalClock({ format12h = true, timezone }: DigitalClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: format12h,
    timeZone: timezone,
  });

  const formattedTime = formatter.format(time);

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`Current time is ${formattedTime}`}
      className="text-4xl font-mono p-4 bg-black text-green-400 rounded-lg inline-block"
    >
      {formattedTime}
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Date display**: Show `Day, Month DD YYYY` below the clock.
* **Time zones**: Allow selecting from a dropdown (`Intl.supportedValuesOf("timeZone")`).
* **Styling**: Flip-clock animation or seven-segment style digits.
* **Performance**: Only re-render once per second (done).
* **Accessibility upgrade**: Add a label like `"Digital clock"` for context.