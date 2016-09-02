var path = require('path');
var fs = require('fs-extra');
var Addon = require('ember-cli/lib/models/addon');
var mergeTrees = require('broccoli-merge-trees');
var findHost = require('./utils/find-host');

/**
 * A simple base class for other addons to extend when they want to generate an
 * Asset Manifest.
 *
 * @class ManifestGenerator
 * @extends EmberCliAddon
 */
var ManifestGenerator = Addon.extend({
  /**
   * Insert a meta tag to hold the manifest in the DOM. We won't insert the
   * manifest until after postprocessing so the content is a placeholder value.
   */
  contentFor: function(type, config) {
    var app = findHost(this);
    var options = app && app.options && app.options.assetLoader;
    if (type === 'head-footer' && !(options && options.noManifest)) {
      var metaName = config.modulePrefix + '/asset-manifest';
      return '<meta name="' + metaName + '" content="%GENERATED_ASSET_MANIFEST%" />';
    }
  },

  /**
   * Generate an Asset Manifest from the "all" post-processing tree with any
   * specified manifestOptions.
   */
  postprocessTree: function(type, tree) {
    if (type !== 'all') { return tree; }

    var app = findHost(this);
    var options = app && app.options;
    var assetLoaderOptions = options && options.assetLoader;

    if (assetLoaderOptions && assetLoaderOptions.noManifest) {
      return tree;
    }

    var generateAssetManifest = require('./generate-asset-manifest'); // eslint-disable-line global-require
    var treeWithManifest = generateAssetManifest(tree, this.manifestOptions);

    var indexName = options.outputPaths.app.html;
    var insertAssetManifest = require('./insert-asset-manifest'); // eslint-disable-line global-require
    var treeWithInsertedManifest = insertAssetManifest(treeWithManifest, { indexName: indexName });

    return treeWithInsertedManifest;
  }
});

module.exports = ManifestGenerator;
