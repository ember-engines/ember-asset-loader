var path = require('path');
var fs = require('fs-extra');
var Addon = require('ember-cli/lib/models/addon');
var mergeTrees = require('broccoli-merge-trees');
var objectAssign = require('object-assign');
var findHost = require('./utils/find-host');
var cleanBaseURL = require('clean-base-url');

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
    var assetLoaderOptions = app && app.options && app.options.assetLoader;
    if (type === 'head-footer' && !(assetLoaderOptions && assetLoaderOptions.noManifest)) {
      var metaName = config.modulePrefix + '/config/asset-manifest';
      return '<meta name="' + metaName + '" content="%GENERATED_ASSET_MANIFEST%" />';
    }
  },

  /**
   * Generate an Asset Manifest from the "all" post-processing tree with any
   * specified manifestOptions.
   */
  postprocessTree: function(type, tree) {
    if (type !== 'all') { return tree; }

    /**
     * Options we care about:
     * - `app.env` via Ember CLI
     * - `app.name` via `root-app/ember-cli-build.js`
     * - `app.options.assetLoader.noManifest` via `root-app/ember-cli-build.js`
     * - `app.options.assetLoader.generateURI` via `root-app/ember-cli-build.js`
     * - `app.options.outputPaths.app.html` via `root-app/ember-cli-build.js`
     * - `app.project.config(app.env).rootURL` via `root-app/config/environment.js`
     * - `this.manifestOptions.*` via `var ManifestGenerator = require('manifest-generator');`
     *   - This file is a base addon which can be extended.
     *   - Can overwrite anything.
     *   - Expected to provide:
     *     - `this.manifestOptions.bundlesLocation`
     *     - `this.manifestOptions.supportedTypes`
     *
     * From these we return early if `noManifest` is set.
     *
     * Otherwise we generate:
     * ```
     * var manifestOptions = {
     *   appName,
     *   bundlesLocation,
     *   generateURI,
     *   rootURL,
     *   supportedTypes
     * }
     * ```
     */

    var app = findHost(this);

    // From the root's `ember-cli-build.js`
    var appBuildtimeOptions = app && app.options || {};
    var assetLoaderOptions = (appBuildtimeOptions && appBuildtimeOptions.assetLoader) || {};

    // From the root's `config/environment.js`
    var appRuntimeOptions = app.project.config(app.env) || {};

    // From the customized addon.
    var manifestOptions = this.manifestOptions || {};

    // Normalize the `rootURL` per Ember CLI's pattern.
    // Also checks `baseURL` to support the pre-2.7 `baseURL` setting.
    var defaults = {};
    defaults.appName = app.name;
    defaults.bundlesLocation = 'bundles';
    defaults.generateURI = assetLoaderOptions.generateURI;
    defaults.rootURL = appRuntimeOptions.rootURL === '' ? '/' : cleanBaseURL(appRuntimeOptions.rootURL || appRuntimeOptions.baseURL);

    // Options which we're going to pass into the Broccoli world.
    manifestOptions = objectAssign(defaults, manifestOptions);

    // Postprocess the `bundlesLocation` property to ensure correctness.
    // Must have leading and trailing `/`.
    manifestOptions.bundlesLocation = cleanBaseURL(manifestOptions.bundlesLocation);

    if (assetLoaderOptions.noManifest) {
      return tree;
    } // else:

    var generateAssetManifest = require('./generate-asset-manifest'); // eslint-disable-line global-require
    var treeWithManifest = generateAssetManifest(tree, manifestOptions);

    var indexName = appBuildtimeOptions.outputPaths.app.html;
    var insertAssetManifest = require('./insert-asset-manifest'); // eslint-disable-line global-require
    var treeWithInsertedManifest = insertAssetManifest(treeWithManifest, { indexName: indexName });

    return treeWithInsertedManifest;
  }
});

module.exports = ManifestGenerator;
