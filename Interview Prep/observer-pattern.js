/**
 * Observer Pattern
 *
 * What does the Observer Pattern do?
 * - Defines a one-to-many relationship
 * - A "Subject" maintains a list of Observers (subscribers)
 * - When the Subject changes, it notifies all Observers
 *
 * Example use case:
 * - UI state changes → notify multiple components
 * - Stock price updates → notify all users watching
 *
 * Why implement it this way?
 * - Store observers in an array
 * - Provide methods: subscribe, unsubscribe, notify
 *
 * Time Complexity:
 * - subscribe: O(1)
 * - unsubscribe: O(n) (must filter observers)
 * - notify: O(n) (call each observer)
 * Space Complexity: O(n)
 */
class Subject {
  constructor() {
    this.observers = [];
  }

  // Add observer function
  subscribe(fn) {
    this.observers.push(fn);
  }

  // Remove observer function
  unsubscribe(fn) {
    this.observers = this.observers.filter(obs => obs !== fn);
  }

  // Notify all observers with data
  notify(data) {
    this.observers.forEach(fn => fn(data));
  }
}

/**
 * Follow-up Questions:
 * - How is this different from PubSub?
 * - How would you implement once-only observers?
 * - How to handle async observers (notify with Promise.all)?
 */



/**
 * EventEmitter (Node.js style)
 *
 * What does EventEmitter do?
 * - Allows objects to emit named events
 * - Other parts of code can "listen" (subscribe) to those events
 * - Used heavily in Node.js core and many frontend libs
 *
 * Why implement it this way?
 * - Maintain a dictionary: eventName → listeners[]
 * - Methods: on (subscribe), off (unsubscribe), emit (notify)
 *
 * Time Complexity:
 * - on: O(1) to add listener
 * - off: O(n) to remove listener
 * - emit: O(n) to call listeners
 * Space Complexity: O(n)
 */
class EventEmitter {
  constructor() {
    this.events = {};
  }

  // Subscribe to an event
  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }

  // Unsubscribe from an event
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  // Emit (trigger) an event
  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}

/**
 * Follow-up Questions:
 * - How would you add once() method (listener runs only once)?
 * - What’s the difference between EventEmitter and Observer?
 * - How would you handle async listeners (await Promise.all)?
 */


/**
 * PubSub (Publish-Subscribe Pattern)
 *
 * What does PubSub do?
 * - A "Publisher" emits messages (events) tagged with a topic
 * - "Subscribers" register interest in topics
 * - Decouples publisher from subscribers (they don’t know about each other)
 *
 * Difference vs Observer:
 * - Observer: Subject knows its observers directly
 * - PubSub: Subscribers are decoupled, only know "topics"
 *
 * Why implement it this way?
 * - Use a dictionary: topic → subscribers[]
 * - Methods: subscribe, unsubscribe, publish
 *
 * Time Complexity:
 * - subscribe: O(1)
 * - unsubscribe: O(n)
 * - publish: O(n) for n subscribers of a topic
 * Space Complexity: O(n)
 */
class PubSub {
  constructor() {
    this.topics = {};
  }

  // Subscribe to a topic
  subscribe(topic, listener) {
    if (!this.topics[topic]) this.topics[topic] = [];
    this.topics[topic].push(listener);
  }

  // Unsubscribe from a topic
  unsubscribe(topic, listener) {
    if (!this.topics[topic]) return;
    this.topics[topic] = this.topics[topic].filter(l => l !== listener);
  }

  // Publish a message to a topic
  publish(topic, data) {
    if (!this.topics[topic]) return;
    this.topics[topic].forEach(listener => listener(data));
  }
}

/**
 * Follow-up Questions:
 * - Difference between PubSub and Observer?
 *   (PubSub decouples via topics; Observer has direct references)
 * - Which is better for large apps (hint: PubSub for decoupling)?
 * - How would you implement async PubSub (await listeners)?
 * - How to persist PubSub events across browser tabs? (localStorage or BroadcastChannel)
 */


// Observer: Subject keeps direct list of observers → notify directly.
// Tight coupling (Subject knows Observers).

// EventEmitter: Similar to Observer, but event names allow multiple independent channels.
// Used in Node.js, React internals.

// PubSub: Publishers don’t know subscribers → only publish to topics.
// Looser coupling, better for large distributed systems.