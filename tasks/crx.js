/*
 * grunt-crx
 * https://github.com/oncletom/grunt-crx
 *
 * Copyright (c) 2012 oncletom
 * Licensed under the MIT license.
 */

"use strict";

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
      extensionHelper.build(taskConfig, extension)
	.then(function(){
	  return autoupdateHelper.buildXML(taskConfig, extension);
	})
	.then(function(){ done(); })
	.catch(done);
    });

  });
};
