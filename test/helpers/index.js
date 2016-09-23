'use strict';

var path = require('path');

module.exports = function(grunt){
  return {
    getTaskConfig: function(target){
      var config = grunt.config().crx[target];

      var files = grunt.task.normalizeMultiTaskFiles(grunt.config().crx[target])[0];

      config.src = files.src.slice();
      config.dest = files.dest;

      return config;
    }
  };
};
