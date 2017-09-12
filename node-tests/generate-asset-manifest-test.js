'use strict';
var path = require('path');
var assert = require('assert');
var walk = require('walk-sync');
var fs = require('fs-extra');

const co = require('co');
const helpers = require('broccoli-test-helper');
const createBuilder = helpers.createBuilder;
const createTempDir = helpers.createTempDir;

var generateAssetManifest = require('../lib/generate-asset-manifest');

describe('generate-asset-manifest', function() {
  let input;
  let output;

  beforeEach(co.wrap(function* () {
    input = yield createTempDir();
  }));

  afterEach(co.wrap(function* () {
    yield input.dispose();
    yield output.dispose();
  }))

  var fixturePath = path.join(__dirname, 'fixtures');
  var manifestsPath = path.join(fixturePath, 'manifests');

  let verifyAssetManifest = co.wrap(function* verifyAssetManifest(manifestName, options) {
    var inputTree = path.join(fixturePath, 'main-test');
    var assetManifestTree = generateAssetManifest(inputTree, options);

    output = createBuilder(assetManifestTree);

    yield output.build();

    var originalFiles = walk(inputTree);
    var outputFiles = walk(output.path());

    assert.equal(outputFiles.length, originalFiles.length + 2, 'output files has two more files than originally');

    assert.equal(originalFiles.indexOf('asset-manifest.json'), -1, 'original files does not contain an asset manifest');
    assert.notEqual(outputFiles.indexOf('asset-manifest.json'), -1, 'output files does contain an asset manifest');

    assert.equal(originalFiles.indexOf('assets/node-asset-manifest.js'), -1, 'original files does not contain a Node asset manifest module');
    assert.notEqual(outputFiles.indexOf('assets/node-asset-manifest.js'), -1, 'output files does contain a Node asset manifest module');

    var manifestFile = output.path('asset-manifest.json');
    var manifest = fs.readJsonSync(manifestFile);
    var expectedManifest = fs.readJsonSync(path.join(manifestsPath, manifestName + '.json'));
    assert.deepEqual(manifest, expectedManifest);
  });

  it('adds an asset manifest to the supplied tree', function() {
    return verifyAssetManifest('full');
  });

  it('adds an asset manifest with custom supportedTypes', function() {
    return verifyAssetManifest('txt', { supportedTypes: [ 'txt' ] });
  });

  it('uses a custom bundlesLocation and properly prepends it to generated URIs', function() {
    return verifyAssetManifest('engines', { bundlesLocation: 'engines-dist' });
  });

  it('can ignore specific files', function() {
    return verifyAssetManifest('full-minus-ignored-files', { filesToIgnore: [ 'blog/assets/engine.css', 'chat/assets/engine.js' ] });
  });

  it('merges an existing manifest into the new one', co.wrap(function* () {
    var inputTree = path.join(fixturePath, 'existing-test');
    var assetManifestTree = generateAssetManifest(inputTree);

    output = createBuilder(assetManifestTree);

    yield output.build();

    var originalFiles = walk(inputTree);
    var outputFiles = walk(output.path());

    assert.equal(outputFiles.length, originalFiles.length + 1, 'output files has one more file than originally');

    assert.notEqual(originalFiles.indexOf('asset-manifest.json'), -1, 'original files does contain an asset manifest');
    assert.notEqual(outputFiles.indexOf('asset-manifest.json'), -1, 'output files does contain an asset manifest');

    assert.equal(originalFiles.indexOf('assets/node-asset-manifest.js'), -1, 'original files does not contain a Node asset manifest module');
    assert.notEqual(outputFiles.indexOf('assets/node-asset-manifest.js'), -1, 'output files does contain a Node asset manifest module');

    var manifestFile = output.path('asset-manifest.json');
    var manifest = fs.readJsonSync(manifestFile);
    var expectedManifest = fs.readJsonSync(path.join(manifestsPath, 'full-plus-existing.json'));
    assert.deepEqual(manifest, expectedManifest);
  }));
});
