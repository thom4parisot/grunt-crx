/*
 * grunt-crx
 * https://github.com/oncletom/grunt-crx
 *
 * Copyright (c) 2012 oncletom
 * Licensed under the MIT license.
 */

var crx = require('crx');

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
