# **15. Tic-tac-toe**

### ✅ Requirements

* 3x3 grid.
* Two players take turns: Player **X** and Player **O**.
* A player wins if they get 3 in a row (row, column, or diagonal).
* Show winner or draw when game ends.
* Accessibility:

  * Grid should be keyboard-navigable.
  * Each cell is a `button` with `aria-label` like `"Cell (1,2): X"`.

---

### ⚙️ Step-by-Step Solution

1. **State**:

   * `board: string[]` of length 9 (`"" | "X" | "O"`).
   * `currentPlayer: "X" | "O"`.
   * `winner: string | null`.
2. **Gameplay**:

   * On click, if cell empty and no winner, fill with current player.
   * Switch player.
   * After each move, check for winner or draw.
3. **Win check**:

   * Predefine winning indices:

     ```ts
     const WINNING_COMBOS = [
       [0,1,2], [3,4,5], [6,7,8], // rows
       [0,3,6], [1,4,7], [2,5,8], // cols
       [0,4,8], [2,4,6],          // diagonals
     ];
     ```
   * If board has same non-empty symbol in any combo → winner.
4. **Restart**: Reset state.
5. **Accessibility**:

   * Use `role="grid"`, `role="gridcell"`.
   * Announce winner with `aria-live="polite"`.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useState } from "react";

const WINNING_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diagonals
];

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [current, setCurrent] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<string | null>(null);

  const checkWinner = (b: string[]) => {
    for (const [a,bIndex,c] of WINNING_COMBOS) {
      if (b[a] && b[a] === b[bIndex] && b[a] === b[c]) return b[a];
    }
    if (b.every((cell) => cell)) return "Draw";
    return null;
  };

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = current;
    setBoard(newBoard);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
    } else {
      setCurrent(current === "X" ? "O" : "X");
    }
  };

  const reset = () => {
    setBoard(Array(9).fill(""));
    setCurrent("X");
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center gap-4" role="region" aria-label="Tic Tac Toe game">
      <h1 className="text-2xl font-bold">Tic-Tac-Toe</h1>
      <div
        role="grid"
        className="grid grid-cols-3 gap-2"
        aria-label="Game board"
      >
        {board.map((cell, i) => (
          <button
            key={i}
            role="gridcell"
            aria-label={`Cell ${i}: ${cell || "empty"}`}
            onClick={() => handleClick(i)}
            className="w-20 h-20 text-3xl font-bold border flex items-center justify-center"
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Status */}
      <div role="status" aria-live="polite" className="text-lg">
        {winner ? (winner === "Draw" ? "It's a draw!" : `Winner: ${winner}`) : `Turn: ${current}`}
      </div>

      <button onClick={reset} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded">
        Restart
      </button>
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **AI opponent**: Implement minimax algorithm for single-player.
* **Board size**: Generalize to NxN grid (e.g., 4x4).
* **Move history**: Undo/redo feature (like React official Tic-tac-toe tutorial).
* **Animations**: Animate winning line.
* **Multiplayer online**: Sync moves via WebSocket/Firebase.