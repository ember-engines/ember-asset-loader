/**
 * Replace the manifest meta tag with an updated version of the manifest.
 * We do this in both the app's and test's index.html file.
 */
var regex = /<meta name="([^"]*\/asset-manifest)" content=[^>]*>/;

function escaper(sourceJSON) {
  return escape(JSON.stringify(sourceJSON));
}

function replacer(fileContents, manifest) {
  if (!regex.test(fileContents)) {
    return fileContents;
  }

  var metaName = regex.exec(fileContents)[1];
  var metaString = '<meta name="' + metaName + '" content="' + escaper(manifest) + '" />';

  return fileContents.replace(regex, metaString);
}

module.exports = { escaper, replacer };
