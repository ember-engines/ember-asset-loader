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
    if (document.querySelector(`script[src="${uri}"]`)) {
      return resolve();
    }

    const script = createLoadElement('script', resolve, function() {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
      reject(...arguments);
    });

    script.src = uri;
    script.async = false;

    document.head.appendChild(script);
  });
});
