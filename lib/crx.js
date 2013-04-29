"use strict";

var exec = require('child_process').exec;
var path = require('path');

var required_properties = ['manifest_version', 'name', 'version'];
var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
var filename_template = "<%= pkg.name %>-<%= manifest.version %>.crx";

/**
 * Resolve the home directory of a supposed-path value
 *
 * @param {String} value
 * @returns {String}
 */
function resolveHomeDirectory(value){
  if (homeDir && typeof value === 'string' && value[0] === '~'){
    value = value.replace(/^~/, homeDir);
  }

  return value;
}

/**
 * Initializes the grunt helper
 *
 * @param {grunt} grunt
 * @returns {{build: Function, expandConfiguration: Function, getTaskConfiguration: Function, resolveHomeDirectory: Function}}
 */
exports.init = function(grunt){
  /**
   * Builds a pre-configured chrome extension in 3 steps
   *
   * @api
   * @param {ChromeExtension} ChromeExtension
   * @param {Function} callback
   * @return null
   */
  function build(ChromeExtension, callback) {
    grunt.util.async.series([
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
  }

  /**
   * Refines a task configuration (expand settings etc.)
   *
   * @param {Object} taskConfig
   * @param {Object=} defaults
   * @return {Object}
   */
  function expandConfiguration(taskConfig, defaults){
    defaults = defaults || getTaskConfiguration();
    grunt.util._.defaults(taskConfig, defaults, taskConfig);

    ['dest', 'src'].forEach(function(key){
      if ((Array.isArray(taskConfig[key]) && taskConfig[key].length === 0) || !taskConfig[key]){
        grunt.fail.fatal("You can't specify an empty '"+key+"' configuration value.");
      }
    });

    // XXX (alexeykuzmin): Is there a better way to get source folder path?
    var sourceDir = Array.isArray(taskConfig.src) ? taskConfig.src[0] : taskConfig.src;

    // Eventually expanding `~` in config paths
    //grunt.util._.assign(taskConfig, taskConfig, resolveHomeDirectory);

    // Checking availability
    if (!grunt.file.exists(sourceDir)){
      grunt.fail.fatal('Unable to locate source directory.');
    }

    if (!grunt.file.exists(taskConfig.privateKey)){
      grunt.fail.fatal('Unable to locate your private key.');
    }
    else{
      taskConfig.privateKey = grunt.file.read(taskConfig.privateKey);
    }

    // Check extension manifest
    taskConfig.manifest = grunt.file.readJSON(path.join(sourceDir, 'manifest.json'));
    required_properties.forEach(function(prop) {
      if ('undefined' === typeof taskConfig.manifest[prop]) {
        grunt.fail.fatal('Invalid manifest: property "' + prop + '" is missing.');
      }
    });

    // Expanding destination
    if (grunt.file.isDir(taskConfig.dest)){
      var filename = taskConfig.filename || filename_template;

      taskConfig.dest = path.join(taskConfig.dest, filename);
    }

    ['dest'].forEach(function(key){
      taskConfig[key] = grunt.template.process(
        taskConfig[key],
        {
          "manifest": taskConfig.manifest,
          "pkg": grunt.file.readJSON('package.json')
        }
      );
    });

    // Preparing filesystem
    // @todo move that away from this method, it's not suitable
    grunt.file.mkdir(path.dirname(taskConfig.dest));

    // @todo remove that to better separate grunt config and Chrome Extension config
    taskConfig.rootDirectory = taskConfig.src;

    return taskConfig;
  }

  /**
   * Returns a task configuration profile
   *
   * @param {String=} profile
   * @return {Object}
   */
  function getTaskConfiguration(profile){
    var config;

    profile = profile || 'default';

    config = grunt.file.readJSON('data/config-'+ profile +'.json');

    return config;
  }

  /*
   * Blending
   */
  return {
    "build": build,
    "expandConfiguration": expandConfiguration,
    "getTaskConfiguration": getTaskConfiguration,
    "resolveHomeDirectory": resolveHomeDirectory
  };
};