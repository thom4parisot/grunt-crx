"use strict";

var path = require('path');

/**
 * Initializes the crx autoupdate grunt helper
 *
 * @param {grunt} grunt
 * @returns {{buildXML: Function, build: Function}}
 */
exports.init = function(grunt){
  /**
   * Generates an autoupdate XML file
   *
   * @todo relocate that to {@link lib/crx.js} as it's totally irrelevant now
   * @param {crx} ChromeExtension
   * @param {Function} callback
   */
  function buildXML(ChromeExtension, callback) {
    if (!ChromeExtension.manifest.update_url || !ChromeExtension.codebase){
      callback();
      return;
    }

    ChromeExtension.generateUpdateXML();
    var dest = path.dirname(ChromeExtension.dest);
    var filename = path.join(dest, path.basename(ChromeExtension.manifest.update_url));

    grunt.file.write(filename, ChromeExtension.updateXML);

    callback();
  }

  /*
   * Blending
   */
  return {
    "buildXML": buildXML,
    /** @deprecated (will be removed in 0.3) */
    "build": buildXML
  };
};