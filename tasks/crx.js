/*
 * grunt-crx
 * https://github.com/oncletom/grunt-crx
 *
 * Copyright (c) 2012 oncletom
 * Licensed under the MIT license.
 */

"use strict";

var async = require('async');
var _ = require('lodash');

module.exports = function(grunt) {
  var extensionHelper = require('./../lib/crx').init(grunt);
  var autoupdateHelper = require('./../lib/autoupdate').init();

  grunt.registerMultiTask('crx', 'Package Chrome Extensions, the simple way.', function() {
    var done = this.async();
    var defaults = extensionHelper.getTaskConfiguration();

    this.requiresConfig('crx');

    var options = this.data.options;
    this.files.forEach(function(taskConfig) {
      if (options) {
        taskConfig.options = _.extend(options, taskConfig.options || {});
      }
      var extension = extensionHelper.createObject(taskConfig, defaults);

      // Building
      async.series([
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
          callback();
        }
      ], /* Baking done! */ done);
    });

  });
};
