/*jshint node:true*/
module.exports = {
  "framework": "qunit",
  "test_page": "tests/index.html?hidepassed",
  "parallel": 4,
  "disable_watching": true,
  "launchers": {
    "SL_CHROME": {
      "exe": "ember",
      "args": [
        "sauce:launch",
        "-b",
        "chrome",
        "-v",
        "47",
        "--vi",
        "public",
        "-p",
        "Windows 10",
        "--at",
        "--no-ct",
        "--u"
      ],
      "protocol": "browser"
    },
    "SL_EDGE": {
      "exe": "ember",
      "args": [
        "sauce:launch",
        "-b",
        "microsoftedge",
        "-v",
        "14",
        "--vi",
        "public",
        "-p",
        "Windows 10",
        "--at",
        "--no-ct",
        "--u"
      ],
      "protocol": "browser"
    },
    "SL_IE11": {
      "exe": "ember",
      "args": [
        "sauce:launch",
        "-b",
        "internet explorer",
        "-v",
        "11",
        "--vi",
        "public",
        "-p",
        "Windows 8.1",
        "--at",
        "--no-ct",
        "--u"
      ],
      "protocol": "browser"
    },
    "SL_IE10": {
      "exe": "ember",
      "args": [
        "sauce:launch",
        "-b",
        "internet explorer",
        "-v",
        "10",
        "--vi",
        "public",
        "-p",
        "Windows 8",
        "--at",
        "--no-ct",
        "--u"
      ],
      "protocol": "browser"
    }
  },
  "launch_in_ci": [
    "SL_CHROME",
    "SL_EDGE",
    "SL_IE11",
    "SL_IE10",
  ]
};
