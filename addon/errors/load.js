function ExtendBuiltin(klass) {
  function ExtendableBuiltin() {
    klass.apply(this, arguments);
  }

  ExtendableBuiltin.prototype = Object.create(klass.prototype);
  ExtendableBuiltin.prototype.constructor = ExtendableBuiltin;
  return ExtendableBuiltin;
}

/**
 * A simple Error type to represent an error that occured while loading a
 * resource.
 *
 * @class LoadError
 * @extends Error
 */
export default class LoadError extends ExtendBuiltin(Error) {
  /**
   * Constructs a new LoadError with a supplied error message and an instance
   * of the AssetLoader service to use when retrying a load.
   *
   * @param {String} message
   * @param {AssetLoader} assetLoader
   */
  constructor(message, assetLoader) {
    super(...arguments);
    this.name = 'LoadError';
    this.message = message;
    this.loader = assetLoader;
  }

  /**
   * An abstract hook to define in a sub-class that specifies how to retry
   * loading the errored resource.
   */
  retryLoad() {
    throw new Error(`You must define a behavior for 'retryLoad' in a subclass.`);
  }

  /**
   * Invokes a specified method on the AssetLoader service and caches the
   * result. Should be used in implementations of the retryLoad hook.
   *
   * @protected
   */
  _invokeAndCache(method, ...args) {
    return this._retry || (this._retry = this.loader[method](...args));
  }
}
