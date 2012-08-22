/*
 * grunt-crx
 * https://github.com/oncletom/grunt-crx
 *
 * Copyright (c) 2012 oncletom
 * Licensed under the MIT license.
 */

var crx = require('crx');
var path = require('path');
var fs = require('fs');

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
    var manifest, extension;
    var p = buildConfigProperty.bind(this);
    var done = this.async();
    var defaults = {
      "appid": null,
      //"buildDir": "build/",
      "codebase": null,
      "privateKey": "key.pem"
    };

    // Configuring stuff
    this.requiresConfig(p('dest'), p('src'));
    this.data = grunt.utils._.extend(defaults, this.data);

    // Checking availability
    if (!path.existsSync(this.file.src)){
      throw grunt.task.taskError('Unable to locate source directory.');
    }
    if (!path.existsSync(this.data.privateKey)){
      throw grunt.task.taskError('Unable to locate your private key.');
    }

    manifest = grunt.file.readJSON(path.join(this.file.src, 'manifest.json'));
    if (!manifest.version || !manifest.name || !manifest.manifest_version){
      throw grunt.task.taskError('Invalid manifest: one or more property is missing.');
    }

    // Preparing filesystem
    // @todo maybe use a basepath to avoid execution context problems
    //grunt.file.mkdir(this.data.buildDir);
    grunt.file.mkdir(path.dirname(this.file.dest));

    // Preparing crx
    extension = new crx({
      "codebase": this.data.codebase || manifest.update_url || "",
      "dest": this.file.dest,
      "privateKey": fs.readFileSync(this.data.privateKey),
      "rootDirectory": this.file.src
    });

    // Building
    grunt.utils.async.series([
      // Building extension
      function(callback){
        grunt.helper('crx', extension, callback);
      },
      // Building manifest
      function(callback){
        if (extension.codebase !== null){
          grunt.helper('crx-manifest', extension, callback);
        }
        else callback();
      }
    ], /* Baking done! */ done);
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('crx', function(ChromeExtension, callback) {
    ChromeExtension.load(function(err){
      var self = this;

      if (err)  throw new grunt.task.taskError(err);

      this.pack(function(err, data){
        if (err)  throw new grunt.task.taskError(err);

        grunt.file.write(self.dest, data);

        self.destroy();
        callback();
      });
    });
  });

  grunt.registerHelper('crx-manifest', function(ChromeExtension, callback) {
    ChromeExtension.generateUpdateXML();
    var dest = path.dirname(ChromeExtension.dest);

    grunt.file.write(path.join(dest, 'updates.xml'), ChromeExtension.updateXML);

    callback();
  });
};
