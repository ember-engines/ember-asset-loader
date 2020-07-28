import RSVP from 'rsvp';
import { createLoadElement, nodeLoader } from './utilities';
import { scheduleWork } from './scheduler';

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

    // DOM mutation should be batched, this indirection enables this batching.
    // By default, it will schedule work on the next afterRender queue. But can
    // be configured for further control via.
    //
    // ```js
    //  import { setScheduler } from 'ember-asset-loader/scheduler';
    //
    //  setScheduler(function(work /* work is a callback */) {
    //    someScheduler.scheduleWork(work);
    //  });
    // ```
    //
    scheduleWork(() => {
      try {
        const script = createLoadElement('script', resolve, function(error) {
          if (this.parentNode) {
            this.parentNode.removeChild(this);
          }
          reject(error);
        });

        script.src = uri;
        script.async = false;

        document.head.appendChild(script);
      } catch(e) {
        reject(e);
      }
    });
  });
});
