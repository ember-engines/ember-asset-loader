import RSVP from 'rsvp';

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const inFlightPromises = {};

/**
 * Ensures we only have a single pending promise for any given key
 * If called multiple times for a given key, before the promise is resolved,
 * it will return the same promise. Once the promise is resolved
 * all references are removed and the `promiseGenerator` will be called gain
 *
 * @method createLoadElement
 * @param {String} key
 * @param {Function} a funciton that returns a promise
 */
export function singlePendingPromise(key, promiseGenerator) {
  if (inFlightPromises[key]) {
    // We already have a promise for that script, return it.
    return inFlightPromises[key];
  }
  const promise = promiseGenerator();
  inFlightPromises[key] = promise;
  // When the promise is either resolved/rejected, we allow for another request
  // NOTE: we only want to prevent inflight promises, but downloading the same
  // asset more than once may be ok (e.g. retry). js and CSS loaders already check
  // that if the script/link node is present before attempting to add it.
  promise.finally(()=> inFlightPromises[key] = undefined);
  return promise;
}

/**
 * Creates a DOM element with the specified onload and onerror handlers.
 *
 * @method createLoadElement
 * @param {String} tag
 * @param {Function} load
 * @param {Function} error
 * @return {HTMLElement} el
 */
export function createLoadElement(tag, load, error) {
  const el = document.createElement(tag);

  el.onload = load;
  el.onerror = error;

  return el;
}

/**
 * Creates a loader function that is compatible with Node environments (such as
 * FastBoot). If we're in the browser, we'll use the passed in loader function,
 * but when in Node, we'll just return a Promise that resolves (we assume assets
 * will be pre-loaded).
 *
 * @method nodeLoader
 * @param {Function} loader
 * @return {Function}
 */
export function nodeLoader(loader) {
  if (isBrowser) {
    return loader;
  } else {
    return () => RSVP.resolve();
  }
}
