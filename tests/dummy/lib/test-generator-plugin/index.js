/*jshint node:true*/
module.exports = {
  name: 'test-generator-plugin',

  postprocessTree: function(type, tree) {
    if (type === 'all') {
      var generateAssetManifest = require('../../../../lib/generate-asset-manifest');
      return generateAssetManifest(tree, {
        bundlesLocation: 'test-dist',
        supportedTypes: [ 'js', 'css' ]
      });
    }

    return tree;
  }
};
