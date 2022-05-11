/* eslint-env node */
var ManifestGenerator = require('../../../../lib/manifest-generator');

module.exports = ManifestGenerator.extend({
  name: 'test-generator-plugin',

  manifestOptions: Object.freeze({
    bundlesLocation: 'test-dist',
    supportedTypes: [ 'js', 'css' ]
  })
});
