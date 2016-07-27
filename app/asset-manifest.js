import environment from './config/environment';

const metaName = environment.modulePrefix + '/asset-manifest';
let config = {};

try {
  const rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  config = JSON.parse(unescape(rawConfig));
} catch(err) {
  throw new Error('Could not read asset manifest from meta tag with name "' + metaName + '".');
}

export default config;
