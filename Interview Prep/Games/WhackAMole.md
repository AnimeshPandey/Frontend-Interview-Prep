# **16. Whack-a-mole**

### ✅ Requirements

* Grid of “holes” (e.g. 3x3).
* Randomly, a **mole pops up** in one of the holes.
* Player clicks/taps mole to score a point.
* Mole disappears after a short duration.
* Game ends after a set time or score target.
* Accessibility:

  * Each hole is a `button`.
  * Active mole has label `"Mole!"`, inactive holes `"Empty hole"`.
  * Score and timer announced with `aria-live="polite"`.

---

### ⚙️ Step-by-Step Solution

1. **State**:

   * `activeIndex` = index of hole with mole.
   * `score` = player’s score.
   * `timeLeft` = countdown timer.
   * `isRunning` = game state.
2. **Game loop**:

   * On start: set interval every \~800ms → randomly show mole.
   * On mole click: increment score, clear mole.
   * Countdown timer → ends game at 0.
3. **Grid rendering**:

   * Holes rendered as buttons.
   * If index = activeIndex → show 🐹, else empty.
4. **Accessibility**:

   * Buttons with `aria-label`.
   * Status area for score/time.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useEffect, useState } from "react";

const GRID_SIZE = 9; // 3x3

export default function WhackAMole() {
  const [active, setActive] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const moleTimer = setInterval(() => {
      setActive(Math.floor(Math.random() * GRID_SIZE));
    }, 800);
    return () => clearInterval(moleTimer);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) {
      setIsRunning(false);
      setActive(null);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const hitMole = (i: number) => {
    if (i === active) {
      setScore((s) => s + 1);
      setActive(null);
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsRunning(true);
  };

  return (
    <div className="flex flex-col items-center gap-4" role="region" aria-label="Whack a mole game">
      <h1 className="text-2xl font-bold">Whack-a-mole</h1>

      {/* Game board */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: GRID_SIZE }, (_, i) => (
          <button
            key={i}
            onClick={() => hitMole(i)}
            disabled={!isRunning}
            aria-label={i === active ? "Mole!" : "Empty hole"}
            className="w-20 h-20 flex items-center justify-center border rounded text-3xl bg-green-200"
          >
            {i === active ? "🐹" : ""}
          </button>
        ))}
      </div>

      {/* Status */}
      <div role="status" aria-live="polite" className="text-lg">
        Time left: {timeLeft}s | Score: {score}
      </div>

      {/* Controls */}
      {!isRunning && (
        <button onClick={startGame} className="px-4 py-2 bg-blue-600 text-white rounded">
          Start Game
        </button>
      )}
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Difficulty settings**: Adjust mole speed (`setInterval` delay).
* **Multiple moles**: Allow >1 mole at a time.
* **Animations**: Animate mole popping up/down with CSS transitions.
* **Leaderboard**: Save high scores in `localStorage` or server.
* **Touch/mobile UX**: Larger grid cells, tap-friendly.
* **Accessibility upgrade**: Add audio/vibration feedback when mole is hit.