'use strict';

module.exports = function(grunt){
  return {
    getTaskConfig: function(target){
      var config = grunt.config().crx[target];

      var files = grunt.task.normalizeMultiTaskFiles(grunt.config().crx[target])[0];

      config.src = files.src;
      config.dest = files.dest;

      return config;
    }
  };
};