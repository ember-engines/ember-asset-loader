/*jshint node:true*/
var ManifestGenerator = require('../../../../lib/manifest-generator');

module.exports = ManifestGenerator.extend({
  name: 'test-generator-plugin',

  manifestOptions: {
    bundlesLocation: 'test-dist',
    supportedTypes: [ 'js', 'css' ]
  }
});
