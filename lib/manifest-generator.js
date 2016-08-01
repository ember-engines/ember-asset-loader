var path = require('path');
var fs = require('fs-extra');
var Addon = require('ember-cli/lib/models/addon');

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
    var options = this.app && this.app.options && this.app.options.assetLoader;
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
    if (type === 'all') {
      var generateAssetManifest = require('./generate-asset-manifest'); // eslint-disable-line global-require
      return generateAssetManifest(tree, this.manifestOptions);
    }

    return tree;
  },

  /**
   * Replace the manifest placeholder with an escaped version of the manifest.
   * We do this in both the app's index and test's index.
   */
  postBuild: function(result) {
    var options = this.app && this.app.options && this.app.options.assetLoader;
    if (options && options.noManifest) {
      return;
    }

    var manifestFile = path.join(result.directory, 'asset-manifest.json');
    var manifest;

    try {
      manifest = fs.readJsonSync(manifestFile);
    } catch (error) {
      console.warn('\n\nWarning: Unable to read asset-manifest.json from build with error: ' + error)
      console.warn('Warning: Proceeding without generated manifest; you will need to manually provide a manifest to the Asset Loader Service to load bundles at runtime. If this was intentional you can turn this message off via the `noManifest` flag.\n\n');
      manifest = { bundles: {} };
    }

    var escapedManifest = escape(JSON.stringify(manifest));

    var indexFilePath = path.join(result.directory, 'index.html');
    this.replaceAssetManifestPlaceholder(indexFilePath, escapedManifest);

    var testsIndexFilePath = path.join(result.directory, 'tests/index.html')
    this.replaceAssetManifestPlaceholder(testsIndexFilePath, escapedManifest);
  },

  replaceAssetManifestPlaceholder: function(filePath, manifest) {
    var resolvedFile = fs.readFileSync(filePath, { encoding: 'utf8' });
    fs.outputFileSync(filePath, resolvedFile.replace(/%GENERATED_ASSET_MANIFEST%/, manifest));
  }
});

module.exports = ManifestGenerator;
