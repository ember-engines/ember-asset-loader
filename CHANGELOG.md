## v0.6.1 (2019-06-21)

#### :bug: Bug Fix
* [#84](https://github.com/ember-engines/ember-asset-loader/pull/84) add .git to npmignore ([@ecoutlee-hortau](https://github.com/ecoutlee-hortau))

#### Committers: 1
- [@ecoutlee-hortau](https://github.com/ecoutlee-hortau)


## v0.6.0 (2019-06-10)

#### :memo: Documentation
* [#75](https://github.com/ember-engines/ember-asset-loader/pull/75) Removes needless Warning on resetLoadedAssetState   ([@villander](https://github.com/villander))

#### Committers: 1
- Michael Villander ([@villander](https://github.com/villander))


## v0.5.1 (2019-03-11)

#### :bug: Bug Fix
* [#78](https://github.com/ember-engines/ember-asset-loader/pull/78) Properly extend from Error base class ([@xg-wang](https://github.com/xg-wang))

#### Committers: 1
- Thomas Wang ([@xg-wang](https://github.com/xg-wang))


## v0.5.0 (2019-03-11)

#### :boom: Breaking Change
* [#80](https://github.com/ember-engines/ember-asset-loader/pull/80) Drop Node 4 support. ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 1
- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))


## v0.4.4 (2019-03-11)

#### :rocket: Enhancement
* [#79](https://github.com/ember-engines/ember-asset-loader/pull/79) Add optional to configure additional files to ignore ([@sangm](https://github.com/sangm))

#### :bug: Bug Fix
* [#72](https://github.com/ember-engines/ember-asset-loader/pull/72) Use fx.existsSync and drop exists-sync dependency ([@scottkidder](https://github.com/scottkidder))

#### :house: Internal
* [#64](https://github.com/ember-engines/ember-asset-loader/pull/64) Minor fixes ([@eventualbuddha](https://github.com/eventualbuddha))

#### Committers: 4
- Brian Donovan ([@eventualbuddha](https://github.com/eventualbuddha))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Sang Mercado ([@sangm](https://github.com/sangm))
- Scott Kidder ([@scottkidder](https://github.com/scottkidder))

v0.4.2 / 2018-03-23
===================

  * Fix issues with scoped bundles (e.g. engines within a scope).

v0.4.1 / 2017-10-06
===================

  * Fix issue causing every rebuild to force a full live reload (even if only CSS has changed).

v0.4.0 / 2017-09-17
===================

  * Support ignoring files by regex
  * Add option to ignore specific files from being added to the manifest

v0.3.1 / 2017-09-07
===================

  * Prevent caching failed assets (#57)
  * Add basic polling (1000ms timeout) to absorb raciness.

v0.3.0 / 2017-08-09
===================

  * Exclude empty files from generated asset-manifest.json.
  * Refactor tests to use broccoli-test-helper API.
  * Add node-test/.eslintrc.js to reduce linting warnings in node-tests/.
  * Avoid issues when the consuming app is using babel 6.
  * Roll ember-cli-sauce back to 1.6.0.
  * Make it possible to extend from `Error` in Babel 6.
  * Refactor from `require` to `requirejs` usage.
  * Update dependency versions to latest.
  * fixup! Update addon blueprint to ember-cli@2.14.
  * Update repository to point to ember-engines/ember-asset-loader.
  * Update addon blueprint to ember-cli@2.14.
  * Post-review README tweaks
  * Add README details about re: broccoli-asset-rev

v0.2.7 / 2017-03-20
===================

  * Call _super before touching `this`.
  * [docs] Tweak retryLoad description
  * [docs] Add missing param to `loadBundle`
  * Update links in README
  * Update Travis CI Badge
  * Node 0.12 compat fixes for lib/meta-handler.js.

v0.2.6 / 2016-11-30
===================

  * Sets async to false when loading scripts.
  * Add test helpers to cache and restore browser state

v0.2.5 / 2016-11-11
===================

  * Allow manifest to be transformed based on app or test index

v0.2.4 / 2016-10-30
===================

  * Bump broccoli-funnel to fix rebuild issues.
  * Allow empty bundle directories to avoid issues on rebuild

v0.2.3 / 2016-10-25
===================

  * Refactor meta replacement to allow for customizability

v0.2.2 / 2016-10-20
===================

  * Add generateURI option for customizing URIs

v0.2.1 / 2016-10-19
===================

  * Fix SauceLabs configuration
  * Check DOM for pre-loaded assets

v0.2.0 / 2016-09-21
===================

  * Move asset-manifest modules into config namespace
  * Enable the asset-manifest to be present in SSR environments
  * Have loaders return resolved Promises in non-browser environments

v0.1.5 / 2016-09-13
===================

  * Update ember-cli-qunit to avoid issue with jQuery 3.x.
  * Avoid using Ember's internal symbol utility.

v0.1.4 / 2016-09-02
===================

  * Change Ember to Beta instead of Canary
  * Use findHost to find app

v0.1.3 / 2016-08-30
===================

  * Add tests for manifest-generator
  * Don't break at runtime when not generating a manifest
  * Don't generate asset-manifest.json when using noManifest option
  * Fix potential error in postprocessTree

v0.1.2 / 2016-08-29
===================

  * Make insertion happen as a broccoli plugin.
  * Rework environment variables

v0.1.1 / 2016-08-25
===================

  * Introduce preload-assets helper for testing

v0.1.0 / 2016-08-01
===================

  * Prepare initial release (v0.1.0)
  * Improve documentation and break out default loaders
  * Improve SauceLabs behavior
  * Setup SauceLabs to test against IE
  * Test in Phantom 1.9 and 2.1
  * Improve cross-browser support for default loaders
  * Test against Canary only
  * Create ManifestGenerator base class
  * fixup! Revamp asset manifest generation
  * Add test addon to fix failing test after revamp
  * Revamp asset manifest generation
  * Update tests to verify initialization of asset manifest
  * Insert manifest into index.html for runtime access
  * Run Node tests in Travis
  * Stop building pushes to non-master branches
  * Add tests for asset manifest generation
  * Generate asset manifest during postprocessTree
  * Add basic Acceptance test for loading assets during getHandler
  * Fix CodeClimate linting issues
  * Improve README
  * Initial implementation
  * Finish initial configuration
  * Initial Commit from Ember CLI v2.7.0-beta.6
