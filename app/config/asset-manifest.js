import require from 'require';
import environment from './environment';

const modulePrefix = environment.modulePrefix;
const metaName = `${modulePrefix}/config/asset-manifest`;
const nodeName = `${modulePrefix}/config/node-asset-manifest`;

let config = {};
const lookupManifest = !environment.noManifestLookup;

if (lookupManifest) {
  try {
    // If we have a Node version of the asset manifest, use that for FastBoot and
    // similar environments.
    if (require.has(nodeName)) {
      config = require(nodeName).default; // eslint-disable-line
    } else {
      const rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
      config = JSON.parse(unescape(rawConfig));
    }
  } catch(err) {
    throw new Error('No manifest was found with the name "' + metaName +
      '". To hide this message you can set the config option `noManifestLookup` to `true`. For non-browser environments, verify that you included the node-asset-manifest module.', {
        id: 'no-manifest-found'
      });
  }
}

export default config;
