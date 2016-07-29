var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var AssetManifestGenerator = require('./asset-manifest-generator');

/**
 * Given a tree, this function will generate an asset manifest and merge it back
 * into the tree.
 *
 * The `bundlesLocation` option specifies which directory in the tree contains
 * the bundles to be placed into the asset manifest.
 *
 * The `supportedTypes` option specifies which types of files should be included
 * into the bundles for the asset manifest.
 */
module.exports = function generateAssetManifest(tree, options) {
  options = options || {};

  var bundlesLocation = options.bundlesLocation || 'bundles';
  var supportedTypes = options.supportedTypes;

  // Get all the bundles for this application
  var bundles = new Funnel(tree, {
    srcDir: bundlesLocation,
    annotation: 'Bundles Location Funnel'
  });

  // Get an existing asset-manifest if it exists
  var existingManifest = new Funnel(tree, {
    include: [ 'asset-manifest.json' ],
    annotation: 'Existing Manifest Funnel'
  });

  // Generate a manifest from the bundles
  var manifest = new AssetManifestGenerator([ bundles, existingManifest ], {
    supportedTypes: supportedTypes,
    prepend: '/' + bundlesLocation,
    annotation: 'Asset Manifest Generator'
  });

  // Merge the manifest back into the build
  return mergeTrees([ tree, manifest ], {
    annotation: 'Merge Asset Manifest',
    overwrite: true
  });
};
