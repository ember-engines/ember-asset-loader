# Ember Asset Loader

[![Build Status](https://travis-ci.org/ember-engines/ember-asset-loader.svg?branch=master)](https://travis-ci.org/ember-engines/ember-asset-loader)
[![Code Climate](https://codeclimate.com/github/trentmwillis/ember-asset-loader/badges/gpa.svg)](https://codeclimate.com/github/trentmwillis/ember-asset-loader)

Provides experimental support for the [Asset Manifest RFC](https://github.com/emberjs/rfcs/pull/153) and [Asset Loader Service RFC](https://github.com/emberjs/rfcs/pull/158).


## Compatibility

* Ember.js v3.24 or above
* Ember CLI v3.24 or above
* Node.js v14 or above

## Usage

Ember Asset Loader does three primary things:

1. Provides a base class to easily generate an Asset Manifest,
2. Provides an Ember service to use the generated manifest at runtime, and
3. Initializes the above service with the above generated manifest.

### Generating an Asset Manifest

You can generate an Asset Manifest by creating either a standalone or in-repo addon which extends from the
`ManifestGenerator` base class:

```js
var ManifestGenerator = require('ember-asset-loader/lib/manifest-generator');
module.exports = ManifestGenerator.extend({
  name: 'asset-generator-addon',
  manifestOptions: {
    bundlesLocation: 'engines-dist',
    supportedTypes: [ 'js', 'css' ]
  }
});
```

The `ManifestGenerator` will generate an asset manifest and merge it into your build tree during post-processing. It
generates the manifest according to the options specified in `manifestOptions`:

* The `bundlesLocation` option is a string that specifies which directory in the build tree contains the bundles to be
placed into the asset manifest. This defaults to `bundles`. Each bundle is a directory containing files that will be downloaded when the bundle is requested. You are responsible for getting the right files into those directories.

* The `supportedTypes` option is an array that specifies which types of files should be included into the bundles for
the asset manifest. This defaults to `[ 'js', 'css' ]`.

_Note: This class provides default `contentFor`, `postprocessTree`, and `postBuild` hooks so be sure that you call
`_super` if you override one of those methods._

### Options

##### noManifest
* Type: `boolean`
* Default: `undefined`
* If `true`, a <meta> tag which would eventually hold the manifest will not be inserted into the DOM.

##### noManifestLookup
* Type: `boolean`
* Default: `undefined`
* If `true`, no error will be thrown in the event that a manifest was not generated for the current environment

### Why isn't a manifest generated by default?

This addon doesn't perform manifest generation just by virtue of being installed because there is no convention for
bundling assets within Ember yet. Thus, to prevent introducing unintuitive or conflicting behavior, we provide no
default generation and you must perform asset generation in your own addon using the base class provided by this addon.

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

### Generating Custom URIs

Custom URIs are often needed due to serving assets from CDNs or another server that does not share the same root
location as your application. Instead of having to write a custom Broccoli plugin or other build-time transform, you can
specify a `generateURI` function as part of your application's options:

```js
var app = new EmberApp(defaults, {
  assetLoader: {
    generateURI: function(filePath) {
      return 'http://cdn.io/' + filePath;
    }
  }
});
```

The function receives the `filePath` for each asset and must return a string.

### Ignore Files

To ignore specific files during the manifest generation, use `filesToIgnore`.
Both string and regex patterns are accepted.


```js
var app = new EmberApp(defaults, {
  assetLoader: {
    filesToIgnore: [/foo-engine/**/engine-vendor.js$/, 'vendor.js']
  }
});
```

### Using With `broccoli-asset-rev`

You need to make sure that `broccoli-asset-rev` runs after your ManifestGenerator addon runs. Here is an example of how to do that:

1. Create an in-repo-addon: `ember generate in-repo-addon asset-generator-addon`

2. Make it generate the manifest by editing `lib/asset-generator-addon/index.js` as described under "Generating an Asset Manifest" above.

3. Edit `lib/asset-generator-addon/package.json` to configure the addon to run after `broccoli-asset-rev`

```json
{
  "name": "asset-generator-addon",
  "keywords": [
    "ember-addon"
  ],
  "ember-addon": {
    "after": "broccoli-asset-rev"
  }
}
```

## Usage with FastBoot / Server-Side Rendering Solutions

Using lazily loaded assets with a server-side rendering solution, such as FastBoot, is often desirable to maximize
performance for your consumers. However, lazy loading assets on your server is not the same as on the client and
can actually have negative performance impact. Due to that, the recommendation is to pre-load all your assets in the
server.

Additionally, at build time we will generate an `assets/node-asset-manifest.js` file that should be included in your SSR
environment to ensure that your application can correctly access asset information.

See the ["How to handle running in Node"](https://github.com/ember-engines/ember-asset-loader/issues/21) issue for more
information.

## Pre-loading Assets During Testing

For test environments it is often useful to load all of the assets in a manifest upfront. You can do this by using the
`preloadAssets` helper, like so:

```js
// tests/test-helper.js
import preloadAssets from 'ember-asset-loader/test-support/preload-assets';
import manifest from 'app/config/asset-manifest';

preloadAssets(manifest);
```

### Resetting Test State

When testing applications with lazy assets, it is important to reset the state of those assets in between tests. To do
this, Ember Asset Loader provides two helpers: `cacheLoadedAssetState()` and `resetLoadedAssetState()`.

```js
// tests/test-helper.js
import preloadAssets from 'ember-asset-loader/test-support/preload-assets';
import { cacheLoadedAssetState, resetLoadedAssetState } from 'ember-asset-loader/test-support/loaded-asset-state';
import manifest from 'app/config/asset-manifest';

cacheLoadedAssetState();
preloadAssets(manifest).then(() => {
  resetLoadedAssetState(); // Undoes the previous load!
});
```

It is important to note that `resetLoadedAssetState` can only remove additional scripts, stylesheets, and modules loaded
since `cacheLoadedAssetState` was called. If any of the loaded assets modified global state, we'll be unable to restore
that state. Therefore, it is important to keep your lazy assets encapsulated and make sure they don't modified any state
already in the browser.

_Note: If you use QUnit, it may be worthwhile to turn on the [`noglobals` config option](https://api.qunitjs.com/QUnit.config/),
to help catch mutated global state._

## Installation

* `git clone https://github.com/ember-engines/ember-asset-loader`
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
