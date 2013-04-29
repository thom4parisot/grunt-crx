/*
 * grunt-crx
 * https://github.com/oncletom/grunt-crx
 *
 * Copyright (c) 2012 oncletom
 * Licensed under the MIT license.
 */

"use strict";

var ChromeExtension = require('crx');
var path = require('path');


module.exports = function(grunt) {
  var extensionHelper = require('./../lib/crx').init(grunt);
  var autoupdateHelper = require('./../lib/autoupdate').init(grunt);

  grunt.registerMultiTask('crx', 'Package Chrome Extensions, the simple way.', function() {
    var done = this.async();
    var defaults = extensionHelper.getTaskConfiguration();

    this.files.forEach(function(config) {
      config = extensionHelper.expandConfiguration(config, defaults);

      // Preparing crx
      var extension = new ChromeExtension({
        "codebase": config.baseURL ? config.baseURL + config.filename : '',
        "maxBuffer": config.options.maxBuffer,
        "privateKey": grunt.file.read(config.privateKey),
        "rootDirectory": config.src,
        "dest": config.dest,
        "exclude": config.exclude
      });

      // Building
      grunt.util.async.series([
        // Building extension
        function(callback){
          extensionHelper.build(extension, callback);
        },
        // Building manifest
        function(callback){
          autoupdateHelper.buildXML(extension, callback);
        },
        // Clearing stuff
        function(callback){
          extension.destroy();

          callback();
        }
      ], /* Baking done! */ done);
    });

  });
};