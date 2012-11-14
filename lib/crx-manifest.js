"use strict";

var path = require('path');

exports.init = function(grunt){
  var exports = {};

  exports.build = function build(ChromeExtension, callback) {
    if (!ChromeExtension.manifest.update_url || !ChromeExtension.codebase){
      return callback();
    }

    ChromeExtension.generateUpdateXML();
    var dest = path.dirname(ChromeExtension.dest);

    grunt.file.write(path.join(dest, path.basename(ChromeExtension.manifest.update_url)), ChromeExtension.updateXML);

    callback();
  };

  return exports;
};