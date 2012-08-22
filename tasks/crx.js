/*
 * grunt-crx
 * https://github.com/oncletom/grunt-crx
 *
 * Copyright (c) 2012 oncletom
 * Licensed under the MIT license.
 */

var crx = require('crx');
var path = require('path');

/**
 * Expand the current multitask config key name
 *
 * @param key
 * @return {String}
 */
function buildConfigProperty(key){
  return [ this.name, this.target, key ].join('.');
}

module.exports = function(grunt) {


  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('crx', 'Package Chrome Extensions, the simple way.', function() {
    var manifest;
    var p = buildConfigProperty.bind(this);
    var defaults = {
      "appid": null,
      "buildDir": "build/",
      "codebase": null,
      "key": "key.pem"
    };

    // Configuring stuff
    this.requiresConfig(p('dest'), p('src'));
    this.data = grunt.utils._.extend(defaults, this.data);

    // Checking availability
    if (!path.existsSync(this.file.src)){
      throw grunt.task.taskError('Unable to locate source directory.');
    }
    if (!path.existsSync(this.data.key)){
      throw grunt.task.taskError('Unable to locate your private key.');
    }
    if (!grunt.file.readJSON( path.join(this.file.src, 'manifest.json') ).version){
      throw grunt.task.taskError('Unable to read extension manifest.');
    }

    // Preparing filesystem
    // @todo maybe use a basepath to avoid execution context problems
    grunt.file.mkdir(this.data.buildDir);
    grunt.file.mkdir(path.dirname(this.file.dest));


    // Building crx

    // Baking done!
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('crx', function() {
    return 'crx!!!';
  });
};
