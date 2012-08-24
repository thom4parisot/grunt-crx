/*
 * grunt-crx
 * https://github.com/oncletom/grunt-crx
 *
 * Copyright (c) 2012 oncletom
 * Licensed under the MIT license.
 */

var ChromeExtension = require('crx');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;

/**
 * Expand the current multitask config key name
 *
 * @param key
 * @return {String}
 */
function buildConfigProperty(key){
  return [ this.name, this.target, key ].join('.');
}

/**
 * Configures the task
 *
 * @this {Grunt}
 * @param defaults
 */
function configure(defaults){
  var grunt = this;
  var self = grunt.task.current;
  var p = buildConfigProperty.bind(self);

  // Configuring stuff
  self.requiresConfig(p('dest'), p('src'));
  grunt.utils._.defaults(self.data, defaults);

  // Checking availability
  if (!path.existsSync(self.file.src)){
    throw self.taskError('Unable to locate source directory.');
  }
  if (!path.existsSync(self.data.privateKey)){
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
        grunt.helper('crx', extension, callback);
      },
      // Building manifest
      function(callback){
        grunt.helper('crx-manifest', extension, callback);
      },
      // Clearing stuff
      function(callback){
        extension.destroy();

        callback();
      }
    ], /* Baking done! */ done);
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('crx', function(ChromeExtension, callback) {
    grunt.utils.async.series([
      function(done){
        ChromeExtension.load(done);
      },
      function(done){
        if (!Array.isArray(ChromeExtension.exclude) || !ChromeExtension.exclude.length){
          return done();
        }

        var files = grunt.file.expand(ChromeExtension.exclude.map(function(pattern){
          return path.join(ChromeExtension.path, '/', pattern);
        }));

        exec('rm -rf '+ files.join(' '), done);
      },
      function(done){
        ChromeExtension.pack(function(err, data){
          if (err){
            throw new grunt.task.taskError(err);
          }

          grunt.file.write(this.dest, data);

          done();
        });
      }
    ], callback);
  });

  grunt.registerHelper('crx-manifest', function(ChromeExtension, callback) {
    if (!ChromeExtension.manifest.update_url || !ChromeExtension.codebase){
      return callback();
    }

    ChromeExtension.generateUpdateXML();
    var dest = path.dirname(ChromeExtension.dest);

    grunt.file.write(path.join(dest, path.basename(ChromeExtension.manifest.update_url)), ChromeExtension.updateXML);

    callback();
  });
};