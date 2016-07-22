import LoadError from './load';
import { RETRY_LOAD_SECRET } from '../services/asset-loader';

export default class BundleLoadError extends LoadError {
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