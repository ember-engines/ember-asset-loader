import RSVP from 'rsvp';
import { createLoadElement, nodeLoader } from './utilities';

/**
 * Default loader function for JS assets. Loads them by inserting a script tag
 * with onload/onerror handlers that correspond to the resolve/reject callbacks
 * of the return Promise.
 *
 * @param {String} uri
 * @return {Promise}
 */
export default nodeLoader(function js(uri) {
  return new RSVP.Promise((resolve, reject) => {
    const script = createLoadElement('script', resolve, reject);

    script.src = uri;

    document.head.appendChild(script);
  });
});
