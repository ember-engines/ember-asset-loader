let cachedRequireEntries;
let cachedScriptTags;
let cachedLinkTags;

/**
 * Determines whether an array contains the provided item.
 *
 * @param {Array} array
 * @param {Any} item
 * @return {Boolean}
 */
function has(array, item) {
  return array.indexOf(item) !== -1;
}

/**
 * Removes a DOM Node from the document.
 *
 * @param {Node} node
 * @return {Void}
 */
function removeNode(node) {
  node.parentNode.removeChild(node);
}

/**
 * Converts an iterable object into an actual Array.
 *
 * @param {Iterable} iterable
 * @return {Array}
 */
function toArray(iterable) {
  return Array.prototype.slice.call(iterable);
}

/**
 * Returns all of the HTML Elements matching a given selector as an array.
 *
 * @param {String} selector
 * @return {Array<HTMLElement>}
 */
function getAll(selector) {
  const htmlCollection = document.querySelectorAll(selector);
  return toArray(htmlCollection);
}

/**
 * Deletes an entry from require's list of modules.
 *
 * @param {String} entry
 * @return {Void}
 */
function resetRequireEntry(entry) {
  delete self.requirejs.entries[entry];
}

/**
 * Compares two arrays, if they're different, invokes a callback for each
 * entry that does not appear in the initial array.
 *
 * @param {Array} initial
 * @param {Array} current
 * @param {Function} diffHandler
 * @return {Void}
 */
function compareAndIterate(initial, current, diffHandler) {
  if (initial.length < current.length) {
    for (let i = 0; i < current.length; i++) {
      let entry = current[i];
      if (!has(initial, entry)) {
        diffHandler(entry);
      }
    }
  }
}

/**
 * Gets the current loaded asset state including scripts, links, and require
 * modules.
 *
 * @return {Object}
 */
export function getLoadedAssetState() {
  return {
    requireEntries: Object.keys(self.requirejs.entries),
    scripts: getAll('script'),
    links: getAll('link')
  };
}

/**
 * Caches the current loaded asset state with regards to links, scripts, and JS
 * modules currently present.
 *
 * @return {Void}
 */
export function cacheLoadedAssetState() {
  ({
    requireEntries: cachedRequireEntries,
    scripts: cachedScriptTags,
    links: cachedLinkTags
  } = getLoadedAssetState());
}

/**
 * Restores the loaded asset state to the previous cached value with regards to
 * links, scripts, and JS modules.
 *
 * @return {Void}
 */
export function resetLoadedAssetState() {
  const {
    requireEntries: currentRequireEntries,
    scripts: currentScriptTags,
    links: currentLinkTags
  } = getLoadedAssetState();

  compareAndIterate(cachedRequireEntries, currentRequireEntries, resetRequireEntry);
  compareAndIterate(cachedScriptTags, currentScriptTags, removeNode);
  compareAndIterate(cachedLinkTags, currentLinkTags, removeNode);
}
