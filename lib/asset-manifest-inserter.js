/* eslint-env node */
var BroccoliCachingWriter = require('broccoli-caching-writer');

var path = require('path');
var fs = require('fs-extra');
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
    annotation: options.annotation,
    persistentOutput: true
  });
  this.options = options;

  // We will hold a reference to the lastIndex and the lastTestIndex to enable noop when nothing has changed
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

  if (fs.existsSync(indexFilePath)) {
    var indexFile = fs.readFileSync(indexFilePath, { encoding: 'utf8' });
    var index = this.replacer(indexFile, appTransformedManifest);

    // If index and lastIndex match, make this a noop to avoid triggering full page refresh
    if (index !== this.lastIndex) {
      this.lastIndex = index;
      fs.writeFileSync(path.join(this.outputPath, this.options.indexName), index);
    }

  }

  var testsTransformedManifest = this.transformer(manifest, 'test');
  var testDirectory = path.join(this.outputPath, 'tests');


  if (fs.existsSync(testIndexFilePath)) {
    var testIndexFile = fs.readFileSync(testIndexFilePath, { encoding: 'utf8' });
    var testIndex = this.replacer(testIndexFile, testsTransformedManifest);

    // If testIndex and lastTestIndex match, make this a noop to avoid triggering full page refresh
    if (testIndex !== this.lastTestIndex) {

      if (!fs.existsSync(testDirectory)) {
        fs.mkdirSync(path.join(this.outputPath, 'tests'));
      }

      this.lastTestIndex = testIndex;
      fs.writeFileSync(path.join(this.outputPath, 'tests', 'index.html'), testIndex);
    }
  }
};

module.exports = AssetManifestInserter;
