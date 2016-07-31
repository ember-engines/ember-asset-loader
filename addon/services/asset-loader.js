import RSVP from 'rsvp';
import Ember from 'ember';
import AssetLoadError from '../errors/asset-load';
import BundleLoadError from '../errors/bundle-load';

// PRIVATE STUFF, YOU SHOULD NOT NORMALLY DO THIS
const symbol = Ember.__loader.require('ember-metal/symbol').default;

export const RETRY_LOAD_SECRET = symbol('RETRY_LOAD_SECRET');

/**
 * Creates a DOM element with the specified onload and onerror handlers.
 *
 * @method createLoadElement
 * @param {String} tag
 * @param {Function} load
 * @paeam {Function} error
 * @return {HTMLElement} el
 */
function createLoadElement(tag, load, error) {
  const el = document.createElement(tag);

  el.onload = load;
  el.onerror = error;

  return el;
}

/**
 * Merges two manifests' bundles together and returns new manifest.
 *
 * @param {AssetManifest} input
 * @param {AssetManifest} manifest
 * @return {AssetManifest} output
 */
function reduceManifestBundles(input, manifest) {
  // If manifest doesn't have any bundles, then no reducing to do
  if (!manifest.bundles) {
    return input;
  }

  // Merge the bundles together, checking for collisions
  return Object.keys(manifest.bundles).reduce((output, bundle) => {
    Ember.assert(`The bundle "${bundle}" already exists.`, !output.bundles[bundle]);
    output.bundles[bundle] = manifest.bundles[bundle];
    return output;
  }, input);
}

/**
 * A Service class to load additional assets into the Ember application.
 *
 * @class AssetLoader
 */
export default Ember.Service.extend({
  /**
   * Setup the caches for the service to use when loading assets.
   *
   * @override
   */
  init() {
    this.__manifests = [];
    this._setupCache();
  },

  /**
   * @public
   * @method pushManifest
   * @param {AssetManifest} manifest
   * @return {AssetManifest} manifest
   */
  pushManifest(manifest) {
    this.__manifests.push(manifest);
    this.__manifest = this.__manifests.reduce(reduceManifestBundles, { bundles: {} });
  },

  /**
   * Loads a bundle by fetching all of its assets and its dependencies.
   *
   * Returns a Promise that resolve when all assets have been loaded or rejects
   * when one of the assets fails to load. Subsequent calls will return the same
   * Promise.
   *
   * @public
   * @method loadBundle
   * @param {String} name
   * @return {Promise} bundlePromise
   */
  loadBundle(name, retryLoad) {
    const cachedPromise = this._getFromCache('bundle', name, retryLoad === RETRY_LOAD_SECRET);

    if (cachedPromise) {
      return cachedPromise;
    }

    const bundle = this._getBundle(name);

    const dependencies = bundle.dependencies || [];
    const dependencyPromises = dependencies.map((dependency) => this.loadBundle(dependency, retryLoad));

    const assets = bundle.assets || [];
    const assetPromises = assets.map((asset) => this.loadAsset(asset, retryLoad));

    const bundlePromise = RSVP.allSettled([ ...dependencyPromises, ...assetPromises ]);

    const bundleWithFail = bundlePromise.then((promises) => {
      const rejects = promises.filter((promise) => promise.state === 'rejected');
      const errors = rejects.map((reject) => reject.reason);

      if (errors.length) {
        throw new BundleLoadError(this, name, errors);
      }

      return name;
    });

    return this._setInCache('bundle', name, bundleWithFail);
  },

  /**
   * @public
   * @method loadAsset
   * @param {Object} asset
   * @param {String} asset.uri
   * @param {String} asset.type
   * @return {Promise} assetPromise
   */
  loadAsset({ uri, type }, retryLoad) {
    const cacheKey = `${type}:${uri}`;

    const cachedPromise = this._getFromCache('asset', cacheKey, retryLoad === RETRY_LOAD_SECRET);

    if (cachedPromise) {
      return cachedPromise;
    }

    const loader = this._getAssetLoader(type);
    const assetPromise = loader(uri);

    const assetWithFail = assetPromise.then(
      () => ({ uri, type }),
      (error) => {
        throw new AssetLoadError(this, { uri, type }, error);
      }
    );

    return this._setInCache('asset', cacheKey, assetWithFail);
  },

  defineLoader(type, loader) {
    this.__assetLoaders[type] = loader;
  },

  /**
   * @private
   * @method getManifest
   * @return {AssetManifest} manifest
   */
  getManifest() {
    const manifest = this.__manifest;

    Ember.assert('No asset manifest found. Ensure you call pushManifest before attempting to use the AssetLoader.', manifest);

    return manifest;
  },

  _setupCache() {
    this.__cache = {};
    this.__cache.asset = {};
    this.__cache.bundle = {};
  },

  _getFromCache(type, key, evict) {
    if (evict) {
      this.__cache[type][key] = undefined;
      return;
    }

    return this.__cache[type][key];
  },

  _setInCache(type, key, value) {
    return (this.__cache[type][key] = value);
  },

  /**
   * @private
   * @method _getBundle
   * @param {String} name
   * @return {Bundle} bundle
   */
  _getBundle(name) {
    const manifest = this.getManifest();

    const bundles = manifest.bundles;

    Ember.assert('Asset manifest does not list any available bundles.', Object.keys(bundles).length);

    const bundle = bundles[name];

    Ember.assert(`No bundle with name "${name}" exists in the asset manifest.`, bundle);

    return bundle;
  },

  /**
   * @private
   * @method _getAssetLoader
   * @param {String} type
   * @return {Function} loader
   */
  _getAssetLoader(type) {
    const loader = this.__assetLoaders[type];

    Ember.assert(`No loader for assets of type "${type}" defined.`, loader);

    return loader;
  },

  /**
   * Defines loader methods for various types of assets. Each loader is stored
   * under a key corresponding to the type of asset it loads.
   *
   * @private
   * @property __assetLoaders
   * @type {Object}
   */
  __assetLoaders: {
    js(uri) {
      return new RSVP.Promise((resolve, reject) => {
        const script = createLoadElement('script', resolve, reject);

        script.src = uri;

        document.head.appendChild(script);
      });
    },

    css(uri) {
      return new RSVP.Promise((resolve, reject) => {
        // Try using the default onload/onerror handlers...
        const link = createLoadElement('link', resolve, reject);

        link.rel = 'stylesheet';
        link.href = uri;

        document.head.appendChild(link);

        // In case the browser doesn't fire onload/onerror events, we poll the
        // the list of stylesheets to see when it loads...
        function checkSheetLoad() {
          const resolvedHref = link.href;
          const stylesheets = document.styleSheets;
          let i = stylesheets.length;

          while (i--) {
            const sheet = stylesheets[i];
            if (sheet.href === resolvedHref) {
              // Unfortunately we have no way of knowing if the load was
              // successful or not, so we always resolve.
              return resolve();
            }
          }

          setTimeout(checkSheetLoad);
        }

        setTimeout(checkSheetLoad);
      });
    }
  }
});
