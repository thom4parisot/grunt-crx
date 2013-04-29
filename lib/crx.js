"use strict";

var exec = require('child_process').exec;
var path = require('path');

/**
 * Initializes the grunt helper
 *
 * @param {grunt} grunt
 * @returns {{build: Function}}
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

  /*
   * Blending
   */
  return {
    "build": build
  };
};