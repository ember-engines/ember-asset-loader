var BroccoliCachingWriter = require('broccoli-caching-writer');
var path = require('path');
var fs = require('fs-extra');
var existsSync = require('exists-sync');
var meta = require('./meta-handler');

/**
 * A Broccoli Plugin to modify index.html to include the asset manifest.
 *
 * @class AssetManifestInserter
 * @extends BroccoliCachingWriter
 *
 * @private
 * @param {Tree} tree
 * @param {object} options
 */

AssetManifestInserter.prototype = Object.create(BroccoliCachingWriter.prototype);
AssetManifestInserter.prototype.constructor = AssetManifestInserter;
function AssetManifestInserter(inputNodes, options) {
  options = options || {};
  options.indexName = options.indexName || 'index.html';
  options.cacheInclude = [options.indexName, 'tests/index.html', 'asset-manifest.json'];

  // Defines a transform for the contents that will be placed in the meta tag.
  this.transformer = options.transformer || meta.transformer;

  // Defines how to insert the meta information into the files.
  // Currently not customizable.
  this.replacer = meta.replacer;

  BroccoliCachingWriter.call(this, inputNodes, {
    annotation: options.annotation
  });
  this.options = options;
  this.lastIndex = null;
  this.lastTestIndex = null;
}

AssetManifestInserter.prototype.build = function() {
  var sourceDir = this.inputPaths[0];
  var manifestFilePath = path.join(sourceDir, 'asset-manifest.json');
  var indexFilePath = path.join(sourceDir, this.options.indexName);
  var testIndexFilePath = path.join(sourceDir, 'tests', 'index.html');

  var manifest;
  try {
    manifest = fs.readJsonSync(manifestFilePath);
  } catch (error) {
    console.warn('\n\nWarning: Unable to read asset-manifest.json from build with error: ' + error)
    console.warn('Warning: Proceeding without generated manifest; you will need to manually provide a manifest to the Asset Loader Service to load bundles at runtime. If this was intentional you can turn this message off via the `noManifest` flag.\n\n');
    manifest = { bundles: {} };
  }

  var appTransformedManifest = this.transformer(manifest, 'app');

  if (existsSync(indexFilePath)) {
    var indexFile = fs.readFileSync(indexFilePath, { encoding: 'utf8' });
    var index = this.replacer(indexFile, appTransformedManifest);
    if (index !== this.lastIndex) {
      fs.writeFileSync(path.join(this.outputPath, this.options.indexName), index);
      this.lastIndex = index;
    }
  }

  var testsTransformedManifest = this.transformer(manifest, 'test');

  if (existsSync(testIndexFilePath)) {
    var testIndexFile = fs.readFileSync(testIndexFilePath, { encoding: 'utf8' });
    var testIndex = this.replacer(testIndexFile, testsTransformedManifest);
    if (testIndex !== this.lastTestIndex) {
      fs.mkdirSync(path.join(this.outputPath, 'tests'));
      fs.writeFileSync(path.join(this.outputPath, 'tests', 'index.html'), testIndex);
      this.lastTestIndex = testIndex;
    }
  }
};

module.exports = AssetManifestInserter;
