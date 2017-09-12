var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var AssetManifestGenerator = require('./asset-manifest-generator');
var NodeAssetManifestGenerator = require('./node-asset-manifest-generator');

/**
 * Given a tree, this function will generate an asset manifest and merge it back
 * into the tree.
 *
 * The `bundlesLocation` option specifies which directory in the tree contains
 * the bundles to be placed into the asset manifest.
 *
 * The `supportedTypes` option specifies which types of files should be included
 * into the bundles for the asset manifest.
 *
 * @public
 * @param {Tree} tree
 * @param {Object} options
 * @return {Tree}
 */
module.exports = function generateAssetManifest(tree, options) {
  options = options || {};

  var bundlesLocation = options.bundlesLocation || 'bundles';
  var filesToIgnore = options.filesToIgnore || [];
  var supportedTypes = options.supportedTypes;
  var generateURI = options.generateURI;
  var appName = options.appName;

  // Get all the bundles for this application
  var bundles = new Funnel(tree, {
    srcDir: bundlesLocation,
    annotation: 'Bundles Location Funnel',
    allowEmpty: true
  });

  // Get an existing asset-manifest if it exists
  var existingManifest = new Funnel(tree, {
    include: [ 'asset-manifest.json' ],
    annotation: 'Existing Manifest Funnel'
  });

  // Generate a manifest from the bundles
  var manifest = new AssetManifestGenerator([ bundles, existingManifest ], {
    generateURI: generateURI,
    supportedTypes: supportedTypes,
    prepend: '/' + bundlesLocation,
    filesToIgnore: filesToIgnore,
    annotation: 'Asset Manifest Generator'
  });

  // Generate a module that can be used in Node environments
  var nodeManifest = new NodeAssetManifestGenerator(manifest, {
    appName: appName,
    annotation: 'Node Asset Manifest Generator'
  });

  // Merge the manifest back into the build
  return mergeTrees([ tree, manifest, nodeManifest ], {
    annotation: 'Merge Asset Manifest',
    overwrite: true
  });
};
