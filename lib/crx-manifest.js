"use strict";

var path = require('path');

exports.init = function(grunt){
  var exports = {};

  exports.build = function build(ChromeExtension, callback) {
    if (!ChromeExtension.manifest.update_url || !ChromeExtension.codebase){
      callback();
    }

    ChromeExtension.generateUpdateXML();
    var dest = path.dirname(ChromeExtension.dest);
    var filename = path.join(dest, path.basename(ChromeExtension.manifest.update_url));

    grunt.file.write(filename, ChromeExtension.updateXML);

    callback();
  };

  return exports;
};