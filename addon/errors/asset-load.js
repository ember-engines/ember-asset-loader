import LoadError from './load';
import { RETRY_LOAD_SECRET } from '../services/asset-loader';

export default class AssetLoadError extends LoadError {
  constructor(assetLoader, asset, error) {
    super(`The ${asset.type} asset with uri "${asset.uri}" failed to load with the error: ${error}.`, assetLoader);
    this.name = 'AssetLoadError';
    this.asset = asset;
    this.originalError = error;
  }

  retryLoad() {
    return this._retry || (this._retry = this.loader.loadAsset(this.asset, RETRY_LOAD_SECRET));
  }
}
