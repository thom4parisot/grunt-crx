"use strict";

var path = require('path');

/**
 * Initializes the crx autoupdate grunt helper
 *
 * @param {grunt} grunt
 * @returns {{buildXML: Function}}
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
        if (ChromeExtension.publicKey){
          done();
          return;
        }

        ChromeExtension.generatePublicKey().then(function(publicKey) {
          ChromeExtension.publicKey = publicKey;
          done();
        });
      },
      //generating file
      function generateXML(done){
        var updateXML = ChromeExtension.generateUpdateXML();
        var dest = path.dirname(ChromeExtension.dest);
        var filename = path.join(dest, path.basename(ChromeExtension.manifest.update_url));

        grunt.file.write(filename, updateXML);
        done();
      }
    ], callback);
  }

  /*
   * Blending
   */
  return {
    "buildXML": buildXML
  };
};
