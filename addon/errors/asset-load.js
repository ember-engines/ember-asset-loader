import LoadError from './load';
import { RETRY_LOAD_SECRET } from '../services/asset-loader';

/**
 * Represents an error that occurred while trying to load an asset.
 *
 * @class AssetLoadError
 * @extends LoadError
 */
export default class AssetLoadError extends LoadError {
  /**
   * Constructs a new AssetLoadError from the original error and the info of the
   * asset that was attempting to load.
   *
   * @param {AssetLoader} assetLoader
   * @param {Asset} asset
   * @param {Error} error
   */
  constructor(assetLoader, asset, error) {
    super(`The ${asset.type} asset with uri "${asset.uri}" failed to load with the error: ${error}.`, assetLoader);
    this.name = 'AssetLoadError';
    this.asset = asset;
    this.originalError = error;
  }

  retryLoad() {
    return this._invokeAndCache('loadAsset', this.asset, RETRY_LOAD_SECRET);
  }
}
