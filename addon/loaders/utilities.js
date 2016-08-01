/**
 * Creates a DOM element with the specified onload and onerror handlers.
 *
 * @method createLoadElement
 * @param {String} tag
 * @param {Function} load
 * @paeam {Function} error
 * @return {HTMLElement} el
 */
export function createLoadElement(tag, load, error) {
  const el = document.createElement(tag);

  el.onload = load;
  el.onerror = error;

  return el;
}
