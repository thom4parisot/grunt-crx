"use strict";

var grunt = require('grunt');
var path = require('path');

var extensionConfigs, dynamicFilename = "grunt-crx-13.3.7.crx";

var extensionHelper = require(__dirname + '/../lib/crx.js').init(grunt);

module.exports = {
  setUp: function(done) {
    extensionConfigs = {
      "standard": extensionHelper.getTaskConfiguration('test-standard'),
      "codebase": extensionHelper.getTaskConfiguration('test-codebase'),
      "exclude": extensionHelper.getTaskConfiguration('test-exclude'),
      "edge": extensionHelper.getTaskConfiguration('test-edge')
    };

    grunt.file.delete("test/data/files/");
    grunt.file.mkdir("test/data/files/");

    done();
  },
  'build': {
    'without codebase': function(test){
      var crx = extensionHelper.createObject(extensionConfigs.standard);
      test.expect(4);

      test.doesNotThrow(function(){
        extensionHelper.build(crx, function(){
          test.equal(grunt.file.expand('test/data/files/test.crx').length, 1);
          test.equal(grunt.file.expand('test/data/files/'+dynamicFilename).length, 0);
          test.equal(grunt.file.expand('test/data/files/updates.xml').length, 0);
          crx.destroy();
          test.done();
        });
      });
    },
    'with codebase': function(test){
      var crx = extensionHelper.createObject(extensionConfigs.codebase);
      test.expect(3);

      extensionHelper.build(crx, function(){
        test.equal(grunt.file.expand('test/data/files/test.crx').length, 0);
        test.equal(grunt.file.expand('test/data/files/'+dynamicFilename).length, 1);
        test.equal(grunt.file.expand('test/data/files/updates.xml').length, 0);

        crx.destroy();
        test.done();
      });
    },
    'excluding files': function(test){
      var crx = extensionHelper.createObject(extensionConfigs.exclude);
      test.expect(4);

      extensionHelper.build(crx, function(){
        //local
        test.equal(grunt.file.expand('test/data/src/stuff/*').length, 1);
        test.equal(grunt.file.expand('test/data/src/*').length, 5);

        //copy
        test.equal(grunt.file.expand(path.join(crx.path + '/stuff/*')).length, 0);
        test.equal(grunt.file.expand(path.join(crx.path + '/*')).length, 3);

        crx.destroy();
        test.done();
      });
    },
    'edge case': function(test){
      var standard = extensionHelper.createObject(extensionConfigs.standard);
      var edge = extensionHelper.createObject(extensionConfigs.edge);

      test.expect(4);

      test.equal(typeof standard.rootDirectory, "string");
      test.equal(typeof edge.rootDirectory, "string");

      test.equal(typeof standard.dest, "string");
      test.equal(typeof edge.dest, "string");

      test.done();
    }
  }
};
