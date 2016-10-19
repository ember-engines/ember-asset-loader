var Plugin = require('broccoli-caching-writer');
var walk = require('walk-sync');
var path = require('path');
var fs = require('fs-extra');

var DEFAULT_SUPPORTED_TYPES = [ 'js', 'css' ];

/**
 * A Broccoli plugin to generate an asset manifest from a given input tree.
 * You can also provide a second tree that is a tree containing an existing
 * `asset-manifest.json` file to merge with.
 *
 * @class AssetManifestGenerator
 * @extends BroccoliCachingWriter
 */
function AssetManifestGenerator(inputTrees, options) {
  options = options || {};

  this.prepend = options.prepend || '';
  this.supportedTypes = options.supportedTypes || DEFAULT_SUPPORTED_TYPES;
  this.generateURI = options.generateURI || function generateURI(filePath) {
    return filePath;
  };

  Plugin.call(this, inputTrees, {
    annotation: options.annotation
  });
}

AssetManifestGenerator.prototype = Object.create(Plugin.prototype);
AssetManifestGenerator.prototype.constructor = AssetManifestGenerator;

/**
 * Generate an asset manifest from an inputTree assuming it has the following
 * convention for structure:
 *
 *   root/
 *     <bundle-name>/
 *       dependencies.manifest.json
 *       <asset>.<type>
 *       assets/
 *         <asset>.<type>
 *
 * This means that for each entry in the inputTree:
 *
 *   1. If the entry is a root-level directory, create a new bundle
 *   2. If the entry is an asset named "dependencies.manifest.json", add its
 *      contents as the "dependencies" for the bundle
 *   3. If the entry is an asset within a bundle, add it to the bundles "assets"
 *   4. Otherwise, do nothing
 *
 * One important note is that bundles should be flattened in the inputTree. If
 * a directory is found within a bundle, it will not be treated as an additional
 * bundle.
 */
AssetManifestGenerator.prototype.build = function() {
  var supportedTypes = this.supportedTypes;
  var generateURI = this.generateURI;
  var prepend = this.prepend;
  var inputPath = this.inputPaths[0];
  var existingManifestPath = this.inputPaths[1];
  var existingManifest;

  // Check to see if we have an exisiting manifest. If not, than use a new
  // empty manifest.
  try {
    existingManifest = fs.readJsonSync(path.join(existingManifestPath, 'asset-manifest.json'))
  } catch (err) {
    existingManifest = { bundles: {} };
  }

  var manifest = walk(inputPath).reduce(function(manifest, entry) {
    var pathParts = entry.split('/');
    var assetName = pathParts.pop();
    var bundleName = pathParts.shift();

    // If there is no assetName, then we have a directory per the rules of
    // walk-sync. And, if there are no pathParts left we have a root directory.
    // https://github.com/joliss/node-walk-sync/blob/master/README.md#usage
    var isNewBundle = !assetName && pathParts.length === 0;
    if (isNewBundle) {
      if (manifest.bundles[bundleName]) {
        throw new Error('Attempting to add bundle "' + bundleName + '" to manifest but a bundle with that name already exists.');
      }

      manifest.bundles[bundleName] = {
        assets: []
      };
    }

    // If the asset is named "dependencies.manifest.json" then we should read
    // the json in and set it as "dependencies" on the corresponding bundle.
    else if (bundleName && assetName && assetName === 'dependencies.manifest.json') {
      var dependencies = fs.readJsonSync(path.join(inputPath, entry));
      manifest.bundles[bundleName].dependencies = dependencies;
    }

    // If the asset is in a bundle, then attempt to add it to the manifest by
    // checking if it is a supported type.
    else if (assetName && bundleName) {
      var assetType = assetName.split('.').pop();

      if (supportedTypes.indexOf(assetType) !== -1) {
        manifest.bundles[bundleName].assets.push({
          uri: generateURI(path.join(prepend, entry)),
          type: assetType
        });
      }
    }

    return manifest;
  }, existingManifest);

  var manifestFile = path.join(this.outputPath, 'asset-manifest.json');

  fs.writeJsonSync(manifestFile, manifest, { spaces: 2 });
};

module.exports = AssetManifestGenerator;
