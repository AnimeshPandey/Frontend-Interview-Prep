# **12. Data Table (with sorting & filtering)**

### ✅ Requirements

* Display tabular data with **headers** and **rows**.
* **Sorting**: Click column headers to sort ascending/descending.
* **Filtering**: Simple text filter for searching rows.
* Accessibility:

  * Use semantic `<table>`, `<thead>`, `<tbody>`.
  * Mark sortable columns with `aria-sort`.
  * Provide keyboard access (sort via `Enter`/`Space`).
* Extensible: Pagination, column resizing, server-side data.

---

### ⚙️ Step-by-Step Solution

1. **Props**:

   * `columns: { key, label }[]`.
   * `data: Record<string, any>[]`.
2. **State**:

   * `sortKey: string | null`.
   * `sortOrder: "asc" | "desc"`.
   * `filter: string`.
3. **Sorting**:

   * If column clicked = current `sortKey`, toggle order.
   * Otherwise, set `sortKey` to column.
   * Sort function uses `localeCompare` for strings or numeric compare.
4. **Filtering**:

   * Case-insensitive substring match across all columns.
5. **Rendering**:

   * Input box above table for filter.
   * `<th>` elements clickable for sorting.
   * Rows update dynamically.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useState, useMemo } from "react";

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
}

export default function DataTable({ columns, data }: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filteredData = useMemo(() => {
    let rows = data;

    // Filter
    if (filter.trim()) {
      const lower = filter.toLowerCase();
      rows = rows.filter((row) =>
        columns.some((col) => String(row[col.key]).toLowerCase().includes(lower))
      );
    }

    // Sort
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }
        return sortOrder === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return rows;
  }, [data, columns, filter, sortKey, sortOrder]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Data Table</h2>

      {/* Filter */}
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search..."
        className="border rounded px-2 py-1 mb-4 w-full"
      />

      {/* Table */}
      <table className="w-full border-collapse border" role="table">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                role="columnheader"
                aria-sort={
                  sortKey === col.key
                    ? sortOrder === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
                className="p-2 border cursor-pointer select-none"
              >
                {col.label}
                {sortKey === col.key && (sortOrder === "asc" ? " ▲" : " ▼")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                No results found
              </td>
            </tr>
          ) : (
            filteredData.map((row, i) => (
              <tr key={i} className="odd:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="p-2 border">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Pagination**: Client-side (`slice`) or server-side (API with `?page` and `?limit`).
* **Column-specific filtering**: Filters per column instead of global search.
* **Resizable columns**: Allow drag-to-resize headers.
* **Sticky headers**: Keep `<thead>` fixed on scroll.
* **Performance**: For huge datasets, use virtualization (`react-window`).
* **Editable cells**: Allow inline editing of values.