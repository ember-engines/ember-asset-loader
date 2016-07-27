var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var AssetManifestGenerator = require('./asset-manifest-generator');

module.exports = function generateAssetManifest(tree, supportedTypes, prepend) {
  // Get all the assets for this application
  var assets = new Funnel(tree, {
    srcDir: 'assets',
    annotation: 'Assets Funnel'
  });

  // Generate a manifest from the assets
  var manifest = new AssetManifestGenerator(assets, {
    supportedTypes: supportedTypes,
    prepend: prepend,
    annotation: 'Asset Manifest Generator'
  });

  // Merge the manifest back into the build
  return mergeTrees([ tree, manifest ], {
    annotation: 'Merge Asset Manifest'
  });
};
