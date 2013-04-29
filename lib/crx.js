"use strict";

var exec = require('child_process').exec;
var path = require('path');

/**
 * Initializes the grunt helper
 *
 * @param {grunt} grunt
 * @returns {{build: Function, getTaskConfiguration: Function}}
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
   * Returns a task configuration profile
   *
   * @param {String=} profile
   * @return {Object}
   */
  function getTaskConfiguration(profile){
    var config;

    profile = profile || 'default';

    config = grunt.file.readJSON('data/config-'+ profile +'.json');

    // Expand private key as a real string
    // @todo make that part of the configuration process to keep that part virgin
    if (grunt.file.exists(config.privateKey)){
      config.privateKey = grunt.file.read(config.privateKey);
    }

    return config;
  }

  /*
   * Blending
   */
  return {
    "build": build,
    "getTaskConfiguration": getTaskConfiguration
  };
};