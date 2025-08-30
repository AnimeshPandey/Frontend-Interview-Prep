# **9. Stopwatch**

### ✅ Requirements

* A timer that starts at `00:00:00` (hh\:mm\:ss).
* Controls: **Start / Stop / Reset**.
* Should display elapsed time accurately (not drifting).
* Accessibility:

  * Use `role="timer"` with `aria-live="polite"`.
  * Buttons labeled for screen readers.
* Extensible: Add **Lap recording** feature.

---

### ⚙️ Step-by-Step Solution

1. **State**:

   * `isRunning` → boolean.
   * `elapsed` → total time in milliseconds.
   * `lastStartTime` → timestamp when started.
2. **Effect**:

   * Use `requestAnimationFrame` or `setInterval(1000)` to update.
   * On **Stop**, freeze elapsed time.
   * On **Start**, compute offset and continue.
3. **Formatting**: Convert milliseconds → `hh:mm:ss`.
4. **Reset**: Clear elapsed back to `0`.
5. **Lap feature (optional)**: Keep an array of timestamps.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useState, useEffect } from "react";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export default function Stopwatch() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // ms
  const [lastStartTime, setLastStartTime] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setElapsed((prev) =>
          lastStartTime ? prev + (Date.now() - lastStartTime) : prev
        );
        setLastStartTime(Date.now());
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, lastStartTime]);

  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      setLastStartTime(Date.now());
    }
  };

  const stop = () => {
    setIsRunning(false);
    if (lastStartTime) {
      setElapsed((prev) => prev + (Date.now() - lastStartTime));
      setLastStartTime(null);
    }
  };

  const reset = () => {
    setIsRunning(false);
    setElapsed(0);
    setLastStartTime(null);
  };

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`Elapsed time ${formatTime(elapsed)}`}
      className="flex flex-col items-center p-6 bg-gray-900 text-white rounded-lg"
    >
      {/* Display */}
      <div className="text-5xl font-mono mb-6">{formatTime(elapsed)}</div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={start}
          disabled={isRunning}
          className="bg-green-600 px-4 py-2 rounded disabled:opacity-50"
          aria-label="Start stopwatch"
        >
          Start
        </button>
        <button
          onClick={stop}
          disabled={!isRunning}
          className="bg-red-600 px-4 py-2 rounded disabled:opacity-50"
          aria-label="Stop stopwatch"
        >
          Stop
        </button>
        <button
          onClick={reset}
          className="bg-gray-600 px-4 py-2 rounded"
          aria-label="Reset stopwatch"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Lap recording**: Store `elapsed` in an array each time “Lap” is clicked.
* **Milliseconds display**: Show `hh:mm:ss.ms` for more precision.
* **Keyboard shortcuts**: Spacebar to start/stop, `r` to reset.
* **Persist across reloads**: Save `elapsed` in `localStorage`.
* **Performance upgrade**: Use `requestAnimationFrame` for smoother updates.