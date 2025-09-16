# Arrays & Two-Pointers / Sliding-Window (complete coverage)

These are the most common patterns; many problems are variations of a handful of ideas.

---

# 1) Fundamental pattern: Two-Pointers on a sorted array

**Idea:** maintain two indices `i` and `j` (one start, one end or both start) and move them towards a goal. O(n) time for many problems.

## Problem A — Two Sum (return indices) (unsorted)

**Pattern:** hash map (not two pointers) — but when array is sorted or you're allowed to sort and return values (not indices) you can use two pointers.

### Variant 1: unsorted array, return indices

```js
// O(n) time, O(n) space
function twoSumIndices(nums, target) {
  const idx = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (idx.has(need)) return [idx.get(need), i];
    idx.set(nums[i], i);
  }
  return null;
}
```

**Pitfalls:** duplicates; return first pair; if multiple answers acceptable, you'll get first encountered.

### Variant 2: sorted array, return values (two pointers)

```js
// nums sorted, return [a,b] such that a+b==target
function twoSumSorted(nums, target) {
  let l = 0, r = nums.length - 1;
  while (l < r) {
    const s = nums[l] + nums[r];
    if (s === target) return [nums[l], nums[r]];
    if (s < target) l++;
    else r--;
  }
  return null;
}
```

**Why works:** If sum too small, increase left to raise sum; if too large, decrease right.

**Complexities:** O(n) time, O(1) space.

---

## Problem B — 3Sum (all triplets sum to 0)

**Pattern:** sort + two pointers inside loop; deduplicate results.

```js
function threeSum(nums) {
  nums.sort((a,b)=>a-b);
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i-1]) continue; // skip duplicates
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const s = nums[i] + nums[l] + nums[r];
      if (s === 0) {
        res.push([nums[i], nums[l], nums[r]]);
        while (l < r && nums[l] === nums[l+1]) l++; // skip dups
        while (l < r && nums[r] === nums[r-1]) r--;
        l++; r--;
      } else if (s < 0) l++;
      else r--;
    }
  }
  return res;
}
```

**Variants:**

* 3Sum closest: same pattern but keep best diff.
* k-sum generalization: recursion + two-pointer base case (k==2). Complexity grows combinatorially: O(n^{k-1}).

**Pitfalls:** heavy attention to duplicate skipping and integer overflow (rare in JS but watch for huge numbers).

---

## Problem C — Container With Most Water

**Pattern:** two pointers from ends; greedily move pointer with smaller height.

```js
function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    const h = Math.min(height[l], height[r]);
    best = Math.max(best, h * (r - l));
    if (height[l] < height[r]) l++;
    else r--;
  }
  return best;
}
```

**Why greedy move smaller pointer?** Moving the taller pointer cannot increase area because width decreases and min height cannot increase beyond smaller height — only moving smaller side can possibly find taller bar.

**Complexity:** O(n), O(1).

---

# 2) Sliding Window (variable window)

**Idea:** maintain window `[l..r]` with some invariant (sum, count of distinct, max/min via deque), expand `r`, shrink `l` as needed.

## Problem A — longest substring without repeating characters (LeetCode classic)

**Pattern:** sliding window + index map (Map or array of last indices)

```js
function lengthOfLongestSubstring(s) {
  const last = new Map(); // char -> last index
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    const ch = s[r];
    if (last.has(ch) && last.get(ch) >= l) {
      l = last.get(ch) + 1;
    }
    last.set(ch, r);
    best = Math.max(best, r - l + 1);
  }
  return best;
}
```

**Variant:** if characters limited (ASCII), use fixed-size array for speed.

**Pitfall:** important to check last index >= l before updating left pointer.

---

## Problem B — minimum window substring (covering all characters of T)

**Pattern:** sliding window + frequency maps + count of satisfied characters.

High-level solution:

1. Build needed freq map for `t`.
2. Expand `r`, update window freq and satisfied count.
3. When all required chars satisfied, try shrink `l` to minimize window.
4. Track best.

```js
function minWindow(s, t) {
  if (!s || !t) return "";
  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch)||0) + 1);
  let required = need.size; // number of unique chars to satisfy
  let l = 0, r = 0, bestL = 0, bestLen = Infinity;
  const window = new Map();

  while (r < s.length) {
    const ch = s[r++];
    window.set(ch, (window.get(ch)||0) + 1);
    if (need.has(ch) && window.get(ch) === need.get(ch)) required--;

    while (required === 0) { // valid window
      if (r - l < bestLen) { bestLen = r - l; bestL = l; }
      const leftChar = s[l++];
      window.set(leftChar, window.get(leftChar) - 1);
      if (need.has(leftChar) && window.get(leftChar) < need.get(leftChar)) required++;
    }
  }
  return bestLen === Infinity ? "" : s.slice(bestL, bestL + bestLen);
}
```

**Variants:** multisets, array of ints (window sums), at-most-k distinct.

**Complexity:** O(n + |alphabet|), space O(|alphabet|).

---

## Problem C — sliding window maximum (deque / monotonic queue)

**Pattern:** maintain indices in a deque where values are in decreasing order — front is max.

```js
function maxSlidingWindow(nums, k) {
  const res = [];
  const dq = []; // store indices, decreasing by value
  for (let i = 0; i < nums.length; i++) {
    // remove indices out of window
    while (dq.length && dq[0] <= i - k) dq.shift(); // O(1) amortized if use deque structure
    // remove smaller values from back
    while (dq.length && nums[dq[dq.length - 1]] < nums[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) res.push(nums[dq[0]]);
  }
  return res;
}
```

**Note:** `Array.shift()` is O(n) per op; for robust large inputs implement deque with head/tail indexes or linked list. But in interviews this classic Array-based code is acceptable if you mention complexity caveat and offer a linked-list/circular buffer alternative.

**Complexity:** O(n) amortized.

---

# 3) Two-Pointers for Partitioning / Reordering

**Idea:** Partition array in-place by moving `i` forward and `j` backward using condition checks.

## Problem — partition by parity (odds left, evens right)

```js
function partitionParity(nums) {
  let l = 0, r = nums.length - 1;
  while (l < r) {
    if ((nums[l] % 2) === 1) { l++; continue; }
    if ((nums[r] % 2) === 0) { r--; continue; }
    [nums[l], nums[r]] = [nums[r], nums[l]];
    l++; r--;
  }
  return nums;
}
```

**Variants:** partition by pivot (quickselect partition), Dutch National Flag (three-way partition) for 0/1/2 sorts.

---

# 4) Two-Pointers for Linked Lists (two pointers in node-space)

**Pattern:** slow/fast for middle, detect cycle, remove nth-from-end.

### Find middle node

```js
function middleNode(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}
```

**Variants:** when even-length choose first/second middle — adjust initialization/loop condition.

### Remove Nth from end (two-pointer gap)

```js
function removeNthFromEnd(head, n) {
  const dummy = { next: head };
  let fast = dummy, slow = dummy;
  for (let i = 0; i <= n; i++) fast = fast.next;
  while (fast) { fast = fast.next; slow = slow.next; }
  slow.next = slow.next.next;
  return dummy.next;
}
```

**Note:** careful with off-by-one — using dummy simplifies.

---

# 5) Common Two-Pointer / Sliding-Window Variations & Interview Tips

### A. Fixed-window vs variable-window

* Fixed k: often use prefix sums (for sums) or deque for max/min.
* Variable: expand until condition fails, then shrink.

### B. When to sort

* Sorting helps convert O(n^2) checks to O(n log n + n^2?) but destroys index ordering — only do when values matter not original indices.
* Sorting costs O(n log n). For two-sum returning indices you cannot sort unless you track original indices.

### C. Complexity trade-offs

* Hash map gives O(n) expected but O(n) extra space.
* Sorting + two-pointer gives O(n log n) time, O(1) extra (if sort in-place) but may change required output.

### D. Edge cases to verbalize in interview

* empty arrays, single-element arrays
* duplicates
* negative numbers (for sums)
* very large numbers (JS number precision) — mention BigInt if needed
* arrays of objects vs primitives (use Map for objects)

### E. Proof style (short)

When interviewer asks why two-pointer greedy is correct (e.g., container with most water), give a concise invariant-based proof: show that moving taller side cannot give larger area because height bound remains min(hL,hR) and width decreases — only moving smaller can possibly increase min height.

---

# 6) Practice problem list (ranked, with variations)

Do these until patterns feel automatic.

1. Two-sum (indices, values, sorted/unsorted). — variations: K-sum.
2. 3Sum / 3Sum Closest / 4Sum.
3. Container With Most Water.
4. Longest substring without repeating characters.
5. Minimum window substring.
6. Sliding window maximum.
7. Partitioning problems (Dutch flag, partition by pivot).
8. Subarray sum equals k (use map of prefix sums).
9. Maximum subarray (Kadane’s algorithm) — sliding-window-like.
10. Subarrays with at most K distinct elements (sliding window + freq map) — variations: exactly K distinct.
11. Find subarray with given product (handle zeros, two pointers for positive numbers).
12. Longest repeating character replacement (sliding window with freq count).

---

# 7) Ready-to-use helper utilities (interview-friendly)

### Circular buffer deque (simple O(1) shift/unshift alternative)

```js
class Deque {
  constructor() { this._a = []; this._head = 0; this._tail = 0; }
  pushBack(v) { this._a[this._tail++] = v; }
  popBack() { if (this._tail === this._head) return undefined; return this._a[--this._tail]; }
  front() { return this._a[this._head]; }
  popFront() { if (this._tail === this._head) return undefined; return this._a[this._head++]; }
  size() { return this._tail - this._head; }
}
```

(Explain that this grows unboundedly unless you occasionally slice to reset when head grows large.)

---

# 8) Quick checklist for interviews (arrays & two-pointers)

* Always mention complexity and justify it.
* Explain choice: why hash vs sort vs two-pointer vs sliding-window.
* Edge cases: empty, negative numbers, duplicates, overflow.
* If using `shift()` mention cost and propose queue implementation.
* Talk about memory constraints and how to reduce from O(n) to O(1) if possible.

---