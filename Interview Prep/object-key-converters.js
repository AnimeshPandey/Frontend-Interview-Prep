/**
 * toCamelCase()
 *
 * What does toCamelCase do?
 * - Converts a snake_case string into camelCase
 * - Example: "first_name" → "firstName"
 *
 * Why implement it this way?
 * - Use regex to find "_" followed by a lowercase letter
 * - Replace with uppercase letter
 *
 * Time Complexity: O(k) – k = string length
 * Space Complexity: O(1)
 */
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Follow-up Questions:
 * - How would you handle UPPER_CASE keys?
 * - How would you handle kebab-case → camelCase?
 */


/**
 * toSnakeCase()
 *
 * What does toSnakeCase do?
 * - Converts a camelCase string into snake_case
 * - Example: "firstName" → "first_name"
 *
 * Why implement it this way?
 * - Regex finds uppercase letters
 * - Prefix with "_" and lowercase it
 *
 * Time Complexity: O(k) – length of string
 * Space Complexity: O(1)
 */
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, c => "_" + c.toLowerCase());
}

/**
 * Follow-up Questions:
 * - How would you handle PascalCase → snake_case?
 * - How would you optimize for very large nested objects?
 */


/**
 * convertKeys()
 *
 * What does convertKeys do?
 * - Recursively converts all object keys using a given converter
 * - Works for arrays, nested objects
 * - Example: { first_name: { last_name: "X" } } → { firstName: { lastName: "X" } }
 *
 * Why implement it this way?
 * - Use recursion for nested structures
 * - Handle arrays separately (map each element)
 * - Use Object.entries → map → Object.fromEntries for clean conversion
 *
 * Time Complexity: O(n * k)
 * - n = number of keys
 * - k = avg string length for conversion
 * Space Complexity: O(n)
 *
 * Performance Considerations:
 * - Recursion may cause stack overflow on very deep objects
 * - For very large objects, consider iterative stack-based approach
 */
function convertKeys(obj, convertFn) {
  if (Array.isArray(obj)) return obj.map(v => convertKeys(v, convertFn)); // recurse on arrays
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [convertFn(k), convertKeys(v, convertFn)])
    );
  }
  return obj; // primitive → return as-is
}

/**
 * Follow-up Questions:
 * - How would you optimize for very large nested objects?
 * - What about converting keys back (camelCase → snake_case)?
 * - How to handle Maps/Sets with object keys?
 */
