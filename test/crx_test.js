"use strict";

var grunt = require('grunt');
var path = require('path');
var exec = require('child_process').exec;
var extensionConfigs, dynamicFilename = "grunt-crx-13.3.7.crx";

var extensionHelper = require(__dirname + '/../lib/crx.js').init(grunt);
var autoupdateHelper = require(__dirname + '/../lib/autoupdate.js').init(grunt);

exports['crx'] = {
  setUp: function(done) {
    extensionConfigs = {
      "standard": extensionHelper.getTaskConfiguration('test-standard'),
      "codebase": extensionHelper.getTaskConfiguration('test-codebase'),
      "exclude": extensionHelper.getTaskConfiguration('test-exclude')
    };

    exec('rm -f test/data/files/*', done);
  },
  'helper-crx': {
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
    }
  },
  'helper-autoupdate': {
    'without running crx-helper': function(test){
      test.expect(1);

      test.throws(function(){
        autoupdateHelper.buildXML(extensionHelper.createObject(extensionConfigs.codebase));
      });

      test.done();
    },
    'without codebase': function(test){
      var crx = extensionHelper.createObject(extensionConfigs.standard);
      test.expect(1);

      grunt.util.async.series([
        function(done){
          extensionHelper.build(crx, done);
        },
        function(done){
          test.throws(function(){
            autoupdateHelper.buildXML(crx);
          });

          crx.destroy();
          done();
        }
      ], test.done);
    },
    'without update url': function(test){
      var crx = extensionHelper.createObject(extensionConfigs.standard);
      crx.manifest.update_url = null;

      test.expect(1);

      autoupdateHelper.buildXML(crx, function(){
        test.equal(grunt.file.expand('test/data/files/updates.xml').length, 0);

        test.done();
      });
    },
    'with codebase': function(test){
      var crx = extensionHelper.createObject(extensionConfigs.codebase);
      test.expect(3);
      grunt.util.async.series([
        function(done){
          extensionHelper.build(crx, done);
        },
        function(done){
          autoupdateHelper.buildXML(crx, function(){

            test.equal(grunt.file.expand('test/data/files/test.crx').length, 0);
            test.equal(grunt.file.expand('test/data/files/'+dynamicFilename).length, 1);
            test.equal(grunt.file.expand('test/data/files/updates.xml').length, 1);

            crx.destroy();
            done();
          });
        }
      ], test.done);
    }
  }
};
