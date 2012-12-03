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
var fs = require('fs');

/**
 * Expand the current multitask config key name
 *
 * @param key
 * @return {String}
 */
function buildConfigProperty(key){
  /*jshint validthis:true */
  return [ this.name, this.target, key ].join('.');
}

/**
 * Configures the task
 *
 * @this {Grunt}
 * @param defaults
 */
function configure(defaults){
  /*jshint validthis:true */
  var grunt = this;
  var self = grunt.task.current;
  var p = buildConfigProperty.bind(self);
  // Support both 0.6 and 0.8. path.existsSync is deprecated
  var existsSync = fs.existsSync || path.existsSync;

  // Configuring stuff
  self.requiresConfig(p('dest'), p('src'));
  grunt.utils._.defaults(self.data, defaults);

  // Checking availability
  if (!existsSync(self.file.src)){
    throw self.taskError('Unable to locate source directory.');
  }
  if (!existsSync(self.data.privateKey)){
    throw self.taskError('Unable to locate your private key.');
  }

  self.data.manifest = grunt.file.readJSON(path.join(self.file.src, 'manifest.json'));
  if (!self.data.manifest.version || !self.data.manifest.name || !self.data.manifest.manifest_version){
    throw self.taskError('Invalid manifest: one or more property is missing.');
  }

  // Expanding filename
  self.data.filename = grunt.template.process(
    self.data.filename,
    grunt.utils._.extend(grunt.config(), {
      "manifest": self.data.manifest,
      "pkg": grunt.config('pkg') || grunt.file.readJSON('package.json')
    })
  );

  // Preparing filesystem
  // @todo maybe use a basepath to avoid execution context problems
  //grunt.file.mkdir(self.data.buildDir);
  grunt.file.mkdir(path.dirname(self.file.dest));
}

module.exports = function(grunt) {

  var crx = require('./../lib/crx').init(grunt);
  var crxManifest = require('./../lib/crx-manifest').init(grunt);

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('crx', 'Package Chrome Extensions, the simple way.', function() {
    var manifest, extension;
    var done = this.async();
    var defaults = {
      "appid": null,
      "baseURL": null,
      "exclude": [],
      "filename": "<%= pkg.name %>-<%= manifest.version %>.crx",
      "options": {
        "maxBuffer": undefined
      },
      "privateKey": "key.pem"
    };

    // Check & Configure
    configure.bind(grunt)(defaults);

    // Preparing crx
    extension = new ChromeExtension({
      "codebase": this.data.baseURL ? this.data.baseURL + this.data.filename : '',
      "maxBuffer": this.data.options.maxBuffer,
      "privateKey": fs.readFileSync(this.data.privateKey),
      "rootDirectory": this.file.src,
      "dest": path.join(this.file.dest, this.data.filename),
      "exclude": this.data.exclude
    });

    // Building
    grunt.utils.async.series([
      // Building extension
      function(callback){
        crx.build(extension, callback);
      },
      // Building manifest
      function(callback){
        crxManifest.build(extension, callback);
      },
      // Clearing stuff
      function(callback){
        extension.destroy();

        callback();
      }
    ], /* Baking done! */ done);
  });
};