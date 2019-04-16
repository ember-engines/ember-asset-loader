/**
 * Finds the host given an addon's context by climbing
 * up the parent/app hierarchy.
 *
 * @param {EmberAddon|EmberApp} context
 * @return {EmberApp}
 */
module.exports = function findHost(context) {
  var current = context;
  var app;

  // Keep iterating upward until we don't have a grandparent.
  // Has to do this grandparent check because at some point we hit the project.
  do {
    app = current.app || app;
  } while (current.parent && current.parent.parent && (current = current.parent));

  return app;
};
