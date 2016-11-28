import RSVP from 'rsvp';
import { createLoadElement, nodeLoader, singlePendingPromise } from './utilities';

/**
 * Default loader function for JS assets. Loads them by inserting a script tag
 * with onload/onerror handlers that correspond to the resolve/reject callbacks
 * of the return Promise.
 *
 * @param {String} uri
 * @return {Promise}
 */
export default nodeLoader(function js(uri) {
  return singlePendingPromise(uri, ()=>
    new RSVP.Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${uri}"]`)) {
        return resolve();
      }

      const script = createLoadElement('script', resolve, reject);

      script.src = uri;

      document.head.appendChild(script);
    })
  );
});
