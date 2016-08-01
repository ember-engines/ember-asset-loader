import LoadError from './load';
import { RETRY_LOAD_SECRET } from '../services/asset-loader';

/**
 * Represents an error, or errors, that occurred while trying to load a bundle
 * of assets.
 *
 * @class BundleLoadError
 * @extends LoadError
 */
export default class BundleLoadError extends LoadError {
  /**
   * Constructs a new BundleLoadError from the original error, or errors, and
   * the name of the bundle that was attempting to load.
   *
   * @param {AssetLoader} assetLoader
   * @param {Asset} asset
   * @param {Error} error
   */
  constructor(assetLoader, bundleName, errors) {
    super(`The bundle "${bundleName}" failed to load.`, assetLoader);
    this.name = 'BundleLoadError';
    this.bundleName = bundleName;
    this.errors = errors;
  }

  retryLoad() {
    return this._invokeAndCache('loadBundle', this.bundleName, RETRY_LOAD_SECRET);
  }
}