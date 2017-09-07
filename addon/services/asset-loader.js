import RSVP from 'rsvp';
import Ember from 'ember';
import AssetLoadError from '../errors/asset-load';
import BundleLoadError from '../errors/bundle-load';
import JsLoader from '../loaders/js';
import CssLoader from '../loaders/css';

export function RETRY_LOAD_SECRET() { }

/**
 * Merges two manifests' bundles together and returns a new manifest.
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
    this._super(...arguments);

    this.__manifests = [];
    this._setupCache();
    this._initAssetLoaders();
  },

  /**
   * Adds a manifest to the service by merging its bundles with any previously
   * added manifests. Bundle collisions result in an error being thrown.
   *
   * @public
   * @method pushManifest
   * @param {AssetManifest} manifest
   * @return {Void}
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
   * @param {Boolean} retryLoad Warning: only used internally to re-initiate loads, NOT public API
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
        // Evict rejected promise.
        this._getFromCache('bundle', name, true);
        throw new BundleLoadError(this, name, errors);
      }

      return name;
    });

    return this._setInCache('bundle', name, bundleWithFail);
  },

  /**
   * Loads a single asset into the application. Expects a given asset to specify
   * a URI and type.
   *
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
        // Evict rejected promise.
        this._getFromCache('asset', cacheKey, true);
        throw new AssetLoadError(this, { uri, type }, error);
      }
    );

    return this._setInCache('asset', cacheKey, assetWithFail);
  },

  /**
   * Define a loader function for assets of a specified type. Any previously
   * defined loaders for that type will be overriden.
   *
   * @public
   * @param {String} type
   * @param {Funciton} loader
   * @return {Void}
   */
  defineLoader(type, loader) {
    this.__assetLoaders[type] = loader;
  },

  /**
   * Gets the current, reduced manifest.
   *
   * @private
   * @method getManifest
   * @return {AssetManifest} manifest
   */
  getManifest() {
    const manifest = this.__manifest;

    Ember.assert('No asset manifest found. Ensure you call pushManifest before attempting to use the AssetLoader.', manifest);

    return manifest;
  },

  /**
   * Sets up the cache used to store Promise values for asset/bundle requests.
   *
   * @private
   * @return {Void}
   */
  _setupCache() {
    this.__cache = {};
    this.__cache.asset = {};
    this.__cache.bundle = {};
  },

  /**
   * Gets a value from the cache according to the type and key it was stored
   * under. Optionally, evicts the cached value and returns undefined.
   *
   * @private
   * @param {String} type
   * @param {String} key
   * @param {Boolean} evict
   * @return {Any}
   */
  _getFromCache(type, key, evict) {
    if (evict) {
      this.__cache[type][key] = undefined;
      return;
    }

    return this.__cache[type][key];
  },

  /**
   * Sets a value in the cache under a type and key.
   *
   * @private
   * @param {String} type
   * @param {String} key
   * @param {Any} value
   * @return {Any}
   */
  _setInCache(type, key, value) {
    return (this.__cache[type][key] = value);
  },

  /**
   * Gets the info for a bundle from the reduced manifest.
   *
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
   * Gets the asset loader method for a specified type.
   *
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
   * Initializes the __assetLoaders object and defines our default loaders.
   */
  _initAssetLoaders() {
    this.__assetLoaders = {};
    this.defineLoader('js', JsLoader);
    this.defineLoader('css', CssLoader);
  },

  /**
   * Defines loader methods for various types of assets. Each loader is stored
   * under a key corresponding to the type of asset it loads.
   *
   * @private
   * @property __assetLoaders
   * @type {Object}
   */
  __assetLoaders: undefined
});
