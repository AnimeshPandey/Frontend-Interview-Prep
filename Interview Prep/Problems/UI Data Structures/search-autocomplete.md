# 🔎 Problem 12: Trie-based Search Autocomplete
* Step 1 → Insert & basic search.
* Step 2 → Prefix search.
* Step 3 → Full autocomplete (suggestions).
* Step 4 → Add frequency / top-k suggestions.
* Step 5 → Discuss performance & real-world tradeoffs.
---

## Step 1. Interviewer starts:

*"Implement a Trie data structure with `insert(word)` and `search(word)`."*

---

### ✅ Basic Trie Insert & Search

```js
class TrieNode {
  constructor() {
    this.children = {}; // map char → TrieNode
    this.isEnd = false; // marks end of word
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEnd = true;
  }

  search(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEnd;
  }
}

// Example
const trie = new Trie();
trie.insert("cat");
console.log(trie.search("cat")); // true
console.log(trie.search("car")); // false
```

---

## Step 2. Interviewer adds:

*"Good. Now implement `startsWith(prefix)` to check if any word starts with that prefix."*

---

### ✅ Prefix Search

```js
class Trie extends Trie {
  startsWith(prefix) {
    let node = this.root;
    for (let char of prefix) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return true;
  }
}

// Example
trie.insert("carrot");
console.log(trie.startsWith("car")); // true
console.log(trie.startsWith("dog")); // false
```

---

## Step 3. Interviewer twists:

*"Nice. Now return all words with a given prefix (autocomplete)."*

---

### ✅ Autocomplete

```js
class Trie extends Trie {
  _dfs(node, prefix, results) {
    if (node.isEnd) results.push(prefix);
    for (let char in node.children) {
      this._dfs(node.children[char], prefix + char, results);
    }
  }

  autocomplete(prefix) {
    let node = this.root;
    for (let char of prefix) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }

    const results = [];
    this._dfs(node, prefix, results);
    return results;
  }
}

// Example
trie.insert("cat");
trie.insert("car");
trie.insert("cartoon");
console.log(trie.autocomplete("car")); // ["car", "cartoon"]
```

---

## Step 4. Interviewer pushes:

*"Good. But in real autocomplete, we want **top K most frequent results** (e.g., Google shows most searched first)."*

---

### ✅ Autocomplete with Frequency / Top-K

```js
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
    this.freq = 0; // frequency of word usage
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
    }
    node.isEnd = true;
    node.freq++;
  }

  _dfs(node, prefix, results) {
    if (node.isEnd) results.push({ word: prefix, freq: node.freq });
    for (let char in node.children) {
      this._dfs(node.children[char], prefix + char, results);
    }
  }

  autocomplete(prefix, k = 5) {
    let node = this.root;
    for (let char of prefix) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }

    const results = [];
    this._dfs(node, prefix, results);
    return results
      .sort((a, b) => b.freq - a.freq)
      .slice(0, k)
      .map(r => r.word);
  }
}

// Example
const trie2 = new Trie();
trie2.insert("car");
trie2.insert("car");
trie2.insert("cat");
trie2.insert("cartoon");
console.log(trie2.autocomplete("car", 2)); // ["car", "cartoon"]
```

---

## Step 5. Interviewer final boss:

*"Awesome. How does this scale? What if we have **1M words** in the Trie? What are the tradeoffs?"*

---

### ✅ Performance & Real-World Discussion

* **Time Complexity**:

  * Insert: O(m) (m = word length).
  * Search: O(m).
  * Autocomplete: O(m + k) (prefix length + words found).

* **Space Complexity**:

  * Potentially huge (each node has up to 26+ children).
  * \~26 \* N worst case.

* **Optimizations**:

  * Use a **compressed trie (radix tree)** → merge chains of single children.
  * Store children in **Map** instead of object → better perf for large char sets.
  * Limit depth with hashing (e.g., fallback to prefix hash → sorted list).

* **Frontend Use Cases**:

  * Search bars with prefix autocomplete.
  * Command palettes (VS Code style).
  * Typeahead (Google, Twitter search).
  * Can preload Trie client-side for **offline search**.

* **Alternatives**:

  * For huge datasets → suffix arrays, bloom filters, search indexes.
  * For small datasets → just filter array with `.startsWith()`.

---

# 🎯 Final Interview Takeaways (Trie Autocomplete)

* ✅ Step 1: Basic insert + search.
* ✅ Step 2: Prefix search (`startsWith`).
* ✅ Step 3: Return all completions.
* ✅ Step 4: Add frequency/top-k.
* ✅ Step 5: Discuss scaling & memory tradeoffs.