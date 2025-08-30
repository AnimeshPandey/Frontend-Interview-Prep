# **14. Kanban Board**

### ✅ Requirements

* Board with **multiple columns** (e.g. “To Do”, “In Progress”, “Done”).
* Each column contains **cards (tasks)**.
* Features:

  * Add new tasks.
  * Move tasks between columns (drag-and-drop or button controls).
  * Reorder tasks within a column.
* Accessibility:

  * Columns as `list` with cards as `listitem`.
  * Provide labels like `aria-label="Todo column"`.
  * Keyboard support: arrows or shortcut keys to move tasks.
* Extensible: Support persistence (localStorage/API), multi-user collaboration.

---

### ⚙️ Step-by-Step Solution

1. **Data model**:

   ```ts
   interface Task {
     id: string;
     text: string;
   }
   interface Column {
     id: string;
     title: string;
     tasks: Task[];
   }
   ```
2. **State**: `columns: Column[]`.
3. **Adding tasks**: Input per column to add new tasks.
4. **Moving tasks**:

   * Simple: Buttons (move left/right).
   * Advanced: Drag-and-drop with `react-beautiful-dnd`.
5. **Accessibility**:

   * Each column = `role="list"`.
   * Each task = `role="listitem"`.
   * Movement buttons labeled for screen readers.

---

### 🧑‍💻 React Implementation (with simple button-based movement)

```tsx
import React, { useState } from "react";

interface Task {
  id: string;
  text: string;
}
interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "To Do", tasks: [] },
    { id: "inprogress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ]);

  const addTask = (colId: string, text: string) => {
    setColumns((cols) =>
      cols.map((col) =>
        col.id === colId
          ? { ...col, tasks: [...col.tasks, { id: Date.now().toString(), text }] }
          : col
      )
    );
  };

  const moveTask = (taskId: string, fromId: string, direction: number) => {
    setColumns((cols) => {
      const fromIndex = cols.findIndex((c) => c.id === fromId);
      const toIndex = fromIndex + direction;
      if (toIndex < 0 || toIndex >= cols.length) return cols;

      const fromCol = cols[fromIndex];
      const toCol = cols[toIndex];
      const task = fromCol.tasks.find((t) => t.id === taskId);
      if (!task) return cols;

      return cols.map((c, i) => {
        if (i === fromIndex) return { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) };
        if (i === toIndex) return { ...c, tasks: [...c.tasks, task] };
        return c;
      });
    });
  };

  return (
    <div className="flex gap-6 p-6 bg-gray-100">
      {columns.map((col) => (
        <div
          key={col.id}
          role="list"
          aria-label={`${col.title} column`}
          className="bg-white rounded-lg p-4 w-64 shadow"
        >
          <h2 className="font-bold text-lg mb-3">{col.title}</h2>
          <TaskInput onAdd={(text) => addTask(col.id, text)} />

          <div className="space-y-2">
            {col.tasks.map((task) => (
              <div
                key={task.id}
                role="listitem"
                className="bg-gray-200 p-2 rounded flex justify-between items-center"
              >
                <span>{task.text}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveTask(task.id, col.id, -1)}
                    aria-label="Move task left"
                    className="px-2 bg-gray-400 text-white rounded"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => moveTask(task.id, col.id, +1)}
                    aria-label="Move task right"
                    className="px-2 bg-gray-400 text-white rounded"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex mb-3 gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="New task"
        className="flex-1 border px-2 py-1 rounded"
      />
      <button
        onClick={() => {
          if (val.trim()) {
            onAdd(val.trim());
            setVal("");
          }
        }}
        className="bg-blue-600 text-white px-3 rounded"
      >
        Add
      </button>
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Drag-and-drop**: Replace left/right buttons with `react-beautiful-dnd` or `dnd-kit`.
* **Persistence**: Save board state in `localStorage` or sync with an API.
* **User assignments**: Add avatars for who’s working on each task.
* **Labels & due dates**: Extend tasks with metadata.
* **Multi-board support**: Workspaces with multiple boards.
* **Collaboration**: Use WebSockets or Firebase for real-time updates.