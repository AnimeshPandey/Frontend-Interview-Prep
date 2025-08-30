/***********************************************************
 * 6. DOM Polyfills (Browser Only)
 ***********************************************************/

/**
 * myGetElementsByClassName()
 *
 * What does native getElementsByClassName do?
 * - Traverses the DOM
 * - Collects all elements that contain a given class
 * - Returns a live HTMLCollection (updates if DOM changes)
 *
 * Why implement it this way?
 * - Recursively traverse the DOM tree
 * - Check each element’s classList
 * - Collect matches in an array
 *
 * Time Complexity: O(n) – n = number of DOM nodes
 * Space Complexity: O(k) – k = number of matches
 *
 * Performance Considerations:
 * - Traversing large DOM trees is expensive
 * - Modern APIs like querySelectorAll(".className") are much faster (native C++)
 */
Document.prototype.myGetElementsByClassName = function(className) {
  const results = [];

  function traverse(node) {
    if (node.nodeType === 1) { // ELEMENT_NODE only
      if (node.classList && node.classList.contains(className)) {
        results.push(node);
      }
      // Recurse into children
      for (const child of node.children) traverse(child);
    }
  }

  traverse(this.body);
  return results;
};

/**
 * Follow-up Questions:
 * - How does this differ from querySelectorAll(".className")?
 *   (querySelectorAll returns static NodeList, getElementsByClassName returns live collection)
 * - Which is faster: className search or querySelectorAll?
 * - How to optimize traversal for huge DOM trees?
 */


/**
 * myGetElementsByTagName()
 *
 * What does native getElementsByTagName do?
 * - Traverses DOM
 * - Collects elements with given tag name
 * - Returns live HTMLCollection
 *
 * Why implement it this way?
 * - Use recursion over DOM tree
 * - Compare tagName (normalize to uppercase)
 *
 * Time Complexity: O(n) – must visit all nodes
 * Space Complexity: O(k) – k = number of matches
 */
Document.prototype.myGetElementsByTagName = function(tagName) {
  const results = [];
  tagName = tagName.toUpperCase(); // HTML is case-insensitive

  function traverse(node) {
    if (node.nodeType === 1) {
      if (node.tagName === tagName) results.push(node);
      for (const child of node.children) traverse(child);
    }
  }

  traverse(this.body);
  return results;
};

/**
 * Follow-up Questions:
 * - Why normalize tagName to uppercase?
 * - Difference between this and querySelectorAll("div")?
 * - Why are querySelector/querySelectorAll preferred in modern code?
 */


/**
 * querySelector()
 *
 * - Returns the first element that matches a CSS selector
 * - Example: document.querySelector(".btn")
 * - Returns null if no match
 *
 * querySelectorAll()
 *
 * - Returns all elements that match a CSS selector
 * - Returns a static NodeList (does not update live like getElementsByClassName)
 * - Example: document.querySelectorAll("div.item")
 *
 * Why use these?
 * - Very flexible: can select by tag, class, id, attribute, pseudo-classes
 * - Usually faster (implemented in native C++ under the hood)
 *
 * Time Complexity: O(n) in worst case (needs to check all elements)
 * Space Complexity: O(k) for NodeList
 */
const modernClassSearch = document.querySelectorAll(".className"); // modern alternative
const modernTagSearch   = document.querySelectorAll("div");        // modern alternative


/**
 * matches()
 *
 * - Tests if an element matches a CSS selector
 * - Example: el.matches(".active")
 *
 * closest()
 *
 * - Traverses up the DOM tree to find nearest ancestor matching selector
 * - Example: el.closest(".card")
 *
 * Why useful?
 * - Often used for event delegation
 * - Example: listen on parent container, check if event.target.closest(".item")
 */
const el = document.querySelector(".btn");
if (el.matches(".btn.primary")) {
  console.log("This button is primary");
}
const card = el.closest(".card"); // nearest ancestor with class "card"


