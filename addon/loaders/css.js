import RSVP from 'rsvp';
import { createLoadElement, nodeLoader } from './utilities';
import { scheduleWork } from './scheduler';

/**
 * Default loader function for CSS assets. Loads them by inserting a link tag
 * with onload/onerror handlers that correspond to the resolve/reject callbacks
 * of the return Promise.
 *
 * In the event that a browser does not support onload/onerror handlers for link
 * elements, we fallback to polling the document.styleSheets property. In those
 * cases, the Promise will always resolve successfully.
 *
 * @param {String} uri
 * @return {Promise}
 */
export default nodeLoader(function css(uri) {
  return new RSVP.Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${uri}"]`)) {
      return resolve();
    }

    scheduleWork(() => {
      let link;
      try {
        // Try using the default onload/onerror handlers...
        link = createLoadElement('link', resolve, reject);

        link.rel = 'stylesheet';
        link.href = uri;

        document.head.appendChild(link);

        // In case the browser doesn't fire onload/onerror events, we poll the
        // the list of stylesheets to see when it loads...

        setTimeout(checkSheetLoad);
      } catch(reason) {
        reject(reason);
      }

      function checkSheetLoad() {
        try {
          const resolvedHref = link.href;
          const stylesheets = document.styleSheets;
          let i = stylesheets.length;

          while (i--) {
            const sheet = stylesheets[i];
            if (sheet.href === resolvedHref) {
              // Unfortunately we have no way of knowing if the load was
              // successful or not, so we always resolve.
              setTimeout(resolve);
              return;
            }
          }

          setTimeout(checkSheetLoad);
        } catch(reason) {
          reject(reason);
        }
      }
    });
  });
});
