/*jshint node:true*/
module.exports = {
  "framework": "qunit",
  "test_page": "tests/index.html?hidepassed",
  "parallel": 2,
  "disable_watching": true,
  "launchers": {
    "SL_CHROME": {
      "exe": "./node_modules/.bin/ember-cli-sauce",
      "args": [
        "-b",
        "chrome",
        "-v",
        "47",
        "--visibility",
        "public",
        "--platform",
        "Windows 10",
        "--attach",
        "--no-connect",
        "--url"
      ],
      "protocol": "browser"
    },
    "SL_EDGE": {
      "exe": "./node_modules/.bin/ember-cli-sauce",
      "args": [
        "-b",
        "microsoftedge",
        "-v",
        "14",
        "--visibility",
        "public",
        "--platform",
        "Windows 10",
        "--attach",
        "--no-connect",
        "--url"
      ],
      "protocol": "browser"
    },
    "SL_IE11": {
      "exe": "./node_modules/.bin/ember-cli-sauce",
      "args": [
        "-b",
        "internet explorer",
        "-v",
        "11",
        "--visibility",
        "public",
        "--platform",
        "Windows 8.1",
        "--attach",
        "--no-connect",
        "--url"
      ],
      "protocol": "browser"
    }
  },
  "launch_in_ci": [
    "SL_CHROME",
    "SL_EDGE",
    "SL_IE11"
  ]
};
