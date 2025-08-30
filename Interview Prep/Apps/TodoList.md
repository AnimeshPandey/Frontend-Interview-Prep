# **11. Todo List**

### ✅ Requirements

* Add, edit, delete, and mark todos as completed.
* Display todos in a list with checkboxes.
* Persist in local state (and optionally in `localStorage`).
* Accessibility:

  * Each todo should be a `listitem` in a `list`.
  * Checkbox with `aria-checked`.
  * Labels tied to inputs.
* Extensible: Filtering (All / Active / Completed), bulk delete, or drag-and-drop ordering.

---

### ⚙️ Step-by-Step Solution

1. **State**:

   * `todos: { id, text, completed }[]`.
   * `input: string` for the new todo.
2. **Handlers**:

   * `addTodo(text)`.
   * `toggleTodo(id)`.
   * `deleteTodo(id)`.
   * `editTodo(id, newText)`.
3. **Rendering**:

   * Input box + Add button.
   * List of todos with checkboxes.
   * Delete & Edit buttons.
4. **Accessibility**:

   * `role="list"`, `role="listitem"`.
   * Checkbox with label.
   * Input with placeholder `"What needs to be done?"`.
5. **Extras**:

   * Save todos in `localStorage` so they persist after reload.
   * Filter view by status.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useState, useEffect } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input.trim(), completed: false }]);
    setInput("");
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const editTodo = (id: number, newText: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, text: newText } : t)));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 border rounded px-2 py-1"
        />
        <button onClick={addTodo} className="bg-blue-600 text-white px-4 py-1 rounded">
          Add
        </button>
      </div>

      {/* List */}
      <ul role="list" className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            role="listitem"
            className="flex items-center justify-between border-b pb-2"
          >
            <label className="flex items-center gap-2 flex-1">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                aria-checked={todo.completed}
              />
              <span className={todo.completed ? "line-through text-gray-500" : ""}>
                {todo.text}
              </span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newText = prompt("Edit todo", todo.text);
                  if (newText) editTodo(todo.id, newText);
                }}
                className="text-sm text-blue-600"
                aria-label={`Edit todo: ${todo.text}`}
              >
                Edit
              </button>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-sm text-red-600"
                aria-label={`Delete todo: ${todo.text}`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Filters**: Add tabs for All / Active / Completed.
* **Bulk actions**: “Clear completed” button.
* **Drag-and-drop**: Reorder todos (`react-beautiful-dnd`).
* **Server sync**: Fetch/save todos from an API.
* **Testing**: Unit test handlers, integration test with React Testing Library.
