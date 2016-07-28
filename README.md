# Ember Asset Loader

[![Build Status](https://travis-ci.org/trentmwillis/ember-asset-loader.svg?branch=master)](https://travis-ci.org/trentmwillis/ember-asset-loader)
[![Code Climate](https://codeclimate.com/github/trentmwillis/ember-asset-loader/badges/gpa.svg)](https://codeclimate.com/github/trentmwillis/ember-asset-loader)

Provides experimental support for the [Asset Manifest RFC](https://github.com/emberjs/rfcs/pull/153) and [Asset Loader Service RFC](https://github.com/emberjs/rfcs/pull/158).

## Usage

Ember Asset Loader does three primary things:

1. Allows you to generate an Asset Manifest,
2. Provides an Ember service to use the generated manifest at runtime, and
3. Initializes the above service with the above generated manifest.

### Generating an Asset Manifest

Generating a manifest is straightforward. Simply import the `generateAssetManifest` from `ember-asset-loader/lib/generate-asset-manifest` during `postprocessTree`:

```js
postprocessTree: function(type, tree) {
  if (type === 'all') {
    var generateAssetManifest = require('ember-asset-loader/lib/generate-asset-manifest');
    return generateAssetManifest(tree, {
      supportedTypes: [ 'js', 'css' ],
      bundlesLocation: 'engine-dist'
    });
  }

  return tree;
}
```

The `generateAssetManifest` function will generate an asset manifest and merge it back into the provided tree. It can
also take in an option hash with the following supported fields:

The `bundlesLocation` option is a string that specifies which directory in the tree contains the bundles to be placed
into the asset manifest. This defaults `bundles`.

The `supportedTypes` option is an array that specifies which types of files should be included into the bundles for the
asset manifest. This defaults to `[ 'js', 'css' ]`.

If no manifest is generated, you'll get a warning at build time to ensure that you understand no manifest has been
generated and thus you'll have to provide a manifest manually in order to use the Asset Loader Service. This warning can
be disabled via the `noManifest` option from the consuming application:

```js
var app = new EmberApp(defaults, {
  assetLoader: {
    noManifest: true
  }
});
```

## Installation

* `git clone https://github.com/trentmwillis/ember-asset-loader`
* `cd ember-asset-loader`
* `npm install`
* `bower install`

## Running

* `ember serve`
* Visit the tests at [http://localhost:4200/tests](http://localhost:4200/tests).

## Running Tests

One of three options:

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
