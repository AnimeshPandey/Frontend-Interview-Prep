# **18. Tetris**

### ✅ Requirements

* Grid-based board (e.g. 20 rows × 10 columns).
* Tetromino shapes (`I`, `O`, `T`, `S`, `Z`, `J`, `L`).
* Blocks fall automatically at a timed interval.
* Player can:

  * Move left/right.
  * Rotate piece.
  * Drop piece faster.
* When a row is full → clear it.
* Game ends when blocks stack to the top.
* Accessibility:

  * `role="grid"`, `role="gridcell"`.
  * Announce “Row cleared” or “Game Over” with `aria-live`.

---

### ⚙️ Step-by-Step Solution

1. **Data structures**:

   * **Board**: 2D array (`rows × cols`) storing color or empty.
   * **Tetromino**: Shape defined as a matrix of coordinates.

   ```ts
   type Point = [number, number];
   interface Tetromino {
     shape: Point[];
     color: string;
   }
   ```
2. **State**:

   * `board` → current grid.
   * `currentPiece` → tetromino’s position + shape.
   * `interval` → game loop speed.
   * `score` & `gameOver`.
3. **Game loop** (`useEffect + setInterval`):

   * Move piece down every tick.
   * If collision → merge into board + spawn new piece.
   * Check full rows → clear + update score.
4. **Controls** (`keydown`):

   * Arrow Left/Right → move.
   * Arrow Up → rotate.
   * Arrow Down → accelerate drop.
   * Space → hard drop.
5. **Rendering**:

   * Draw board grid with blocks.
   * Active piece overlayed on board.

---

### 🧑‍💻 React Implementation (simplified version)

```tsx
import React, { useEffect, useState } from "react";

const ROWS = 20;
const COLS = 10;

const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: "bg-cyan-400" },
  O: { shape: [[1, 1], [1, 1]], color: "bg-yellow-400" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: "bg-purple-500" },
  L: { shape: [[1, 0], [1, 0], [1, 1]], color: "bg-orange-500" },
  J: { shape: [[0, 1], [0, 1], [1, 1]], color: "bg-blue-500" },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: "bg-green-500" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "bg-red-500" },
};

function randomTetromino() {
  const keys = Object.keys(TETROMINOS) as (keyof typeof TETROMINOS)[];
  return TETROMINOS[keys[Math.floor(Math.random() * keys.length)]];
}

export default function Tetris() {
  const [board, setBoard] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill("")));
  const [piece, setPiece] = useState({ shape: TETROMINOS.I.shape, color: TETROMINOS.I.color, pos: { x: 3, y: 0 } });
  const [gameOver, setGameOver] = useState(false);

  const drawPiece = (newBoard: string[][], shape: number[][], pos: { x: number; y: number }, color: string) => {
    shape.forEach((row, y) =>
      row.forEach((cell, x) => {
        if (cell) {
          const ny = y + pos.y;
          const nx = x + pos.x;
          if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
            newBoard[ny][nx] = color;
          }
        }
      })
    );
  };

  const drop = () => {
    const newPos = { ...piece.pos, y: piece.pos.y + 1 };
    if (!collides(piece.shape, newPos)) {
      setPiece({ ...piece, pos: newPos });
    } else {
      mergePiece();
      spawnPiece();
    }
  };

  const collides = (shape: number[][], pos: { x: number; y: number }) => {
    return shape.some((row, y) =>
      row.some((cell, x) => {
        if (!cell) return false;
        const ny = y + pos.y;
        const nx = x + pos.x;
        return ny >= ROWS || nx < 0 || nx >= COLS || (ny >= 0 && board[ny][nx]);
      })
    );
  };

  const mergePiece = () => {
    const newBoard = board.map((row) => [...row]);
    drawPiece(newBoard, piece.shape, piece.pos, piece.color);
    setBoard(newBoard);
    clearRows(newBoard);
  };

  const clearRows = (newBoard: string[][]) => {
    const cleared = newBoard.filter((row) => row.some((c) => !c));
    const rowsCleared = ROWS - cleared.length;
    while (cleared.length < ROWS) cleared.unshift(Array(COLS).fill(""));
    setBoard(cleared);
    if (rowsCleared > 0) console.log(`Cleared ${rowsCleared} row(s)!`);
  };

  const spawnPiece = () => {
    const t = randomTetromino();
    const newPiece = { shape: t.shape, color: t.color, pos: { x: 3, y: 0 } };
    if (collides(newPiece.shape, newPiece.pos)) {
      setGameOver(true);
    } else {
      setPiece(newPiece);
    }
  };

  // Game loop
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(drop, 800);
    return () => clearInterval(id);
  });

  return (
    <div className="flex flex-col items-center" role="region" aria-label="Tetris game">
      <h1 className="text-2xl font-bold">Tetris</h1>
      <div role="grid" className="grid gap-px bg-gray-700" style={{ gridTemplateColumns: `repeat(${COLS}, 20px)` }}>
        {board.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              role="gridcell"
              className={`w-5 h-5 ${cell || "bg-gray-900"}`}
            />
          ))
        )}
      </div>
      {gameOver && <div role="status" aria-live="polite" className="mt-2 text-red-600">Game Over!</div>}
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Rotation logic**: Implement matrix transpose + reverse rows for rotation.
* **Scoring system**: Points for row clears, faster drops.
* **Levels**: Increase drop speed over time.
* **Keyboard controls**: Left/Right/Down/Up, Space = hard drop.
* **Pause/Resume**: Add button or keybinding.
* **Accessibility upgrade**: Announce “Row cleared” or “Level up!” via `aria-live`.