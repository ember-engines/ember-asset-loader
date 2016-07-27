/* jshint node: true */
'use strict';

var path = require('path');
var fs = require('fs-extra');

module.exports = {
  name: 'ember-asset-loader',

  /**
   * Generate an asset manifest from the "all" tree.
   */
  postprocessTree: function(type, tree) {
    if (type === 'all') {
      tree = require('./lib/generate-asset-manifest')(tree); // eslint-disable-line global-require
    }

    return tree;
  },

  /**
   * Insert a meta tag to hold the manifest in the DOM. We won't insert the
   * manifest until after postprocessing so the content is a placeholder value.
   */
  contentFor: function(type, config) {
    if (type === 'head-footer') {
      var metaName = config.modulePrefix + '/asset-manifest';
      return '<meta name="' + metaName + '" content="%GENERATED_ASSET_MANIFEST%" />';
    }
  },

  /**
   * Replace the manifest placeholder with an escaped version of the manifest.
   * We do this in both the app's index and test's index.
   */
  postBuild: function(result) {
    var manifestFile = path.join(result.directory, 'asset-manifest.json');
    var manifest = fs.readJsonSync(manifestFile);

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
};
