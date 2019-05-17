"use strict";

var path = require("path");
var fs = require("fs").promises;

/**
 * Initializes the crx autoupdate grunt helper
 *
 * @returns {{buildXML: Function, build: Function}}
 */
exports.init = function() {
  /**
   * Generates an autoupdate XML file
   *
   * @param {crx} ChromeExtension
   */
  function buildXML(taskConfig, ChromeExtension) {
    if (!ChromeExtension.manifest.update_url || !ChromeExtension.codebase) {
      return Promise.resolve();
    }

    return Promise.resolve(ChromeExtension.publicKey)
      .then(function(publicKey) {
        if (publicKey) {
          return publicKey;
        }

        return ChromeExtension.generatePublicKey();
      })
      .then(function(publicKey) {
        ChromeExtension.publicKey = publicKey;

        return ChromeExtension.generateUpdateXML(publicKey);
      })
      .then(function(updateXML) {
        var dest = path.dirname(taskConfig.dest);
        var filename = path.join(
          dest,
          path.basename(ChromeExtension.manifest.update_url)
        );

        return fs.writeFile(filename, updateXML);
      });
  }

  /*
   * Blending
   */
  return {
    buildXML,
  };
};
