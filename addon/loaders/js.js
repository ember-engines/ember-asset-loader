import RSVP from 'rsvp';
import { createLoadElement, nodeLoader, uriIncluded } from './utilities';

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
    if (uriIncluded(uri, document)) {
      return resolve();
    }

    const script = createLoadElement('script', resolve, function(error) {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
      reject(error);
    });

    script.src = uri;
    script.async = false;

    document.head.appendChild(script);
  });
});
