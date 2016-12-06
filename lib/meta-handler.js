/**
 * Replace the manifest meta tag with an updated version of the manifest.
 * We do this in both the app's and test's index.html file.
 *
 * @private
 */
var regex = /<meta name="([^"]*\/config\/asset-manifest)" content=[^>]*>/;

function transformer(sourceJSON) {
  return escape(JSON.stringify(sourceJSON));
}

function replacer(fileContents, metaContents) {
  if (!regex.test(fileContents)) {
    return fileContents;
  }

  var metaName = regex.exec(fileContents)[1];
  var metaString = '<meta name="' + metaName + '" content="' + metaContents + '" />';

  return fileContents.replace(regex, metaString);
}

module.exports = { 
  transformer: transformer, 
  replacer: replacer 
};
