# **13. File Explorer**

### ✅ Requirements

* Display a **nested tree structure** of folders and files.
* **Expand/Collapse** folders.
* Click on a file → trigger a callback (e.g., open file).
* Accessibility:

  * Use `role="tree"`, `role="treeitem"`.
  * `aria-expanded` for folders.
  * Keyboard navigation:

    * `ArrowRight`: expand folder / move to child.
    * `ArrowLeft`: collapse folder / move to parent.
* Extensible: Add features like renaming, drag-and-drop, async loading.

---

### ⚙️ Step-by-Step Solution

1. **Data model**: Tree-like JSON structure:

   ```ts
   interface Node {
     name: string;
     type: "file" | "folder";
     children?: Node[];
   }
   ```
2. **Recursive rendering**:

   * If `folder`, render name + caret + recursive children.
   * If `file`, render leaf node.
3. **State**:

   * Track expanded folders (set of paths or IDs).
4. **Accessibility**:

   * `role="tree"` on root.
   * Each item → `role="treeitem"`.
   * Folders get `aria-expanded`.
5. **Interaction**:

   * Toggle expand on click.
   * Trigger callback on file click.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useState } from "react";

interface Node {
  name: string;
  type: "file" | "folder";
  children?: Node[];
}

interface FileExplorerProps {
  data: Node[];
  onFileOpen?: (name: string) => void;
}

export default function FileExplorer({ data, onFileOpen }: FileExplorerProps) {
  return (
    <div role="tree" className="p-2 border rounded w-80 bg-gray-50">
      {data.map((node, idx) => (
        <TreeNode key={idx} node={node} onFileOpen={onFileOpen} level={1} />
      ))}
    </div>
  );
}

function TreeNode({
  node,
  onFileOpen,
  level,
}: {
  node: Node;
  onFileOpen?: (name: string) => void;
  level: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isFolder = node.type === "folder";

  return (
    <div role="treeitem" aria-expanded={isFolder ? expanded : undefined}>
      <div
        className={`flex items-center cursor-pointer pl-${level * 2}`}
        onClick={() => {
          if (isFolder) setExpanded((e) => !e);
          else onFileOpen?.(node.name);
        }}
      >
        {isFolder ? (
          <span className="mr-1">{expanded ? "📂" : "📁"}</span>
        ) : (
          <span className="mr-1">📄</span>
        )}
        {node.name}
      </div>

      {/* Children */}
      {isFolder && expanded && node.children && (
        <div className="ml-4 border-l pl-2">
          {node.children.map((child, i) => (
            <TreeNode
              key={i}
              node={child}
              onFileOpen={onFileOpen}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Example Data

```tsx
const data = [
  {
    name: "src",
    type: "folder",
    children: [
      { name: "index.tsx", type: "file" },
      {
        name: "components",
        type: "folder",
        children: [
          { name: "App.tsx", type: "file" },
          { name: "Button.tsx", type: "file" },
        ],
      },
    ],
  },
  { name: "package.json", type: "file" },
];
```

Usage:

```tsx
<FileExplorer data={data} onFileOpen={(file) => alert("Open " + file)} />
```

---

### 🔥 Follow-up Questions & Extensions

* **Async loading**: Show “loading…” until children fetched from API.
* **Drag-and-drop**: Reorder files/folders (with libraries like `react-beautiful-dnd`).
* **Context menu**: Right-click to rename/delete.
* **Keyboard navigation**: Arrow keys to move, Enter to open, Left/Right to expand/collapse.
* **Virtualization**: For huge file trees, render only visible nodes (`react-window`).