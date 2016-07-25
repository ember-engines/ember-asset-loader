var Plugin = require('broccoli-caching-writer');
var walk = require('walk-sync');
var path = require('path');
var fs = require('fs-extra');

var DEFAULT_SUPPORTED_TYPES = [ 'js', 'css' ];

function AssetManifestGenerator(inputTree, options) {
  options = options || {};

  this.supportedTypes = options.supportedTypes || DEFAULT_SUPPORTED_TYPES;

  Plugin.call(this, [inputTree], {
    annotation: options.annotation
  });
}

AssetManifestGenerator.prototype = Object.create(Plugin.prototype);
AssetManifestGenerator.prototype.constructor = AssetManifestGenerator;

/**
 * TODO: Determine nested bundles behavior.
 *
 * Generate an asset manifest from an inputTree by following these rules for
 * each entry:
 *
 *   1. If the entry is a directory, create a new bundle
 *   2. If the entry is an asset not in the root of the tree, add it to a bundle
 *   3. If the entry is an asset in the root of the tree, do nothing
 *
 * The assumption is that root-level assets should be those initially loaded
 * with an application while those in sub-directories are candidates for lazy
 * loading.
 */
AssetManifestGenerator.prototype.build = function() {
  var supportedTypes = this.supportedTypes;
  var manifest = walk(this.inputPaths).reduce(function(manifest, entry) {
    var pathParts = entry.split('/');
    var assetName = pathParts.pop();
    var directoryName = pathParts.pop();

    // If there is no assetName but there is a directoryName, then we have a
    // directory per the rules of walk-sync.
    // https://github.com/joliss/node-walk-sync/blob/master/README.md#usage
    if (!assetName && directoryName) {
      manifest.bundles[directoryName] = {
        assets: []
      };
    } else if (assetName && directoryName) {
      // If there's an assetName and a directoryName then we check that it is a
      // supported type we should generate an entry for.
      var assetType = assetName.split('.').pop();

      if (supportedTypes.indexOf(assetType) !== -1) {
        manifest.bundles[directoryName].assets.push({
          uri: assetName,
          type: assetType
        });
      }
    }

    return manifest;
  }, { bundles: {} });

  var manifestFile = path.join(this.outputPath, 'asset-manifest.json');

  fs.writeJsonSync(manifestFile, manifest, { spaces: 2 });
};

module.exports = AssetManifestGenerator;
