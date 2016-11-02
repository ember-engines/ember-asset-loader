var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var AssetManifestGenerator = require('./asset-manifest-generator');
var NodeAssetManifestGenerator = require('./node-asset-manifest-generator');

/**
 * Given a tree, this function will generate an asset manifest and merge it back
 * into the tree.
 *
 * The `appName` option specifies the base namespace of the module which is
 * generated for Node environments.
 *
 * The `bundlesLocation` option specifies which directory in the tree contains
 * the bundles to be placed into the asset manifest. It should have a leading and
 * trailing `/`.
 *
 * The `generateURI` option is a function which is invoked with the `filepath` to
 * prepend with CDN information.
 *
 * The `rootURL` option specifies the path at which the application will be served.
 * It should have a leading and trailing `/`.
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

  var appName = options.appName;
  var bundlesLocation = options.bundlesLocation;
  var generateURI = options.generateURI;
  var rootURL = options.rootURL;
  var supportedTypes = options.supportedTypes;

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
    prepend: bundlesLocation,
    rootURL: rootURL,
    supportedTypes: supportedTypes,
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
