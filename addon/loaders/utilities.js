import RSVP from 'rsvp';

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

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
