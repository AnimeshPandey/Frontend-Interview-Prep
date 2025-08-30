# **17. Wordle**

### ✅ Requirements

* Guess a **hidden 5-letter word** within 6 tries.
* Each guess gives feedback:

  * 🟩 letter correct and in right place.
  * 🟨 letter correct but wrong place.
  * ⬜ letter not in word.
* Input via on-screen keyboard or physical keyboard.
* Accessibility:

  * Grid with rows (`role="row"`) and cells (`role="gridcell"`).
  * Each cell announced with letter + status.
  * Game status updates via `aria-live`.

---

### ⚙️ Step-by-Step Solution

1. **State**:

   * `target` = hidden word (e.g. `"REACT"`).
   * `guesses: string[]` → completed guesses.
   * `currentGuess: string` → user’s input.
   * `status: "playing" | "won" | "lost"`.
2. **Input handling**:

   * On key press: add letter (max 5).
   * Backspace deletes last letter.
   * Enter submits if 5 letters.
3. **Feedback logic**:

   * For each letter:

     * If matches position → green.
     * Else if in word → yellow.
     * Else → gray.
   * Handle duplicate letters carefully.
4. **Win/Loss detection**:

   * If guess === target → `won`.
   * If guesses.length === 6 → `lost`.
5. **Accessibility**:

   * `aria-label="Letter E, correct"` for each cell.
   * `aria-live="polite"` for announcements.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useEffect, useState } from "react";

const WORD_LENGTH = 5;
const MAX_TRIES = 6;
const TARGET = "REACT"; // normally random from word list

type LetterStatus = "correct" | "present" | "absent" | "empty";

export default function Wordle() {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");

  const handleKey = (e: KeyboardEvent) => {
    if (status !== "playing") return;
    if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((g) => g + e.key.toUpperCase());
    } else if (e.key === "Backspace") {
      setCurrentGuess((g) => g.slice(0, -1));
    } else if (e.key === "Enter" && currentGuess.length === WORD_LENGTH) {
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");
      if (currentGuess === TARGET) setStatus("won");
      else if (newGuesses.length === MAX_TRIES) setStatus("lost");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentGuess, guesses, status]);

  const evaluateGuess = (guess: string): LetterStatus[] => {
    const result: LetterStatus[] = Array(WORD_LENGTH).fill("absent");
    const targetArr = TARGET.split("");
    const used = Array(WORD_LENGTH).fill(false);

    // Mark correct
    guess.split("").forEach((ch, i) => {
      if (ch === targetArr[i]) {
        result[i] = "correct";
        used[i] = true;
      }
    });

    // Mark present
    guess.split("").forEach((ch, i) => {
      if (result[i] === "correct") return;
      const idx = targetArr.findIndex((t, j) => t === ch && !used[j]);
      if (idx !== -1) {
        result[i] = "present";
        used[idx] = true;
      }
    });

    return result;
  };

  return (
    <div className="flex flex-col items-center gap-4" role="region" aria-label="Wordle game">
      <h1 className="text-2xl font-bold">Wordle</h1>

      {/* Grid */}
      <div role="grid" className="grid grid-rows-6 gap-2">
        {Array.from({ length: MAX_TRIES }).map((_, row) => {
          const guess = guesses[row] || (row === guesses.length ? currentGuess : "");
          const letters = guess.padEnd(WORD_LENGTH).split("");
          const statuses =
            row < guesses.length ? evaluateGuess(guesses[row]) : Array(WORD_LENGTH).fill("empty");

          return (
            <div role="row" key={row} className="grid grid-cols-5 gap-2">
              {letters.map((ch, i) => {
                const st = statuses[i];
                const colors: Record<LetterStatus, string> = {
                  correct: "bg-green-500 text-white",
                  present: "bg-yellow-500 text-white",
                  absent: "bg-gray-400 text-white",
                  empty: "bg-white border",
                };
                return (
                  <div
                    key={i}
                    role="gridcell"
                    aria-label={`Letter ${ch || "blank"}, ${st}`}
                    className={`w-12 h-12 flex items-center justify-center text-xl font-bold uppercase rounded ${colors[st]}`}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Status */}
      <div role="status" aria-live="polite" className="mt-3 text-lg">
        {status === "won" && "🎉 You guessed the word!"}
        {status === "lost" && `😢 You lost. The word was ${TARGET}.`}
        {status === "playing" && `Tries left: ${MAX_TRIES - guesses.length}`}
      </div>
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Word list**: Load from dictionary API or word bank.
* **On-screen keyboard**: Render A–Z buttons, color them by used letter status.
* **Hard mode**: Must reuse revealed hints.
* **Different word lengths**: Make board dynamic (4-letter, 6-letter).
* **Multiplayer**: Let one player set a word, the other guesses.