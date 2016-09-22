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
    var self = this;

    this.requiresConfig('crx');

    this.files.forEach(function(taskConfig) {
      var extension = extensionHelper.createObject(taskConfig, {
	options: self.options()
      });

      // Building
      async.series([
        // Building extension
        function(callback){
	  extensionHelper.build(taskConfig, extension, callback);
        },
	// // Building manifest
        function(callback){
	  autoupdateHelper.buildXML(taskConfig, extension, callback);
        },
        // Clearing stuff
        function(callback){
          callback();
        }
      ], /* Baking done! */ done);
    });

  });
};
