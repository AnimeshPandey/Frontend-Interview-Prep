# **19. Snake**

### ✅ Requirements

* Grid-based game (e.g. 20×20).
* Snake moves continuously in one direction.
* Arrow keys change direction.
* Eating food makes the snake grow.
* Game ends if snake hits the wall or itself.
* Accessibility:

  * Game board should be a `role="grid"`.
  * Announce events: “Food eaten”, “Game Over” via `aria-live`.

---

### ⚙️ Step-by-Step Solution

1. **State**:

   * `snake: [ [row, col], ... ]` → head is first element.
   * `direction: "UP" | "DOWN" | "LEFT" | "RIGHT"`.
   * `food: [row, col]`.
   * `score`.
   * `gameOver`.
2. **Game loop**:

   * `setInterval` moves snake every X ms.
   * Compute new head based on direction.
   * Check collisions:

     * Wall → game over.
     * Snake body → game over.
   * If head === food → grow snake + spawn new food.
   * Otherwise → move forward (drop tail).
3. **Controls**:

   * Arrow keys change direction.
   * Prevent reversing into itself.
4. **Rendering**:

   * Grid of divs.
   * Snake cells = green, food = red, empty = dark.
5. **Accessibility**:

   * `aria-live="polite"` for score and game status.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useEffect, useState } from "react";

const ROWS = 20;
const COLS = 20;

type Point = [number, number];
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

function randomFood(): Point {
  return [Math.floor(Math.random() * ROWS), Math.floor(Math.random() * COLS)];
}

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([[10, 10]]);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [food, setFood] = useState<Point>(randomFood);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const move = () => {
    setSnake((prev) => {
      if (gameOver) return prev;

      const head = prev[0];
      let newHead: Point = [...head] as Point;
      if (direction === "UP") newHead = [head[0] - 1, head[1]];
      if (direction === "DOWN") newHead = [head[0] + 1, head[1]];
      if (direction === "LEFT") newHead = [head[0], head[1] - 1];
      if (direction === "RIGHT") newHead = [head[0], head[1] + 1];

      // Check wall collision
      if (
        newHead[0] < 0 ||
        newHead[0] >= ROWS ||
        newHead[1] < 0 ||
        newHead[1] >= COLS
      ) {
        setGameOver(true);
        return prev;
      }

      // Check self collision
      if (prev.some(([r, c]) => r === newHead[0] && c === newHead[1])) {
        setGameOver(true);
        return prev;
      }

      let newSnake = [newHead, ...prev];
      // Check food
      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        setScore((s) => s + 1);
        setFood(randomFood());
      } else {
        newSnake.pop(); // move forward
      }
      return newSnake;
    });
  };

  // Game loop
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(move, 200);
    return () => clearInterval(id);
  });

  // Controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && direction !== "DOWN") setDirection("UP");
      if (e.key === "ArrowDown" && direction !== "UP") setDirection("DOWN");
      if (e.key === "ArrowLeft" && direction !== "RIGHT") setDirection("LEFT");
      if (e.key === "ArrowRight" && direction !== "LEFT") setDirection("RIGHT");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [direction]);

  const reset = () => {
    setSnake([[10, 10]]);
    setDirection("RIGHT");
    setFood(randomFood());
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center gap-4" role="region" aria-label="Snake game">
      <h1 className="text-2xl font-bold">Snake</h1>
      <div
        role="grid"
        className="grid gap-px bg-gray-700"
        style={{ gridTemplateColumns: `repeat(${COLS}, 20px)` }}
      >
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const isSnake = snake.some(([sr, sc]) => sr === r && sc === c);
            const isFood = food[0] === r && food[1] === c;
            return (
              <div
                key={`${r}-${c}`}
                role="gridcell"
                className={`w-5 h-5 ${
                  isSnake ? "bg-green-500" : isFood ? "bg-red-500" : "bg-black"
                }`}
              />
            );
          })
        )}
      </div>

      <div role="status" aria-live="polite" className="text-lg">
        {gameOver ? "Game Over!" : `Score: ${score}`}
      </div>
      {gameOver && (
        <button onClick={reset} className="px-4 py-2 bg-blue-600 text-white rounded">
          Restart
        </button>
      )}
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Levels**: Speed up snake as score increases.
* **Obstacles**: Add walls or hazards.
* **Wrap-around mode**: Snake goes through one side and appears on the other.
* **Touch controls**: Swipe gestures for mobile play.
* **High scores**: Persist in `localStorage`.
* **Accessibility upgrade**: Announce “Food eaten! Score: X” via `aria-live`.