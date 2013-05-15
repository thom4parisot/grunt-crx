module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    nodeunit: {
      files: ['test/*.js']
    },
    watch: {
      files: '<%= jshint.files.src %>',
      tasks: 'default'
    },
    jshint: {
      files: {
        src: ['Gruntfile.js', 'tasks/**/*.js', 'test/**/*.js'],
        options: {
          jshintrc: '.jshintrc'
        }
      }
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Load helper plugins.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Alias for nodeunit.
  grunt.registerTask('test', 'nodeunit');

  // Default task.
  grunt.registerTask('default', ['jshint', 'test']);

};
