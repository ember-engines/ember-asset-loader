/**
 * A simple Error type to represent an error that occured while loading a
 * resource.
 *
 * The hack to make stack and instanceof Error work is from
 * https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
 *
 * @class LoadError
 * @extends Error
 */

let captureErrorForStack;
if (new Error().stack) {
  captureErrorForStack = () => new Error();
} else {
  captureErrorForStack = () => {
    try { __undef__(); } catch (e) { return e; } // eslint-disable-line
  }
}

/**
 * Constructs a new LoadError with a supplied error message and an instance
 * of the AssetLoader service to use when retrying a load.
 *
 * @param {String} message
 * @param {AssetLoader} assetLoader
 */
export default function LoadError(message, assetLoader) {
  this.name = 'LoadError';
  this.message = message;
  this.loader = assetLoader;
  this.stack = captureErrorForStack().stack;
}
LoadError.prototype = new Error;

/**
 * An abstract hook to define in a sub-class that specifies how to retry
 * loading the errored resource.
 */
LoadError.prototype.retryLoad = function() {
  throw new Error(`You must define a behavior for 'retryLoad' in a subclass.`);
}

/**
 * Invokes a specified method on the AssetLoader service and caches the
 * result. Should be used in implementations of the retryLoad hook.
 *
 * @protected
 */
LoadError.prototype._invokeAndCache = function(method, ...args) {
  return this._retry || (this._retry = this.loader[method](...args));
}
