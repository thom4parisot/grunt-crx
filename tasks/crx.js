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
 * @param {!Object} task Task object.
 * @param {!String} key Property name.
 * @return {String}
 */
function buildConfigProperty(task, key){
  return [ task.name, task.target, key ].join('.');
}

/**
 * Configures the task
 *
 * @param {!Object} grunt Grunt itself.
 * @param {!Object} config User settings hash.
 * @param {Object} defaults Default settings hash.
 */
function configure(grunt, config, defaults){
  var task = grunt.task.current;
  var p = buildConfigProperty.bind(null, task);
  var existsSync = fs.existsSync;

  // Configuring stuff
  task.requiresConfig(p('dest'), p('src'));
  grunt.util._.defaults(config, defaults);

  // XXX (alexeykuzmin): Is there a better way to get source folder path?
  var sourceDir = config.src[0];

  // Checking availability
  if (!existsSync(sourceDir)){
    grunt.fail.fatal('Unable to locate source directory.');
  }
  if (!existsSync(config.privateKey)){
    grunt.fail.fatal('Unable to locate your private key.');
  }

  // Check extension manifest
  config.manifest = grunt.file.readJSON(path.join(sourceDir, 'manifest.json'));
  [
    'manifest_version',
    'name',
    'version'
  ].forEach(function(prop) {
      if ('undefined' === typeof config.manifest[prop]) {
        grunt.fail.fatal('Invalid manifest: property "' + prop + '" is missing.');
      }
  });

  // Expanding filename
  config.filename = grunt.template.process(
      config.filename,
      grunt.util._.extend(grunt.config(), {
        "manifest": config.manifest,
        "pkg": grunt.config('pkg') || grunt.file.readJSON('package.json')
      })
  );

  // Preparing filesystem
  // @todo maybe use a basepath to avoid execution context problems
  //grunt.file.mkdir(self.data.buildDir);
  grunt.file.mkdir(path.dirname(config.dest));
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

    this.files.forEach(function(config) {
      configure(grunt, config, defaults);

      // Preparing crx
      extension = new ChromeExtension({
        "codebase": config.baseURL ? config.baseURL + config.filename : '',
        "maxBuffer": config.options.maxBuffer,
        "privateKey": fs.readFileSync(config.privateKey),
        "rootDirectory": config.src,
        "dest": path.join(config.dest, config.filename),
        "exclude": config.exclude
      });

      // Building
      grunt.util.async.series([
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

  });
};