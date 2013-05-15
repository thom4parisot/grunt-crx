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
   * @param {crx} ChromeExtension
   * @param {Function} callback
   */
  function buildXML(ChromeExtension, callback) {
    if (!ChromeExtension.manifest.update_url || !ChromeExtension.codebase){
      callback();
      return;
    }

    grunt.util.async.series([
      //ensuring publicKey
      function generatePublicKey(done){
        if (ChromeExtension.publicKey !== undefined){
          return done();
        }

        ChromeExtension.generatePublicKey(done);
      },
      //generating file
      function generateXML(done){
        ChromeExtension.generateUpdateXML();
        var dest = path.dirname(ChromeExtension.dest);
        var filename = path.join(dest, path.basename(ChromeExtension.manifest.update_url));

        grunt.file.write(filename, ChromeExtension.updateXML);
        done();
      }
    ], callback);
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